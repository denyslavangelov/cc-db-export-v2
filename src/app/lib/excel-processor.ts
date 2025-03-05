import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';
import JSZip from 'jszip';
import { CountryCodes, ExcelData, ProcessedData } from "@/app/types";

const COUNTRY_CODES: CountryCodes = {
  "Austria": "AT",
  "Croatia": "CR",
  "Czechia": "CZ",
  "Denmark": "DK",
  "Finland": "FI",
  "Ireland": "IE",
  "Norway": "NO",
  "Slovakia": "SK",
  "Sweden": "SE",
  "Switzerland": "CH",
  "Hungary": "HU",
  "Nigeria": "NG",
  "Serbia": "SB",
  "Bulgaria": "BG",
  "KENYA": "KE",
  "Greece": "GR",
};

export async function processExcelFile(file: File, exportInXlsx: boolean = false): Promise<void> {
  const data = await readExcelFile(file);
  const indexSheet = data.INDEX[4]; // Row 10 (0-based)
  const countryName = indexSheet?.D; // Column D
  const isoCode = COUNTRY_CODES[countryName];
  
  if (!isoCode) {
    throw new Error('Country not recognized');
  }

  const processedData = processSheets(data, isoCode);
  
  await generateExportFiles(processedData, countryName, isoCode, exportInXlsx);
}

async function readExcelFile(file: File): Promise<ExcelData> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target?.result as ArrayBuffer);
        const workbook = XLSX.read(data, { type: 'array' });
        
        // Helper function to remove first 12 rows but keep headers
        const processSheet = (sheetName: string, skipRows: boolean = false) => {
          const sheet = workbook.Sheets[sheetName];
          const jsonData = XLSX.utils.sheet_to_json(sheet, { 
            header: 'A',
            raw: false,
            defval: null
          });

          if (skipRows) {
            const headers = jsonData[8]; // Save the header row (8th row, 0-based index)
            const dataRows = jsonData.slice(9); // Remove first 8 rows
            return [headers, ...dataRows]; // Put header row back at the start
          }
          return jsonData;
        };

        const result: ExcelData = {
          INDEX: processSheet('INDEX'),
          MAIN_BRAND_LIST: processSheet('MAIN BRAND LIST', true),
          DIARY_BRAND_LIST: processSheet('DIARY BRAND LIST', true),
          IMAGERY: processSheet('IMAGERY', true),
          SUB_CATEGORY_LIST: processSheet('SUB CATEGORY LIST', true),
          CONTAINERS: processSheet('CONTAINERS', true)
        };

        
        resolve(result);
      } catch (error) {
        reject(error);
      }
    };
    reader.readAsArrayBuffer(file);
  });
}

function processSheets(data: ExcelData, isoCode: string): ProcessedData {
  return {
    mainBrandList: processMainBrandList(data.MAIN_BRAND_LIST, isoCode),
    diaryBrandList: processDiaryBrandList(data.DIARY_BRAND_LIST, isoCode),
    equityBrandList: processEquityBrandList(data.MAIN_BRAND_LIST, isoCode),
    imageryList: processImageryList(data.IMAGERY, isoCode),
    diaryCategories: processDiaryCategories(data.SUB_CATEGORY_LIST, data.CONTAINERS, isoCode),
    fullList: [] // This will be populated after processing all other lists
  };
}

function processMainBrandList(data: any[], isoCode: string): string[] {
  return formatDataList(data, `MAIN_BRANDLIST_${isoCode}`, 2, 3);
}

function processDiaryBrandList(data: any[], isoCode: string): string[] {
  return formatDataList(data, `DIARY_BRANDLIST_${isoCode}`, 2, 3);
}

function processEquityBrandList(data: any[], isoCode: string): string[] {
  return formatDataList(data, `EQUITY_BRANDLIST_${isoCode}`, 2, 3);
}

function processImageryList(data: any[], isoCode: string): string[] {
  return formatDataList(data, `IMAGERY_BRANDLIST_${isoCode}`, 4, 5, true);
}

function processDiaryCategories(categoryData: any[], containerData: any[], isoCode: string): string[] {
  const result = [`DIARY_CATEGORIES_${isoCode} "" define`, "{"];
  const headers = new Map<string, { label: string, categories: string[] }>();
  const localCategories: string[] = [];

  
  // Process categories
  for (let i = 0; i < categoryData.length; i++) {
    const row = categoryData[i];
    const label = row?.A;
    const code = row?.B;
    const definition = row?.C;
    const headerLabel = row?.D;
    const headerCode = row?.E;

    if (!label || !code) continue;

    if (definition?.toLowerCase().includes("diary")) {
      const containerCodes = getContainerCodes(containerData, code);

      
      const entry = formatCategoryEntry(code, label, containerCodes);

      if (headerCode === "1000") {
        localCategories.push(entry);
      } else {
        if (!headers.has(headerCode)) {
          headers.set(headerCode, { label: headerLabel, categories: [] });
        }
        headers.get(headerCode)?.categories.push(entry);
      }
    }
  }

  // Add headers and their categories
  Array.from(headers.entries())
    .sort(([a], [b]) => parseInt(a) - parseInt(b))
    .forEach(([code, { label, categories }]) => {
      result.push(`_${code} "${label}"`);
      result.push("{");
      result.push(...categories.map((cat, i) => cat + (i < categories.length - 1 ? "," : "")));
      result.push("},");
    });

  // Add local categories at the end
  if (localCategories.length > 0) {
    result.push('_1000 "Local, traditional or other type of drink"');
    result.push("{");
    result.push(...localCategories.map((cat, i) => cat + (i < localCategories.length - 1 ? "," : "")));
    result.push("} fix");
  }

  result.push("};");
  return result;
}

// Helper functions
function formatDataList(data: any[], listName: string, codeCol: number, categoryStartCol: number, isImagery = false): string[] {
  const result = [`${listName} "" define`, "{"];
  const entries: string[] = [];

  for (let i = 0; i < data.length; i++) {
    const row = data[i];
    const name = row?.A;
    const code = row[String.fromCharCode(65 + codeCol - 1)]; // Convert column number to letter

    if (name && code) {
      const formattedName = isImagery ? `<b>${name}</b>` : name;
      const categoryCodes = getCategoryCodes(data, row, categoryStartCol);
      if (categoryCodes.length > 0) {
        entries.push(formatEntry(code, formattedName, categoryCodes));
      }
    }
  }

  result.push(...entries.map((entry, i) => entry + (i < entries.length - 1 ? "," : "")));
  result.push("};");
  return result;
}

function getCategoryCodes(data: any[], row: any, startCol: number): string[] {
  const codes: string[] = [];
  const keys = Object.keys(row);
  const headerRow = row.__rowNum__ === 0 ? row : null; // Store header row if this is the first row
  const headers = data[0];
  
  for (let i = startCol - 1; i < keys.length; i++) {
    const columnKey = keys[i];
    const value = row[columnKey];

    
    const headerValue = headers[columnKey];

    if (value?.toLowerCase() === "yes" && headerValue) {
      const code = extractCategoryCode(headerValue);
      if (code) codes.push(code);
    }
  }
  return codes;
}

function extractCategoryCode(headerText: string): string {
  const match = /\d+/.exec(headerText);
  return match ? match[0] : "";
}

function formatEntry(code: string, name: string, categoryCodes: string[]): string {
  return [
    `_${code} "${name}"`,
    "[",
    `      CategoryCode = "{_${categoryCodes.join(",_")}}"`,
    "]"
  ].join("\n");
}

function formatCategoryEntry(code: string, name: string, containerCodes: string[]): string {
  const entry = [`      _${code} "${name}"`];
  if (containerCodes.length > 0) {
    entry.push("[");
    entry.push(`      ContainersCodes = "{_${containerCodes.join(",_")}}"`,);
    entry.push("]");
  }
  return entry.join("\n");
}

function getContainerCodes(containerData: any[], categoryCode: string): string[] {
  const codes: string[] = [];
  const headerRow = containerData[0];
  let targetCol = -1;

  // Find the column for the category
  Object.keys(headerRow).forEach((key, index) => {
    if (extractCategoryCode(headerRow[key]) === categoryCode) {
      targetCol = index;
    }
  });

  if (targetCol === -1) return codes;

  // Get container codes where the category column has "Yes"
  for (let i = 0; i < containerData.length; i++) {
    const row = containerData[i];
    if (row[Object.keys(row)[targetCol]]?.toLowerCase() === "yes") {
      const containerCode = row?.D;
      if (containerCode) codes.push(containerCode);
    }
  }

  return codes;
}

async function generateExportFiles(data: ProcessedData, countryName: string, isoCode: string, exportInXlsx: boolean): Promise<void> {
  const zip = new JSZip();
  
  // Text files configuration
  const files = [
    { name: `MAIN_BRANDLIST_${isoCode}.txt`, content: data.mainBrandList },
    { name: `DIARY_BRANDLIST_${isoCode}.txt`, content: data.diaryBrandList },
    { name: `EQUITY_BRANDLIST_${isoCode}.txt`, content: data.equityBrandList },
    { name: `IMAGERY_BRANDLIST_${isoCode}.txt`, content: data.imageryList },
    { name: `DIARY_CATEGORIES_${isoCode}.txt`, content: data.diaryCategories },
    { name: `ALL_LISTS_${isoCode}.txt`, content: [...data.mainBrandList, "", ...data.diaryBrandList, "", 
      ...data.equityBrandList, "", ...data.imageryList, "", ...data.diaryCategories] }
  ];

  // Excel files configuration
  const excelFiles = [
    { 
      name: `MAIN_BRANDLIST_${isoCode}.xlsx`,
      sheetName: 'Main Brand List',
      data: data.mainBrandList
    },
    { 
      name: `DIARY_BRANDLIST_${isoCode}.xlsx`,
      sheetName: 'Diary Brand List',
      data: data.diaryBrandList
    },
    { 
      name: `EQUITY_BRANDLIST_${isoCode}.xlsx`,
      sheetName: 'Equity Brand List',
      data: data.equityBrandList
    }
  ];

  // Add text files to zip
  if (!exportInXlsx) {
    files.forEach(file => {
      zip.file(file.name, file.content.join('\n'));
    });
  }

  // Add Excel files to zip if exportInXlsx is true
  if (exportInXlsx) {
    for (const file of excelFiles) {
      const excelData = convertToExcelFormat(parseListToExcelRows(file.data));
      const wb = XLSX.utils.book_new();
      const ws = XLSX.utils.json_to_sheet(excelData);
      XLSX.utils.book_append_sheet(wb, ws, file.sheetName);
      const excelBuffer = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
      zip.file(file.name, excelBuffer);
    }
  }

  // Generate and save the zip file
  const zipBlob = await zip.generateAsync({ type: 'blob' });
  const format = exportInXlsx ? 'iField' : 'DIMENSIONS';
  saveAs(zipBlob, `CC_PACKAGE_EXPORT_${countryName.toUpperCase()}_${format.toUpperCase()}.zip`);
}

function parseListToExcelRows(list: string[]): any[] {
  const rows: any[] = [];
  let currentObject: any = {};

  // Match pattern: _123 "Text" [ CategoryCode = "{_720}" ]
  const pattern = /_(\d+)\s*"([^"]+)"\s*\[\s*CategoryCode\s*=\s*"\{([^}]+)\}"\s*\]/;

  list.forEach(line => {
    const match = line.match(pattern);
    if (match) {
      if (currentObject.Text) {
        rows.push(currentObject);
      }
      const [_, code, text, categories] = match;
      currentObject = {
        Text: text,
        'Object Name': `_${code}`,
        'Extended Properties': JSON.stringify({
          CategoryCode: categories.trim().startsWith('_') ? categories.trim() : `_${categories.trim()}`
        })
      };
    }
  });

  // Push the last object if exists
  if (currentObject.Text) {
    rows.push(currentObject);
  }

  return rows;
}

function convertToExcelFormat(rows: any[]): any[] {
  // Remove any duplicate rows based on Object Name
  const uniqueRows = rows.filter((row, index, self) =>
    index === self.findIndex((r) => r['Object Name'] === row['Object Name'])
  );

  return uniqueRows.sort((a, b) => a['Object Name'].localeCompare(b['Object Name']));
}