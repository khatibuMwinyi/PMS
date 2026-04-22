'use client';

import { useState } from 'react';

export default function DesignPreview() {
  const [showPanel, setShowPanel] = useState(true);

  if (!showPanel) return null;

  return (
    <div className="fixed bottom-8 right-8 z-40">
      <div className="bg-white rounded-2xl shadow-2xl border border-[#DDE1E8] p-6 w-80">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-bold text-[#0F172A]">Design Options</h3>
          <button
            onClick={() => setShowPanel(false)}
            className="text-[#64748B] hover:text-[#0F172A]"
          >
            ×
          </button>
        </div>

        <div className="space-y-3">
          <button className="w-full text-left p-3 rounded-lg border border-[#DDE1E8] hover:border-[#C89128] transition-all">
            <h4 className="font-semibold text-[#0F172A]">Luxury Modern</h4>
            <p className="text-sm text-[#64748B]">Elegant with gold accents</p>
          </button>

          <button className="w-full text-left p-3 rounded-lg border border-[#DDE1E8] hover:border-[#C89128] transition-all">
            <h4 className="font-semibold text-[#0F172A]">Modern Minimalist</h4>
            <p className="text-sm text-[#64748B]">Clean and functional</p>
          </button>

          <button className="w-full text-left p-3 rounded-lg border border-[#DDE1E8] hover:border-[#C89128] transition-all">
            <h4 className="font-semibold text-[#0F172A]">Bold Contemporary</h4>
            <p className="text-sm text-[#64748B]">Dynamic and vibrant</p>
          </button>
        </div>
      </div>
    </div>
  );
}