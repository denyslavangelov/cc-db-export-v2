"use client"

import { useState, useRef, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Loader2, Check, FileSpreadsheet, Upload, Sparkles, FileUp, FolderOpen, File } from "lucide-react"
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
      toast.error('Please select an Excel file (.xlsx)');
      return;
    }

    setIsProcessing(true);
    try {
        setTimeout(async () => {
            await processExcelFile(file, exportInXlsx);
            toast.success('Files exported successfully!');
        }, 2000);
    } catch (error) {
      toast.error('Error processing file: ' + (error as Error).message);
    } finally {
      setIsProcessing(false);
    }

    handleSave();
  };
  
  const handleSave = () => {
    if (status === "idle") {
      setStatus("saving")
      setTimeout(() => {
        setStatus("saved")
        setBounce(true)
        confetti({
          particleCount: 100,
          spread: 70,
          origin: { y: 0.6 },
          colors: ["#ff0000", "#00ff00", "#0000ff", "#ffff00", "#00ffff", "#ff00ff"],
          shapes: ["star", "circle"],
        })
        setTimeout(() => {
          setStatus("idle")
          setBounce(false)
        }, 2000)
      }, 2000)
    }
  }

  const buttonVariants = {
    idle: {
      backgroundColor: "rgb(17, 24, 39)",
      color: "white",
      scale: 1,
    },
    saving: {
      backgroundColor: "rgb(59, 130, 246)",
      color: "white",
      scale: 1,
    },
    saved: {
      backgroundColor: "rgb(34, 197, 94)",
      color: "white",
      scale: [1, 1.1, 1],
      transition: {
        duration: 0.2,
        times: [0, 0.5, 1],
      },
    },
  }

  const sparkleVariants = {
    initial: { opacity: 0, scale: 0 },
    animate: { opacity: 1, scale: 1 },
    exit: { opacity: 0, scale: 0 },
  }

  return (
    <div className={cn(
      "min-h-screen flex flex-col items-center justify-center gap-4 bg-gray-900",
      geologica.className
    )}>
      <motion.button
        onClick={() => window.open("https://ipsosgroup.sharepoint.com/teams/MSU-COKE-SmallMarketSolution-TEAM/Shared%20Documents/Forms/AllItems.aspx?id=%2Fteams%2FMSU%2DCOKE%2DSmallMarketSolution%2DTEAM%2FShared%20Documents%2FGeneral%2FOPS%5FFILES&viewid=ff457430%2D3660%2D48e3%2Da7f5%2D9a7de8a333cb", "_blank")}
        className={cn(
          "flex items-center gap-2 px-4 py-2 rounded-full",
          "bg-gray-800/50 text-gray-200",
          "hover:bg-gray-700/50 transition-all duration-200 cursor-pointer",
          "border border-gray-700/50",
          "backdrop-blur-sm"
        )}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
      >
        <FolderOpen className="w-4 h-4" />
        <span className="text-sm">Open Packages Directory</span>
      </motion.button>

      <div className="w-full max-w-2xl p-8 mx-auto">
        <div className={cn(
          "rounded-2xl p-8",
          "bg-gray-800/50",
          "backdrop-blur-xl",
          "shadow-2xl"
        )}>
          <div className="flex flex-col items-center gap-6">
            <div className="text-center space-y-2">
              <div className="flex items-center justify-center gap-2 mb-4">
                <FileSpreadsheet className="w-8 h-8 text-blue-400" />
              </div>
              <h4 className="text-3xl font-semibold bg-gradient-to-r from-gray-100 to-gray-400 bg-clip-text text-transparent tracking-tight">
                Upload latest package
              </h4>
              <p className="text-xs text-gray-400 flex items-center justify-center gap-2 tracking-wide">
                Please upload the latest package
              </p>
            </div>

            <div className="flex flex-col gap-6">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="exportFormat"
                  checked={exportInXlsx}
                  onCheckedChange={(checked) => setExportInXlsx(checked as boolean)}
                />
                <Label htmlFor="exportFormat">Export for iField (in CSV format)</Label>
              </div>


              <div className="relative w-full flex justify-center mt-4 gap-4">
                <motion.button
                  onClick={() => fileInputRef.current?.click()}
                  animate={status}
                  variants={buttonVariants}
                  className={cn(
                    "group relative grid overflow-hidden rounded-full px-6 py-2 transition-all duration-200 cursor-pointer",
                    "hover:shadow-lg",
                  )}
                  style={{ minWidth: "150px" }}
                  whileHover={status === "idle" ? { scale: 1.05 } : {}}
                  whileTap={status === "idle" ? { scale: 0.95 } : {}}
                >
                  {status === "idle" && (
                    <span>
                      <span
                        className={cn(
                          "spark mask-gradient absolute inset-0 h-[100%] w-[100%] animate-flip overflow-hidden rounded-full",
                          "[mask:linear-gradient(white,_transparent_50%)] before:absolute before:aspect-square before:w-[200%] before:bg-[conic-gradient(from_0deg,transparent_0_340deg,white_360deg)]",
                          "before:rotate-[-90deg] before:animate-rotate",
                          "before:content-[''] before:[inset:0_auto_auto_50%] before:[translate:-50%_-15%]",
                        )}
                      />
                    </span>
                  )}
                  <span
                    className={cn(
                      "backdrop absolute inset-px rounded-[22px] transition-colors duration-200",
                      status === "idle" ? "bg-gray-950 group-hover:bg-gray-900" : "",
                    )}
                  />
                  <span className="z-10 flex items-center justify-center gap-2 text-sm font-medium text-gray-200">
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
                      className="flex items-center gap-2"
                    >
                      {status === "idle" && <Upload className="w-4 h-4" />}
                      {status === "idle" ? "Upload package" : status === "saving" ? "Processing..." : "Saved!"}
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
            </div>
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

