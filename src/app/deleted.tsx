"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Loader2, Check, Sun, Moon } from "lucide-react"
import confetti from "canvas-confetti"
import { cn } from "./utils/cn"
import "tailwindcss/tailwind.css"
import { toast } from "sonner"
import { processExcelFile } from "./lib/excel-processor";

export default function SaveButton() {
  const [status, setStatus] = useState<"idle" | "saving" | "saved">("idle")
  const [isDark, setIsDark] = useState(false)

  const handleSave = async () => {
    // Open file picker when button is clicked
    const input = document.createElement('input')
    input.type = 'file'
    input.accept = '.xlsx'
    
    input.onchange = async (e) => {
      const file = (e.target as HTMLInputElement).files?.[0]
      if (!file) return

      if (!file.name.endsWith('.xlsx')) {
        toast.error('Please select an Excel file (.xlsx)')
        return
      }

      setStatus("saving")
      try {
        await processExcelFile(file)
        setStatus("saved")
        toast.success('Files exported successfully!')
        setTimeout(() => setStatus("idle"), 2000)
      } catch (error) {
        toast.error('Error processing file: ' + (error as Error).message)
        setStatus("idle")
      }
    }

    input.click()
  }

  const toggleTheme = () => {
    setIsDark(!isDark)
    document.documentElement.classList.toggle("dark")
  }

  // Button variants for different states
  const buttonVariants = {
    idle: {
      backgroundColor: isDark ? "rgb(64, 64, 64)" : "rgb(243, 244, 246)",
      color: isDark ? "white" : "black",
    },
    saving: {
      backgroundColor: "rgb(59, 130, 246)",
      color: "white",
    },
    saved: {
      backgroundColor: "rgb(34, 197, 94)",
      color: "white",
    },
  }

  return (
    <div
      className={`min-h-screen flex flex-col items-center justify-center gap-4 transition-colors duration-300 ${isDark ? "dark bg-gray-900" : "bg-white"}`}
    >
      <div className="flex flex-col items-center gap-6">
        <h1 className="text-2xl font-semibold text-neutral-800 dark:text-neutral-200">
          Excel File Processor
        </h1>
        <div className="relative">
          {status === "idle" && (
            <button
              onClick={handleSave}
              className="group relative grid overflow-hidden rounded-full px-6 py-2 shadow-[0_1000px_0_0_hsl(0_0%_85%)_inset] transition-colors duration-200 dark:shadow-[0_1000px_0_0_hsl(0_0%_20%)_inset] cursor-pointer"
              style={{ minWidth: "120px" }}
            >
              <span>
                <span
                  className={cn(
                    "spark mask-gradient absolute inset-0 h-[100%] w-[100%] animate-flip overflow-hidden rounded-full",
                    "[mask:linear-gradient(black,_transparent_50%)] before:absolute before:aspect-square before:w-[200%] before:bg-[conic-gradient(from_0deg,transparent_0_340deg,black_360deg)]",
                    "before:rotate-[-90deg] before:animate-rotate dark:before:bg-[conic-gradient(from_0deg,transparent_0_340deg,white_360deg)]",
                    "before:content-[''] before:[inset:0_auto_auto_50%] before:[translate:-50%_-15%] dark:[mask:linear-gradient(white,_transparent_50%)]",
                  )}
                />
              </span>
              <span className="backdrop absolute inset-px rounded-[22px] bg-neutral-100 transition-colors duration-200 group-hover:bg-neutral-200 dark:bg-neutral-950 dark:group-hover:bg-neutral-900" />
              <span className="z-10 text-sm font-medium text-neutral-500 dark:text-neutral-400">Save now</span>
            </button>
          )}
          {status !== "idle" && (
            <motion.button
              onClick={handleSave}
              animate={status}
              variants={buttonVariants}
              className="flex items-center gap-2 px-6 py-2 rounded-full text-sm font-medium transition-shadow hover:shadow-lg cursor-pointer"
              style={{ minWidth: "120px", justifyContent: "center" }}
              transition={{ duration: 0.3 }}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              disabled={status !== "saving"}
              aria-label={`${status === "saving" ? "Saving file" : "File saved"}`}
            >
              <AnimatePresence mode="wait">
                {status === "saving" && (
                  <motion.span
                    key="saving"
                    initial={{ opacity: 0, rotate: 0 }}
                    animate={{ opacity: 1, rotate: 360 }}
                    exit={{ opacity: 0 }}
                    transition={{
                      duration: 0.3,
                      rotate: { repeat: Number.POSITIVE_INFINITY, duration: 1, ease: "linear" },
                    }}
                  >
                    <Loader2 className="w-4 h-4" />
                  </motion.span>
                )}
                {status === "saved" && (
                  <motion.span
                    key="saved"
                    initial={{ opacity: 0, scale: 0.5 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0 }}
                  >
                    <Check className="w-4 h-4" />
                  </motion.span>
                )}
              </AnimatePresence>
              <motion.span
                key={status}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2 }}
              >
                {status === "saving" ? "Saving file" : "File saved"}
              </motion.span>
            </motion.button>
          )}
        </div>
      </div>

      <button
        onClick={toggleTheme}
        className={`p-2 rounded-full transition-colors duration-300 cursor-pointer ${
          isDark ? "bg-gray-800 text-yellow-500 hover:bg-gray-700" : "bg-gray-100 text-gray-900 hover:bg-gray-200"
        }`}
        aria-label={`Switch to ${isDark ? "light" : "dark"} mode`}
      >
        {isDark ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
      </button>
    </div>
  )
}

