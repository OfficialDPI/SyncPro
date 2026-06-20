import React from 'react';
const { useState } = React;

function App() {
  const [count, setCount] = useState(0  // ← missing closing parenthesis
  return (
    <div className="min-h-screen bg-[#2C1A14] flex items-center justify-center">
      <button
        onClick={() => setCount(count + 1)
        className="px-6 py-3 bg-primary hover:bg-primary-light text-accent rounded-full font-semibold transition-all"
      >
        Click me
      </button>
      <p className="text-accent ml-4 text-xl">Count: {count}}</p> {/* extra closing brace */}
    </div>
  )
}
export default App;
