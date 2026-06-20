function App() {
  const { useState, useCallback, useEffect } = React;
  const { Plus, Minus, RotateCcw } = lucide;

  const [count, setCount] = useState(0);
  const [step, setStep] = useState(1);
  const [stepInput, setStepInput] = useState("1");
  const [error, setError] = useState("");

  // Validate step and sync
  useEffect(() => {
    const parsed = parseInt(stepInput, 10);
    if (isNaN(parsed) || parsed <= 0) {
      setError("Step must be a positive integer.");
      setStep(1);
    } else {
      setError("");
      setStep(parsed);
    }
  }, [stepInput]);

  const increment = useCallback(() => {
    setCount((prev) => prev + step);
  }, [step]);

  const decrement = useCallback(() => {
    setCount((prev) => prev - step);
  }, [step]);

  const reset = useCallback(() => {
    setCount(0);
    setStepInput("1");
    setError("");
  }, []);

  const handleStepChange = (e) => {
    setStepInput(e.target.value);
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4" style={{ backgroundColor: '#0f0f23' }}>
      <div className="w-full max-w-md bg-gradient-to-b from-gray-900 to-gray-800 border border-indigo-900/30 rounded-3xl shadow-2xl p-8 transition-all">
        {/* Header */}
        <div className="text-center mb-6">
          <h1 className="text-3xl font-bold bg-gradient-to-r from-indigo-400 to-pink-400 bg-clip-text text-transparent">
            Counter
          </h1>
          <p className="text-gray-400 mt-1 text-sm">Precision stepping</p>
        </div>

        {/* Count Display */}
        <div className="bg-black/30 backdrop-blur-md rounded-2xl p-6 mb-6 border border-indigo-500/20 shadow-inner shadow-indigo-900/30">
          <div
            className="text-6xl font-mono font-bold text-center tabular-nums text-white"
            aria-live="polite"
            aria-label={`Current count: ${count}`}
          >
            {count}
          </div>
        </div>

        {/* Step Input with Validation */}
        <div className="mb-6">
          <label htmlFor="step-input" className="block text-sm font-medium text-gray-300 mb-2">
            Step size
          </label>
          <input
            id="step-input"
            type="number"
            min="1"
            step="1"
            value={stepInput}
            onChange={handleStepChange}
            className={`w-full px-4 py-2 bg-gray-800 border rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-900 transition-colors ${
              error ? 'border-red-500 focus:ring-red-400' : 'border-indigo-500/40 focus:ring-indigo-400'
            }`}
            placeholder="Enter step (e.g., 1)"
            aria-invalid={error ? "true" : "false"}
            aria-describedby="step-error"
          />
          {error && (
            <p id="step-error" className="mt-1 text-xs text-red-400 flex items-center gap-1" role="alert">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
              {error}
            </p>
          )}
        </div>

        {/* Buttons Grid */}
        <div className="grid grid-cols-3 gap-3">
          <button
            onClick={decrement}
            className="group flex items-center justify-center gap-2 py-3 px-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 active:scale-95 transition-all text-white font-semibold shadow-lg shadow-indigo-900/50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-900 focus:ring-indigo-300"
            aria-label={`Decrease by ${step}`}
          >
            <Minus className="w-5 h-5 group-hover:rotate-12 transition-transform" />
            <span className="sr-only">Decrement</span>
          </button>

          <button
            onClick={reset}
            className="group flex items-center justify-center gap-2 py-3 px-2 rounded-xl bg-gray-700 hover:bg-gray-600 active:scale-95 transition-all text-gray-300 font-semibold shadow-lg focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-900 focus:ring-gray-400"
            aria-label="Reset count to zero"
          >
            <RotateCcw className="w-5 h-5 group-hover:rotate-180 transition-transform duration-300" />
            <span className="sr-only">Reset</span>
          </button>

          <button
            onClick={increment}
            className="group flex items-center justify-center gap-2 py-3 px-2 rounded-xl bg-pink-500 hover:bg-pink-400 active:scale-95 transition-all text-white font-semibold shadow-lg shadow-pink-900/50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-900 focus:ring-pink-300"
            aria-label={`Increase by ${step}`}
          >
            <Plus className="w-5 h-5 group-hover:rotate-12 transition-transform" />
            <span className="sr-only">Increment</span>
          </button>
        </div>

        {/* Keyboard hint */}
        <p className="text-xs text-gray-500 mt-6 text-center">
          Tip: Use tab to navigate, enter to activate buttons
        </p>
      </div>
    </div>
  );
}