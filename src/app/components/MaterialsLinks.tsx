"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { FileText, Plus, Settings } from "lucide-react"
import { cn } from "@/app/utils/cn"
import { Geologica } from 'next/font/google'
import { MaterialsLink } from '@/app/types'
import { materialsApi } from '@/app/lib/materials-api'
import EditableLinkItem from './EditableLinkItem'
import AddLinkForm from './AddLinkForm'
import { toast } from 'sonner'

const geologica = Geologica({ subsets: ['latin'] })

export default function MaterialsLinks() {
  const [links, setLinks] = useState<MaterialsLink[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  // Function to get current quarter and year
  const getCurrentQuarterAndYear = () => {
    const now = new Date()
    const currentYear = now.getFullYear()
    const currentMonth = now.getMonth() + 1 // getMonth() returns 0-11
    
    let currentQuarter: string
    if (currentMonth >= 1 && currentMonth <= 3) currentQuarter = 'Q1'
    else if (currentMonth >= 4 && currentMonth <= 6) currentQuarter = 'Q2'
    else if (currentMonth >= 7 && currentMonth <= 9) currentQuarter = 'Q3'
    else currentQuarter = 'Q4'
    
    return { currentQuarter, currentYear }
  }

  const { currentQuarter, currentYear } = getCurrentQuarterAndYear()
  const [selectedQuarter, setSelectedQuarter] = useState<string>(currentQuarter)
  const [selectedYear, setSelectedYear] = useState<number>(currentYear)

  // Filter links based on selected quarter and year
  const filteredLinks = links.filter(link => 
    selectedQuarter === 'All' ? true : link.quarter === selectedQuarter
  ).filter(link => 
    selectedYear === 0 ? true : link.year === selectedYear
  )

  // Get unique quarters and years for filter options
  const uniqueQuarters = [...new Set(links.map(link => link.quarter))].sort()
  const uniqueYears = [...new Set(links.map(link => link.year))].sort((a, b) => b - a)

  // Fetch links on component mount
  useEffect(() => {
    fetchLinks()
  }, [])

  const fetchLinks = async () => {
    try {
      setIsLoading(true)
      const response = await materialsApi.getAll()
      if (response) {
        setLinks(response)
      }
    } catch (error) {
      console.error('Error fetching links:', error)
      setError('Failed to fetch materials. Please try again.')
      // Fallback to default links if API fails
      setLinks([
        {
          id: "1",
          title: "CCDB Export Tool",
          url: "https://cc-db-export.vercel.app",
          description: "Main export tool for generating CSV and text files",
          quarter: currentQuarter,
          year: currentYear,
          lastUpdated: new Date().toISOString(),
          updatedBy: "System"
        },
        {
          id: "2", 
          title: "SharePoint Directory",
          url: "https://ipsosgroup.sharepoint.com/teams/MSU-COKE-SmallMarketSolution-TEAM/Shared%20Documents/Forms/AllItems.aspx?FolderCTID=0x0120003F91AC7BBE846B44835EC129AE411B38&id=%2Fteams%2FMSU-COKE-SmallMarketSolution-TEAM%2FShared+Documents%2FGeneral%2FOPS_FILES&OR=Teams-HL&CT=1730392210797",
          description: "Access to project files and resources",
          quarter: currentQuarter,
          year: currentYear,
          lastUpdated: new Date().toISOString(),
          updatedBy: "System"
        }
      ])
    } finally {
      setIsLoading(false)
    }
  }

  const handleUpdate = (updatedLink: MaterialsLink) => {
    setLinks(prev => prev.map(link => 
      link.id === updatedLink.id ? updatedLink : link
    ))
  }

  const handleDelete = (id: string) => {
    setLinks(prev => prev.filter(link => link.id !== id))
  }

  const handleAdd = (newLink: MaterialsLink) => {
    setLinks(prev => [newLink, ...prev])
  }

  const handleEditToggle = (id: string) => {
    setEditingId(editingId === id ? null : id)
  }

  if (isLoading) {
    return (
      <div className={cn(
        "min-h-screen flex flex-col items-center justify-center gap-4 bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900",
        geologica.className
      )}>
        <div className="w-full max-w-6xl p-6 mx-auto">
          <div className={cn(
            "rounded-3xl p-8",
            "bg-gray-800/60",
            "backdrop-blur-xl",
            "shadow-2xl",
            "border border-gray-700/30"
          )}>
            <div className="flex flex-col items-center gap-6">
              <div className="text-center space-y-4">
                <div className="flex items-center justify-center gap-3 mb-6">
                  <div className="p-3 bg-blue-500/20 rounded-full">
                    <FileText className="w-10 h-10 text-blue-400" />
                  </div>
                </div>
                <h4 className="text-4xl font-bold text-gray-100 tracking-tight">
                  Materials Links
                </h4>
                <div className="flex items-center justify-center pt-4">
                  <div className="w-8 h-8 border-3 border-blue-400 border-t-transparent rounded-full animate-spin" />
                </div>
              </div>
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
      <div className="w-full max-w-7xl p-4 mx-auto pt-6">
        {/* Header Section */}
        <div className="text-center mb-6">
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="p-3 bg-blue-500/20 rounded-2xl">
              <FileText className="w-10 h-10 text-blue-400" />
            </div>
          </div>
          <h1 className="text-4xl font-bold text-gray-100 tracking-tight mb-2">
            Materials Links
          </h1>
          <p className="text-base text-gray-400 tracking-wide mb-3">
            Q2 2025 / 25-004044-01-30
          </p>
          <div className="flex items-center justify-center gap-2 text-sm text-gray-500">
            <Settings className="w-4 h-4" />
            <span>Click on any link to edit or add new ones below</span>
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
          {/* Error Display */}
          {error && (
            <div className="mb-4 p-3 bg-red-500/20 border border-red-500/30 rounded-lg">
              <p className="text-red-300 text-sm">{error}</p>
            </div>
          )}

          {/* Quick Filter Buttons */}
          <div className="mb-4 flex flex-wrap gap-2">
            <button
              onClick={() => { setSelectedQuarter(currentQuarter); setSelectedYear(currentYear); }}
              className={`px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                selectedQuarter === currentQuarter && selectedYear === currentYear
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-700/50 text-gray-300 hover:bg-gray-600/50'
              }`}
            >
              Current: {currentQuarter} {currentYear}
            </button>
            <button
              onClick={() => { setSelectedQuarter('Q2'); setSelectedYear(2025); }}
              className={`px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                selectedQuarter === 'Q2' && selectedYear === 2025
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-700/50 text-gray-300 hover:bg-gray-600/50'
              }`}
            >
              Q2 2025
            </button>
            <button
              onClick={() => { setSelectedQuarter('Q3'); setSelectedYear(2025); }}
              className={`px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                selectedQuarter === 'Q3' && selectedYear === 2025
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-700/50 text-gray-300 hover:bg-gray-600/50'
              }`}
            >
              Q3 2025
            </button>
            <button
              onClick={() => { setSelectedQuarter('All'); setSelectedYear(0); }}
              className={`px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                selectedQuarter === 'All' && selectedYear === 0
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-700/50 text-gray-300 hover:bg-gray-600/50'
              }`}
            >
              Show All
            </button>
          </div>

          {/* Filters */}
          <div className="mb-6 p-4 bg-gray-700/30 rounded-xl border border-gray-600/30">
            <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
              <div className="flex items-center gap-3">
                <span className="text-sm font-medium text-gray-300">Filter by:</span>
                
                <select
                  value={selectedQuarter}
                  onChange={(e) => setSelectedQuarter(e.target.value)}
                  className="px-3 py-2 bg-gray-600/50 border border-gray-500/50 rounded-lg text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 text-sm"
                >
                  <option value="All">All Quarters</option>
                  {uniqueQuarters.map(quarter => (
                    <option key={quarter} value={quarter}>{quarter}</option>
                  ))}
                </select>
                
                <select
                  value={selectedYear}
                  onChange={(e) => setSelectedYear(parseInt(e.target.value))}
                  className="px-3 py-2 bg-gray-600/50 border border-gray-500/50 rounded-lg text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 text-sm"
                >
                  <option value={0}>All Years</option>
                  {uniqueYears.map(year => (
                    <option key={year} value={year}>{year}</option>
                  ))}
                </select>
              </div>
              
              <div className="text-sm text-gray-400">
                Showing {filteredLinks.length} of {links.length} total links
              </div>
            </div>
          </div>

          {/* Add new link form */}
          <div className="mb-4">
            <AddLinkForm onAdd={handleAdd} defaultQuarter={selectedQuarter} defaultYear={selectedYear} />
          </div>

          {/* Links grid */}
          <div className="space-y-3">
            {filteredLinks.length === 0 ? (
              <div className="text-center py-6">
                <div className="p-4 bg-gray-700/30 rounded-2xl border-2 border-dashed border-gray-600/50">
                  <FileText className="w-12 h-12 text-gray-500 mx-auto mb-3" />
                  <h3 className="text-lg font-semibold text-gray-300 mb-1">
                    {selectedQuarter === 'All' && selectedYear === 0 
                      ? 'No materials links found' 
                      : `No materials links for ${selectedQuarter === 'All' ? 'any quarter' : selectedQuarter} ${selectedYear === 0 ? 'any year' : selectedYear}`
                    }
                  </h3>
                  <p className="text-gray-400 text-sm">Add your first link using the button above!</p>
                </div>
              </div>
            ) : (
              <>
                <div className="flex items-center justify-between mb-3">
                  <h2 className="text-lg font-semibold text-gray-100">Current Links</h2>
                  <div className="text-sm text-gray-400 bg-gray-700/50 px-3 py-1 rounded-full">
                    {filteredLinks.length} link{filteredLinks.length !== 1 ? 's' : ''} 
                    {selectedQuarter !== 'All' || selectedYear !== 0 ? ` for ${selectedQuarter === 'All' ? 'any quarter' : selectedQuarter} ${selectedYear === 0 ? 'any year' : selectedYear}` : ''}
                  </div>
                </div>
                
                {/* Grid layout for links */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
                  {filteredLinks.map((link) => (
                    <EditableLinkItem
                      key={link.id}
                      link={link}
                      onUpdate={handleUpdate}
                      onDelete={handleDelete}
                      isEditing={editingId === link.id}
                      onEditToggle={() => handleEditToggle(link.id)}
                    />
                  ))}
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  )
} 