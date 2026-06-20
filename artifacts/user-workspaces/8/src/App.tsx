const { useState, useEffect, useRef, useCallback } = React;
const { Plus, Minus, RotateCcw, Zap } = lucide;

// Animated number counter component
const AnimatedCounter = ({ value, previousValue }) => {
  const [displayValue, setDisplayValue] = useState(value);
  const [animating, setAnimating] = useState(false);
  const prevValueRef = useRef(value);

  useEffect(() => {
    if (value !== prevValueRef.current) {
      setAnimating(true);
      setDisplayValue(value);
      const timeout = setTimeout(() => setAnimating(false), 300);
      prevValueRef.current = value;
      return () => clearTimeout(timeout);
    }
  }, [value]);

  const isPositive = value > 0;
  const isNegative = value < 0;
  const isZero = value === 0;

  return (
    <div className="relative flex items-center justify-center">
      <div
        className={`
          text-8xl md:text-9xl font-black tracking-tighter select-none tabular-nums
          transition-all duration-300 ease-out
          ${animating ? 'scale-110' : 'scale-100'}
          ${isPositive ? 'text-emerald-400' : isNegative ? 'text-rose-400' : 'text-gray-300'}
        `}
        style={{
          textShadow: isPositive
            ? '0 0 60px rgba(52, 211, 153, 0.4)'
            : isNegative
            ? '0 0 60px rgba(251, 113, 133, 0.4)'
            : '0 0 40px rgba(255, 255, 255, 0.08)',
        }}
        aria-live="polite"
        aria-label={`Count is ${value}`}
      >
        {displayValue}
      </div>
      {animating && (
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute inset-0 bg-gradient-to-t from-transparent to-purple-500/10 rounded-full blur-2xl animate-pulse" />
        </div>
      )}
    </div>
  );
};

// Step indicator based on count
const StepIndicator = ({ value }) => {
  const milestones = [-10, -5, 0, 5, 10, 25, 50, 100];
  const closestMilestone = milestones.reduce((prev, curr) =>
    Math.abs(curr - value) < Math.abs(prev - value) ? curr : prev
  );

  const getMessage = () => {
    if (value === 0) return 'Starting point';
    if (value < 0) return `${Math.abs(value)} below zero`;
    if (value < 10) return 'Just warming up';
    if (value < 50) return 'Gaining momentum';
    if (value < 100) return 'On a roll! 🔥';
    return 'Legendary status 🚀';
  };

  return (
    <div className="flex items-center gap-2 text-sm text-gray-500">
      <Zap className="w-3.5 h-3.5 text-purple-400" />
      <span>{getMessage()}</span>
      {value !== 0 && (
        <span className="text-gray-600">
          · Next milestone: {closestMilestone > value ? closestMilestone : milestones.find(m => m > value) || '∞'}
        </span>
      )}
    </div>
  );
};

// Button component with consistent styling
const CounterButton = ({ onClick, icon: Icon, label, variant = 'default', disabled = false }) => {
  const baseClasses =
    'relative flex items-center justify-center rounded-2xl font-semibold transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-[#0d0d12] focus:ring-purple-500 disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:scale-100 disabled:hover:shadow-none';

  const variants = {
    increment:
      'w-16 h-16 md:w-20 md:h-20 bg-purple-600 hover:bg-purple-500 text-white hover:scale-105 active:scale-95 shadow-lg shadow-purple-600/25 hover:shadow-purple-500/40',
    decrement:
      'w-16 h-16 md:w-20 md:h-20 bg-[#1f1f2b] hover:bg-[#2a2a3a] text-white border border-[#33334a] hover:border-gray-500 hover:scale-105 active:scale-95 shadow-lg shadow-black/20 hover:shadow-black/30',
    reset:
      'h-11 px-5 bg-transparent hover:bg-[#1f1f2b] text-gray-400 hover:text-gray-200 border border-[#2a2a35] hover:border-gray-600 hover:scale-105 active:scale-95 gap-2 text-sm',
  };

  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`${baseClasses} ${variants[variant]}`}
      aria-label={label}
    >
      <Icon className={variant === 'reset' ? 'w-4 h-4' : 'w-6 h-6 md:w-7 md:h-7'} />
      {variant === 'reset' && <span className="hidden sm:inline">{label}</span>}
    </button>
  );
};

// Main App component
const App = () => {
  const [count, setCount] = useState(0);
  const [previousCount, setPreviousCount] = useState(0);
  const [history, setHistory] = useState([0]);
  const [step, setStep] = useState(1);
  const [showHistory, setShowHistory] = useState(false);

  const increment = useCallback(() => {
    setPreviousCount(count);
    setCount(prev => {
      const next = prev + step;
      setHistory(h => [...h.slice(-19), next]);
      return next;
    });
  }, [count, step]);

  const decrement = useCallback(() => {
    setPreviousCount(count);
    setCount(prev => {
      const next = prev - step;
      setHistory(h => [...h.slice(-19), next]);
      return next;
    });
  }, [count, step]);

  const reset = useCallback(() => {
    setPreviousCount(count);
    setCount(0);
    setHistory(h => [...h, 0]);
    setStep(1);
  }, [count]);

  const handleStepChange = (newStep) => {
    if (newStep >= 1 && newStep <= 100) {
      setStep(newStep);
    }
  };

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'ArrowUp' || e.key === 'ArrowRight') {
        e.preventDefault();
        increment();
      } else if (e.key === 'ArrowDown' || e.key === 'ArrowLeft') {
        e.preventDefault();
        decrement();
      } else if (e.key === 'r' || e.key === 'R') {
        if (!e.ctrlKey && !e.metaKey) {
          e.preventDefault();
          reset();
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [increment, decrement, reset]);

  return (
    <div className="min-h-screen bg-[#0d0d12] flex flex-col items-center justify-center px-4 py-8 relative overflow-hidden">
      {/* Background ambient effects */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-purple-600/5 rounded-full blur-[120px]" />
        <div className="absolute top-1/4 right-1/4 w-[300px] h-[300px] bg-blue-500/5 rounded-full blur-[100px]" />
        <div className="absolute bottom-1/4 left-1/4 w-[250px] h-[250px] bg-emerald-500/4 rounded-full blur-[80px]" />
      </div>

      {/* Main card */}
      <main className="relative z-10 w-full max-w-md">
        <div className="bg-[#141419] border border-[#22222a] rounded-3xl p-6 md:p-8 shadow-2xl shadow-black/40">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-purple-600/10 border border-purple-500/20 mb-4">
              <Zap className="w-3.5 h-3.5 text-purple-400" />
              <span className="text-xs font-medium text-purple-400 tracking-wide uppercase">Counter</span>
            </div>
            <h1 className="text-2xl md:text-3xl font-bold text-white tracking-tight">
              Interactive Counter
            </h1>
            <p className="text-sm text-gray-500 mt-1">
              Use buttons or arrow keys
            </p>
          </div>

          {/* Counter display */}
          <div className="mb-8 py-6">
            <AnimatedCounter value={count} previousValue={previousCount} />
            <div className="flex justify-center mt-3">
              <StepIndicator value={count} />
            </div>
          </div>

          {/* Step selector */}
          <div className="flex items-center justify-center gap-2 mb-6">
            <span className="text-xs text-gray-500">Step:</span>
            <div className="flex items-center bg-[#1a1a22] rounded-lg border border-[#2a2a35] p-0.5">
              {[1, 5, 10, 25].map((s) => (
                <button
                  key={s}
                  onClick={() => handleStepChange(s)}
                  className={`
                    px-3 py-1.5 rounded-md text-xs font-semibold transition-all duration-200
                    ${step === s
                      ? 'bg-purple-600 text-white shadow-md shadow-purple-600/20'
                      : 'text-gray-400 hover:text-gray-200 hover:bg-[#252533]'
                    }
                  `}
                  aria-label={`Set step to ${s}`}
                  aria-pressed={step === s}
                >
                  ±{s}
                </button>
              ))}
            </div>
            <input
              type="number"
              min="1"
              max="100"
              value={step}
              onChange={(e) => handleStepChange(parseInt(e.target.value) || 1)}
              className="w-14 h-8 bg-[#1a1a22] border border-[#2a2a35] rounded-lg text-center text-sm text-white focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
              aria-label="Custom step value"
            />
          </div>

          {/* Action buttons */}
          <div className="flex items-center justify-center gap-4 mb-6">
            <CounterButton
              onClick={decrement}
              icon={Minus}
              label="Decrement"
              variant="decrement"
            />
            <CounterButton
              onClick={increment}
              icon={Plus}
              label="Increment"
              variant="increment"
            />
          </div>

          {/* Reset button */}
          <div className="flex justify-center mb-4">
            <CounterButton
              onClick={reset}
              icon={RotateCcw}
              label="Reset"
              variant="reset"
              disabled={count === 0 && step === 1}
            />
          </div>

          {/* History toggle */}
          <button
            onClick={() => setShowHistory(!showHistory)}
            className="w-full text-center text-xs text-gray-600 hover:text-gray-400 transition-colors duration-200 py-1 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 focus:ring-offset-[#141419] rounded-md"
            aria-expanded={showHistory}
            aria-label="Toggle history"
          >
            {showHistory ? 'Hide history ▲' : 'Show history ▼'}
          </button>

          {/* History panel */}
          {showHistory && (
            <div className="mt-3 p-4 bg-[#1a1a22] border border-[#2a2a35] rounded-xl max-h-32 overflow-y-auto">
              <div className="flex flex-wrap gap-1.5">
                {history.slice(-15).map((h, i) => (
                  <span
                    key={i}
                    className={`
                      text-xs px-2 py-0.5 rounded-md font-mono
                      ${h > 0 ? 'text-emerald-400 bg-emerald-400/10' : h < 0 ? 'text-rose-400 bg-rose-400/10' : 'text-gray-400 bg-gray-400/10'}
                    `}
                  >
                    {h}
                  </span>
                ))}
                {history.length === 0 && (
                  <span className="text-xs text-gray-500">No history yet</span>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Keyboard shortcut hint */}
        <p className="text-center text-xs text-gray-600 mt-5">
          <kbd className="px-1.5 py-0.5 bg-[#1a1a22] border border-[#2a2a35] rounded text-gray-400 text-[10px] font-mono">↑↓</kbd>
          {' '}or{' '}
          <kbd className="px-1.5 py-0.5 bg-[#1a1a22] border border-[#2a2a35] rounded text-gray-400 text-[10px] font-mono">←→</kbd>
          {' '}to count ·{' '}
          <kbd className="px-1.5 py-0.5 bg-[#1a1a22] border border-[#2a2a35] rounded text-gray-400 text-[10px] font-mono">R</kbd>
          {' '}to reset
        </p>
      </main>
    </div>
  );
};