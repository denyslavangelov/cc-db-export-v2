"use client"

import { useState, useEffect, useCallback } from 'react'
import { motion } from 'framer-motion'
import { CheckSquare, Square, RotateCcw, FileText, CheckCircle2, Play, ExternalLink } from 'lucide-react'
import { cn } from '@/app/utils/cn'
import { Geologica } from 'next/font/google'

const geologica = Geologica({ subsets: ['latin'] })

interface ChecklistItem {
  id: string
  text: string
  checked: boolean
  platform: string
  subItems?: ChecklistItem[]
}

const defaultChecklist: ChecklistItem[] = [
  {
    id: "1",
    text: "Transfer / Upload Images / DBs",
    checked: false,
    platform: "iField"
  },
  {
    id: "2",
    text: "Update the IIS Shell",
    checked: false,
    platform: "Dimensions Only"
  },
  {
    id: "3",
    text: "Adjustments to the default shell:",
    checked: false,
    platform: "Dimensions Only",
    subItems: [
      {
        id: "3.1",
        text: "Comment out `page_age.Ask()`",
        checked: false,
        platform: "Dimensions Only"
      },
      {
        id: "3.2",
        text: "Comment out `resp_gender.Ask()`",
        checked: false,
        platform: "Dimensions Only"
      },
      {
        id: "3.3",
        text: "Increase `MaxOpCodesExecuted` to **200,000** (default is 20,000)",
        checked: false,
        platform: "Dimensions Only"
      },
      {
        id: "3.4",
        text: "Comment out `ReturnCode = 'CF'`",
        checked: false,
        platform: "Dimensions Only"
      }
    ]
  },
  {
    id: "4",
    text: "Update the lists:",
    checked: false,
    platform: "Both",
    subItems: [
      {
        id: "4.1",
        text: "Download the **WaveDetails** Excel file from SharePoint",
        checked: false,
        platform: "Both"
      },
      {
        id: "4.2",
        text: "Export the lists using the **CCDB Export Tool**",
        checked: false,
        platform: "Both"
      },
      {
        id: "4.3",
        text: "Copy & paste the lists from the exported file into your **mdd**",
        checked: false,
        platform: "Both"
      }
    ]
  },
  {
    id: "5",
    text: "Update country-specific questions:",
    checked: false,
    platform: "Both",
    subItems: [
      {
        id: "5.1",
        text: "Regions (no QMKTSIZE module)",
        checked: false,
        platform: "iField"
      },
      {
        id: "5.2",
        text: "Update the **REGION_SUMMARY** page with country-specific region questions",
        checked: false,
        platform: "Dimensions Only"
      },
      {
        id: "5.3",
        text: "Update the categories of **INCOME_LIST** using the **Country Specific Questions Excel**",
        checked: false,
        platform: "Both"
      },
      {
        id: "5.4",
        text: "Update the **EDUCATION** categories using the same approach",
        checked: false,
        platform: "Both"
      },
      {
        id: "5.5",
        text: "Locate the **\"Country_Specific_Questions_Start\"** tag in the routing and update the following:",
        checked: false,
        platform: "Both",
        subItems: [
          {
            id: "5.5.1",
            text: "CultureInfo",
            checked: false,
            platform: "CultureInfo"
          },
          {
            id: "5.5.2",
            text: "Recode **QCOUNTRY** with the correct category (check metadata)",
            checked: false,
            platform: "Both"
          },
          {
            id: "5.5.3",
            text: "Update **QLANGUAGE** with correct categories (check metadata)",
            checked: false,
            platform: "Both"
          },
          {
            id: "5.5.4",
            text: "Update the name of the **INCOME** question (delete old version)",
            checked: false,
            platform: "Both"
          },
          {
            id: "5.5.5",
            text: "Update the name of the **EDUCATION** question (delete old version)",
            checked: false,
            platform: "Both"
          },
          {
            id: "5.5.6",
            text: "Update the income recoding (**HHINC**, from questionnaire)",
            checked: false,
            platform: "Both"
          },
          {
            id: "5.5.7",
            text: "Update the minimum **AGE** (from questionnaire)",
            checked: false,
            platform: "Both"
          },
          {
            id: "5.5.8",
            text: "Update the **AEQ** categories (**AEQ_QUALIFY**, from questionnaire)",
            checked: false,
            platform: "Both"
          }
        ]
      }
    ]
  },
  {
    id: "6",
    text: "Update the questions transferred between both stages",
    checked: false,
    platform: "iField"
  },
  {
    id: "7",
    text: "Update custom properties",
    checked: false,
    platform: "iField"
  },
  {
    id: "8",
    text: "Final Step: Testing",
    checked: false,
    platform: "Both",
    subItems: [
      {
        id: "8.1",
        text: "Run test cases and generate dummy data to confirm everything is working smoothly and no errors appear",
        checked: false,
        platform: "Both"
      }
    ]
  }
]

export default function Checklist() {
  const [checklist, setChecklist] = useState<ChecklistItem[]>(defaultChecklist)
  const [progress, setProgress] = useState(0)
  const [selectedPlatform, setSelectedPlatform] = useState<string>("iField")
  const [mounted, setMounted] = useState(false)

  // Filter items based on selected platform
  const filterItemsByPlatform = useCallback((items: ChecklistItem[]): ChecklistItem[] => {
    return items.filter(item => {
      // Check if this item matches the platform
      const itemMatches = item.platform === selectedPlatform || 
        (item.platform === "Both" && (selectedPlatform === "iField" || selectedPlatform === "Dimensions Only"))
      
      // Check if any sub-items match
      const subItemsMatch = item.subItems && item.subItems.some(subItem => 
        subItem.platform === selectedPlatform || 
        (subItem.platform === "Both" && (selectedPlatform === "iField" || selectedPlatform === "Dimensions Only"))
      )
      
      return itemMatches || subItemsMatch
    }).map(item => {
      // If item has sub-items, filter them recursively
      if (item.subItems) {
        const filteredSubItems = filterItemsByPlatform(item.subItems)
        return { ...item, subItems: filteredSubItems }
      }
      return item
    })
  }, [selectedPlatform])

  const filteredChecklist = filterItemsByPlatform(checklist)

  const countTotalItems = useCallback((items: ChecklistItem[]): number => {
    let count = items.length
    items.forEach(item => {
      if (item.subItems) {
        count += countTotalItems(item.subItems)
      }
    })
    return count
  }, [])

  const countCheckedItems = useCallback((items: ChecklistItem[]): number => {
    let count = 0
    items.forEach(item => {
      if (item.checked) count++
      if (item.subItems) {
        count += countCheckedItems(item.subItems)
      }
    })
    return count
  }, [])

  const calculateProgress = useCallback(() => {
    const totalItems = countTotalItems(filteredChecklist)
    const checkedItems = countCheckedItems(filteredChecklist)
    setProgress(totalItems > 0 ? Math.round((checkedItems / totalItems) * 100) : 0)
  }, [filteredChecklist, countTotalItems, countCheckedItems])


  // Handle client-side mounting and localStorage
  useEffect(() => {
    setMounted(true)
    const savedChecklist = localStorage.getItem('coca-cola-checklist')
    if (savedChecklist) {
      const parsedChecklist = JSON.parse(savedChecklist)
      // Check if platform data exists
      const hasPlatformData = parsedChecklist.some((item: any) => item.platform)
      if (!hasPlatformData) {
        // No platform data found, use default checklist
        setChecklist(defaultChecklist)
      } else {
        setChecklist(parsedChecklist)
      }
    }
  }, [])

  // Save checklist to localStorage whenever it changes (only after mounting)
  useEffect(() => {
    if (mounted) {
      localStorage.setItem('coca-cola-checklist', JSON.stringify(checklist))
    }
  }, [checklist, mounted])

  // Recalculate progress when checklist or filter changes
  useEffect(() => {
    calculateProgress()
  }, [calculateProgress])

  const toggleItem = (id: string, items: ChecklistItem[]): ChecklistItem[] => {
    return items.map(item => {
      if (item.id === id) {
        return { ...item, checked: !item.checked }
      }
      if (item.subItems) {
        return { ...item, subItems: toggleItem(id, item.subItems) }
      }
      return item
    })
  }

  const handleToggle = (id: string) => {
    setChecklist(prev => toggleItem(id, prev))
  }

  const resetChecklist = () => {
    if (confirm('Are you sure you want to reset the entire checklist? This will uncheck all items and restore platform data.')) {
      setChecklist(defaultChecklist)
      // Clear localStorage to ensure fresh start
      localStorage.removeItem('coca-cola-checklist')
    }
  }



  const renderChecklistItem = (item: ChecklistItem, level: number = 0) => {
    const hasSubItems = item.subItems && item.subItems.length > 0
    const isMainItem = level === 0

    return (
      <div key={item.id} className="mb-2">
        <motion.div
          className={cn(
            "flex items-start gap-3 p-3 rounded-lg transition-all duration-200 cursor-pointer group",
            isMainItem 
              ? "bg-gray-700/30 hover:bg-gray-600/40 border border-gray-600/30" 
              : "bg-gray-700/20 hover:bg-gray-600/30 border border-gray-600/20",
            level === 1 ? "ml-6" : level === 2 ? "ml-12" : "",
            item.checked ? "opacity-75" : ""
          )}
          whileHover={{ scale: 1.01 }}
          whileTap={{ scale: 0.99 }}
          onClick={() => handleToggle(item.id)}
        >
          <div className="flex-shrink-0 mt-0.5">
            {item.checked ? (
              <CheckSquare className="w-5 h-5 text-green-400" />
            ) : (
              <Square className="w-5 h-5 text-gray-400 group-hover:text-gray-300" />
            )}
          </div>
          
          <div className="flex-1">
            <div className="flex items-center gap-2 flex-wrap">
              <span 
                className={cn(
                  "text-sm font-medium transition-all duration-200",
                  isMainItem ? "text-gray-100" : "text-gray-200",
                  item.checked ? "line-through text-gray-400" : ""
                )}
              >
                {item.text}
              </span>
              <span 
                className={cn(
                  "px-2 py-1 rounded-full text-xs font-medium",
                  item.platform === "Dimensions Only" ? "bg-blue-500/20 text-blue-300 border border-blue-500/30" :
                  item.platform === "Both" ? "bg-purple-500/20 text-purple-300 border border-purple-500/30" :
                  item.platform === "iField" ? "bg-orange-500/20 text-orange-300 border border-orange-500/30" :
                  item.platform === "CultureInfo" ? "bg-green-500/20 text-green-300 border border-green-500/30" :
                  "bg-gray-500/20 text-gray-300 border border-gray-500/30"
                )}
              >
                {item.platform}
              </span>
            </div>
          </div>
        </motion.div>

        {hasSubItems && (
          <div className="mt-2">
            {item.subItems!.map(subItem => renderChecklistItem(subItem, level + 1))}
          </div>
        )}
      </div>
    )
  }

  // Prevent hydration mismatch by not rendering until mounted
  if (!mounted) {
    return (
      <div className={cn(
        "min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900",
        geologica.className
      )}>
        <div className="w-full max-w-4xl p-4 mx-auto pt-6">
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-400 mx-auto mb-4"></div>
              <p className="text-gray-400">Loading checklist...</p>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className={cn(
      "min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900",
      geologica.className
    )}>
      <div className="w-full max-w-4xl p-4 mx-auto pt-6">
        {/* Header Section */}
        <div className="text-center mb-6">
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="p-3 bg-emerald-500/20 rounded-2xl">
              <CheckCircle2 className="w-10 h-10 text-emerald-400" />
            </div>
          </div>
          <h1 className="text-4xl font-bold text-gray-100 tracking-tight mb-2">
            CC Hub
          </h1>
          <p className="text-lg text-gray-300 tracking-wide mb-2">
            Coca-Cola Market Setup & Scripting Platform
          </p>
          
          {/* Video Link Section - Only for iField */}
          {selectedPlatform === "iField" && (
            <div className="bg-gray-800/40 border border-gray-600/30 rounded-lg p-4 mb-6">
              <div className="flex items-center justify-between">
                <div className="text-left">
                  <h2 className="text-base font-medium text-gray-200 mb-1">
                    iField Setup Tutorial
                  </h2>
                  <p className="text-sm text-gray-400">
                    Essential video guide for iField market implementation
                  </p>
                </div>
                <a
                  href="https://ipsosgroup-my.sharepoint.com/personal/yoana_radneva_ipsos_com/_layouts/15/stream.aspx?id=%2Fpersonal%2Fyoana%5Fradneva%5Fipsos%5Fcom%2FDocuments%2FCoke%20Program%20%2D%20All%20SD%5FQA%2FiField%2FCoke%20iFiled%20%2D%20Scripting%20set%20up%20market%2Emp4&referrer=StreamWebApp%2EWeb&referrerScenario=AddressBarCopied%2Eview%2Eef904c5c%2Dfd0e%2D4014%2Da1fa%2De7aa79221b3f&isDarkMode=true"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 px-4 py-2 bg-orange-500/20 text-orange-300 border border-orange-500/30 rounded-md transition-colors text-sm hover:bg-orange-500/30"
                >
                  <Play className="w-4 h-4" />
                  <span>Watch Video</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              </div>
            </div>
          )}
        </div>

        {/* Progress Bar */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-300">Progress</span>
            <span className="text-sm text-gray-400">{progress}%</span>
          </div>
          <div className="w-full bg-gray-700/30 rounded-full h-2">
            <motion.div
              className="bg-gradient-to-r from-emerald-500 to-emerald-600 h-2 rounded-full transition-all duration-500"
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
            />
          </div>
        </div>

        {/* Main Content */}
        <div className={cn(
          "rounded-3xl p-6",
          "bg-gray-800/60",
          "backdrop-blur-xl",
          "shadow-2xl",
          "border border-gray-700/30"
        )}>
          {/* Action Bar */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
            <h2 className="text-xl font-semibold text-gray-100">Market Setup Checklist</h2>
            <div className="flex items-center gap-4">
              {/* Platform Filter Buttons */}
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium text-gray-300">Filter:</span>
                <motion.button
                  onClick={() => setSelectedPlatform("iField")}
                  className={`px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                    selectedPlatform === "iField"
                      ? 'bg-orange-600 text-white'
                      : 'bg-gray-700/50 text-gray-300 hover:bg-gray-600/50'
                  }`}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  iField
                </motion.button>
                <motion.button
                  onClick={() => setSelectedPlatform("Dimensions Only")}
                  className={`px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                    selectedPlatform === "Dimensions Only"
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-700/50 text-gray-300 hover:bg-gray-600/50'
                  }`}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  Dimensions
                </motion.button>
              </div>
              
              <motion.button
                onClick={resetChecklist}
                className="flex items-center gap-2 px-4 py-2 bg-gray-700/50 hover:bg-gray-600/50 text-gray-300 hover:text-gray-200 rounded-lg transition-all duration-200 border border-gray-600/30"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <RotateCcw className="w-4 h-4" />
                <span className="text-sm font-medium">Reset All</span>
              </motion.button>
              
            </div>
          </div>


          {/* Checklist Items */}
          <div className="space-y-2">
            {filteredChecklist.length === 0 ? (
              <div className="text-center py-8">
                <div className="p-6 bg-gray-700/30 rounded-2xl border-2 border-dashed border-gray-600/50">
                  <CheckCircle2 className="w-12 h-12 text-gray-500 mx-auto mb-3" />
                  <h3 className="text-lg font-semibold text-gray-300 mb-1">
                    No items found for {selectedPlatform}
                  </h3>
                  <p className="text-gray-400 text-sm">Try selecting a different platform or "All Platforms"</p>
                </div>
              </div>
            ) : (
              filteredChecklist.map(item => renderChecklistItem(item))
            )}
          </div>

          {/* Completion Message */}
          {progress === 100 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-8 text-center p-6 bg-emerald-500/20 rounded-2xl border border-emerald-500/30"
            >
              <CheckCircle2 className="w-12 h-12 text-emerald-400 mx-auto mb-3" />
              <h3 className="text-lg font-semibold text-emerald-300 mb-1">Checklist Complete! 🎉</h3>
              <p className="text-emerald-200 text-sm">All items have been checked off. Great job!</p>
            </motion.div>
          )}
        </div>
      </div>

    </div>
  )
}
