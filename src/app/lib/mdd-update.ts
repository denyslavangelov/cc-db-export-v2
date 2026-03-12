/**
 * Update FAMILY_BRANDS and/or education variable in an IBM MR / Dimensions .MDD file (XML with namespaces).
 * Replaces categories from the country-specific Excel data.
 */

import type { FamilyBrandsSheetRow, EducationListSheetRow, IncomeListSheetRow } from "./country-questions-workbook";

const FAMILY_BRANDS_VAR_NAME = "FAMILY_BRANDS";
const INCOME_LIST_CATEGORIES_NAME = "INCOME_LIST";

/** MDD uses a namespace URI with a space ("Arc 3"), which is invalid in XML. Fix for DOMParser. */
const MDM_NS_INVALID = "http://www.spss.com/mr/dm/metadatamodel/Arc 3/2000-02-04";
const MDM_NS_VALID = "http://www.spss.com/mr/dm/metadatamodel/Arc%203/2000-02-04";

/** Use category name as id for new categories so we don't introduce random UUIDs or break references. */

/**
 * Build SubFamilyBrands value: comma-separated list of all sub-brand codes for this family.
 * Value format: {_code1,_code2,_code3} (each code is a BRAND_FUNNEL BRAND CODE from the Excel).
 */
function getSubFamilyBrandsValue(extendedProperties: string): string {
  try {
    const o = JSON.parse(extendedProperties) as { subFamilyBrands?: string | string[] };
    const raw = o?.subFamilyBrands;
    const codes: string[] = Array.isArray(raw)
      ? raw.map((c) => String(c).trim()).filter(Boolean)
      : typeof raw === "string"
        ? raw.split(",").map((c) => c.trim()).filter(Boolean)
        : [];
    if (codes.length === 0) return "{}";
    return "{" + codes.join(",") + "}";
  } catch {
    return "{}";
  }
}

/**
 * Find a variable definition by name (has name, no ref) and its categories element.
 */
function findVariableCategoriesByName(doc: Document, variableName: string): { variable: Element; categories: Element } | null {
  const variables = doc.getElementsByTagName("variable");
  for (let i = 0; i < variables.length; i++) {
    const v = variables[i];
    const name = v.getAttribute("name");
    const ref = v.getAttribute("ref");
    if (name !== variableName || ref) continue;
    const categories = Array.from(v.children).find((c) => c.tagName === "categories" || c.localName === "categories");
    if (categories) return { variable: v, categories };
  }
  return null;
}

/**
 * Build a new <category> element: one per family, with SubFamilyBrands set to
 * a comma-separated list of all sub-brand codes for that family.
 */
function createCategoryElement(
  doc: Document,
  ns: string | null,
  row: FamilyBrandsSheetRow
): Element {
  const create = ns ? (tag: string) => doc.createElementNS(ns, tag) : (tag: string) => doc.createElement(tag);
  const name = row["Object Name"] || "_";
  const category = create("category");
  category.setAttribute("id", name);
  category.setAttribute("name", name);

  // SubFamilyBrands = comma-separated list of all sub-brands for this family, e.g. {_20022044,_20022045}
  const subFamilyBrandsValue = getSubFamilyBrandsValue(row["Extended Properties"] ?? "{}");

  const properties = create("properties");
  const property = create("property");
  property.setAttribute("name", "SubFamilyBrands");
  property.setAttribute("value", subFamilyBrandsValue);
  property.setAttribute("type", "8");
  property.setAttribute("context", "Question");
  properties.appendChild(property);
  category.appendChild(properties);

  const labels = create("labels");
  labels.setAttribute("context", "LABEL");
  const text = create("text");
  text.setAttribute("context", "QUESTION");
  text.setAttribute("xml:lang", "en-US");
  text.textContent = row.Text ?? "";
  labels.appendChild(text);
  category.appendChild(labels);

  return category;
}

/** Get en-US label text from a category element (labels/text with xml:lang='en-US'). */
function getCategoryEnUsLabel(categoryEl: Element): string {
  const texts = categoryEl.getElementsByTagName("text");
  for (let i = 0; i < texts.length; i++) {
    const t = texts[i];
    if (t.getAttribute("xml:lang") === "en-US") return (t.textContent ?? "").trim();
  }
  return "";
}

/** Build a map of existing category name -> element from a categories container (only direct category children). */
function getExistingCategoriesByName(categoriesEl: Element): Map<string, Element> {
  const map = new Map<string, Element>();
  for (const child of Array.from(categoriesEl.children)) {
    if (child.tagName === "category" || child.localName === "category") {
      const name = child.getAttribute("name") ?? "";
      if (name) map.set(name, child);
    }
  }
  return map;
}

/** Create a category element with name and en-US label (shared for education and income). Id = name to avoid changing ids. */
function createLabelOnlyCategoryElement(
  doc: Document,
  ns: string | null,
  objectName: string,
  labelText: string
): Element {
  const create = ns ? (tag: string) => doc.createElementNS(ns, tag) : (tag: string) => doc.createElement(tag);
  const category = create("category");
  category.setAttribute("id", objectName);
  category.setAttribute("name", objectName);
  const labels = create("labels");
  labels.setAttribute("context", "LABEL");
  const text = create("text");
  text.setAttribute("context", "QUESTION");
  text.setAttribute("xml:lang", "en-US");
  text.textContent = labelText;
  labels.appendChild(text);
  category.appendChild(labels);
  return category;
}

/** Build a <category> for education: Object Name + Text (en-US). */
function createEducationCategoryElement(
  doc: Document,
  ns: string | null,
  row: EducationListSheetRow
): Element {
  return createLabelOnlyCategoryElement(doc, ns, row["Object Name"] || "_", row.Text ?? "");
}

/**
 * Merge education list from Excel into the education variable's categories.
 * Does NOT remove or re-add existing categories so translations (fi-FI, etc.) are preserved.
 * Only removes categories no longer in the Excel list; inserts new categories in Excel order.
 */
function mergeEducationCategoriesIntoElement(
  doc: Document,
  categoriesEl: Element,
  educationListSheetRows: EducationListSheetRow[]
): { addedCount: number; preservedCount: number } {
  const ns = categoriesEl.namespaceURI || null;
  const create = ns ? (tag: string) => doc.createElementNS(ns, tag) : (tag: string) => doc.createElement(tag);
  const existingByName = getExistingCategoriesByName(categoriesEl);
  const orderedRows = educationListSheetRows.map((r) => ({ name: r["Object Name"] || "_", row: r }));
  const namesSet = new Set(orderedRows.map((o) => o.name));

  let addedCount = 0;
  let preservedCount = 0;

  const toRemove: Element[] = [];
  for (const child of Array.from(categoriesEl.children)) {
    const tag = (child.tagName || child.localName || "").toLowerCase();
    if (tag === "deleted") {
      toRemove.push(child);
    } else if (tag === "category") {
      const name = child.getAttribute("name") ?? "";
      if (name && !namesSet.has(name)) toRemove.push(child);
    }
  }
  for (const el of toRemove) categoriesEl.removeChild(el);

  const firstExistingInOrder = Array.from(categoriesEl.children).find((c) => {
    const tag = (c.tagName || c.localName || "").toLowerCase();
    if (tag !== "category") return false;
    return namesSet.has(c.getAttribute("name") ?? "");
  }) ?? null;

  for (const { name, row } of orderedRows) {
    const existing = existingByName.get(name);
    if (existing && categoriesEl.contains(existing)) {
      preservedCount++;
      continue;
    }
    const newCat = createEducationCategoryElement(doc, ns, row);
    if (firstExistingInOrder) {
      categoriesEl.insertBefore(newCat, firstExistingInOrder);
    } else {
      categoriesEl.appendChild(newCat);
    }
    addedCount++;
  }

  const deleted = create("deleted");
  categoriesEl.appendChild(deleted);
  return { addedCount, preservedCount };
}

/**
 * Find the INCOME_LIST **definition** only (the one that holds the full category list with translations).
 * Do NOT update elements that have categoriesref – those are references that point at the definition;
 * updating them would overwrite with en-US-only and drop fi-FI, de-AT, etc.
 */
function findIncomeListDefinition(doc: Document): Element | null {
  const list = doc.getElementsByTagNameNS("*", "categories");
  for (let i = 0; i < list.length; i++) {
    const el = list[i];
    if ((el.getAttribute("name") ?? "") !== INCOME_LIST_CATEGORIES_NAME) continue;
    if ((el.getAttribute("categoriesref") ?? "").trim() !== "") continue;
    return el;
  }
  return null;
}

/**
 * Merge income list from Excel into an existing INCOME_LIST categories element.
 * Does NOT remove or re-add existing categories so translations (fi-FI, de-AT, etc.) are preserved.
 * Only removes categories no longer in the Excel list; inserts new categories (e.g. _1, _2) in Excel order.
 */
function mergeIncomeCategoriesIntoElement(
  doc: Document,
  categoriesEl: Element,
  incomeListSheetRows: IncomeListSheetRow[]
): { addedCount: number; preservedCount: number } {
  const ns = categoriesEl.namespaceURI || null;
  const create = ns ? (tag: string) => doc.createElementNS(ns, tag) : (tag: string) => doc.createElement(tag);
  const existingByName = getExistingCategoriesByName(categoriesEl);
  const orderedRows = incomeListSheetRows.map((r) => ({ name: r["Object Name"] || "_", row: r }));
  const namesSet = new Set(orderedRows.map((o) => o.name));

  let addedCount = 0;
  let preservedCount = 0;

  const toRemove: Element[] = [];
  for (const child of Array.from(categoriesEl.children)) {
    const tag = (child.tagName || child.localName || "").toLowerCase();
    if (tag === "deleted") {
      toRemove.push(child);
    } else if (tag === "category") {
      const name = child.getAttribute("name") ?? "";
      if (name && !namesSet.has(name)) toRemove.push(child);
    }
  }
  for (const el of toRemove) categoriesEl.removeChild(el);

  const firstExistingInOrder = Array.from(categoriesEl.children).find((c) => {
    const tag = (c.tagName || c.localName || "").toLowerCase();
    if (tag !== "category") return false;
    return namesSet.has(c.getAttribute("name") ?? "");
  }) ?? null;

  for (const { name, row } of orderedRows) {
    const existing = existingByName.get(name);
    if (existing && categoriesEl.contains(existing)) {
      preservedCount++;
      continue;
    }
    const newCat = createLabelOnlyCategoryElement(doc, ns, name, row.Text ?? "");
    if (firstExistingInOrder) {
      categoriesEl.insertBefore(newCat, firstExistingInOrder);
    } else {
      categoriesEl.appendChild(newCat);
    }
    addedCount++;
  }

  const deleted = create("deleted");
  categoriesEl.appendChild(deleted);
  return { addedCount, preservedCount };
}

/**
 * Replace only <category> and <deleted> children of a categories element (preserves e.g. top-level <labels>).
 */
function replaceCategoryAndDeletedChildrenOnly(
  doc: Document,
  categoriesEl: Element,
  categoryElements: Element[]
): void {
  const ns = categoriesEl.namespaceURI || null;
  const create = ns ? (tag: string) => doc.createElementNS(ns, tag) : (tag: string) => doc.createElement(tag);
  const toRemove: Element[] = [];
  for (const child of Array.from(categoriesEl.children)) {
    const tag = child.tagName || child.localName || "";
    if (tag === "category" || tag === "deleted") toRemove.push(child);
  }
  for (const el of toRemove) categoriesEl.removeChild(el);
  const deleted = create("deleted");
  categoriesEl.appendChild(deleted);
  for (const el of categoryElements) categoriesEl.appendChild(el);
}

/** Replace a variable's categories node content with new category elements (keeps <deleted/> then new categories). */
function replaceCategories(
  doc: Document,
  categories: Element,
  categoryElements: Element[]
): void {
  const ns = categories.namespaceURI || null;
  const create = ns ? (tag: string) => doc.createElementNS(ns, tag) : (tag: string) => doc.createElement(tag);

  while (categories.firstChild) {
    categories.removeChild(categories.firstChild);
  }
  const deleted = create("deleted");
  categories.appendChild(deleted);
  for (const el of categoryElements) {
    categories.appendChild(el);
  }
}

export interface UpdateMddOptions {
  familyBrandsSheetRows?: FamilyBrandsSheetRow[];
  educationListSheetRows?: EducationListSheetRow[];
  /** Education variable name in the MDD (e.g. edu_FIN). From Excel Education sheet "Variable Name". */
  educationVariableName?: string | null;
  incomeListSheetRows?: IncomeListSheetRow[];
}

export interface MddUpdateSummary {
  familyBrands?: { updated: boolean; categoriesCount: number; notFound?: boolean };
  education?: {
    variableName: string;
    updated: boolean;
    categoriesCount: number;
    categoriesUpdated?: number;
    categoriesUnchanged?: number;
    notFound?: boolean;
  };
  income?: {
    updated: boolean;
    categoriesCount: number;
    categoriesUpdated?: number;
    categoriesUnchanged?: number;
    notFound?: boolean;
  };
}

export interface UpdateMddResult {
  xml: string;
  summary: MddUpdateSummary;
}

/**
 * Update MDD with FAMILY_BRANDS and/or education categories from country Excel data.
 * Single parse/serialize pass. Returns updated XML and a summary of what was updated or not found.
 */
export function updateMddFromCountryData(mddXml: string, options: UpdateMddOptions): UpdateMddResult {
  const { familyBrandsSheetRows, educationListSheetRows, educationVariableName, incomeListSheetRows } = options;
  const hasFamilyBrands = familyBrandsSheetRows && familyBrandsSheetRows.length > 0;
  const hasEducation =
    educationListSheetRows &&
    educationListSheetRows.length > 0 &&
    educationVariableName != null &&
    educationVariableName.trim() !== "";
  const hasIncome = incomeListSheetRows && incomeListSheetRows.length > 0;

  const summary: MddUpdateSummary = {};

  if (!hasFamilyBrands && !hasEducation && !hasIncome) {
    return { xml: mddXml, summary };
  }

  const mddXmlFixed = mddXml.includes(MDM_NS_INVALID)
    ? mddXml.split(MDM_NS_INVALID).join(MDM_NS_VALID)
    : mddXml;

  const parser = new DOMParser();
  const doc = parser.parseFromString(mddXmlFixed, "text/xml");
  const parseError = doc.querySelector("parsererror");
  if (parseError) {
    throw new Error("MDD parse error: " + (parseError.textContent || "Invalid XML"));
  }

  if (hasFamilyBrands) {
    const found = findVariableCategoriesByName(doc, FAMILY_BRANDS_VAR_NAME);
    const count = familyBrandsSheetRows!.length;
    if (found) {
      const { categories } = found;
      const ns = categories.namespaceURI || null;
      const elements = familyBrandsSheetRows!.map((row) => createCategoryElement(doc, ns, row));
      replaceCategories(doc, categories, elements);
      summary.familyBrands = { updated: true, categoriesCount: count };
    } else {
      summary.familyBrands = { updated: false, categoriesCount: count, notFound: true };
    }
  }

  if (hasEducation) {
    const varName = educationVariableName!.trim();
    const found = findVariableCategoriesByName(doc, varName);
    const count = educationListSheetRows!.length;
    if (found) {
      const { categories } = found;
      const { addedCount, preservedCount } = mergeEducationCategoriesIntoElement(doc, categories, educationListSheetRows!);
      summary.education = {
        variableName: varName,
        updated: true,
        categoriesCount: count,
        categoriesUpdated: addedCount,
        categoriesUnchanged: preservedCount,
      };
    } else {
      summary.education = { variableName: varName, updated: false, categoriesCount: count, notFound: true };
    }
  }

  if (hasIncome) {
    const incomeListDefinition = findIncomeListDefinition(doc);
    const count = incomeListSheetRows!.length;
    if (incomeListDefinition) {
      const { addedCount, preservedCount } = mergeIncomeCategoriesIntoElement(doc, incomeListDefinition, incomeListSheetRows!);
      summary.income = {
        updated: true,
        categoriesCount: count,
        categoriesUpdated: addedCount,
        categoriesUnchanged: preservedCount,
      };
    } else {
      summary.income = { updated: false, categoriesCount: count, notFound: true };
    }
  }

  const serializer = new XMLSerializer();
  let out = serializer.serializeToString(doc);
  if (out.includes(MDM_NS_VALID)) {
    out = out.split(MDM_NS_VALID).join(MDM_NS_INVALID);
  }
  return { xml: out, summary };
}

/**
 * Update only the FAMILY_BRANDS variable in the MDD (convenience wrapper).
 */
export function updateMddFamilyBrands(
  mddXml: string,
  familyBrandsSheetRows: FamilyBrandsSheetRow[]
): string {
  const result = updateMddFromCountryData(mddXml, { familyBrandsSheetRows });
  return result.xml;
}

/**
 * Read an MDD File and return its text (for use in updateMddFamilyBrands).
 */
export function readMddFile(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result;
      if (typeof result === "string") resolve(result);
      else if (result instanceof ArrayBuffer) resolve(new TextDecoder("utf-8").decode(result));
      else reject(new Error("Could not read MDD file as text"));
    };
    reader.onerror = () => reject(reader.error);
    reader.readAsText(file, "UTF-8");
  });
}
