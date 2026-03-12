"use client"

import { useState, useRef } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Loader2, Check, FileSpreadsheet, Upload, FolderOpen, ArrowRight, BookOpen, Download, Info } from "lucide-react"
import confetti from "canvas-confetti"
import { cn } from "@/app/utils/cn"
import { processExcelFile } from "@/app/lib/excel-processor"
import { readCountryQuestionsWorkbook, getCountryNames, getDataForCountry, buildFamilyBrandsSheetRows, buildEducationListSheetRows, buildIncomeListSheetRows, type CountryQuestionsWorkbook } from "@/app/lib/country-questions-workbook"
import { readMddFile, updateMddFromCountryData, type MddUpdateSummary } from "@/app/lib/mdd-update"
import { toast } from "sonner"

/** Trigger download of a blob with a given filename (avoids second saveAs being blocked). */
function downloadBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob)
  const a = document.createElement("a")
  a.href = url
  a.download = filename
  a.style.display = "none"
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(url)
}
import { Geologica } from 'next/font/google'

const geologica = Geologica({ subsets: ['latin'] })

type ExportPlatform = "iField" | "Dimensions"

export default function SaveButton() {
  const [status, setStatus] = useState<"idle" | "saving" | "saved">("idle")
  const [bounce, setBounce] = useState(false)
  const [isProcessing, setIsProcessing] = useState(false)
  const [dragActive, setDragActive] = useState(false)
  const [sharePointFiles, setSharePointFiles] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const countryWorkbookInputRef = useRef<HTMLInputElement>(null)
  const [platform, setPlatform] = useState<ExportPlatform | null>(null)
  const [countryWorkbook, setCountryWorkbook] = useState<CountryQuestionsWorkbook | null>(null)
  const [countryWorkbookLoading, setCountryWorkbookLoading] = useState(false)
  const [selectedCountry, setSelectedCountry] = useState<string | null>(null)
  const [packageFile, setPackageFile] = useState<File | null>(null)
  const [mddFile, setMddFile] = useState<File | null>(null)
  const [lastMddUpdateSummary, setLastMddUpdateSummary] = useState<MddUpdateSummary | null>(null)
  const mddInputRef = useRef<HTMLInputElement>(null)

  const exportInXlsx = platform === "iField"
  const step1Valid = !!countryWorkbook
  const step2Valid = !!selectedCountry
  const step3Valid = !!packageFile
  const step4Valid = platform !== null
  const step5Valid = !!mddFile
  const step2Unlocked = step1Valid
  const step3Unlocked = step2Valid
  const step4Unlocked = step3Valid
  const step5Unlocked = step4Valid
  const allValid = step1Valid && step2Valid && step3Valid && step4Valid

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

  const handleCountryWorkbookUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    if (!file.name.endsWith('.xlsx') && !file.name.endsWith('.xls')) {
      toast.error('Please select an Excel file (.xlsx or .xls)')
      e.target.value = ''
      return
    }
    setCountryWorkbookLoading(true)
    setCountryWorkbook(null)
    try {
      const data = await readCountryQuestionsWorkbook(file)
      setCountryWorkbook(data)
      setSelectedCountry(null)
      toast.success(`Loaded: qCountry ${data.qCountry.length}, Family Brands ${data.familyBrands.length}, Education ${data.education.length}, S6 INCOME ${data.s6Income.length} rows`)
    } catch (err: unknown) {
      console.error('Country questions workbook error:', err)
      toast.error(err instanceof Error ? err.message : 'Failed to read Country specific questions workbook')
    } finally {
      setCountryWorkbookLoading(false)
      e.target.value = ''
    }
  };

  const handleExportAll = async () => {
    if (!allValid || !countryWorkbook || !selectedCountry || !packageFile) return
    setIsProcessing(true)
    setStatus('saving')
    try {
      const countryData = getDataForCountry(countryWorkbook, selectedCountry)

      const familyBrandsSheetRows = exportInXlsx
        ? buildFamilyBrandsSheetRows(countryData.familyBrands)
        : undefined
      const educationListSheetRows = exportInXlsx
        ? buildEducationListSheetRows(countryData.education)
        : undefined
      const incomeListSheetRows = exportInXlsx
        ? buildIncomeListSheetRows(countryData.s6Income)
        : undefined

      let updatedMddContent: string | null = null
      let mddFileName: string | undefined
      const hasFamilyBrands = countryData.familyBrands.length > 0
      const hasEducation = countryData.education.length > 0
      const hasIncome = countryData.s6Income.length > 0
      const educationVariableName = countryData.education[0]?.VariableName?.trim() || undefined
      if (!exportInXlsx && mddFile && (hasFamilyBrands || (hasEducation && educationVariableName) || hasIncome)) {
        try {
          const mddXml = await readMddFile(mddFile)
          const familyBrandsForMdd = hasFamilyBrands ? buildFamilyBrandsSheetRows(countryData.familyBrands) : undefined
          const educationListForMdd = hasEducation ? buildEducationListSheetRows(countryData.education) : undefined
          const incomeListForMdd = hasIncome ? buildIncomeListSheetRows(countryData.s6Income) : undefined
          const result = updateMddFromCountryData(mddXml, {
            familyBrandsSheetRows: familyBrandsForMdd,
            educationListSheetRows: educationListForMdd,
            educationVariableName: educationVariableName || undefined,
            incomeListSheetRows: incomeListForMdd,
          })
          updatedMddContent = result.xml
          setLastMddUpdateSummary(result.summary)
          mddFileName = mddFile.name
          const base = mddFileName.replace(/\.[^.]+$/, '')
          const ext = mddFileName.includes('.') ? mddFileName.slice(mddFileName.lastIndexOf('.')) : '.mdd'
          const copyName = `${base}_COPY${ext}`
          const mddBlob = new Blob([updatedMddContent], { type: 'application/xml' })
          downloadBlob(mddBlob, copyName)
          toast.success('MDD updated; downloaded as ' + copyName)
        } catch (mddErr: unknown) {
          console.warn('MDD update failed:', mddErr)
          setLastMddUpdateSummary(null)
          toast.warning(mddErr instanceof Error ? mddErr.message : 'MDD not updated; export continues without modified MDD')
        }
      }

      await processExcelFile(packageFile, exportInXlsx, familyBrandsSheetRows, educationListSheetRows, incomeListSheetRows, updatedMddContent ?? undefined, mddFileName)

      setStatus('saved')
      setBounce(true)
      toast.success('All lists exported successfully!')
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#ff0000', '#00ff00', '#0000ff', '#ffff00', '#00ffff', '#ff00ff'],
        shapes: ['star', 'circle'],
      })
      setTimeout(() => {
        setStatus('idle')
        setBounce(false)
      }, 2000)
    } catch (err: unknown) {
      console.error('Export error:', err)
      toast.error(err instanceof Error ? err.message : 'Export failed')
      setStatus('idle')
    } finally {
      setIsProcessing(false)
    }
  }

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
        </div>

        {/* Main Content */}
        <div className={cn(
          "rounded-3xl p-6",
          "bg-gray-800/60",
          "backdrop-blur-xl",
          "shadow-2xl",
          "border border-gray-700/30"
        )}>
          {/* Step 1: Upload country specific file */}
          <div className={cn("mb-6 p-4 rounded-xl border", step1Valid ? "bg-emerald-500/10 border-emerald-500/30" : "bg-gray-700/20 border-gray-600/30")}>
            <div className="flex items-center gap-2 mb-2">
              <span className={cn("flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-sm font-semibold", step1Valid ? "bg-emerald-500/30 text-emerald-300" : "bg-gray-600 text-gray-300")}>
                {step1Valid ? <Check className="h-4 w-4" /> : '1'}
              </span>
              <h2 className="text-sm font-medium text-gray-200">Upload country specific file</h2>
            </div>
            <p className="text-xs text-gray-400 mb-3 ml-9">
              &quot;Coke SMS - Country specific questions_Linked with Q&apos;re&quot; (sheets: qCountry, Family Brands, Education, S6 INCOME)
            </p>
            <input
              ref={countryWorkbookInputRef}
              type="file"
              accept=".xlsx,.xls"
              className="hidden"
              onChange={handleCountryWorkbookUpload}
              aria-label="Upload Country specific questions Excel"
            />
            <div className="ml-9 flex flex-wrap items-center gap-3">
              <motion.button
                type="button"
                onClick={() => countryWorkbookInputRef.current?.click()}
                disabled={countryWorkbookLoading}
                className={cn(
                  "flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium border transition-colors",
                  "bg-gray-700/50 text-gray-200 border-gray-600/50 hover:bg-gray-600/50 disabled:opacity-60"
                )}
              >
                {countryWorkbookLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
                <span>{countryWorkbookLoading ? 'Reading…' : 'Upload Country questions Excel'}</span>
              </motion.button>
              {countryWorkbook && (
                <span className="text-sm text-gray-300">{countryWorkbook.fileName}</span>
              )}
            </div>
          </div>

          {/* Step 2: Choose country */}
          <div className={cn(
            "mb-6 p-4 rounded-xl border transition-opacity",
            step2Valid ? "bg-emerald-500/10 border-emerald-500/30" : "bg-gray-700/20 border-gray-600/30",
            !step2Unlocked && "opacity-60"
          )}>
            <div className="flex items-center gap-2 mb-2">
              <span className={cn("flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-sm font-semibold", step2Valid ? "bg-emerald-500/30 text-emerald-300" : "bg-gray-600 text-gray-300")}>
                {step2Valid ? <Check className="h-4 w-4" /> : '2'}
              </span>
              <h2 className="text-sm font-medium text-gray-200">Choose country</h2>
            </div>
            {!step2Unlocked ? (
              <p className="text-xs text-gray-500 ml-9">Complete step 1 first</p>
            ) : (
              <>
                <div className="ml-9 flex flex-wrap items-center gap-3">
                  <select
                    id="country-select"
                    value={selectedCountry ?? ''}
                    onChange={(e) => setSelectedCountry(e.target.value || null)}
                    className={cn(
                      "px-3 py-2 rounded-lg text-sm bg-gray-900 border border-gray-600/50 text-gray-200",
                      "focus:outline-none focus:ring-2 focus:ring-amber-500/50 focus:border-amber-500/50",
                      "min-w-[200px]"
                    )}
                  >
                    <option value="">Select country…</option>
                    {countryWorkbook && getCountryNames(countryWorkbook).map((name) => (
                      <option key={name} value={name}>{name}</option>
                    ))}
                  </select>
                  {selectedCountry && countryWorkbook && (
                    (() => {
                      const filtered = getDataForCountry(countryWorkbook, selectedCountry)
                      return (
                        <span className="text-xs text-gray-400">
                          Family Brands <strong className="text-gray-300">{filtered.familyBrands.length}</strong>, Education <strong>{filtered.education.length}</strong>, S6 INCOME <strong>{filtered.s6Income.length}</strong> rows
                        </span>
                      )
                    })()
                  )}
                </div>
              </>
            )}
          </div>

          {/* Step 3: Upload package file */}
          <div className={cn(
            "mb-6 p-4 rounded-xl border transition-opacity",
            step3Valid ? "bg-emerald-500/10 border-emerald-500/30" : "bg-gray-700/20 border-gray-600/30",
            !step3Unlocked && "opacity-60"
          )}>
            <div className="flex items-center gap-2 mb-2">
              <span className={cn("flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-sm font-semibold", step3Valid ? "bg-emerald-500/30 text-emerald-300" : "bg-gray-600 text-gray-300")}>
                {step3Valid ? <Check className="h-4 w-4" /> : '3'}
              </span>
              <h2 className="text-sm font-medium text-gray-200">Upload package file</h2>
            </div>
            {!step3Unlocked ? (
              <p className="text-xs text-gray-500 ml-9">Complete step 2 first</p>
            ) : (
              <>
                <p className="text-xs text-gray-400 mb-3 ml-9">
                  Wave details / package Excel (.xlsx)
                </p>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".xlsx,.xls"
                  className="hidden"
                  onChange={(e) => {
                    const file = e.target.files?.[0]
                    if (file && (file.name.endsWith('.xlsx') || file.name.endsWith('.xls'))) {
                      setPackageFile(file)
                    }
                    e.target.value = ''
                  }}
                  aria-label="Upload package Excel"
                />
                <div className="ml-9 flex flex-wrap items-center gap-3">
                  <motion.button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium bg-gray-700/50 text-gray-200 border border-gray-600/50 hover:bg-gray-600/50 transition-colors"
                  >
                    <Upload className="w-4 h-4" />
                    <span>Select Excel file</span>
                  </motion.button>
                  {packageFile && (
                    <span className="text-sm text-gray-300">{packageFile.name}</span>
                  )}
                </div>
              </>
            )}
          </div>

          {/* Step 4: Choose platform */}
          <div className={cn(
            "mb-6 p-4 rounded-xl border transition-opacity",
            step4Valid ? "bg-emerald-500/10 border-emerald-500/30" : "bg-gray-700/20 border-gray-600/30",
            !step4Unlocked && "opacity-60"
          )}>
            <div className="flex items-center gap-2 mb-2">
              <span className={cn("flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-sm font-semibold", step4Valid ? "bg-emerald-500/30 text-emerald-300" : "bg-gray-600 text-gray-300")}>
                {step4Valid ? <Check className="h-4 w-4" /> : '4'}
              </span>
              <h2 className="text-sm font-medium text-gray-200">Choose platform</h2>
            </div>
            {!step4Unlocked ? (
              <p className="text-xs text-gray-500 ml-9">Complete step 3 first</p>
            ) : (
              <>
                <p className="text-xs text-gray-400 mb-3 ml-9">
                  Export format: iField (CSV) or Dimensions (.txt)
                </p>
                <div className="ml-9 flex flex-wrap items-center gap-2">
                  <motion.button
                    type="button"
                    onClick={() => setPlatform("iField")}
                    className={cn(
                      "px-4 py-2 rounded-lg text-sm font-medium border transition-colors",
                      platform === "iField"
                        ? "bg-orange-500/30 text-orange-200 border-orange-500/50"
                        : "bg-gray-700/50 text-gray-300 border-gray-600/50 hover:bg-gray-600/50"
                    )}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    iField (CSV)
                  </motion.button>
                  <motion.button
                    type="button"
                    onClick={() => setPlatform("Dimensions")}
                    className={cn(
                      "px-4 py-2 rounded-lg text-sm font-medium border transition-colors",
                      platform === "Dimensions"
                        ? "bg-blue-500/30 text-blue-200 border-blue-500/50"
                        : "bg-gray-700/50 text-gray-300 border-gray-600/50 hover:bg-gray-600/50"
                    )}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    Dimensions (.txt)
                  </motion.button>
                </div>
              </>
            )}
          </div>

          {/* Step 5: Upload MDD (optional; for Dimensions: updates FAMILY_BRANDS and includes in zip) */}
          <div className={cn(
            "mb-6 p-4 rounded-xl border transition-opacity",
            step5Valid ? "bg-emerald-500/10 border-emerald-500/30" : "bg-gray-700/20 border-gray-600/30",
            !step5Unlocked && "opacity-60"
          )}>
            <div className="flex items-center gap-2 mb-2">
              <span className={cn("flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-sm font-semibold", step5Valid ? "bg-emerald-500/30 text-emerald-300" : "bg-gray-600 text-gray-300")}>
                {step5Valid ? <Check className="h-4 w-4" /> : '5'}
              </span>
              <h2 className="text-sm font-medium text-gray-200">Upload MDD (optional)</h2>
            </div>
            {!step5Unlocked ? (
              <p className="text-xs text-gray-500 ml-9">Complete step 4 first</p>
            ) : (
              <>
                <p className="text-xs text-gray-400 mb-3 ml-9">
                  For Dimensions: upload a .mdd file to update FAMILY_BRANDS from the country Family Brands data; the updated MDD is included in the export zip.
                </p>
                <input
                  ref={mddInputRef}
                  type="file"
                  accept=".mdd,.xml"
                  className="hidden"
                  onChange={(e) => {
                    const file = e.target.files?.[0]
                    if (file && (file.name.endsWith('.mdd') || file.name.endsWith('.xml'))) {
                      setMddFile(file)
                    }
                    e.target.value = ''
                  }}
                  aria-label="Upload MDD file"
                />
                <div className="ml-9 flex flex-wrap items-center gap-3">
                  <motion.button
                    type="button"
                    onClick={() => mddInputRef.current?.click()}
                    className={cn(
                      "flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium border transition-colors",
                      "bg-gray-700/50 text-gray-200 border-gray-600/50 hover:bg-gray-600/50"
                    )}
                  >
                    <Upload className="w-4 h-4" />
                    <span>{mddFile ? 'Replace MDD' : 'Upload MDD file'}</span>
                  </motion.button>
                  {mddFile && (
                    <span className="text-sm text-gray-300">{mddFile.name}</span>
                  )}
                </div>
              </>
            )}
          </div>

          {/* Export button */}
          <div className="mb-6 flex flex-col items-center gap-3">
            <motion.button
              type="button"
              onClick={handleExportAll}
              disabled={!allValid || isProcessing}
              className={cn(
                "flex items-center gap-2 px-8 py-4 rounded-xl text-base font-semibold transition-all",
                allValid && !isProcessing
                  ? "bg-amber-500 text-gray-900 hover:bg-amber-400 shadow-lg shadow-amber-500/20"
                  : "bg-gray-700 text-gray-500 cursor-not-allowed"
              )}
              whileHover={allValid && !isProcessing ? { scale: 1.02 } : undefined}
              whileTap={allValid && !isProcessing ? { scale: 0.98 } : undefined}
            >
              {isProcessing ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <Download className="w-5 h-5" />
              )}
              <span>{isProcessing ? 'Exporting…' : 'Export all lists'}</span>
            </motion.button>
            {!allValid && (
              <p className="text-xs text-gray-500">
                Complete all 4 steps above to enable export
              </p>
            )}
          </div>

          {/* Last MDD update summary */}
          {lastMddUpdateSummary && (lastMddUpdateSummary.familyBrands || lastMddUpdateSummary.education || lastMddUpdateSummary.income) && (
            <div className="mb-6 p-4 rounded-xl border border-gray-600/50 bg-gray-700/20">
              <div className="flex items-center gap-2 mb-2 text-gray-300">
                <Info className="h-4 w-4 shrink-0" />
                <span className="text-sm font-medium">Last MDD update</span>
              </div>
              <ul className="text-xs text-gray-400 space-y-1.5 ml-6">
                {lastMddUpdateSummary.familyBrands && (
                  <li>
                    <span className="text-gray-300 font-medium">FAMILY_BRANDS:</span>{" "}
                    {lastMddUpdateSummary.familyBrands.updated ? (
                      <span className="text-emerald-400">{lastMddUpdateSummary.familyBrands.categoriesCount} categories updated</span>
                    ) : (
                      <span className="text-amber-400">not found in MDD (had {lastMddUpdateSummary.familyBrands.categoriesCount} from Excel)</span>
                    )}
                  </li>
                )}
                {lastMddUpdateSummary.education && (
                  <li>
                    <span className="text-gray-300 font-medium">{lastMddUpdateSummary.education.variableName}:</span>{" "}
                    {lastMddUpdateSummary.education.updated ? (
                      <>
                        <span className="text-emerald-400">{lastMddUpdateSummary.education.categoriesUpdated ?? lastMddUpdateSummary.education.categoriesCount} updated</span>
                        {(lastMddUpdateSummary.education.categoriesUnchanged ?? 0) > 0 && (
                          <span className="text-gray-500">, {lastMddUpdateSummary.education.categoriesUnchanged} unchanged</span>
                        )}
                        <span className="text-gray-500"> ({lastMddUpdateSummary.education.categoriesCount} total)</span>
                      </>
                    ) : (
                      <span className="text-amber-400">not found in MDD (had {lastMddUpdateSummary.education.categoriesCount} from Excel)</span>
                    )}
                  </li>
                )}
                {lastMddUpdateSummary.income && (
                  <li>
                    <span className="text-gray-300 font-medium">INCOME_LIST:</span>{" "}
                    {lastMddUpdateSummary.income.updated ? (
                      <>
                        <span className="text-emerald-400">{lastMddUpdateSummary.income.categoriesUpdated ?? lastMddUpdateSummary.income.categoriesCount} updated</span>
                        {(lastMddUpdateSummary.income.categoriesUnchanged ?? 0) > 0 && (
                          <span className="text-gray-500">, {lastMddUpdateSummary.income.categoriesUnchanged} unchanged</span>
                        )}
                        <span className="text-gray-500"> ({lastMddUpdateSummary.income.categoriesCount} total)</span>
                      </>
                    ) : (
                      <span className="text-amber-400">not found in MDD (had {lastMddUpdateSummary.income.categoriesCount} from Excel)</span>
                    )}
                  </li>
                )}
              </ul>
            </div>
          )}

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

    </div>
  )
}

