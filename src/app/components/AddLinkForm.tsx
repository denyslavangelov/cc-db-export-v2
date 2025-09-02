"use client"

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, X, Link as LinkIcon } from 'lucide-react';
import { MaterialsLink } from '@/app/types';
import { materialsApi } from '@/app/lib/materials-api';
import { toast } from 'sonner';

interface AddLinkFormProps {
  onAdd: (newLink: MaterialsLink) => void;
}

export default function AddLinkForm({ onAdd }: AddLinkFormProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    url: '',
    description: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.title.trim() || !formData.url.trim()) {
      toast.error('Title and URL are required');
      return;
    }

    setIsSubmitting(true);
    try {
      const newLink = await materialsApi.create({
        title: formData.title.trim(),
        url: formData.url.trim(),
        description: formData.description.trim() || undefined,
        updatedBy: 'User' // In a real app, this would come from user authentication
      });
      
      onAdd(newLink);
      setFormData({ title: '', url: '', description: '' });
      setIsExpanded(false);
      toast.success('Link added successfully');
    } catch (error) {
      toast.error(`Failed to add link: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    setFormData({ title: '', url: '', description: '' });
    setIsExpanded(false);
  };

  if (!isExpanded) {
    return (
      <motion.button
        onClick={() => setIsExpanded(true)}
        className="group p-3 rounded-xl bg-gradient-to-r from-green-500/10 to-emerald-500/10 hover:from-green-500/20 hover:to-emerald-500/20 border border-green-500/30 hover:border-green-500/50 transition-all duration-300 cursor-pointer w-fit"
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
      >
        <div className="flex items-center gap-2">
          <div className="p-1.5 bg-green-500/20 rounded-lg group-hover:bg-green-500/30 transition-colors duration-200">
            <Plus className="w-4 h-4 text-green-400" />
          </div>
          <span className="text-sm font-medium text-gray-100 group-hover:text-white transition-colors duration-200">
            Add Link
          </span>
        </div>
      </motion.button>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, height: 0, scale: 0.95 }}
      animate={{ opacity: 1, height: 'auto', scale: 1 }}
      exit={{ opacity: 0, height: 0, scale: 0.95 }}
      className="p-4 rounded-xl bg-gradient-to-r from-green-500/10 to-emerald-500/10 border border-green-500/30 shadow-lg"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="p-1.5 bg-green-500/20 rounded-lg">
              <LinkIcon className="w-4 h-4 text-green-400" />
            </div>
            <h3 className="text-base font-semibold text-gray-100">Add New Link</h3>
          </div>
          <button
            type="button"
            onClick={handleCancel}
            className="p-1.5 text-gray-400 hover:text-gray-200 hover:bg-gray-700/50 rounded-lg transition-all duration-200"
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
          >
            <X className="w-4 h-4" />
          </button>
        </div>
        
        {/* Form fields */}
        <div className="grid gap-3">
          <div>
            <label className="block text-xs font-medium text-gray-300 mb-1.5">
              Title <span className="text-red-400">*</span>
            </label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
              placeholder="Enter link title"
              required
              className="w-full px-3 py-2 bg-gray-700/50 border border-gray-600 rounded-lg text-gray-100 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-200 text-sm"
            />
          </div>
          
          <div>
            <label className="block text-xs font-medium text-gray-300 mb-1.5">
              URL <span className="text-red-400">*</span>
            </label>
            <input
              type="url"
              value={formData.url}
              onChange={(e) => setFormData(prev => ({ ...prev, url: e.target.value }))}
              placeholder="https://example.com"
              required
              className="w-full px-3 py-2 bg-gray-700/50 border border-gray-600 rounded-lg text-gray-100 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-200 text-sm"
            />
          </div>
          
          <div>
            <label className="block text-xs font-medium text-gray-300 mb-1.5">
              Description <span className="text-gray-500 text-xs">(optional)</span>
            </label>
            <input
              type="text"
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              placeholder="Brief description"
              className="w-full px-3 py-2 bg-gray-700/50 border border-gray-600 rounded-lg text-gray-100 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-200 text-sm"
            />
          </div>
        </div>
        
        {/* Action buttons */}
        <div className="flex gap-2 pt-1">
          <motion.button
            type="submit"
            disabled={isSubmitting}
            className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 disabled:from-green-800 disabled:to-emerald-800 text-white rounded-lg font-medium transition-all duration-200 shadow-lg hover:shadow-xl text-sm"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            {isSubmitting ? (
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              <Plus className="w-4 h-4" />
            )}
            {isSubmitting ? 'Adding...' : 'Add'}
          </motion.button>
          
          <motion.button
            type="button"
            onClick={handleCancel}
            className="px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg font-medium transition-all duration-200 text-sm"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            Cancel
          </motion.button>
        </div>
      </form>
    </motion.div>
  );
}
