const { useState } = React;
const { Plus, Minus, RotateCcw } = lucide;

function Counter() {
  const [count, setCount] = useState(0);

  const increment = () => setCount(prev => prev + 1);
  const decrement = () => setCount(prev => prev - 1);
  const reset = () => setCount(0);

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl p-8 max-w-sm w-full text-center">
        <h2 className="text-2xl font-semibold text-gray-700 mb-4">Simple Counter</h2>
        <div
          aria-live="polite"
          id="counter-value"
          className="text-6xl font-bold text-blue-700 mb-8 transition-all duration-200"
        >
          {count}
        </div>
        <div className="flex justify-center gap-4">
          <button
            onClick={decrement}
            aria-label="Decrement count"
            title="Decrease"
            className="p-3 rounded-full bg-gray-200 hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-400 transition-colors"
          >
            <Minus size={24} />
          </button>
          <button
            onClick={reset}
            aria-label="Reset count"
            title="Reset"
            className="px-5 py-2 rounded-full bg-gray-100 hover:bg-gray-200 text-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-400 transition-colors flex items-center gap-1"
          >
            <RotateCcw size={20} />
            <span>Reset</span>
          </button>
          <button
            onClick={increment}
            aria-label="Increment count"
            title="Increase"
            className="p-3 rounded-full bg-blue-500 hover:bg-blue-600 text-white focus:outline-none focus:ring-2 focus:ring-blue-400 transition-colors"
          >
            <Plus size={24} />
          </button>
        </div>
      </div>
    </div>
  );
}

ReactDOM.render(<Counter />, document.getElementById('root'));