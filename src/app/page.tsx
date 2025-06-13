"use client"

import { useState } from "react"
import SaveButton from "@/app/components/SaveButton"
import MaterialsLinks from "@/app/components/MaterialsLinks"
import { motion } from "framer-motion"
import { FileSpreadsheet, FileText } from "lucide-react"
import { cn } from "@/app/utils/cn"
import { Geologica } from 'next/font/google'

const geologica = Geologica({ subsets: ['latin'] })

export default function Home() {
  const [activeTab, setActiveTab] = useState<"export" | "materials">("export")

  return (
    <main className={cn("min-h-screen bg-gray-900", geologica.className)}>
      <div className="flex justify-center gap-4 pt-8">
        <motion.button
          onClick={() => setActiveTab("export")}
          className={cn(
            "flex items-center gap-2 px-6 py-3 rounded-full",
            "transition-all duration-200",
            activeTab === "export"
              ? "bg-gray-800 text-gray-100"
              : "bg-gray-800/50 text-gray-400 hover:bg-gray-700/50"
          )}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <FileSpreadsheet className="w-5 h-5" />
          <span>Export</span>
        </motion.button>

        <motion.button
          onClick={() => setActiveTab("materials")}
          className={cn(
            "flex items-center gap-2 px-6 py-3 rounded-full",
            "transition-all duration-200",
            activeTab === "materials"
              ? "bg-gray-800 text-gray-100"
              : "bg-gray-800/50 text-gray-400 hover:bg-gray-700/50"
          )}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <FileText className="w-5 h-5" />
          <span>Materials</span>
        </motion.button>
      </div>

      <div className="mt-8">
        {activeTab === "export" ? <SaveButton /> : <MaterialsLinks />}
      </div>
    </main>
  )
}

