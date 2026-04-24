'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Eye, X, Palette } from 'lucide-react';

const designOptions = [
  {
    id: 'option1',
    name: 'Luxury Modern',
    description: 'Elegant and sophisticated design with gold accents',
    preview: 'A luxurious, sophisticated design featuring elegant typography, gold accents, and premium feel. Perfect for high-end property management.',
    component: () => import('./page.option1').then(m => m.default)
  },
  {
    id: 'option2',
    name: 'Modern Minimalist',
    description: 'Clean, minimalist design focusing on functionality',
    preview: 'A clean, minimalist design with ample whitespace and focus on user experience. Perfect for users who value simplicity and clarity.',
    component: () => import('./page.option2').then(m => m.default)
  },
  {
    id: 'option3',
    name: 'Bold Contemporary',
    description: 'Dynamic, vibrant design with animations',
    preview: 'A bold, contemporary design with dynamic animations and vibrant colors. Perfect for making a strong statement and attracting attention.',
    component: () => import('./page.option3').then(m => m.default)
  }
];

export default function DesignPreview() {
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [showPreview, setShowPreview] = useState(false);

  const handlePreview = (optionId: string) => {
    setSelectedOption(optionId);
    setShowPreview(true);
  };

  const closePreview = () => {
    setShowPreview(false);
    setTimeout(() => setSelectedOption(null), 300);
  };

  const selectedDesign = selectedOption ? designOptions.find(opt => opt.id === selectedOption) : null;

  return (
    <>
      {/* Preview Panel */}
      {showPreview && selectedDesign && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm"
          onClick={closePreview}
        >
          {/* Preview Window */}
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="absolute top-0 left-0 right-0 bottom-0 bg-white"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="sticky top-0 z-10 bg-white border-b border-[#DDE1E8] p-4 flex items-center justify-between">
              <div>
                <h3 className="text-xl font-bold text-[#0F172A]">
                  {selectedDesign.name}
                </h3>
                <p className="text-sm text-[#64748B]">
                  {selectedDesign.description}
                </p>
              </div>
              <button
                onClick={closePreview}
                className="p-2 hover:bg-[#F8F8F9] rounded-lg transition-colors"
              >
                <X className="w-5 h-5 text-[#2D3A58]" />
              </button>
            </div>

            {/* Preview Content */}
            <div className="h-[calc(100vh-80px)] overflow-auto">
              <selectedDesign.component />
            </div>
          </motion.div>
        </motion.div>
      )}

      {/* Design Selector */}
      <div className="fixed bottom-8 right-8 z-40">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-2xl shadow-2xl border border-[#DDE1E8] p-6"
        >
          <div className="flex items-center gap-3 mb-4">
            <Palette className="w-6 h-6 text-[#C89128]" />
            <h3 className="text-lg font-bold text-[#0F172A]">Design Options</h3>
          </div>

          <div className="space-y-3">
            {designOptions.map((option) => (
              <motion.button
                key={option.id}
                whileHover={{ scale: 1.02, x: 5 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => handlePreview(option.id)}
                className="w-full text-left p-3 rounded-lg border border-[#DDE1E8] hover:border-[#C89128] transition-all group"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-semibold text-[#0F172A] group-hover:text-[#C89128] transition-colors">
                      {option.name}
                    </h4>
                    <p className="text-sm text-[#64748B] mt-1">
                      {option.description}
                    </p>
                  </div>
                  <Eye className="w-4 h-4 text-[#DDE1E8] group-hover:text-[#C89128] transition-colors" />
                </div>
              </motion.button>
            ))}
          </div>
        </motion.div>
      </div>
    </>
  );
}