import React, { useState } from 'react';
import ReactDOM from 'react-dom/client';

const CounterApp = () => {
  const [count, setCount] = useState(0);

  const increment = () => setCount(prev => prev + 1);
  const decrement = () => setCount(prev => prev - 1);
  const reset = () => setCount(0);

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      minHeight: '100vh',
      fontFamily: 'Arial, sans-serif',
      backgroundColor: '#f0f2f5'
    }}>
      <div style={{
        backgroundColor: 'white',
        padding: '2rem 3rem',
        borderRadius: '12px',
        boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
        textAlign: 'center'
      }}>
        <h1 style={{ color: '#333', marginBottom: '1.5rem' }}>Counter App</h1>
        
        <div style={{
          fontSize: '4rem',
          fontWeight: 'bold',
          color: count >= 0 ? '#2ecc71' : '#e74c3c',
          marginBottom: '1.5rem',
          transition: 'color 0.3s ease'
        }}>
          {count}
        </div>

        <div style={{
          display: 'flex',
          gap: '0.5rem',
          justifyContent: 'center',
          flexWrap: 'wrap'
        }}>
          <button
            onClick={decrement}
            style={{
              padding: '0.8rem 1.5rem',
              fontSize: '1.2rem',
              backgroundColor: '#e74c3c',
              color: 'white',
              border: 'none',
              borderRadius: '6px',
              cursor: 'pointer',
              transition: 'background-color 0.2s',
              fontWeight: 'bold'
            }}
            onMouseEnter={(e) => e.target.style.backgroundColor = '#c0392b'}
            onMouseLeave={(e) => e.target.style.backgroundColor = '#e74c3c'}
          >
            -
          </button>

          <button
            onClick={reset}
            style={{
              padding: '0.8rem 1.5rem',
              fontSize: '1.2rem',
              backgroundColor: '#3498db',
              color: 'white',
              border: 'none',
              borderRadius: '6px',
              cursor: 'pointer',
              transition: 'background-color 0.2s',
              fontWeight: 'bold'
            }}
            onMouseEnter={(e) => e.target.style.backgroundColor = '#2980b9'}
            onMouseLeave={(e) => e.target.style.backgroundColor = '#3498db'}
          >
            Reset
          </button>

          <button
            onClick={increment}
            style={{
              padding: '0.8rem 1.5rem',
              fontSize: '1.2rem',
              backgroundColor: '#2ecc71',
              color: 'white',
              border: 'none',
              borderRadius: '6px',
              cursor: 'pointer',
              transition: 'background-color 0.2s',
              fontWeight: 'bold'
            }}
            onMouseEnter={(e) => e.target.style.backgroundColor = '#27ae60'}
            onMouseLeave={(e) => e.target.style.backgroundColor = '#2ecc71'}
          >
            +
          </button>
        </div>
      </div>
    </div>
  );
};

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(<CounterApp />);