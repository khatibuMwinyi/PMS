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
    component: null // Will be loaded dynamically
  },
  {
    id: 'option2',
    name: 'Modern Minimalist',
    description: 'Clean, minimalist design focusing on functionality',
    preview: 'A clean, minimalist design with ample whitespace and focus on user experience. Perfect for users who value simplicity and clarity.',
    component: null
  },
  {
    id: 'option3',
    name: 'Bold Contemporary',
    description: 'Dynamic, vibrant design with animations',
    preview: 'A bold, contemporary design with dynamic animations and vibrant colors. Perfect for making a strong statement and attracting attention.',
    component: null
  }
];

export default function DesignPreview() {
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [showPreview, setShowPreview] = useState(false);
  const [loadingComponent, setLoadingComponent] = useState<string | null>(null);

  const handlePreview = async (optionId: string) => {
    setSelectedOption(optionId);
    setLoadingComponent(optionId);
    setShowPreview(true);

    // Dynamically import the component
    try {
      const component = await import(`../(marketing)/page.${optionId}.tsx`).then(m => m.default);
      designOptions.find(opt => opt.id === optionId)!.component = component;
    } catch (error) {
      console.error('Error loading component:', error);
    } finally {
      setLoadingComponent(null);
    }
  };

  const closePreview = () => {
    setShowPreview(false);
    setTimeout(() => setSelectedOption(null), 300);
  };

  const SelectedComponent = selectedOption ? designOptions.find(opt => opt.id === selectedOption)?.component : null;

  return (
    <>
      {/* Preview Panel */}
      {showPreview && (
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
            <div className="sticky top-0 z-10 bg-white border-b border-[var(--brand-gray)] p-4 flex items-center justify-between">
              <div>
                <h3 className="text-xl font-bold text-[var(--brand-primary)]">
                  {designOptions.find(opt => opt.id === selectedOption)?.name}
                </h3>
                <p className="text-sm text-[var(--text-muted)]">
                  {designOptions.find(opt => opt.id === selectedOption)?.description}
                </p>
              </div>
              <button
                onClick={closePreview}
                className="p-2 hover:bg-[var(--surface-page)] rounded-lg transition-colors"
              >
                <X className="w-5 h-5 text-[var(--text-secondary)]" />
              </button>
            </div>

            {/* Preview Content */}
            <div className="h-[calc(100vh-80px)] overflow-auto">
              {loadingComponent ? (
                <div className="flex items-center justify-center h-full">
                  <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[var(--brand-gold)] mx-auto mb-4"></div>
                    <p className="text-[var(--text-secondary)]">Loading design...</p>
                  </div>
                </div>
              ) : SelectedComponent ? (
                <SelectedComponent />
              ) : (
                <div className="flex items-center justify-center h-full">
                  <p className="text-[var(--text-secondary)]">Failed to load design</p>
                </div>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}

      {/* Design Selector */}
      <div className="fixed bottom-8 right-8 z-40">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-2xl shadow-2xl border border-[var(--brand-gray)] p-6"
        >
          <div className="flex items-center gap-3 mb-4">
            <Palette className="w-6 h-6 text-[var(--brand-gold)]" />
            <h3 className="text-lg font-bold text-[var(--brand-primary)]">Design Options</h3>
          </div>

          <div className="space-y-3">
            {designOptions.map((option) => (
              <motion.button
                key={option.id}
                whileHover={{ scale: 1.02, x: 5 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => handlePreview(option.id)}
                className="w-full text-left p-3 rounded-lg border border-[var(--brand-gray)] hover:border-[var(--brand-gold)] transition-all group"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-semibold text-[var(--brand-primary)] group-hover:text-[var(--brand-gold)] transition-colors">
                      {option.name}
                    </h4>
                    <p className="text-sm text-[var(--text-muted)] mt-1">
                      {option.description}
                    </p>
                  </div>
                  <Eye className="w-4 h-4 text-[var(--brand-gray)] group-hover:text-[var(--brand-gold)] transition-colors" />
                </div>
              </motion.button>
            ))}
          </div>
        </motion.div>
      </div>
    </>
  );
}