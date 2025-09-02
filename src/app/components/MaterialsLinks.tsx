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

  // Fetch links on component mount
  useEffect(() => {
    fetchLinks()
  }, [])

  const fetchLinks = async () => {
    try {
      const fetchedLinks = await materialsApi.getAll()
      setLinks(fetchedLinks)
    } catch (error) {
      toast.error(`Failed to fetch links: ${error instanceof Error ? error.message : 'Unknown error'}`)
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
          {/* Add new link form */}
          <div className="mb-4">
            <AddLinkForm onAdd={handleAdd} />
          </div>

          {/* Links grid */}
          <div className="space-y-3">
            {links.length === 0 ? (
              <div className="text-center py-6">
                <div className="p-4 bg-gray-700/30 rounded-2xl border-2 border-dashed border-gray-600/50">
                  <FileText className="w-12 h-12 text-gray-500 mx-auto mb-3" />
                  <h3 className="text-lg font-semibold text-gray-300 mb-1">No materials links yet</h3>
                  <p className="text-gray-400 text-sm">Add your first link using the button above to get started!</p>
                </div>
              </div>
            ) : (
              <>
                <div className="flex items-center justify-between mb-3">
                  <h2 className="text-lg font-semibold text-gray-100">Current Links</h2>
                  <div className="text-sm text-gray-400 bg-gray-700/50 px-3 py-1 rounded-full">
                    {links.length} link{links.length !== 1 ? 's' : ''}
                  </div>
                </div>
                
                {/* Grid layout for links */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
                  {links.map((link) => (
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