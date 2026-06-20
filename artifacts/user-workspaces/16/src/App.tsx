const App = () => {
  const { useState, useEffect, useCallback, useRef } = React;
  const { Plus, Minus, RotateCcw } = lucide;

  const [count, setCount] = useState(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('counter-count');
      return saved !== null ? parseInt(saved, 10) : 0;
    }
    return 0;
  });

  const countRef = useRef(null);
  const [animating, setAnimating] = useState(false);

  useEffect(() => {
    localStorage.setItem('counter-count', count.toString());
    setAnimating(true);
    const timeout = setTimeout(() => setAnimating(false), 200);
    return () => clearTimeout(timeout);
  }, [count]);

  const increment = useCallback(() => setCount(c => c + 1), []);
  const decrement = useCallback(() => setCount(c => c - 1), []);
  const reset = useCallback(() => setCount(0), []);

  const handleKeyDown = (e, handler) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      handler();
    }
  };

  return (
    <div className="min-h-screen bg-[#0f172a] flex items-center justify-center p-4">
      <div className="relative">
        {/* Background glow effect */}
        <div className="absolute inset-0 rounded-3xl bg-gradient-to-br from-[#6366f1]/20 to-[#22d3ee]/10 blur-3xl" />

        <div className="relative bg-slate-900/80 backdrop-blur-xl border border-slate-700/50 rounded-3xl shadow-2xl shadow-slate-900/50 p-8 md:p-12 flex flex-col items-center gap-8">
          {/* Status announcement for screen readers */}
          <div role="status" aria-live="polite" className="sr-only">
            Count is {count}
          </div>

          {/* Count display */}
          <div
            ref={countRef}
            className={`text-7xl font-bold text-white tabular-nums select-none transition-transform duration-200 ${
              animating ? 'scale-125 text-[#22d3ee]' : 'scale-100'
            }`}
            aria-hidden="true"
          >
            {count}
          </div>

          {/* Controls */}
          <div className="flex items-center gap-4">
            {/* Decrement button */}
            <button
              onClick={decrement}
              onKeyDown={(e) => handleKeyDown(e, decrement)}
              aria-label="Decrease count"
              className="group relative flex items-center justify-center h-16 w-16 rounded-2xl bg-[#6366f1]/10 hover:bg-[#6366f1]/20 text-[#6366f1] hover:text-white transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#22d3ee] focus-visible:ring-offset-2 focus-visible:ring-offset-slate-900 active:scale-95"
              title="Decrease"
            >
              <Minus size={32} strokeWidth={2.5} className="group-hover:scale-110 transition-transform" />
              <span className="sr-only">Decrease</span>
            </button>

            {/* Increment button */}
            <button
              onClick={increment}
              onKeyDown={(e) => handleKeyDown(e, increment)}
              aria-label="Increase count"
              className="group relative flex items-center justify-center h-20 w-20 rounded-2xl bg-[#6366f1] hover:bg-[#6366f1]/90 text-white shadow-lg shadow-[#6366f1]/20 transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#22d3ee] focus-visible:ring-offset-2 focus-visible:ring-offset-slate-900 active:scale-95"
              title="Increase"
            >
              <Plus size={36} strokeWidth={2.5} className="group-hover:scale-110 transition-transform" />
              <span className="sr-only">Increase</span>
            </button>
          </div>

          {/* Reset button */}
          <button
            onClick={reset}
            onKeyDown={(e) => handleKeyDown(e, reset)}
            aria-label="Reset count to zero"
            className="flex items-center gap-2 px-5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#22d3ee] focus-visible:ring-offset-2 focus-visible:ring-offset-slate-900 active:scale-95"
            title="Reset"
          >
            <RotateCcw size={18} strokeWidth={2} />
            <span className="text-sm font-medium">Reset</span>
          </button>
        </div>
      </div>
    </div>
  );
};