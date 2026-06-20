import React from 'react';
function App() {
  const { useState, useEffect, useRef, useCallback } = React;
  const { Plus, Minus, RotateCcw, Hash } = lucide;

  const [count, setCount] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);
  const [pressedButton, setPressedButton] = useState(null);
  const prevCountRef = useRef(0);
  const announceRef = useRef(null);

  const getCountColor = useCallback(() => {
    if (count > 0) return 'text-emerald-600';
    if (count < 0) return 'text-rose-500';
    return 'text-gray-700';
  }, [count]);

  const getBgGlow = useCallback(() => {
    if (count > 0) return 'shadow-emerald-200/60';
    if (count < 0) return 'shadow-rose-200/60';
    return 'shadow-blue-100/50';
  }, [count]);

  useEffect(() => {
    if (prevCountRef.current !== count) {
      setIsAnimating(true);
      const timer = setTimeout(() => setIsAnimating(false), 350);
      prevCountRef.current = count;
      return () => clearTimeout(timer);
    }
  }, [count]);

  useEffect(() => {
    if (announceRef.current) {
      announceRef.current.textContent = `Counter updated to ${count}`;
    }
  }, [count]);

  const handleIncrement = useCallback(() => {
    setCount((prev) => prev + 1);
    setPressedButton('increment');
    setTimeout(() => setPressedButton(null), 200);
  }, []);

  const handleDecrement = useCallback(() => {
    setCount((prev) => prev - 1);
    setPressedButton('decrement');
    setTimeout(() => setPressedButton(null), 200);
  }, []);

  const handleReset = useCallback(() => {
    setCount(0);
    setPressedButton('reset');
    setTimeout(() => setPressedButton(null), 200);
  }, []);

  const handleKeyDown = useCallback(
    (e) => {
      if (e.key === 'ArrowUp' || e.key === 'ArrowRight') {
        e.preventDefault();
        handleIncrement();
      } else if (e.key === 'ArrowDown' || e.key === 'ArrowLeft') {
        e.preventDefault();
        handleDecrement();
      } else if (e.key === 'r' || e.key === 'R') {
        e.preventDefault();
        handleReset();
      }
    },
    [handleIncrement, handleDecrement, handleReset]
  );

  return (
    <div
      className="min-h-screen flex items-center justify-center p-6"
      style={{ backgroundColor: '#ffffff' }}
      onKeyDown={handleKeyDown}
      tabIndex={-1}
    >
      {/* Screen reader live region */}
      <div
        ref={announceRef}
        className="sr-only"
        role="status"
        aria-live="polite"
        aria-atomic="true"
      >
        Counter is at {count}
      </div>

      {/* Card Container */}
      <div
        className={`
          relative w-full max-w-md rounded-3xl p-8 sm:p-10
          bg-white border border-gray-100
          shadow-xl shadow-blue-100/40 ${getBgGlow()}
          transition-shadow duration-500 ease-out
        `}
      >
        {/* Subtle top accent bar */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-20 h-1.5 bg-blue-600 rounded-b-full" />

        {/* Header */}
        <div className="flex items-center justify-center gap-2.5 mb-8">
          <div className="w-9 h-9 rounded-xl bg-blue-50 flex items-center justify-center">
            <Hash className="w-4.5 h-4.5 text-blue-600" strokeWidth={2.2} />
          </div>
          <h1 className="text-xl font-semibold text-gray-800 tracking-tight">
            Counter
          </h1>
        </div>

        {/* Count Display */}
        <div className="flex flex-col items-center mb-8">
          <p className="text-xs font-medium text-gray-400 uppercase tracking-widest mb-3">
            Current Value
          </p>
          <div
            className={`
              relative text-8xl sm:text-9xl font-bold tabular-nums tracking-tighter
              ${getCountColor()}
              transition-all duration-300 ease-out
              ${isAnimating ? 'scale-110' : 'scale-100'}
            `}
            aria-label={`Count: ${count}`}
            role="status"
            aria-live="polite"
          >
            <span
              className={`
                inline-block transition-transform duration-300 ease-[cubic-bezier(0.34,1.56,0.64,1)]
                ${isAnimating ? 'translate-y-[-4px]' : 'translate-y-0'}
              `}
            >
              {count}
            </span>
          </div>

          {/* Status Badge */}
          <div
            className={`
              mt-4 inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-semibold
              transition-all duration-300
              ${count > 0 ? 'bg-emerald-50 text-emerald-700' : ''}
              ${count < 0 ? 'bg-rose-50 text-rose-700' : ''}
              ${count === 0 ? 'bg-gray-50 text-gray-500' : ''}
            `}
          >
            <span
              className={`
                w-1.5 h-1.5 rounded-full
                transition-colors duration-300
                ${count > 0 ? 'bg-emerald-500' : ''}
                ${count < 0 ? 'bg-rose-500' : ''}
                ${count === 0 ? 'bg-gray-400' : ''}
              `}
            />
            {count > 0 && 'Positive'}
            {count < 0 && 'Negative'}
            {count === 0 && 'Zero'}
          </div>
        </div>

        {/* Button Row */}
        <div className="flex items-center justify-center gap-3 sm:gap-4">
          {/* Decrement Button */}
          <button
            onClick={handleDecrement}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') handleDecrement();
            }}
            className={`
              group relative w-14 h-14 sm:w-16 sm:h-16 rounded-2xl
              flex items-center justify-center
              bg-rose-50 hover:bg-rose-100
              text-rose-600 hover:text-rose-700
              border border-rose-100 hover:border-rose-200
              transition-all duration-200 ease-out
              focus:outline-none focus:ring-4 focus:ring-rose-200/60
              active:scale-90
              ${pressedButton === 'decrement' ? 'scale-90 bg-rose-100' : ''}
            `}
            aria-label="Decrement counter"
            title="Decrease (Arrow Down / Left)"
          >
            <Minus
              className={`
                w-6 h-6 transition-transform duration-200
                group-hover:rotate-[-15deg]
                group-active:rotate-[-30deg]
              `}
              strokeWidth={2.2}
            />
            <span className="absolute -bottom-7 text-[10px] text-gray-400 font-medium opacity-0 group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap pointer-events-none">
              Arrow ↓
            </span>
          </button>

          {/* Reset Button */}
          <button
            onClick={handleReset}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') handleReset();
            }}
            className={`
              group relative w-12 h-12 sm:w-14 sm:h-14 rounded-xl
              flex items-center justify-center
              bg-gray-100 hover:bg-gray-200
              text-gray-500 hover:text-gray-700
              border border-gray-200 hover:border-gray-300
              transition-all duration-200 ease-out
              focus:outline-none focus:ring-4 focus:ring-gray-300/50
              active:scale-90
              ${pressedButton === 'reset' ? 'scale-90 bg-gray-200' : ''}
            `}
            aria-label="Reset counter to zero"
            title="Reset (R key)"
          >
            <RotateCcw
              className={`
                w-4.5 h-4.5 transition-transform duration-300
                group-hover:rotate-[-180deg]
              `}
              strokeWidth={2.2}
            />
            <span className="absolute -bottom-7 text-[10px] text-gray-400 font-medium opacity-0 group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap pointer-events-none">
              R key
            </span>
          </button>

          {/* Increment Button */}
          <button
            onClick={handleIncrement}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') handleIncrement();
            }}
            className={`
              group relative w-14 h-14 sm:w-16 sm:h-16 rounded-2xl
              flex items-center justify-center
              bg-blue-600 hover:bg-blue-700
              text-white
              border border-blue-600 hover:border-blue-700
              shadow-lg shadow-blue-200/50 hover:shadow-blue-300/60
              transition-all duration-200 ease-out
              focus:outline-none focus:ring-4 focus:ring-blue-300/60
              active:scale-90
              ${pressedButton === 'increment' ? 'scale-90 bg-blue-700' : ''}
            `}
            aria-label="Increment counter"
            title="Increase (Arrow Up / Right)"
          >
            <Plus
              className={`
                w-6 h-6 transition-transform duration-200
                group-hover:rotate-[15deg]
                group-active:rotate-[30deg]
              `}
              strokeWidth={2.2}
            />
            <span className="absolute -bottom-7 text-[10px] text-gray-400 font-medium opacity-0 group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap pointer-events-none">
              Arrow ↑
            </span>
          </button>
        </div>

        {/* Keyboard Hint */}
        <p className="text-center mt-8 text-xs text-gray-400">
          <span className="inline-flex items-center gap-1">
            <kbd className="px-1.5 py-0.5 text-[10px] font-semibold bg-gray-100 rounded-md border border-gray-200 text-gray-500">
              ↑↓
            </kbd>
            <span>arrows</span>
            <span className="mx-1">·</span>
            <kbd className="px-1.5 py-0.5 text-[10px] font-semibold bg-gray-100 rounded-md border border-gray-200 text-gray-500">
              R
            </kbd>
            <span>to reset</span>
          </span>
        </p>
      </div>
    </div>
  );
}
export default App;
