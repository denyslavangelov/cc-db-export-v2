"use client"

import { useState, useRef } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Loader2, Check, FileSpreadsheet, Upload, Sparkles, FileUp, FolderOpen, File, ExternalLink } from "lucide-react"
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

          {/* Upload Section - Primary Priority */}
          <div className="text-center mb-6">
            <div className="relative w-full flex justify-center">
              <motion.button
                onClick={() => fileInputRef.current?.click()}
                animate={status}
                variants={buttonVariants}
                className={cn(
                  "group relative grid overflow-hidden rounded-xl px-10 py-5 transition-all duration-300 cursor-pointer",
                  "hover:shadow-2xl hover:shadow-amber-500/25",
                  "bg-gradient-to-r from-amber-600/80 to-amber-700/80 hover:from-amber-600 hover:to-amber-700",
                  "border border-amber-500/30 hover:border-amber-400/50"
                )}
                style={{ minWidth: "220px" }}
                whileHover={{ 
                  scale: 1.05, 
                  y: -3,
                  transition: { 
                    type: "spring", 
                    stiffness: 400, 
                    damping: 10 
                  }
                }}
                whileTap={{ 
                  scale: 0.95, 
                  y: 0,
                  transition: { 
                    type: "spring", 
                    stiffness: 400, 
                    damping: 10 
                  }
                }}
              >
                {/* Glow effect on hover */}
                <motion.div
                  className="absolute inset-0 rounded-xl bg-gradient-to-r from-amber-400/20 to-amber-500/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                  initial={{ opacity: 0 }}
                  whileHover={{ opacity: 1 }}
                />
                
                {/* Animated border glow */}
                <motion.div
                  className="absolute inset-0 rounded-xl bg-gradient-to-r from-amber-400/40 via-amber-500/40 to-amber-400/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                  initial={{ opacity: 0 }}
                  whileHover={{ opacity: 1 }}
                  animate={{
                    background: [
                      "linear-gradient(45deg, rgba(245, 158, 11, 0.4), rgba(245, 158, 11, 0.4))",
                      "linear-gradient(45deg, rgba(245, 158, 11, 0.4), rgba(217, 119, 6, 0.4), rgba(245, 158, 11, 0.4))",
                      "linear-gradient(45deg, rgba(245, 158, 11, 0.4), rgba(245, 158, 11, 0.4))"
                    ]
                  }}
                  transition={{
                    duration: 2,
                    repeat: Infinity,
                    ease: "easeInOut"
                  }}
                />

                {status === "idle" && (
                  <span
                    className={cn(
                      "spark mask-gradient absolute inset-0 h-[100%] w-[100%] animate-flip overflow-hidden rounded-xl",
                      "[mask:linear-gradient(white,_transparent_50%)] before:absolute before:aspect-square before:w-[200%] before:bg-[conic-gradient(from_0deg,transparent_0_340deg,white_360deg)]",
                      "before:rotate-[-90deg] before:animate-rotate",
                      "before:content-[''] before:[inset:0_auto_auto_50%] before:[translate:-50%_-15%]",
                    )}
                  />
                )}
                <span
                  className={cn(
                    "backdrop absolute inset-px rounded-[22px] transition-colors duration-200",
                    status === "idle" ? "bg-amber-600/80 group-hover:bg-amber-600" : "",
                  )}
                />
                <span className="z-10 flex items-center justify-center gap-2 text-lg font-semibold text-gray-200">
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
                        <Loader2 className="w-6 h-6" />
                      </motion.span>
                    )}
                    {status === "saved" && (
                      <motion.span
                        key="saved"
                        initial={{ opacity: 0, scale: 0.5 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0 }}
                      >
                        <Check className="w-6 h-6" />
                      </motion.span>
                    )}
                  </AnimatePresence>
                  <motion.span
                    key={status}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.2 }}
                    className="flex items-center gap-2"
                  >
                    {status === "idle" && (
                      <motion.div
                        whileHover={{ 
                          rotate: [0, -10, 10, 0],
                          transition: { duration: 0.3 }
                        }}
                      >
                        <Upload className="w-6 h-6" />
                      </motion.div>
                    )}
                    {status === "idle" ? "Upload Package" : status === "saving" ? "Processing..." : "Exported!"}
                  </motion.span>
                </span>
              </motion.button>

              <AnimatePresence>
                {bounce && (
                  <motion.div
                    className="absolute top-0 right-0 -mr-1 -mt-1"
                    initial="initial"
                    animate="animate"
                    exit="exit"
                    variants={sparkleVariants}
                  >
                    <Sparkles className="w-6 h-6 text-yellow-400" />
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Instructions */}
            <div className="mt-4 text-center">
              <p className="text-sm text-gray-400 mb-2">
                Supported format: <span className="text-gray-300 font-medium">.xlsx</span>
              </p>
              <p className="text-xs text-gray-500">
                Drag and drop your Excel file or click to browse
              </p>
            </div>
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

