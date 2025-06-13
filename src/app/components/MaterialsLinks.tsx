"use client"

import { motion } from "framer-motion"
import { FileText, ExternalLink } from "lucide-react"
import { cn } from "@/app/utils/cn"
import { Geologica } from 'next/font/google'

const geologica = Geologica({ subsets: ['latin'] })

interface LinkItem {
  title: string
  url: string
  description?: string
}

const materialsLinks: LinkItem[] = [
  {
    title: "Master Questionnaire",
    url: "https://ipsosgroup.sharepoint.com/:w:/r/teams/MSU-COKE-SmallMarketSolution-TEAM/Shared%20Documents/General/OPS_FILES/Q2%202025/Questionnaire/SMS%20Coke%20Master%20Questionnaire_Q2_2025_V1.docx?d=w30645244478f4f208532c45beb3b453f&csf=1&web=1&e=n6TUS4",
    description: "Q2 2025 / 25-004044-01-30"
  },
  {
    title: "Country Specific Questions",
    url: "https://ipsosgroup.sharepoint.com/:x:/r/teams/MSU-COKE-SmallMarketSolution-TEAM/Shared%20Documents/General/OPS_FILES/!%20Coke%20SMS%20-%20Country%20specific%20questions_Linked%20with%20Q%27re.xlsx?d=wd8826cbcca3a43bebdc9c7eb17a0de10&csf=1&web=1&e=5MaGCF",
    description: "Excel country specific"
  },
  {
    title: "QCF iField",
    url: "https://ipsosgroup.sharepoint.com/:x:/t/BG-PM-Team/EUCG2wpu3CRKhEPIeIEbHTYBTjbqcl1kWsS0O827uvtufg?e=L3XYVH",
    description: "QCF iField"
  },
  {
    title: "QCF Dimensions",
    url: "https://ipsosgroup.sharepoint.com/:x:/t/BG-PM-Team/EewYESO3ZWdHs1b7BBYPYmYBttO0dYHkGq-_GTFQ81dxWA",
    description: "QCF Dimensions"
  },
  {
    title: "Offline Market Info",
    url: "https://ipsosgroup.sharepoint.com/:x:/r/teams/MSU-COKE-SmallMarketSolution-TEAM/Shared%20Documents/General/OPS_FILES/Q2%202025/Fieldwork%20coordination/Offline/Coke%20SMS%20EU%20Q2%202025-%20offline%20Market%20info.xlsx?d=wcea8ffa57f404e109082a17d9c48c59c&csf=1&web=1&e=ZNHKyT",
    description: "iField INFO (NWB info, BC+SAR, Variables to transfer)"
  },
  {
    title: "Brand List - Export",
    url: "https://cc-db-export.vercel.app/",
    description: "Brand lists Dim. Markets"
  },
  {
    title: "Quotas",
    url: "https://ipsosgroup.sharepoint.com/:x:/r/teams/MSU-COKE-SmallMarketSolution-TEAM/Shared%20Documents/General/OPS_FILES/Q2%202025/Quotas/EU%20SMS%20Quotas%20Online%20-%20Q2%202025_v1.xlsx?d=w9847f0a9c02a4377a74aaa0360e1a8b3&csf=1&web=1&e=aIX2Qq",
    description: "Dim QUOTAS"
  }
]

export default function MaterialsLinks() {
  return (
    <div className={cn(
      "min-h-screen flex flex-col items-center justify-center gap-4 bg-gray-900",
      geologica.className
    )}>
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
                <FileText className="w-8 h-8 text-blue-400" />
              </div>
              <h4 className="text-3xl font-semibold text-gray-100 tracking-tight">
                Materials Links
              </h4>
              <p className="text-xs text-gray-400 flex items-center justify-center gap-2 tracking-wide">
                Q2 2025 / 25-004044-01-30
              </p>
            </div>

            <div className="w-full space-y-4">
              {materialsLinks.map((link, index) => (
                <motion.a
                  key={index}
                  href={link.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={cn(
                    "flex items-center justify-between p-4 rounded-lg",
                    "bg-gray-800/30 hover:bg-gray-700/30",
                    "border border-gray-700/50",
                    "transition-all duration-200",
                    "cursor-pointer"
                  )}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <div className="flex flex-col">
                    <span className="text-gray-100 font-medium">{link.title}</span>
                    {link.description && (
                      <span className="text-sm text-gray-400">{link.description}</span>
                    )}
                  </div>
                  <ExternalLink className="w-5 h-5 text-gray-400" />
                </motion.a>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
} 