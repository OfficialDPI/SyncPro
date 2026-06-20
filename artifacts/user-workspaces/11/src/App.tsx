const { useState } = React;
const { Plus, Minus, RotateCcw } = lucide;

function CounterApp() {
  const [count, setCount] = useState(0);

  const increment = () => setCount(prev => prev + 1);
  const decrement = () => setCount(prev => prev - 1);
  const reset = () => setCount(0);

  // Dynamic styles based on count value
  const getCountColor = () => {
    if (count > 0) return 'text-emerald-400';
    if (count < 0) return 'text-rose-400';
    return 'text-blue-400';
  };

  const getBorderStyle = () => {
    if (count > 0) return 'border-emerald-500/30 shadow-emerald-500/10';
    if (count < 0) return 'border-rose-500/30 shadow-rose-500/10';
    return 'border-purple-500/20 shadow-purple-500/5';
  };

  return (
    <div className="min-h-screen bg-[#0d0d12] flex items-center justify-center p-4 font-sans">
      <div 
        className={`relative w-full max-w-sm bg-gray-900/70 backdrop-blur-lg rounded-2xl border ${getBorderStyle()} p-8 shadow-2xl transition-all duration-500 ease-in-out hover:shadow-purple-500/10`}
        role="region" 
        aria-label="Counter card"
      >
        {/* Subtle decorative gradient */}
        <div className="absolute -top-10 -right-10 w-32 h-32 bg-purple-600/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-10 -left-10 w-32 h-32 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col items-center gap-8">
          <h2 className="text-2xl font-semibold text-white/80 tracking-tight">
            Counter
          </h2>

          <div 
            className="flex items-center justify-center w-40 h-40 rounded-full bg-gray-800/50 border border-white/5 shadow-inner"
            aria-live="polite"
            aria-atomic="true"
          >
            <span 
              className={`text-6xl font-bold transition-colors duration-300 ${getCountColor()}`}
              aria-label={`Current count: ${count}`}
            >
              {count}
            </span>
          </div>

          <div className="flex items-center gap-4">
            <button
              onClick={decrement}
              className="group relative px-4 py-3 rounded-xl bg-gradient-to-br from-purple-600 to-purple-700 text-white font-medium shadow-lg shadow-purple-900/30 hover:shadow-purple-700/40 hover:scale-105 active:scale-95 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:ring-offset-2 focus:ring-offset-gray-900"
              aria-label="Decrement count"
              tabIndex={0}
            >
              <Minus className="w-5 h-5 transition-transform duration-200 group-hover:rotate-90" />
            </button>

            <button
              onClick={reset}
              className="group relative px-4 py-3 rounded-xl bg-gradient-to-br from-gray-700 to-gray-800 text-gray-300 font-medium shadow-lg shadow-gray-900/30 hover:shadow-gray-700/40 hover:scale-105 active:scale-95 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-gray-500/50 focus:ring-offset-2 focus:ring-offset-gray-900"
              aria-label="Reset count to zero"
              tabIndex={0}
            >
              <RotateCcw className="w-5 h-5 transition-transform duration-300 group-hover:rotate-180" />
            </button>

            <button
              onClick={increment}
              className="group relative px-4 py-3 rounded-xl bg-gradient-to-br from-purple-600 to-purple-700 text-white font-medium shadow-lg shadow-purple-900/30 hover:shadow-purple-700/40 hover:scale-105 active:scale-95 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:ring-offset-2 focus:ring-offset-gray-900"
              aria-label="Increment count"
              tabIndex={0}
            >
              <Plus className="w-5 h-5 transition-transform duration-200 group-hover:rotate-90" />
            </button>
          </div>

          {count > 10 && (
            <p className="text-emerald-400/80 text-sm animate-fade-in" role="status">
              🚀 High value reached!
            </p>
          )}
          {count < -10 && (
            <p className="text-rose-400/80 text-sm animate-fade-in" role="status">
              ⚠️ Low value reached!
            </p>
          )}
        </div>
      </div>
    </div>
  );
}