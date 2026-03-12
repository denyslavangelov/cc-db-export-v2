/**
 * Parser for "Coke SMS - Country specific questions_Linked with Q're" Excel workbook.
 * Reads Family Brands, Education, S6 INCOME sheets. Includes all rows (hidden/filtered in Excel are still present when reading file).
 */

import * as XLSX from 'xlsx'

export interface FamilyBrandRow {
  Market: string | null
  qCountryCode: string | null
  brandFunnelBrandCode: number | null
  brandFunnelBrandLabel: string | null
  forCategoryCode: number | null
  categoryLabel: string | null
  thenShowFamilyBrandCode: number | null
  familyBrandLabel: string | null
}

export interface EducationRow {
  Country: string | null
  VariableName: string | null
  Code: number | null
  LabelEducation: string | null
}

export interface S6IncomeRow {
  Country: string | null
  VariableName: string | null
  CodeIncome: number | null
  LabelIncome: string | null
  HHINC_GRP: number | null
}

export interface QCountryRow {
  method: string | null
  country: string | null
  qCountryCode: string | null
}

export interface CountryQuestionsWorkbook {
  qCountry: QCountryRow[]
  familyBrands: FamilyBrandRow[]
  education: EducationRow[]
  s6Income: S6IncomeRow[]
  fileName: string
}

/** Unique country names from qCountry sheet, in sheet order. */
export function getCountryNames(workbook: CountryQuestionsWorkbook): string[] {
  const seen = new Set<string>()
  const out: string[] = []
  for (const row of workbook.qCountry) {
    const c = row.country?.trim()
    if (c && !seen.has(c)) {
      seen.add(c)
      out.push(c)
    }
  }
  return out
}

/** Get qCountry Code for a country name (from qCountry sheet). */
export function getQCountryCodeForCountry(workbook: CountryQuestionsWorkbook, countryName: string): string | null {
  const norm = countryName.trim().replace(/\s+/g, ' ')
  for (const row of workbook.qCountry) {
    const c = row.country?.trim().replace(/\s+/g, ' ')
    if (c === norm) return row.qCountryCode ?? null
  }
  return null
}

/** Filter workbook data for a single country. Family Brands filtered by qCountry Code; Education and S6 INCOME by Country. */
export function getDataForCountry(
  workbook: CountryQuestionsWorkbook,
  countryName: string
): { familyBrands: FamilyBrandRow[]; education: EducationRow[]; s6Income: S6IncomeRow[] } {
  const code = getQCountryCodeForCountry(workbook, countryName)
  const normCountry = countryName.trim().replace(/\s+/g, ' ')
  const matchCountry = (c: string | null) => c?.trim().replace(/\s+/g, ' ') === normCountry
  return {
    familyBrands: code != null
      ? workbook.familyBrands.filter((r) => (r.qCountryCode ?? '').trim() === code.trim())
      : [],
    education: workbook.education.filter((r) => matchCountry(r.Country)),
    s6Income: workbook.s6Income.filter((r) => matchCountry(r.Country)),
  }
}

const PARSING = {
  trimStrings: true,
  normalizeCountryWhitespace: true,
  coerceNumericToInt: true,
  treatBlankAsNull: true,
} as const

function trim(s: unknown): string | null {
  if (s == null || s === '') return PARSING.treatBlankAsNull ? null : ''
  const str = String(s).trim()
  if (PARSING.treatBlankAsNull && str === '') return null
  return str
}

function normalizeWhitespace(s: string | null): string | null {
  if (s == null) return null
  return s.replace(/\s+/g, ' ').trim()
}

function toInt(val: unknown): number | null {
  if (val == null || val === '') return null
  if (typeof val === 'number' && Number.isInteger(val)) return val
  const s = String(val).trim()
  if (s === '') return null
  const n = Number(s)
  if (!Number.isNaN(n) && Number.isInteger(n)) return n
  return null
}

/** Normalize header for matching: trim, collapse spaces, remove "Unnamed" columns */
function normHeader(h: string): string {
  return String(h ?? '')
    .trim()
    .replace(/\s+/g, ' ')
}

/** Build map: normalized header -> column index (0-based) */
function headerIndexMap(row: unknown[]): Map<string, number> {
  const map = new Map<string, number>()
  row.forEach((cell, i) => {
    const n = normHeader(cell ?? '')
    if (n && !/^Unnamed:\s*\d+$/i.test(n)) map.set(n, i)
  })
  return map
}

function getCell(row: unknown[], idx: number): unknown {
  if (idx < 0 || idx >= row.length) return undefined
  const v = row[idx]
  if (v === '' || v == null) return PARSING.treatBlankAsNull ? null : v
  return v
}

/** Family Brands: Market, qCountry Code, BRAND_FUNNEL  BRAND CODE, BRAND_FUNNEL BRAND LABEL, FOR CATEGORY CODE, CATEGORY LABEL, THEN SHOW FAMILY BRAND CODE, FAMILY BRAND LABEL */
function parseFamilyBrands(rows: unknown[][]): FamilyBrandRow[] {
  if (rows.length < 2) return []
  const headerMap = headerIndexMap(rows[0])
  const get = (key: string) => headerMap.get(key) ?? headerMap.get(key.replace(/\s{2,}/g, ' ')) ?? -1
  const marketCol = get('Market')
  const qCountryCol = get('qCountry Code')
  const brandCodeCol = get('BRAND_FUNNEL  BRAND CODE') >= 0 ? get('BRAND_FUNNEL  BRAND CODE') : get('BRAND_FUNNEL BRAND CODE')
  const brandLabelCol = get('BRAND_FUNNEL BRAND LABEL')
  const forCatCodeCol = get('FOR CATEGORY CODE')
  const catLabelCol = get('CATEGORY LABEL')
  const familyCodeCol = get('THEN SHOW FAMILY BRAND CODE')
  const familyLabelCol = get('FAMILY BRAND LABEL')

  const out: FamilyBrandRow[] = []
  for (let i = 1; i < rows.length; i++) {
    const row = rows[i]
    let market = trim(getCell(row, marketCol))
    if (PARSING.normalizeCountryWhitespace && market) market = normalizeWhitespace(market)
    out.push({
      Market: market,
      qCountryCode: trim(getCell(row, qCountryCol)),
      brandFunnelBrandCode: toInt(getCell(row, brandCodeCol)),
      brandFunnelBrandLabel: trim(getCell(row, brandLabelCol)),
      forCategoryCode: toInt(getCell(row, forCatCodeCol)),
      categoryLabel: trim(getCell(row, catLabelCol)),
      thenShowFamilyBrandCode: toInt(getCell(row, familyCodeCol)),
      familyBrandLabel: trim(getCell(row, familyLabelCol)),
    })
  }
  return out
}

/** Education: Country, Variable Name, Code, Label Education */
function parseEducation(rows: unknown[][]): EducationRow[] {
  if (rows.length < 2) return []
  const headerMap = headerIndexMap(rows[0])
  const get = (key: string) => headerMap.get(key) ?? -1
  const countryCol = get('Country')
  const varCol = get('Variable Name')
  const codeCol = get('Code')
  const labelCol = get('Label Education')

  const out: EducationRow[] = []
  for (let i = 1; i < rows.length; i++) {
    const row = rows[i]
    let country = trim(getCell(row, countryCol))
    if (PARSING.normalizeCountryWhitespace && country) country = normalizeWhitespace(country)
    out.push({
      Country: country,
      VariableName: trim(getCell(row, varCol)),
      Code: toInt(getCell(row, codeCol)),
      LabelEducation: trim(getCell(row, labelCol)),
    })
  }
  return out
}

/** qCountry: METHOD, Country, qCountry Code, qlanguage 1..8, Qlanguage */
function parseQCountry(rows: unknown[][]): QCountryRow[] {
  if (rows.length < 2) return []
  const headerMap = headerIndexMap(rows[0])
  const get = (key: string) => headerMap.get(key) ?? -1
  const methodCol = get('METHOD')
  const countryCol = get('Country')
  const qCountryCol = get('qCountry Code')

  const out: QCountryRow[] = []
  for (let i = 1; i < rows.length; i++) {
    const row = rows[i]
    let country = trim(getCell(row, countryCol))
    if (PARSING.normalizeCountryWhitespace && country) country = normalizeWhitespace(country)
    out.push({
      method: trim(getCell(row, methodCol)),
      country,
      qCountryCode: trim(getCell(row, qCountryCol)),
    })
  }
  return out
}

/** S6 INCOME: Country, Variable Name, Code Income, Label Income, HHINC_GRP */
function parseS6Income(rows: unknown[][]): S6IncomeRow[] {
  if (rows.length < 2) return []
  const headerMap = headerIndexMap(rows[0])
  const get = (key: string) => headerMap.get(key) ?? -1
  const countryCol = get('Country')
  const varCol = get('Variable Name')
  const codeCol = get('Code Income')
  const labelCol = get('Label Income')
  const hhincCol = get('HHINC_GRP')

  const out: S6IncomeRow[] = []
  for (let i = 1; i < rows.length; i++) {
    const row = rows[i]
    let country = trim(getCell(row, countryCol))
    if (PARSING.normalizeCountryWhitespace && country) country = normalizeWhitespace(country)
    out.push({
      Country: country,
      VariableName: trim(getCell(row, varCol)),
      CodeIncome: toInt(getCell(row, codeCol)),
      LabelIncome: trim(getCell(row, labelCol)),
      HHINC_GRP: toInt(getCell(row, hhincCol)),
    })
  }
  return out
}

/** Get sheet as array of rows (first row = headers). Includes all rows; no filter by visibility. */
function sheetToRowArrays(sheet: XLSX.WorkSheet): unknown[][] {
  const range = XLSX.utils.decode_range((sheet['!ref'] as string) || 'A1')
  const rows: unknown[][] = []
  for (let R = range.s.r; R <= range.e.r; R++) {
    const row: unknown[] = []
    for (let C = range.s.c; C <= range.e.c; C++) {
      const cell = sheet[XLSX.utils.encode_cell({ r: R, c: C })]
      row.push(cell?.v ?? '')
    }
    rows.push(row)
  }
  return rows
}

const REQUIRED_SHEETS = ['qCountry', 'Family Brands', 'Education', 'S6 INCOME'] as const

/** Find sheet by exact or normalized name; returns sheet name as in workbook or undefined */
function findSheetName(sheetNames: string[], name: string): string | undefined {
  const exact = sheetNames.find((s) => s.trim() === name)
  if (exact) return exact
  const lower = name.toLowerCase().replace(/\s+/g, ' ')
  return sheetNames.find((s) => s.toLowerCase().replace(/\s+/g, ' ') === lower)
}

/** Read Country specific questions workbook from file. Parses Family Brands, Education, S6 INCOME. Throws if any required sheet is missing. */
export async function readCountryQuestionsWorkbook(file: File): Promise<CountryQuestionsWorkbook> {
  const buf = await file.arrayBuffer()
  const wb = XLSX.read(new Uint8Array(buf), { type: 'array', cellDates: false })

  const sheetNames = wb.SheetNames
  const missing: string[] = []
  for (const name of REQUIRED_SHEETS) {
    if (!findSheetName(sheetNames, name)) missing.push(name)
  }
  if (missing.length > 0) {
    throw new Error(`Missing required sheet(s): ${missing.join(', ')}. Workbook must contain: qCountry, Family Brands, Education, S6 INCOME.`)
  }

  const getSheet = (name: string): XLSX.WorkSheet => {
    const found = findSheetName(sheetNames, name)
    return wb.Sheets[found!]
  }

  const qCountry = parseQCountry(sheetToRowArrays(getSheet('qCountry')))
  const familyBrands = parseFamilyBrands(sheetToRowArrays(getSheet('Family Brands')))
  const education = parseEducation(sheetToRowArrays(getSheet('Education')))
  const s6Income = parseS6Income(sheetToRowArrays(getSheet('S6 INCOME')))

  return {
    qCountry,
    familyBrands,
    education,
    s6Income,
    fileName: file.name,
  }
}

/** One row for the Family Brands sheet in CC_PACKAGE export (Text, Object Name, Extended Properties with subFamilyBrands). */
export interface FamilyBrandsSheetRow {
  Text: string
  'Object Name': string
  'Extended Properties': string
}

/** Build rows for the Family Brands sheet in CC_PACKAGE export. Groups by family (THEN SHOW FAMILY BRAND CODE / FAMILY BRAND LABEL) and lists all BRAND_FUNNEL BRAND CODE as subFamilyBrands. */
export function buildFamilyBrandsSheetRows(rows: FamilyBrandRow[]): FamilyBrandsSheetRow[] {
  const byFamily = new Map<string, { label: string; familyCode: number | null; subCodes: number[] }>()
  for (const r of rows) {
    const familyCode = r.thenShowFamilyBrandCode
    const label = (r.familyBrandLabel ?? '').trim()
    const subCode = r.brandFunnelBrandCode
    if (familyCode == null && !label) continue
    const key = `${familyCode ?? ''}\t${label}`
    if (!byFamily.has(key)) {
      byFamily.set(key, { label, familyCode, subCodes: [] })
    }
    const entry = byFamily.get(key)!
    if (subCode != null && !entry.subCodes.includes(subCode)) {
      entry.subCodes.push(subCode)
    }
  }
  const result: FamilyBrandsSheetRow[] = []
  for (const [, { label, familyCode, subCodes }] of byFamily) {
    const objectName = familyCode != null ? `_${familyCode}` : ''
    const subFamilyBrands = subCodes.map((c) => `_${c}`).join(', ')
    result.push({
      Text: label,
      'Object Name': objectName,
      'Extended Properties': JSON.stringify({ subFamilyBrands }),
    })
  }
  return result
}

/** One row for the EDUCATION_LIST sheet in CC_PACKAGE export (Text, Object Name). */
export interface EducationListSheetRow {
  Text: string
  'Object Name': string
}

/** Build rows for the EDUCATION_LIST sheet in CC_PACKAGE export. Columns: Text (= Label Education), Object Name (= _Code). One row per Code (deduplicated), sorted by Code. */
export function buildEducationListSheetRows(rows: EducationRow[]): EducationListSheetRow[] {
  const byCode = new Map<number, string>()
  for (const r of rows) {
    if (r.Code == null) continue
    if (!byCode.has(r.Code)) {
      byCode.set(r.Code, (r.LabelEducation ?? '').trim())
    }
  }
  const out: EducationListSheetRow[] = Array.from(byCode.entries())
    .sort(([a], [b]) => a - b)
    .map(([code, text]) => ({
      Text: text,
      'Object Name': `_${code}`,
    }))
  return out
}

/** One row for the INCOME_LIST sheet in CC_PACKAGE export (Text, Object Name). */
export interface IncomeListSheetRow {
  Text: string
  'Object Name': string
}

/** Build rows for the INCOME_LIST sheet in CC_PACKAGE export. Columns: Text (= Label Income), Object Name (= _Code Income). One row per Code Income (deduplicated), sorted by code. */
export function buildIncomeListSheetRows(rows: S6IncomeRow[]): IncomeListSheetRow[] {
  const byCode = new Map<number, string>()
  for (const r of rows) {
    if (r.CodeIncome == null) continue
    if (!byCode.has(r.CodeIncome)) {
      byCode.set(r.CodeIncome, (r.LabelIncome ?? '').trim())
    }
  }
  const out: IncomeListSheetRow[] = Array.from(byCode.entries())
    .sort(([a], [b]) => a - b)
    .map(([code, text]) => ({
      Text: text,
      'Object Name': `_${code}`,
    }))
  return out
}

export interface ListFile {
  filename: string
  content: string
}

/** Escape a cell for CSV: wrap in quotes and escape internal quotes. */
function escapeCsvCell(val: string | number | null): string {
  if (val === null || val === undefined) return ''
  const s = String(val)
  if (s.includes('"') || s.includes(',') || s.includes('\n') || s.includes('\r')) {
    return `"${s.replace(/"/g, '""')}"`
  }
  return s
}

/** Data subset for list generation (full workbook or country-filtered). */
export type CountryListsData = Pick<CountryQuestionsWorkbook, 'familyBrands' | 'education' | 's6Income'>

/** Generate list files from parsed Country questions workbook (or country-filtered subset). forIField = true -> CSV, false -> tab-separated .txt */
export function generateCountryLists(data: CountryListsData, forIField: boolean): ListFile[] {
  const ext = forIField ? 'csv' : 'txt'
  const sep = forIField ? ',' : '\t'
  const files: ListFile[] = []

  // Family Brands
  const fbHeader = ['Market', 'qCountry Code', 'BRAND_FUNNEL BRAND CODE', 'BRAND_FUNNEL BRAND LABEL', 'FOR CATEGORY CODE', 'CATEGORY LABEL', 'THEN SHOW FAMILY BRAND CODE', 'FAMILY BRAND LABEL']
  const fbRows = data.familyBrands.map((r) => [
    r.Market ?? '',
    r.qCountryCode ?? '',
    r.brandFunnelBrandCode ?? '',
    r.brandFunnelBrandLabel ?? '',
    r.forCategoryCode ?? '',
    r.categoryLabel ?? '',
    r.thenShowFamilyBrandCode ?? '',
    r.familyBrandLabel ?? '',
  ])
  const fbContent = forIField
    ? [fbHeader.map(escapeCsvCell).join(','), ...fbRows.map((row) => row.map(escapeCsvCell).join(','))].join('\r\n')
    : [fbHeader.join(sep), ...fbRows.map((row) => row.map(String).join(sep))].join('\n')
  files.push({ filename: `Family_Brands.${ext}`, content: fbContent })

  // Education
  const eduHeader = ['Country', 'Variable Name', 'Code', 'Label Education']
  const eduRows = data.education.map((r) => [
    r.Country ?? '',
    r.VariableName ?? '',
    r.Code ?? '',
    r.LabelEducation ?? '',
  ])
  const eduContent = forIField
    ? [eduHeader.map(escapeCsvCell).join(','), ...eduRows.map((row) => row.map(escapeCsvCell).join(','))].join('\r\n')
    : [eduHeader.join(sep), ...eduRows.map((row) => row.map(String).join(sep))].join('\n')
  files.push({ filename: `Education.${ext}`, content: eduContent })

  // S6 INCOME
  const incHeader = ['Country', 'Variable Name', 'Code Income', 'Label Income', 'HHINC_GRP']
  const incRows = data.s6Income.map((r) => [
    r.Country ?? '',
    r.VariableName ?? '',
    r.CodeIncome ?? '',
    r.LabelIncome ?? '',
    r.HHINC_GRP ?? '',
  ])
  const incContent = forIField
    ? [incHeader.map(escapeCsvCell).join(','), ...incRows.map((row) => row.map(escapeCsvCell).join(','))].join('\r\n')
    : [incHeader.join(sep), ...incRows.map((row) => row.map(String).join(sep))].join('\n')
  files.push({ filename: `S6_INCOME.${ext}`, content: incContent })

  return files
}
