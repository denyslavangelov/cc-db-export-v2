"use client"

import { useState, useEffect, useCallback } from 'react'
import { motion } from 'framer-motion'
import { CheckSquare, Square, RotateCcw, FileText, CheckCircle2 } from 'lucide-react'
import { cn } from '@/app/utils/cn'
import { Geologica } from 'next/font/google'

const geologica = Geologica({ subsets: ['latin'] })

interface ChecklistItem {
  id: string
  text: string
  checked: boolean
  subItems?: ChecklistItem[]
}

const defaultChecklist: ChecklistItem[] = [
  {
    id: "1",
    text: "Update the IIS Shell",
    checked: false
  },
  {
    id: "2",
    text: "Adjustments to the default shell:",
    checked: false,
    subItems: [
      {
        id: "2.1",
        text: "Comment out `page_age.Ask()`",
        checked: false
      },
      {
        id: "2.2",
        text: "Comment out `resp_gender.Ask()`",
        checked: false
      },
      {
        id: "2.3",
        text: "Increase `MaxOpCodesExecuted` to **200,000** (default is 20,000)",
        checked: false
      },
      {
        id: "2.4",
        text: "Comment out `ReturnCode = 'CF'`",
        checked: false
      }
    ]
  },
  {
    id: "3",
    text: "Update the lists:",
    checked: false,
    subItems: [
      {
        id: "3.1",
        text: "Download the **WaveDetails** Excel file from SharePoint",
        checked: false
      },
      {
        id: "3.2",
        text: "Export the lists using the **CCDB Export Tool**",
        checked: false
      },
      {
        id: "3.3",
        text: "Copy & paste the lists from the exported file into your **mdd**",
        checked: false
      }
    ]
  },
  {
    id: "4",
    text: "Update country-specific questions:",
    checked: false,
    subItems: [
      {
        id: "4.1",
        text: "Update the **REGION_SUMMARY** page with country-specific region questions",
        checked: false
      },
      {
        id: "4.2",
        text: "Update the categories of **INCOME_LIST** using the **Country Specific Questions Excel**",
        checked: false
      },
      {
        id: "4.3",
        text: "Update the **EDUCATION** categories using the same approach",
        checked: false
      },
      {
        id: "4.4",
        text: "Locate the **\"Country_Specific_Questions_Start\"** tag in the routing and update the following:",
        checked: false,
        subItems: [
          {
            id: "4.4.1",
            text: "CultureInfo",
            checked: false
          },
          {
            id: "4.4.2",
            text: "Recode **QCOUNTRY** with the correct category (check metadata)",
            checked: false
          },
          {
            id: "4.4.3",
            text: "Update **QLANGUAGE** with correct categories (check metadata)",
            checked: false
          },
          {
            id: "4.4.4",
            text: "Update the name of the **INCOME** question (delete old version)",
            checked: false
          },
          {
            id: "4.4.5",
            text: "Update the name of the **EDUCATION** question (delete old version)",
            checked: false
          },
          {
            id: "4.4.6",
            text: "Update the income recoding (**HHINC**, from questionnaire)",
            checked: false
          },
          {
            id: "4.4.7",
            text: "Update the minimum **AGE** (from questionnaire)",
            checked: false
          },
          {
            id: "4.4.8",
            text: "Update the **AEQ** categories (**AEQ_QUALIFY**, from questionnaire)",
            checked: false
          }
        ]
      }
    ]
  },
  {
    id: "5",
    text: "Final Step: Testing",
    checked: false,
    subItems: [
      {
        id: "5.1",
        text: "Run test cases and generate dummy data to confirm everything is working smoothly and no errors appear",
        checked: false
      }
    ]
  }
]

export default function Checklist() {
  const [checklist, setChecklist] = useState<ChecklistItem[]>(defaultChecklist)
  const [progress, setProgress] = useState(0)

  const countTotalItems = (items: ChecklistItem[]): number => {
    let count = items.length
    items.forEach(item => {
      if (item.subItems) {
        count += countTotalItems(item.subItems)
      }
    })
    return count
  }

  const countCheckedItems = (items: ChecklistItem[]): number => {
    let count = 0
    items.forEach(item => {
      if (item.checked) count++
      if (item.subItems) {
        count += countCheckedItems(item.subItems)
      }
    })
    return count
  }

  const calculateProgress = useCallback(() => {
    const totalItems = countTotalItems(checklist)
    const checkedItems = countCheckedItems(checklist)
    setProgress(Math.round((checkedItems / totalItems) * 100))
  }, [checklist, countTotalItems, countCheckedItems])

  // Load checklist from localStorage on component mount
  useEffect(() => {
    const savedChecklist = localStorage.getItem('coca-cola-checklist')
    if (savedChecklist) {
      setChecklist(JSON.parse(savedChecklist))
    }
  }, [])

  // Save checklist to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem('coca-cola-checklist', JSON.stringify(checklist))
    calculateProgress()
  }, [checklist, calculateProgress])

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
    if (confirm('Are you sure you want to reset the entire checklist? This will uncheck all items.')) {
      setChecklist(defaultChecklist)
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
            <span 
              className={cn(
                "text-sm font-medium transition-all duration-200",
                isMainItem ? "text-gray-100" : "text-gray-200",
                item.checked ? "line-through text-gray-400" : ""
              )}
            >
              {item.text}
            </span>
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
            COCA COLA - Scripting Checklist
          </h1>
          <p className="text-base text-gray-400 tracking-wide mb-3">
            New Market Checklist
          </p>
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
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-semibold text-gray-100">Checklist Items</h2>
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

          {/* Checklist Items */}
          <div className="space-y-2">
            {checklist.map(item => renderChecklistItem(item))}
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
