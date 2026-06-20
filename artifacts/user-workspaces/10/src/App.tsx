function CounterApp() {
  const { useState, useEffect, useRef, useCallback } = React;
  const { Minus, Plus, RotateCcw } = lucide;

  const [count, setCount] = useState(0);
  const [step, setStep] = useState(1);
  const [error, setError] = useState(null);
  const [animateCount, setAnimateCount] = useState(false);
  const countRef = useRef(null);

  const validateStep = useCallback((value) => {
    const num = parseFloat(value);
    if (isNaN(num) || num <= 0) {
      setError("Step must be a positive number.");
      return false;
    }
    setError(null);
    return true;
  }, []);

  const handleStepChange = (e) => {
    const val = e.target.value;
    setStep(val);
    if (val === "") {
      setError("Step required.");
      return;
    }
    validateStep(val);
  };

  const handleStepBlur = () => {
    if (step === "" || isNaN(parseFloat(step)) || parseFloat(step) <= 0) {
      setError("Invalid step. Resetting to 1.");
      setStep(1);
      setError(null);
    }
  };

  const triggerCountAnimation = () => {
    setAnimateCount(true);
    setTimeout(() => setAnimateCount(false), 200);
  };

  const updateCount = useCallback((delta) => {
    const stepNum = parseFloat(step);
    if (!validateStep(step)) return;
    setCount((prev) => {
      const newVal = prev + delta * stepNum;
      // round to avoid floating point weirdness
      return Math.round(newVal * 100) / 100;
    });
    triggerCountAnimation();
  }, [step, validateStep]);

  const increment = () => updateCount(1);
  const decrement = () => updateCount(-1);
  const reset = () => {
    setCount(0);
    triggerCountAnimation();
  };

  useEffect(() => {
    // Announce count change to screen readers
    if (countRef.current) {
      countRef.current.textContent = `Count: ${count}`;
    }
  }, [count]);

  const stepErrorId = "step-error";

  return (
    <div className="min-h-screen flex items-center justify-center p-4" style={{ backgroundColor: '#0d0d12' }}>
      <div className="w-full max-w-md p-8 rounded-2xl bg-gray-900/80 backdrop-blur-lg border border-gray-800 shadow-2xl shadow-black/30 transition-all duration-300">
        <h1 className="text-3xl font-bold text-center mb-3 bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent">
          Counter
        </h1>
        <p className="text-gray-400 text-sm text-center mb-8">A simple counter with adjustable step size</p>

        {/* Count display with live region */}
        <div className="relative mb-10">
          <div 
            className={`text-7xl font-extrabold text-center transition-transform duration-200 ${
              animateCount ? 'scale-110' : 'scale-100'
            } ${count >= 0 ? 'text-purple-300' : 'text-blue-300'}`}
            style={{ textShadow: '0 0 20px rgba(168, 85, 247, 0.4)' }}
            aria-live="polite"
            aria-atomic="true"
          >
            {count}
          </div>
          <div ref={countRef} className="sr-only" aria-live="polite">Count: {count}</div>
        </div>

        {/* Step input */}
        <div className="mb-8">
          <label htmlFor="step" className="block text-sm font-medium text-gray-300 mb-2">
            Step size
          </label>
          <input
            id="step"
            type="number"
            value={step}
            onChange={handleStepChange}
            onBlur={handleStepBlur}
            min="0.1"
            step="any"
            placeholder="Enter step"
            className={`w-full px-4 py-3 rounded-lg bg-gray-800 border text-gray-200 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all duration-200 ${
              error ? 'border-red-500' : 'border-gray-700 hover:border-gray-600'
            }`}
            aria-invalid={error ? 'true' : 'false'}
            aria-describedby={error ? stepErrorId : undefined}
          />
          {error && (
            <p id={stepErrorId} className="mt-2 text-sm text-red-400 flex items-center gap-1" role="alert">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              {error}
            </p>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-center gap-4">
          <button
            onClick={decrement}
            disabled={!!error}
            className="p-4 rounded-full bg-gray-800 hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed text-gray-200 transition-all duration-200 active:scale-95 focus:outline-none focus:ring-2 focus:ring-purple-500"
            aria-label="Decrement count"
          >
            <Minus className="w-6 h-6" />
          </button>

          <button
            onClick={reset}
            className="p-4 rounded-full bg-gray-800 hover:bg-gray-700 text-gray-200 transition-all duration-200 active:scale-95 focus:outline-none focus:ring-2 focus:ring-purple-500"
            aria-label="Reset count to zero"
          >
            <RotateCcw className="w-6 h-6" />
          </button>

          <button
            onClick={increment}
            disabled={!!error}
            className="p-4 rounded-full bg-purple-600 hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed text-white transition-all duration-200 active:scale-95 focus:outline-none focus:ring-2 focus:ring-purple-400"
            aria-label="Increment count"
          >
            <Plus className="w-6 h-6" />
          </button>
        </div>
      </div>
    </div>
  );
}