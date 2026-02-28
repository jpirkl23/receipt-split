"use client";
import { useReceiptStore } from "@/store";

export function Header() {
  const reset = useReceiptStore((state) => state.reset);
  const receipt = useReceiptStore((state) => state.receipt);

  const handleReset = () => {
    if (receipt) {
      if (confirm("Are you sure you want to start over? All data will be lost.")) {
        reset();
        window.location.reload(); // Force reload to reset step
      }
    }
  };

  return (
    <header className="bg-gradient-to-r from-blue-600 to-blue-700 text-white shadow-lg sticky top-0 z-50">
      <nav className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
        <button 
          onClick={handleReset}
          className="text-2xl font-bold hover:opacity-80 transition-opacity cursor-pointer flex items-center gap-2"
          title="Click to start over"
        >
          <span className="text-3xl">🧾</span>
          <span>Receipt Split</span>
        </button>
        <div className="flex items-center gap-4">
          <p className="text-blue-100 text-sm hidden sm:block">
            Simple, accurate bill splitting
          </p>
          {receipt && (
            <button
              onClick={handleReset}
              className="bg-white/10 hover:bg-white/20 px-4 py-2 rounded-lg font-semibold text-sm transition-colors"
            >
              🔄 Start Over
            </button>
          )}
        </div>
      </nav>
    </header>
  );
}
