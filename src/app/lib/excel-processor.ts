import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';
import JSZip from 'jszip';
import { CountryCodes, ExcelData, ProcessedData } from "@/app/types";
import { toast } from "sonner";

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
  "Uzbekistan": "UZ"
};

interface DiaryCategory {
  text: string;
  objectName: string;
  groupId?: string;
  isHeader: boolean;
  containerCodes?: string;
}

export async function processExcelFile(file: File, exportInXlsx: boolean = false): Promise<void> {
  try {
    const data = await readExcelFile(file);
    const indexSheet = data.INDEX[4]; // Row 10 (0-based)
    const countryName = indexSheet?.D; // Column D
    const isoCode = COUNTRY_CODES[countryName];
    
    if (!isoCode) {
      toast.error(`Country "${countryName}" not recognized. Please check the INDEX sheet.`, {
        duration: 5000,
      });
      throw new Error(`Country "${countryName}" not recognized`);
    }

    const processedData = processSheets(data, isoCode);
    
    await generateExportFiles(processedData, countryName, isoCode, exportInXlsx);
    return Promise.resolve();
  } catch (error: any) {
    console.error('Error processing Excel file:', error);
    toast.error(`Error processing file: ${error.message || 'Unknown error'}`, {
      duration: 5000,
    });
    return Promise.reject(error);
  }
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
            const headers = jsonData[7]; // Save the header row (8th row, 0-based index)
            const dataRows = jsonData.slice(8); // Remove first 8 rows
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
    diaryCategories: processDiaryCategories(data.SUB_CATEGORY_LIST, data.CONTAINERS),
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

function processDiaryCategories(categoryData: any[], containerData: any[]): string[] {
  // Check if we have valid data
  if (!categoryData || categoryData.length === 0) {
    toast.error("No category data found for diary categories", {
      duration: 5000,
    });
    return [`DIARY_CATEGORIES"" define`, "{", "};"]; // Return minimal valid structure
  }

  const result = [`DIARY_CATEGORIES"" define`, "{"];
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
      if (categories.length > 0) {
        result.push(`_${code} "${label}"`);
        result.push("{");
        result.push(...categories.map((cat, i) => cat + (i < categories.length - 1 ? "," : "")));
        result.push("},");
      }
    });

  // Always add the _1000 header with the "Other (specify)" entry
  result.push('_1000 "Local, traditional or other type of drink"');
  result.push("{");
  
  // Add local categories if any
  if (localCategories.length > 0) {
    result.push(...localCategories.map((cat, i) => cat + "," ));
  }
  
  // Add "Other (specify)" entry as the last item in the _1000 section
  result.push('_1004 "Other (specify)" [ ContainersCodes = "{}" ]');
  result.push("} fix");

  result.push("};");
  
  // Log for debugging
  console.log("Processed diary categories:", result);
  
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

  if (entries.length === 0) {
    toast.error(`No valid entries found in ${listName}. Please check your Excel file.`, {
      duration: 5000,
    });
    throw new Error(`No valid entries found in ${listName}`);
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

function createImagesList(brandList: string[]): any[] {
  const rows: any[] = [];
  console.log("Processing brand list for images:", brandList.slice(0, 3)); // Log first 3 items
  
  for (const line of brandList) {
    // First match basic pattern for code and text
    const match = line.match(/_(\d+)\s*"([^"]+)"/);
    
    if (match) {
      const objectName = match[1];
      const brandName = match[2];
      
      // Extract category codes, handling multi-line format
      let categoryCode = "";
      const fullText = line.replace(/\n/g, " ");
      const categoryMatch = fullText.match(/CategoryCode\s*=\s*"\{([^}]+)\}"/);
      
      if (categoryMatch) {
        // Process the category codes - they might be in format _123,_456
        categoryCode = categoryMatch[1].trim();
      }
      
      const row = {
        'Position': 0, // Will be updated with index + 1 below
        'Text': `{#RESOURCE:_${objectName}.jpg#}<br/>${brandName}`,
        'Object Name': `_${objectName}`,
        'Extended Properties': JSON.stringify({
          CategoryCode: categoryCode
        })
      };
      
      rows.push(row);
      
      // Log the first few processed rows
      if (rows.length <= 2) {
        console.log("Processed image row:", row);
      }
    }
  }

  const finalRows = rows.map((row, index) => ({
    ...row,
    'Position': index + 1
  }));
  
  console.log(`Processed ${finalRows.length} image rows`);
  
  return finalRows;
}

async function generateExportFiles(data: ProcessedData, countryName: string, isoCode: string, exportInXlsx: boolean): Promise<void> {
  try {
    const zip = new JSZip();
    
    // Text files configuration
    const files = [
      { name: `MAIN_BRANDLIST_${isoCode}.txt`, content: data.mainBrandList },
      { name: `DIARY_BRANDLIST_${isoCode}.txt`, content: data.diaryBrandList },
      { name: `EQUITY_BRANDLIST_${isoCode}.txt`, content: data.equityBrandList },
      { name: `IMAGERY_LIST_${isoCode}.txt`, content: data.imageryList },
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
      },
      {
        name: `IMAGERY_LIST_${isoCode}.xlsx`,
        sheetName: 'Imagery List',
        data: data.imageryList
      },
      {
        name: `DIARY_CATEGORIES_${isoCode}.xlsx`,
        sheetName: 'Diary Categories',
        data: data.diaryCategories
      }
    ];

    // Add image list Excel files
    if (exportInXlsx) {
      excelFiles.push(
        {
          name: `MAIN_BRANDLIST_IMAGES_${isoCode}.xlsx`,
          sheetName: 'Main Brand List Images',
          data: createImagesList(data.mainBrandList)
        },
        {
          name: `DIARY_BRANDLIST_IMAGES_${isoCode}.xlsx`,
          sheetName: 'Diary Brand List Images',
          data: createImagesList(data.diaryBrandList)
        },
        {
          name: `EQUITY_BRANDLIST_IMAGES_${isoCode}.xlsx`,
          sheetName: 'Equity Brand List Images',
          data: createImagesList(data.equityBrandList)
        }
      );
    }

    // Add text files to zip
    if (!exportInXlsx) {
    files.forEach(file => {
        zip.file(file.name, file.content.join('\n'));
      });
    }

    // Add Excel files to zip if exportInXlsx is true
    if (exportInXlsx) {
      for (const file of excelFiles) {
        const excelData = file.name.includes('_IMAGES_') 
          ? file.data // Use the already formatted image list data
          : convertToExcelFormat(parseListToExcelRows(file.data));
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
  } catch (error: any) {
    console.error('Error generating export files:', error);
    toast.error(`Error generating export files: ${error.message || 'Unknown error'}`);
  }
}

function parseListToExcelRows(list: string[]): any[] {
  const rows: any[] = [];
  let currentObject: any = {};

  // Special handling for DIARY_CATEGORIES
  if (list.length > 0 && list[0].includes('DIARY_CATEGORIES')) {
    return parseDiaryCategories(list);
  }

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

function parseDiaryCategories(list: string[]): any[] {
  console.log("Parsing diary categories:", list);
  
  // If the list is empty or only contains the define and empty structure, return empty array
  if (list.length <= 3) {
    console.warn("Diary categories list is empty or minimal");
    return [];
  }
  
  const rows: any[] = [];
  let currentHeader: { id: string; text: string } | null = null;
  let inBlock = false;
  let currentItem = '';
  let hasOtherSpecify = false; // Track if we've already added the "Other (specify)" entry
  let has1000Header = false; // Track if we've found the _1000 header
  
  // Define default values for all columns
  const defaultValues = {
    'Measure': '',
    'Answers Reference': '',
    'Fixed To Position': '0',
    'Exclusive': '0',
    'Display Order': '',
    'SPSS Code': '',
    'Is Other': '0',
    'Other field Object Name': '',
    'Text Field Type': '',
    'Data Type': '',
    'Placeholder': '',
    'Precision/Length': '',
    'Scale': '',
    'Minimum Text Length': '',
    'Maximum Text Length': '',
    'Minimum Value': '',
    'Maximum Value': '',
    'Text Content Rule': '',
    'Range Expression': '',
    'Regular Expression': '',
    'Visualization': '',
    'Data Classification': '0',
    'Other field Extended Properties': '{}'
  };

  for (let i = 0; i < list.length; i++) {
    const line = list[i].trim();
  
    // Skip empty lines
    if (!line) {
      continue;
    }
    
    // Check for "Other (specify)" entry
    if (line.includes('_1004') && line.includes('Other (specify)')) {
      hasOtherSpecify = true;
    }
  
    // Handle block structure
    if (line === '{') {
      inBlock = true;
      currentItem = '';
      continue;
    }
    
    if (line === '},') {
      inBlock = false;
      if (currentHeader && currentItem) {
        // Split items by "],," or "]," to handle multiple items
        const items = currentItem.split(/\],+/).filter(item => item.trim());
        
        for (const item of items) {
          // Match all three parts: code, label, and container codes
          const subItemMatch = item.match(/^\s*_(\d+)\s*"([^"]+)"\s*\[\s*ContainersCodes\s*=\s*"\{([^}]+)\}"/);
          
          if (subItemMatch) {
            rows.push({
              'Text': subItemMatch[2],
              'Object Name': `_${subItemMatch[1]}`,
              'Group ID': '', // Temporary empty value, will be filled later
              'Display As Header': '0',
              'No Filter': '0',
              'Extended Properties': JSON.stringify({
                ContainersCodes: subItemMatch[3]
              }),
              ...defaultValues
            });
          }
        }
      }
      currentHeader = null;
      currentItem = '';
      continue;
    }
    
    if (line === '} fix') {
      inBlock = false;
      if (currentHeader && currentItem) {
        // Split items by "],," or "]," to handle multiple items
        const items = currentItem.split(/\],+/).filter(item => item.trim());
        
        for (const item of items) {
          // Match all three parts: code, label, and container codes
          const subItemMatch = item.match(/^\s*_(\d+)\s*"([^"]+)"\s*\[\s*ContainersCodes\s*=\s*"\{([^}]+)\}"/);
          
          if (subItemMatch) {
            rows.push({
              'Text': subItemMatch[2],
              'Object Name': `_${subItemMatch[1]}`,
              'Group ID': '', // Temporary empty value, will be filled later
              'Display As Header': '0',
              'No Filter': '0',
              'Extended Properties': JSON.stringify({
                ContainersCodes: subItemMatch[3]
              }),
              ...defaultValues
            });
          }
        }
      }
      currentHeader = null;
      currentItem = '';
      continue;
    }
  
    if (line === 'define' || line === '};' || line === '],' || line === '}') {
      continue;
    }
  
    // Match header pattern: _100 "Sparkling (fizzy) soft drink"
    const headerMatch = line.match(/^_(\d+)\s*"([^"]+)"$/);
    if (headerMatch && !line.includes('ContainersCodes')) {
      const headerId = headerMatch[1];
      const headerText = headerMatch[2];
      currentHeader = {
        id: headerId,
        text: headerText
      };
      
      // Check if this is the _1000 header
      if (headerId === '1000') {
        has1000Header = true;
      }
  
      // Special handling for Alcoholic drinks and alternatives
      const isAlcoholic = headerId === '900' || headerId === '1100';
  
      // Add header row
      rows.push({
        'Text': headerText,
        'Object Name': `_${headerId}`,
        'Group ID': '',
        'Display As Header': '1',
        'No Filter': isAlcoholic ? '0' : '1',
        'Extended Properties': '{}',
        ...defaultValues
      });
      continue;
    }
  
    // Accumulate sub-items
    if (inBlock) {
      currentItem += line.trim() + ' ';
    }
  }
  
  // If no rows were processed, return empty array
  if (rows.length === 0) {
    console.warn("No diary categories were processed");
    return [];
  }
  
  // First pass: Add positions and track header positions
  const headerPositions = new Map<string, number>();
  const rowsWithPositions = rows.map((row, index) => {
    const position = index + 1;
    if (row['Display As Header'] === '1') {
      headerPositions.set(row['Object Name'], position);
    }
    return {
      'Position': position,
      ...row
    };
  });
  
  // Second pass: Update Group IDs based on header positions
  const processedRows = rowsWithPositions.map(row => {
    if (row['Display As Header'] === '0') {
      // Get the first 2-4 digits of the Object Name to match with header
      const objectNumber = parseInt(row['Object Name'].substring(1));
      const headerNumber = Math.floor(objectNumber / 100) * 100;
      const headerPrefix = `_${headerNumber}`;
      const headerPosition = headerPositions.get(headerPrefix);
      return {
        ...row,
        'Group ID': headerPosition ? headerPosition.toString() : ''
      };
    }
    return row;
  });

  // Add the _1000 header if it doesn't exist
  let localHeaderPosition = headerPositions.get('_1000');
  if (!has1000Header && processedRows.length > 0) {
    const newPosition = processedRows.length + 1;
    processedRows.push({
      'Position': newPosition,
      'Text': 'Local, traditional or other type of drink',
      'Object Name': '_1000',
      'Group ID': '',
      'Display As Header': '1',
      'No Filter': '1',
      'Extended Properties': '{}',
      ...defaultValues
    });
    localHeaderPosition = newPosition;
  }

  // Add the "Other (specify)" row at the end if we have any rows and haven't already added it
  if (processedRows.length > 0 && !hasOtherSpecify) {
    processedRows.push({
      'Position': processedRows.length + 1,
      'Text': 'Other (specify)',
      'Object Name': '_1004',
      'Measure': '',
      'Group ID': localHeaderPosition ? localHeaderPosition.toString() : '',
      'Answers Reference': '',
      'Display As Header': '0',
      'Fixed To Position': '0',
      'Exclusive': '0',
      'No Filter': '0',
      'Display Order': '',
      'SPSS Code': '',
      'Extended Properties': '{"ContainersCode":""}',
      'Is Other': '1',
      'Other field Object Name': '_1004',
      'Text Field Type': '2',
      'Data Type': '3',
      'Placeholder': '',
      'Precision/Length': '4000',
      'Scale': '0',
      'Minimum Text Length': '',
      'Maximum Text Length': '',
      'Minimum Value': '',
      'Maximum Value': '',
      'Text Content Rule': '',
      'Range Expression': '',
      'Regular Expression': '',
      'Visualization': '1',
      'Data Classification': '0',
      'Other field Extended Properties': '{}'
    });
  }

  console.log("Processed diary categories rows:", processedRows.length);
  return processedRows;
}

function convertToExcelFormat(rows: any[]): any[] {
  // Remove duplicates based on Object Name
  const uniqueRows = rows.filter((row, index, self) =>
    index === self.findIndex((r) => r['Object Name'] === row['Object Name'])
  );

  return uniqueRows.sort((a, b) => a['Position'] - b['Position']);
} 