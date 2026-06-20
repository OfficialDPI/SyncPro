import React from 'react';
function App() {
  const { useState, useCallback } = React;
  const { Sun, Moon, Pencil, Check, X } = window.lucide;

  const [name, setName] = useState('Friend');
  const [editing, setEditing] = useState(false);
  const [tempName, setTempName] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 18) return 'Good afternoon';
    return 'Good evening';
  };

  const getGreetingIcon = () => {
    const hour = new Date().getHours();
    if (hour < 12) return <Sun size={24} className="text-yellow-400" />;
    if (hour < 18) return <Sun size={24} className="text-orange-400" />;
    return <Moon size={24} className="text-blue-300" />;
  };

  const handleEdit = useCallback(() => {
    setTempName(name);
    setError('');
    setSuccess(false);
    setEditing(true);
  }, [name]);

  const handleCancel = useCallback(() => {
    setEditing(false);
    setError('');
  }, []);

  const handleSave = useCallback(() => {
    if (tempName.trim() === '') {
      setError('Name cannot be empty');
      return;
    }
    setName(tempName.trim());
    setEditing(false);
    setError('');
    setSuccess(true);
    setTimeout(() => setSuccess(false), 2000);
  }, [tempName]);

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      handleSave();
    }
  };

  return (
    <div
      className="min-h-screen flex items-center justify-center px-4"
      style={{ backgroundColor: '#1a1a2e' }}
    >
      <div className="relative w-full max-w-md mx-auto">
        {/* Success toast */}
        {success && (
          <div
            className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-12 bg-green-500 text-white px-4 py-2 rounded-lg shadow-lg animate-bounce"
            role="status"
            aria-live="polite"
          >
            ✓ Name updated!
          </div>
        )}

        <div className="bg-gray-900/50 backdrop-blur-lg rounded-2xl shadow-2xl p-8 border border-gray-700 transition-all duration-500 hover:shadow-purple-500/20">
          <div className="flex justify-center mb-6">{getGreetingIcon()}</div>

          {!editing ? (
            <div className="text-center space-y-2">
              <h1 className="text-3xl font-semibold text-white tracking-tight">
                {getGreeting()},
              </h1>
              <h2 className="text-4xl font-extrabold bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-pink-400 mb-6">
                {name}!
              </h2>
              <button
                onClick={handleEdit}
                className="inline-flex items-center gap-2 px-5 py-2.5 bg-purple-600 hover:bg-purple-700 text-white rounded-full transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 focus:ring-offset-gray-900"
                aria-label={`Edit name, currently ${name}`}
              >
                <Pencil size={16} aria-hidden="true" />
                Change Name
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              <label
                htmlFor="name-input"
                className="block text-sm font-medium text-gray-300"
              >
                Your name
              </label>
              <div className="flex gap-2">
                <input
                  id="name-input"
                  type="text"
                  value={tempName}
                  onChange={(e) => setTempName(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="Enter your name"
                  className="flex-1 px-4 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-500 transition-all"
                  aria-invalid={!!error}
                  aria-describedby="name-error"
                  autoFocus
                />
                <button
                  onClick={handleSave}
                  className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-all focus:outline-none focus:ring-2 focus:ring-purple-500"
                  aria-label="Save name"
                >
                  <Check size={20} aria-hidden="true" />
                </button>
                <button
                  onClick={handleCancel}
                  className="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-all focus:outline-none focus:ring-2 focus:ring-gray-500"
                  aria-label="Cancel editing"
                >
                  <X size={20} aria-hidden="true" />
                </button>
              </div>
              {error && (
                <p
                  id="name-error"
                  className="text-red-400 text-sm flex items-center gap-1"
                  role="alert"
                >
                  ⚠ {error}
                </p>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
export default App;
