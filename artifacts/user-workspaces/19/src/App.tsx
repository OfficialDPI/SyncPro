function App() {
  const { useState, useEffect, useRef, useCallback, useMemo } = React;
  const { Home, Mail, Phone, Menu, X, Send, Award, Users, Clock, TrendingUp } = lucide;

  // Mobile menu
  const [menuOpen, setMenuOpen] = useState(false);

  // Contact form
  const [form, setForm] = useState({ name: '', email: '', message: '' });
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState(null); // 'success' | 'error' | null

  // Refs for intersection observers
  const featuresRef = useRef(null);
  const statsRef = useRef(null);
  const contactRef = useRef(null);
  const [featuresVisible, setFeaturesVisible] = useState(false);
  const [statsVisible, setStatsVisible] = useState(false);

  // Scroll-triggered animations via Intersection Observer
  useEffect(() => {
    const observerOptions = { threshold: 0.2 };
    const handleIntersect = (entries, observer) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          if (entry.target === featuresRef.current) setFeaturesVisible(true);
          if (entry.target === statsRef.current) setStatsVisible(true);
          observer.unobserve(entry.target);
        }
      });
    };
    const observer = new IntersectionObserver(handleIntersect, observerOptions);
    if (featuresRef.current) observer.observe(featuresRef.current);
    if (statsRef.current) observer.observe(statsRef.current);
    return () => observer.disconnect();
  }, []);

  // Scroll to contact
  const scrollToContact = () => {
    contactRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  // Form validation
  const validateForm = useCallback(() => {
    const newErrors = {};
    if (!form.name.trim()) newErrors.name = 'Name is required.';
    if (!form.email.trim()) {
      newErrors.email = 'Email is required.';
    } else if (!/\S+@\S+\.\S+/.test(form.email)) {
      newErrors.email = 'Please enter a valid email.';
    }
    if (!form.message.trim()) newErrors.message = 'Message is required.';
    return newErrors;
  }, [form]);

  // Handle form submit
  const handleSubmit = async (e) => {
    e.preventDefault();
    const validationErrors = validateForm();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }
    setErrors({});
    setIsSubmitting(true);
    setSubmitStatus(null);
    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      if (!res.ok) throw new Error('Server error');
      setSubmitStatus('success');
      setForm({ name: '', email: '', message: '' });
    } catch (err) {
      setSubmitStatus('error');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Input change handler
  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
    // Clear field error on change
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  // Stat counter animation (simple numeric increment using useEffect)
  const stats = [
    { icon: Users, value: 12300, label: 'Active Members' },
    { icon: Clock, value: 420, label: 'Weekly Classes' },
    { icon: Award, value: 85, label: 'Expert Coaches' },
    { icon: TrendingUp, value: 15, label: 'Years of Excellence' },
  ];

  const [statCounts, setStatCounts] = useState(stats.map(() => 0));

  useEffect(() => {
    if (!statsVisible) return;
    const duration = 2000;
    const incrementSteps = 30;
    const intervals = stats.map((stat, idx) => {
      const target = stat.value;
      const step = target / incrementSteps;
      let current = 0;
      const timer = setInterval(() => {
        current += step;
        if (current >= target) {
          current = target;
          clearInterval(timer);
        }
        setStatCounts(prev => {
          const next = [...prev];
          next[idx] = Math.floor(current);
          return next;
        });
      }, duration / incrementSteps);
      return timer;
    });
    return () => intervals.forEach(clearInterval);
  }, [statsVisible]);

  // Navigation links
  const navLinks = [
    { label: 'Home', icon: Home },
    { label: 'Features', icon: Award },
    { label: 'Contact', icon: Mail, onClick: scrollToContact },
  ];

  return (
    <div className="min-h-screen bg-[#1a1a2e] text-white font-sans relative">
      {/* Fixed Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-[#1a1a2e]/80 backdrop-blur-md shadow-lg" role="navigation" aria-label="Main navigation">
        <div className="max-w-7xl mx-auto px-4 py-3 flex justify-between items-center">
          <div className="flex items-center gap-2 text-2xl font-bold tracking-tight">
            <span className="bg-[#ff4500] p-1 rounded-lg">
              <TrendingUp className="w-6 h-6 text-white" />
            </span>
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-[#ff4500] to-[#00bfff]">
              PrimeFit
            </span>
          </div>
          {/* Desktop menu */}
          <div className="hidden md:flex items-center gap-8">
            {navLinks.map((link) => (
              <button
                key={link.label}
                onClick={link.onClick}
                className="flex items-center gap-1.5 text-gray-300 hover:text-[#ff4500] transition-colors duration-200 font-medium text-sm uppercase tracking-wider"
                aria-label={link.label}
              >
                <link.icon className="w-4 h-4" />
                {link.label}
              </button>
            ))}
            <button
              onClick={scrollToContact}
              className="ml-4 px-5 py-2 bg-[#ff4500] text-white rounded-full font-semibold text-sm hover:bg-[#e03e00] transition-colors shadow-lg shadow-[#ff4500]/20 flex items-center gap-2"
              aria-label="Get started"
            >
              <Send className="w-4 h-4" />
              Get Started
            </button>
          </div>
          {/* Mobile menu toggle */}
          <button
            className="md:hidden p-2 rounded-lg hover:bg-white/10 transition-colors"
            onClick={() => setMenuOpen(!menuOpen)}
            aria-expanded={menuOpen}
            aria-controls="mobile-menu"
            aria-label="Toggle mobile menu"
          >
            {menuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
        {/* Mobile menu */}
        <div
          id="mobile-menu"
          className={`md:hidden overflow-hidden transition-all duration-300 ease-in-out ${menuOpen ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'}`}
        >
          <div className="bg-[#16213e] px-4 py-4 space-y-2 border-t border-white/10">
            {navLinks.map((link) => (
              <button
                key={link.label}
                onClick={() => { setMenuOpen(false); link.onClick?.(); }}
                className="flex items-center gap-2 w-full py-2 px-3 rounded-lg text-gray-300 hover:text-[#ff4500] hover:bg-white/5 transition-colors"
              >
                <link.icon className="w-4 h-4" />
                {link.label}
              </button>
            ))}
            <button
              onClick={() => { setMenuOpen(false); scrollToContact(); }}
              className="w-full mt-2 px-5 py-2 bg-[#ff4500] text-white rounded-full font-semibold text-sm hover:bg-[#e03e00] transition-colors flex items-center justify-center gap-2"
            >
              <Send className="w-4 h-4" />
              Get Started
            </button>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <header className="relative pt-28 pb-24 px-4 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-[#1a1a2e] via-[#16213e] to-[#1a1a2e]">
          <div className="absolute top-20 left-10 w-64 h-64 bg-[#ff4500]/10 rounded-full blur-3xl" />
          <div className="absolute bottom-10 right-10 w-96 h-96 bg-[#00bfff]/10 rounded-full blur-3xl" />
        </div>
        <div className="max-w-7xl mx-auto relative z-10 flex flex-col items-center text-center">
          <h1 className="text-5xl md:text-7xl font-extrabold leading-tight mb-6">
            <span className="text-white">Elevate Your </span>
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-[#ff4500] to-[#00bfff]">
              Athletic Performance
            </span>
          </h1>
          <p className="text-lg md:text-xl text-gray-300 max-w-2xl mb-10">
            Join the elite community that trains with purpose. Cutting-edge facilities, world-class coaches, and a results-driven mindset.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <button
              onClick={scrollToContact}
              className="px-8 py-4 bg-[#ff4500] text-white rounded-full font-bold text-lg hover:bg-[#e03e00] transition-all transform hover:scale-105 shadow-xl shadow-[#ff4500]/20 flex items-center gap-2"
              aria-label="Start your free trial"
            >
              <Send className="w-5 h-5" />
              Start Free Trial
            </button>
            <button
              className="px-8 py-4 bg-transparent border-2 border-[#00bfff] text-[#00bfff] rounded-full font-bold text-lg hover:bg-[#00bfff]/10 transition-all transform hover:scale-105 flex items-center gap-2"
              aria-label="Learn more about us"
            >
              Explore More
            </button>
          </div>
        </div>
      </header>

      {/* Features Section */}
      <section ref={featuresRef} className="py-20 px-4 bg-[#16213e]/30">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-14">
            <h2 className="text-4xl md:text-5xl font-bold mb-4">Why Choose <span className="text-[#ff4500]">PrimeFit</span>?</h2>
            <p className="text-gray-400 text-lg max-w-xl mx-auto">We don't just train bodies — we forge champions.</p>
          </div>
          <div className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 transition-all duration-1000 transform ${featuresVisible ? 'translate-y-0 opacity-100' : 'translate-y-12 opacity-0'}`}>
            {[
              { icon: Award, title: 'Expert Coaches', desc: 'Former professional athletes and certified trainers who push your limits safely.' },
              { icon: Clock, title: 'Flexible Scheduling', desc: 'Classes around the clock to fit your busy lifestyle — never miss a workout.' },
              { icon: Users, title: 'Community Focus', desc: 'Train alongside motivated peers in a supportive, high-energy environment.' },
            ].map((feat, idx) => (
              <div key={idx} className="group bg-[#1a1a2e] p-8 rounded-2xl border border-white/5 hover:border-[#00bfff]/30 hover:shadow-2xl hover:shadow-[#00bfff]/10 transition-all duration-300">
                <div className="w-14 h-14 bg-[#ff4500]/20 rounded-xl flex items-center justify-center mb-6 group-hover:bg-[#ff4500]/30 transition-colors">
                  <feat.icon className="w-7 h-7 text-[#ff4500]" />
                </div>
                <h3 className="text-2xl font-semibold mb-3">{feat.title}</h3>
                <p className="text-gray-400 leading-relaxed">{feat.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Stats Section with Counters */}
      <section ref={statsRef} className="py-20 px-4 bg-gradient-to-b from-[#1a1a2e] to-[#16213e]">
        <div className="max-w-7xl mx-auto text-center">
          <h2 className="text-4xl md:text-5xl font-bold mb-6"><span className="text-[#00bfff]">Numbers</span> Don't Lie</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mt-12">
            {stats.map((stat, idx) => (
              <div key={idx} className="flex flex-col items-center p-6 rounded-2xl bg-[#1a1a2e] border border-white/5 hover:scale-105 transition-transform duration-300">
                <div className="mb-4 bg-[#00bfff]/20 p-3 rounded-full">
                  <stat.icon className="w-8 h-8 text-[#00bfff]" />
                </div>
                <span className="text-4xl md:text-5xl font-extrabold text-white mb-1">
                  {statCounts[idx].toLocaleString()}+
                </span>
                <span className="text-gray-400 text-sm uppercase tracking-wider">{stat.label}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section ref={contactRef} id="contact" className="py-20 px-4 relative">
        <div className="absolute inset-0 bg-[#16213e]/40 backdrop-blur-sm" />
        <div className="max-w-3xl mx-auto relative z-10 bg-[#1a1a2e] p-8 md:p-12 rounded-3xl border border-white/10 shadow-2xl">
          <div className="text-center mb-10">
            <h2 className="text-4xl md:text-5xl font-bold mb-3">Get In <span className="text-[#ff4500]">Touch</span></h2>
            <p className="text-gray-400">Ready to transform? Send us a message and we'll get back within 24h.</p>
          </div>
          <form onSubmit={handleSubmit} noValidate className="space-y-6">
            {/* Name */}
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-300 mb-2">
                Full Name
              </label>
              <input
                type="text"
                id="name"
                name="name"
                value={form.name}
                onChange={handleChange}
                placeholder="John Doe"
                className="w-full px-4 py-3 bg-[#16213e] border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[#ff4500] focus:border-transparent transition-all"
                aria-describedby="name-error"
                aria-invalid={!!errors.name}
              />
              {errors.name && (
                <p id="name-error" className="mt-2 text-sm text-[#ff4500]" role="alert">{errors.name}</p>
              )}
            </div>
            {/* Email */}
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-300 mb-2">
                Email Address
              </label>
              <input
                type="email"
                id="email"
                name="email"
                value={form.email}
                onChange={handleChange}
                placeholder="john@example.com"
                className="w-full px-4 py-3 bg-[#16213e] border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[#ff4500] focus:border-transparent transition-all"
                aria-describedby="email-error"
                aria-invalid={!!errors.email}
              />
              {errors.email && (
                <p id="email-error" className="mt-2 text-sm text-[#ff4500]" role="alert">{errors.email}</p>
              )}
            </div>
            {/* Message */}
            <div>
              <label htmlFor="message" className="block text-sm font-medium text-gray-300 mb-2">
                Message
              </label>
              <textarea
                id="message"
                name="message"
                rows="4"
                value={form.message}
                onChange={handleChange}
                placeholder="Tell us about your goals..."
                className="w-full px-4 py-3 bg-[#16213e] border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[#ff4500] focus:border-transparent transition-all resize-none"
                aria-describedby="message-error"
                aria-invalid={!!errors.message}
              />
              {errors.message && (
                <p id="message-error" className="mt-2 text-sm text-[#ff4500]" role="alert">{errors.message}</p>
              )}
            </div>
            {/* Submit button and status */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full sm:w-auto px-8 py-3 bg-[#ff4500] text-white rounded-full font-bold text-lg hover:bg-[#e03e00] transition-all transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                aria-label="Send message"
              >
                {isSubmitting ? (
                  <span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                ) : (
                  <Send className="w-5 h-5" />
                )}
                {isSubmitting ? 'Sending...' : 'Send Message'}
              </button>
              {submitStatus === 'success' && (
                <p className="text-[#00bfff] font-medium" role="status">Message sent successfully! 🎉</p>
              )}
              {submitStatus === 'error' && (
                <p className="text-[#ff4500] font-medium" role="alert">Failed to send. Please try again.</p>
              )}
            </div>
          </form>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 px-4 border-t border-white/10 text-center text-gray-400 text-sm">
        &copy; 2025 PrimeFit Sports. All rights reserved.
      </footer>
    </div>
  );
}