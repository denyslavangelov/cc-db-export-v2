"use client"

import { useState } from 'react';
import { motion } from 'framer-motion';
import { ExternalLink, Edit2, Save, X, Trash2, Link as LinkIcon } from 'lucide-react';
import { MaterialsLink } from '@/app/types';
import { materialsApi } from '@/app/lib/materials-api';
import { toast } from 'sonner';

interface EditableLinkItemProps {
  link: MaterialsLink;
  onUpdate: (updatedLink: MaterialsLink) => void;
  onDelete: (id: string) => void;
  isEditing: boolean;
  onEditToggle: () => void;
}

export default function EditableLinkItem({ 
  link, 
  onUpdate, 
  onDelete, 
  isEditing, 
  onEditToggle 
}: EditableLinkItemProps) {
  const [formData, setFormData] = useState({
    title: link.title,
    url: link.url,
    description: link.description || ''
  });
  const [isSaving, setIsSaving] = useState(false);

  const handleSave = async () => {
    if (!formData.title.trim() || !formData.url.trim()) {
      toast.error('Title and URL are required');
      return;
    }

    setIsSaving(true);
    try {
      const updatedLink = await materialsApi.update({
        ...link,
        title: formData.title.trim(),
        url: formData.url.trim(),
        description: formData.description.trim() || undefined,
        updatedBy: 'User' // In a real app, this would come from user authentication
      });
      
      onUpdate(updatedLink);
      onEditToggle();
      toast.success('Link updated successfully');
    } catch (error) {
      toast.error(`Failed to update link: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    setFormData({
      title: link.title,
      url: link.url,
      description: link.description || ''
    });
    onEditToggle();
  };

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this link?')) {
      return;
    }

    try {
      await materialsApi.delete(link.id);
      onDelete(link.id);
      toast.success('Link deleted successfully');
    } catch (error) {
      toast.error(`Failed to delete link: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  };

  if (isEditing) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="p-4 rounded-xl bg-gradient-to-br from-blue-500/10 to-purple-500/10 border-2 border-blue-500/30 shadow-lg"
      >
        <div className="space-y-3">
          <div className="flex items-center gap-2 mb-3">
            <div className="p-1.5 bg-blue-500/20 rounded-lg">
              <LinkIcon className="w-4 h-4 text-blue-400" />
            </div>
            <h3 className="text-sm font-semibold text-gray-100">Editing</h3>
          </div>
          
          <div className="space-y-3">
            <div>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                placeholder="Title"
                className="w-full px-3 py-2 bg-gray-700/50 border border-gray-600 rounded-lg text-gray-100 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 text-sm"
              />
            </div>
            
            <div>
              <input
                type="url"
                value={formData.url}
                onChange={(e) => setFormData(prev => ({ ...prev, url: e.target.value }))}
                placeholder="URL"
                className="w-full px-3 py-2 bg-gray-700/50 border border-gray-600 rounded-lg text-gray-100 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 text-sm"
              />
            </div>
            
            <div>
              <input
                type="text"
                value={formData.description}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                placeholder="Description (optional)"
                className="w-full px-3 py-2 bg-gray-700/50 border border-gray-600 rounded-lg text-gray-100 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 text-sm"
              />
            </div>
          </div>
          
          <div className="flex gap-2 pt-1">
            <motion.button
              onClick={handleSave}
              disabled={isSaving}
              className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 disabled:from-blue-800 disabled:to-blue-900 text-white rounded-lg font-medium transition-all duration-200 text-sm"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              {isSaving ? (
                <div className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <Save className="w-3 h-3" />
              )}
              {isSaving ? 'Saving...' : 'Save'}
            </motion.button>
            
            <motion.button
              onClick={handleCancel}
              className="px-3 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg transition-all duration-200"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <X className="w-3 h-3" />
            </motion.button>
          </div>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      className="group relative p-4 rounded-xl bg-gradient-to-br from-gray-800/50 to-gray-700/50 hover:from-gray-700/50 hover:to-gray-600/50 border border-gray-700/50 hover:border-gray-600/50 transition-all duration-300 cursor-pointer shadow-lg hover:shadow-xl h-full"
      whileHover={{ scale: 1.02, y: -1 }}
      whileTap={{ scale: 0.98 }}
      onClick={() => onEditToggle()}
    >
      {/* Hover indicator */}
      <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-blue-500/5 to-purple-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
      
      <div className="relative z-10 h-full flex flex-col">
        {/* Header with icon and title */}
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center gap-2 flex-1 min-w-0">
            <div className="p-1.5 bg-blue-500/20 rounded-lg group-hover:bg-blue-500/30 transition-colors duration-200 flex-shrink-0">
              <LinkIcon className="w-4 h-4 text-blue-400" />
            </div>
            <h3 className="text-sm font-semibold text-gray-100 group-hover:text-white transition-colors duration-200 truncate">
              {link.title}
            </h3>
          </div>
          
          {/* Action buttons */}
          <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-all duration-200 flex-shrink-0">
            <motion.button
              onClick={(e) => {
                e.stopPropagation();
                onEditToggle();
              }}
              className="p-1 text-gray-400 hover:text-blue-400 hover:bg-blue-500/20 rounded transition-all duration-200"
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
            >
              <Edit2 className="w-3 h-3" />
            </motion.button>
            
            <motion.button
              onClick={(e) => {
                e.stopPropagation();
                handleDelete();
              }}
              className="p-1 text-gray-400 hover:text-red-400 hover:bg-red-500/20 rounded transition-all duration-200"
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
            >
              <Trash2 className="w-3 h-3" />
            </motion.button>
          </div>
        </div>
        
        {/* Description */}
        {link.description && (
          <p className="text-xs text-gray-400 group-hover:text-gray-300 transition-colors duration-200 mb-3 line-clamp-2 flex-1">
            {link.description}
          </p>
        )}
        
        {/* Footer with actions and metadata */}
        <div className="mt-auto space-y-2">
          {/* Open link button */}
          <a
            href={link.url}
            target="_blank"
            rel="noopener noreferrer"
            onClick={(e) => e.stopPropagation()}
            className="flex items-center gap-1.5 px-2 py-1.5 bg-gray-700/50 hover:bg-gray-600/50 text-gray-300 hover:text-white rounded-lg transition-all duration-200 group/link text-xs w-full justify-center"
          >
            <ExternalLink className="w-3 h-3 group-hover/link:text-blue-400 transition-colors duration-200" />
            <span className="font-medium">Open Link</span>
          </a>
          
          {/* Metadata */}
          <div className="flex items-center justify-between text-xs text-gray-500">
            <span className="truncate">
              {new Date(link.lastUpdated).toLocaleDateString()}
            </span>
            {link.updatedBy && (
              <span className="truncate ml-1">by {link.updatedBy}</span>
            )}
          </div>
          
          {/* Edit hint */}
          <div className="text-xs text-gray-500 opacity-0 group-hover:opacity-100 transition-opacity duration-200 text-center">
            Click to edit
          </div>
        </div>
      </div>
    </motion.div>
  );
}
