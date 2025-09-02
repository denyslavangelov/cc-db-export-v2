"use client"

import { useState, useRef } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Loader2, Check, FileSpreadsheet, Upload, Sparkles, FileUp, FolderOpen, File, ExternalLink, ArrowRight } from "lucide-react"
import confetti from "canvas-confetti"
import { cn } from "@/app/utils/cn"
import { processExcelFile } from "@/app/lib/excel-processor"
import { toast } from "sonner"
import { Geologica } from 'next/font/google'
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"

const geologica = Geologica({ subsets: ['latin'] })

export default function SaveButton() {
  const [status, setStatus] = useState<"idle" | "saving" | "saved">("idle")
  const [bounce, setBounce] = useState(false)
  const [isProcessing, setIsProcessing] = useState(false)
  const [dragActive, setDragActive] = useState(false)
  const [sharePointFiles, setSharePointFiles] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [exportInXlsx, setExportInXlsx] = useState(false)

  const handleFileUpload = async (file: File) => {
    if (!file.name.endsWith('.xlsx')) {
      toast.error('Please select an Excel file (.xlsx)', {
        duration: 5000,
      });
      return;
    }

    setIsProcessing(true);
    setStatus("saving");
    try {
      await processExcelFile(file, exportInXlsx);
      
      // Only show success message and animations if no errors were thrown
      toast.success('Files exported successfully!');
      setStatus("saved");
      setBounce(true);
      
      // Trigger confetti effect
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 },
        colors: ["#ff0000", "#00ff00", "#0000ff", "#ffff00", "#00ffff", "#ff00ff"],
        shapes: ["star", "circle"],
      });
      
      // Reset to idle after 2 seconds
      setTimeout(() => {
        setStatus("idle");
        setBounce(false);
      }, 2000);
    } catch (error: any) {
      console.error('Error processing file:', error);
      
      // Make sure we show an error toast here as well
      toast.error(`Error: ${error.message || 'Unknown error'}`, {
        duration: 5000,
      });
      
      // Reset status immediately on error
      setStatus("idle");
    } finally {
      setIsProcessing(false);
    }
  };

  const buttonVariants = {
    idle: {
      backgroundColor: "rgb(17, 24, 39)",
      color: "white",
      scale: 1,
      transition: { duration: 0.2 }
    },
    saving: {
      backgroundColor: "rgb(59, 130, 246)",
      color: "white",
      scale: 1,
      transition: { duration: 0.2 }
    },
    saved: {
      backgroundColor: "rgb(34, 197, 94)",
      color: "white",
      scale: [1, 1.05, 1],
      transition: {
        duration: 0.3,
        times: [0, 0.5, 1],
        ease: "easeInOut"
      },
    },
  }

  const sparkleVariants = {
    initial: { opacity: 0, scale: 0 },
    animate: { 
      opacity: 1, 
      scale: 1,
      transition: {
        duration: 0.2,
        ease: "easeOut"
      }
    },
    exit: { 
      opacity: 0, 
      scale: 0,
      transition: {
        duration: 0.2,
        ease: "easeIn"
      }
    },
  }

  return (
    <div className={cn(
      "min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900",
      geologica.className
    )}>
      <div className="w-full max-w-2xl p-4 mx-auto pt-6">
        {/* Header Section */}
        <div className="text-center mb-6">
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="p-3 bg-amber-500/15 rounded-2xl">
              <FileSpreadsheet className="w-10 h-10 text-amber-400/80" />
            </div>
          </div>
          <h1 className="text-4xl font-bold text-gray-100 tracking-tight mb-2">
            CC Package Export
          </h1>
          <p className="text-base text-gray-400 tracking-wide mb-3">
            Export your data packages with ease
          </p>
        </div>

        {/* Main Content */}
        <div className={cn(
          "rounded-3xl p-6",
          "bg-gray-800/60",
          "backdrop-blur-xl",
          "shadow-2xl",
          "border border-gray-700/30"
        )}>
          {/* Export Configuration - Secondary Priority */}
          <div className="mb-6">
            <div className="flex items-center justify-center space-x-3 bg-gray-700/20 px-4 py-3 rounded-xl border border-gray-600/30 w-fit mx-auto">
              <Checkbox
                id="exportFormat"
                checked={exportInXlsx}
                onCheckedChange={(checked) => setExportInXlsx(checked as boolean)}
                className="border-gray-500 data-[state=checked]:bg-gray-50 data-[state=checked]:text-gray-900 cursor-pointer"
              />
              <Label 
                htmlFor="exportFormat" 
                className="text-gray-300 font-medium select-none cursor-pointer text-sm"
              >
                Export for iField (CSV)
              </Label>
            </div>
          </div>

          {/* Upload Section */}
          <div className="mb-8">
            <motion.div
              className="group relative w-full max-w-sm mx-auto overflow-hidden rounded-xl bg-gradient-to-r from-amber-500/80 to-amber-600/80 p-0.5 shadow-lg transition-all duration-300 hover:shadow-amber-500/20"
              onDragOver={(e) => {
                e.preventDefault()
                e.stopPropagation()
              }}
              onDrop={(e) => {
                e.preventDefault()
                e.stopPropagation()
                const file = e.dataTransfer.files[0]
                if (file && (file.name.endsWith('.xlsx') || file.name.endsWith('.xls'))) {
                  handleFileUpload(file)
                }
              }}
            >
              <motion.button
                onClick={() => fileInputRef.current?.click()}
                className="relative w-full"
                whileHover={{ 
                  y: -1,
                  transition: { duration: 0.2, ease: "easeOut" }
                }}
                whileTap={{ 
                  y: 0,
                  scale: 0.98,
                  transition: { duration: 0.1, ease: "easeInOut" }
                }}
              >
                <div className="relative flex items-center justify-center gap-3 px-6 py-4 bg-gray-900 rounded-xl transition-all duration-300 group-hover:bg-gray-800">
                  {/* Subtle background glow */}
                  <div className="absolute inset-0 bg-gradient-to-r from-amber-500/10 to-amber-600/10 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                  
                  {/* Icon with minimal animation */}
                  <motion.div
                    className="relative z-10"
                    animate={{ rotate: [0, 2, -2, 0] }}
                    transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                  >
                    <Upload className="w-6 h-6 text-amber-400 group-hover:text-amber-300 transition-colors duration-300" />
                  </motion.div>
                  
                  {/* Text content */}
                  <div className="relative z-10 text-left">
                    <div className="text-lg font-semibold text-white group-hover:text-amber-50 transition-colors duration-300">
                      Upload Package
                    </div>
                    <div className="text-xs text-amber-200/70 group-hover:text-amber-200 transition-colors duration-300">
                      Select Excel files
                    </div>
                  </div>
                  
                  {/* Subtle arrow indicator */}
                  <motion.div
                    className="relative z-10 ml-auto"
                    animate={{ x: [0, 2, 0] }}
                    transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                  >
                    <ArrowRight className="w-4 h-4 text-amber-300/80 group-hover:text-amber-200 transition-colors duration-300" />
                  </motion.div>
                  
                  {/* Subtle hover effect */}
                  <div className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/5 to-transparent group-hover:translate-x-full transition-transform duration-500 ease-out" />
                </div>
              </motion.button>
            </motion.div>
          </div>

          {/* Hidden file input */}
          <input
            ref={fileInputRef}
            type="file"
            accept=".xlsx,.xls"
            onChange={(e) => {
              const file = e.target.files?.[0]
              if (file) {
                handleFileUpload(file)
              }
            }}
            className="hidden"
          />

          {/* Instructions */}
          <div className="mt-4 text-center">
            <p className="text-sm text-gray-400 mb-2">
              Supported format: <span className="text-gray-300 font-medium">.xlsx</span>
            </p>
          </div>

          {/* Quick Actions - Tertiary Priority */}
          <div className="flex justify-center">
            <motion.button
              onClick={() => window.open("https://ipsosgroup.sharepoint.com/teams/MSU-COKE-SmallMarketSolution-TEAM/Shared%20Documents/Forms/AllItems.aspx?id=%2Fteams%2FMSU%2DCOKE%2DSmallMarketSolution%2DTEAM%2FShared%20Documents%2FGeneral%2FOPS%5FFILES&viewid=ff457430%2D3660%2D48e3%2Da7f5%2D9a7de8a333cb", "_blank")}
              className="flex items-center gap-2 px-3 py-2 bg-gray-700/30 hover:bg-gray-600/40 text-gray-300 hover:text-gray-200 rounded-lg transition-all duration-200 border border-gray-600/20 text-xs"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <FolderOpen className="w-3.5 h-3.5" />
              <span className="font-medium">Open Packages Directory</span>
            </motion.button>
          </div>
        </div>
      </div>

      <input
        ref={fileInputRef}
        type="file"
        accept=".xlsx"
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) {
            handleFileUpload(file);
            e.target.value = '';
          }
        }}
      />
    </div>
  )
}

