'use client';

export default function DebugPreview() {
  return (
    <div className="fixed bottom-8 right-8 z-40 bg-red-500 text-white p-4 rounded-lg">
      Debug: Preview component loaded
      <div className="mt-2">
        <button className="bg-white text-red-500 px-3 py-1 rounded text-sm">
          Show Options
        </button>
      </div>
    </div>
  );
}