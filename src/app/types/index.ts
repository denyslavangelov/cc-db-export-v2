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
  }
  
  export interface ProcessedData {
    mainBrandList: string[];
    diaryBrandList: string[];
    equityBrandList: string[];
    imageryList: string[];
    diaryCategories: string[];
    fullList: string[];
  } 