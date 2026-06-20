const { useState, useEffect, useCallback } = React;
const { Plus, Minus, RotateCcw, Hash } = lucide;

// ── Counter Display ──────────────────────────────────────────
function CounterDisplay({ count, prevCount }) {
  const isIncreasing = count > prevCount;
  const isDecreasing = count < prevCount;
  
  return (
    <div className="relative flex flex-col items-center justify-center py-10">
      {/* Glow behind the number */}
      <div 
        className="absolute inset-0 rounded-full opacity-20 blur-3xl transition-colors duration-500"
        style={{
          background: count > 0 
            ? 'radial-gradient(circle, rgba(168,85,247,0.6), transparent)' 
            : count < 0 
              ? 'radial-gradient(circle, rgba(239,68,68,0.5), transparent)' 
              : 'radial-gradient(circle, rgba(100,116,139,0.3), transparent)',
          width: '180px',
          height: '180px',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
        }}
      />
      
      {/* Icon + Label */}
      <div className="flex items-center gap-2 mb-3 text-gray-500 text-sm uppercase tracking-widest font-medium">
        <Hash size={14} />
        <span>Current Count</span>
      </div>
      
      {/* The Number */}
      <span
        className={`
          relative text-7xl md:text-8xl font-extrabold tracking-tighter tabular-nums
          transition-all duration-300 ease-out
          ${count === 0 ? 'text-gray-400' : count > 0 ? 'text-white' : 'text-red-400'}
          ${isIncreasing ? 'animate-pulse scale-110' : ''}
          ${isDecreasing ? 'scale-95' : ''}
        `}
        style={{ 
          textShadow: count !== 0 
            ? `0 0 60px ${count > 0 ? 'rgba(168,85,247,0.4)' : 'rgba(239,68,68,0.3)'}` 
            : 'none' 
        }}
        key={count}
      >
        {count}
      </span>
      
      {/* Status badge */}
      <div className="mt-4">
        <span className={`
          inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold
          transition-all duration-300
          ${count > 0 ? 'bg-purple-500/15 text-purple-400 border border-purple-500/30' : ''}
          ${count === 0 ? 'bg-gray-500/10 text-gray-500 border border-gray-600/30' : ''}
          ${count < 0 ? 'bg-red-500/10 text-red-400 border border-red-500/30' : ''}
        `}>
          <span className={`w-1.5 h-1.5 rounded-full ${
            count > 0 ? 'bg-purple-400 animate-pulse' : 
            count < 0 ? 'bg-red-400 animate-pulse' : 'bg-gray-500'
          }`} />
          {count > 0 ? 'Positive' : count < 0 ? 'Negative' : 'Neutral'}
        </span>
      </div>
    </div>
  );
}

// ── Control Button ───────────────────────────────────────────
function ControlButton({ onClick, icon: Icon, label, variant = 'default', className = '' }) {
  const baseClasses = `
    flex items-center justify-center gap-2 font-semibold rounded-xl
    transition-all duration-200 ease-out
    focus:ring-2 focus:ring-offset-2 focus:ring-offset-[#141419] focus:ring-purple-500
    active:scale-95 select-none
    h-14
  `;
  
  const variants = {
    default: 'bg-[#1a1a21] hover:bg-[#22222e] text-white border border-[#22222a] hover:border-gray-600',
    primary: 'bg-purple-600 hover:bg-purple-500 text-white shadow-lg shadow-purple-500/20 hover:shadow-purple-500/40',
    danger: 'bg-red-500/10 hover:bg-red-500/20 text-red-400 hover:text-red-300 border border-red-500/20 hover:border-red-500/40',
  };
  
  return (
    <button
      onClick={onClick}
      aria-label={label}
      className={`${baseClasses} ${variants[variant]} ${className}`}
    >
      <Icon size={20} />
      <span className="hidden sm:inline">{label}</span>
    </button>
  );
}

// ── Step Presets ─────────────────────────────────────────────
function StepPreset({ steps, currentStep, onSelect }) {
  return (
    <div className="flex items-center gap-2 justify-center flex-wrap">
      <span className="text-xs text-gray-500 mr-1">Step:</span>
      {steps.map((step) => (
        <button
          key={step}
          onClick={() => onSelect(step)}
          aria-label={`Set step to ${step}`}
          className={`
            px-2.5 py-1 rounded-lg text-xs font-semibold transition-all duration-200
            focus:ring-2 focus:ring-offset-2 focus:ring-offset-[#141419] focus:ring-purple-500
            ${currentStep === step 
              ? 'bg-purple-600 text-white shadow-md shadow-purple-500/30' 
              : 'bg-[#1a1a21] text-gray-400 hover:text-white hover:bg-[#22222e] border border-[#22222a]'
            }
          `}
        >
          {step}
        </button>
      ))}
    </div>
  );
}

// ── Stats Bar ────────────────────────────────────────────────
function StatsBar({ totalClicks, history }) {
  const increments = history.filter(h => h.type === 'inc').length;
  const decrements = history.filter(h => h.type === 'dec').length;
  const resets = history.filter(h => h.type === 'reset').length;
  
  return (
    <div className="grid grid-cols-3 gap-3 mt-6 pt-6 border-t border-[#22222a]">
      <div className="text-center">
        <div className="text-xs text-gray-500 uppercase tracking-wider mb-1">Increments</div>
        <div className="text-lg font-bold text-green-400">{increments}</div>
      </div>
      <div className="text-center border-x border-[#22222a]">
        <div className="text-xs text-gray-500 uppercase tracking-wider mb-1">Decrements</div>
        <div className="text-lg font-bold text-red-400">{decrements}</div>
      </div>
      <div className="text-center">
        <div className="text-xs text-gray-500 uppercase tracking-wider mb-1">Resets</div>
        <div className="text-lg font-bold text-gray-400">{resets}</div>
      </div>
    </div>
  );
}

// ── Toast Notification ───────────────────────────────────────
function Toast({ message, visible }) {
  return (
    <div
      className={`
        fixed top-6 left-1/2 -translate-x-1/2 z-50
        px-4 py-2.5 rounded-xl bg-[#1a1a21] border border-[#22222a]
        text-sm font-medium text-white shadow-2xl
        transition-all duration-300 ease-out
        ${visible ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-4 pointer-events-none'}
      `}
      style={{ boxShadow: '0 0 30px rgba(168,85,247,0.2)' }}
    >
      {message}
    </div>
  );
}

// ── App ──────────────────────────────────────────────────────
function App() {
  const [count, setCount] = useState(0);
  const [prevCount, setPrevCount] = useState(0);
  const [step, setStep] = useState(1);
  const [history, setHistory] = useState([]);
  const [toast, setToast] = useState({ message: '', visible: false });
  
  const stepPresets = [1, 2, 5, 10, 25, 50, 100];
  
  const showToast = useCallback((message) => {
    setToast({ message, visible: true });
    setTimeout(() => setToast(t => ({ ...t, visible: false })), 1500);
  }, []);
  
  const increment = useCallback(() => {
    setPrevCount(count);
    setCount(c => c + step);
    setHistory(h => [...h.slice(-49), { type: 'inc', amount: step, time: Date.now() }]);
    showToast(`+${step}`);
  }, [count, step, showToast]);
  
  const decrement = useCallback(() => {
    setPrevCount(count);
    setCount(c => c - step);
    setHistory(h => [...h.slice(-49), { type: 'dec', amount: step, time: Date.now() }]);
    showToast(`-${step}`);
  }, [count, step, showToast]);
  
  const reset = useCallback(() => {
    setPrevCount(count);
    setCount(0);
    setHistory(h => [...h.slice(-49), { type: 'reset', amount: count, time: Date.now() }]);
    showToast('Reset to zero');
  }, [count, showToast]);
  
  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;
      if (e.key === 'ArrowUp' || e.key === '+') { e.preventDefault(); increment(); }
      if (e.key === 'ArrowDown' || e.key === '-') { e.preventDefault(); decrement(); }
      if (e.key === 'r' || e.key === 'R' || e.key === 'Escape') { e.preventDefault(); reset(); }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [increment, decrement, reset]);
  
  const totalClicks = history.length;
  
  return (
    <div className="min-h-screen bg-[#0d0d12] flex items-center justify-center p-4">
      <Toast message={toast.message} visible={toast.visible} />
      
      <div 
        className="w-full max-w-sm"
        style={{ boxShadow: '0 0 80px rgba(168,85,247,0.08)' }}
      >
        {/* Card */}
        <div className="bg-[#141419] border border-[#22222a] rounded-2xl p-6 sm:p-8">
          {/* Title */}
          <div className="text-center mb-2">
            <h1 className="text-sm font-semibold text-gray-400 uppercase tracking-widest">
              Counter
            </h1>
          </div>
          
          {/* Display */}
          <CounterDisplay count={count} prevCount={prevCount} />
          
          {/* Buttons */}
          <div className="grid grid-cols-3 gap-3 mt-4">
            <ControlButton
              onClick={decrement}
              icon={Minus}
              label="Decrease"
              variant="default"
            />
            <ControlButton
              onClick={reset}
              icon={RotateCcw}
              label="Reset"
              variant="danger"
            />
            <ControlButton
              onClick={increment}
              icon={Plus}
              label="Increase"
              variant="primary"
            />
          </div>
          
          {/* Step presets */}
          <div className="mt-5">
            <StepPreset 
              steps={stepPresets} 
              currentStep={step} 
              onSelect={setStep} 
            />
          </div>
          
          {/* Stats */}
          <StatsBar totalClicks={totalClicks} history={history} />
          
          {/* Keyboard hint */}
          <p className="text-center text-xs text-gray-600 mt-4">
            <kbd className="px-1.5 py-0.5 rounded bg-[#1a1a21] border border-[#22222a] text-gray-500 text-[10px]">↑</kbd>
            {' '}
            <kbd className="px-1.5 py-0.5 rounded bg-[#1a1a21] border border-[#22222a] text-gray-500 text-[10px]">↓</kbd>
            {' '}
            <span className="text-gray-600">or</span>
            {' '}
            <kbd className="px-1.5 py-0.5 rounded bg-[#1a1a21] border border-[#22222a] text-gray-500 text-[10px]">R</kbd>
            {' '}
            <span className="text-gray-600">to control</span>
          </p>
        </div>
        
        {/* Footer */}
        <p className="text-center text-xs text-gray-600 mt-4">
          Total clicks: <span className="text-gray-400 font-semibold">{totalClicks}</span>
        </p>
      </div>
    </div>
  );
}

ReactDOM.render(<App />, document.getElementById('root'));