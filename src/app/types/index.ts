export interface CountryCodes {
    [key: string]: string;
  }
  
  export interface ExcelData {
    INDEX: any[];
    MAIN_BRAND_LIST: any[];
    DIARY_BRAND_LIST: any[];
    IMAGERY: any[];
    SUB_CATEGORY_LIST: any[];
    CONTAINERS: any[];
    EQUITY_BRAND_LIST: any[];
  }
  
  export interface ProcessedData {
    mainBrandList: string[];
    diaryBrandList: string[];
    equityBrandList: string[];
    imageryList: string[];
    diaryCategories: string[];
    fullList: string[];
  }

  export interface MaterialsLink {
    id: string
    title: string
    url: string
    description?: string
    quarter: string // Q1, Q2, Q3, Q4
    year: number // 2024, 2025, etc.
    lastUpdated: string
    updatedBy?: string
  } 