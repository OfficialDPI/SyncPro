<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta name="description" content="Coffee Cove — Handcrafted coffee experiences in a cozy, welcoming space. Discover our artisan brews, fresh pastries, and the perfect atmosphere for your daily ritual.">
    <meta name="theme-color" content="#1E1814">
    <title>Coffee Cove — Handcrafted Coffee & Cozy Vibes</title>
    <!-- Google Fonts for modern typography -->
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Inter:opsz,wght@14..32,400;14..32,500;14..32,600;14..32,700&family=Outfit:wght@400;500;600;700;800&display=swap" rel="stylesheet">
    <style>
        :root {
            --primary: #6F4E37;
            --primary-light: #8B6346;
            --primary-dark: #4A3325;
            --accent: #D4A76A;
            --accent-light: #E0BF8A;
            --accent-dark: #B8894A;
            --dark: #1E1814;
            --dark-light: #2A231E;
            --dark-lighter: #352D27;
            --dark-card: #251F1A;
            --cream: #F5EDE4;
            --cream-muted: #C4B8AD;
            --white: #FFFFFF;
            --shadow-sm: 0 2px 8px rgba(0,0,0,0.25);
            --shadow-md: 0 6px 24px rgba(0,0,0,0.35);
            --shadow-lg: 0 12px 40px rgba(0,0,0,0.5);
            --shadow-accent: 0 4px 20px rgba(212, 167, 106, 0.25);
            --radius-sm: 8px;
            --radius-md: 14px;
            --radius-lg: 24px;
            --radius-full: 9999px;
            --transition: 0.3s cubic-bezier(0.4, 0, 0.2, 1);
            --font-heading: 'Outfit', sans-serif;
            --font-body: 'Inter', sans-serif;
        }

        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }

        html {
            scroll-behavior: smooth;
            scroll-padding-top: 80px;
        }

        body {
            background-color: var(--dark);
            color: var(--cream);
            font-family: var(--font-body);
            line-height: 1.7;
            overflow-x: hidden;
            -webkit-font-smoothing: antialiased;
        }

        /* Skip Link */
        .skip-link {
            position: absolute;
            top: -100px;
            left: 20px;
            z-index: 9999;
            padding: 12px 24px;
            background: var(--accent);
            color: var(--dark);
            font-weight: 700;
            border-radius: var(--radius-sm);
            text-decoration: none;
            transition: top 0.2s ease;
        }
        .skip-link:focus {
            top: 16px;
            outline: 3px solid var(--accent);
            outline-offset: 3px;
        }

        *:focus-visible {
            outline: 2px solid var(--accent);
            outline-offset: 2px;
            border-radius: 4px;
        }

        /* ========== NAVIGATION ========== */
        .navbar {
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            z-index: 1000;
            background: rgba(30, 24, 20, 0.9);
            backdrop-filter: blur(12px);
            -webkit-backdrop-filter: blur(12px);
            border-bottom: 1px solid rgba(212, 167, 106, 0.12);
            transition: var(--transition);
            padding: 0 24px;
        }
        .navbar.scrolled {
            background: rgba(30, 24, 20, 0.98);
            box-shadow: var(--shadow-lg);
        }
        .nav-container {
            max-width: 1200px;
            margin: 0 auto;
            display: flex;
            align-items: center;
            justify-content: space-between;
            height: 72px;
        }
        .nav-logo {
            display: flex;
            align-items: center;
            gap: 10px;
            text-decoration: none;
            color: var(--cream);
            font-family: var(--font-heading);
            font-size: 1.5rem;
            font-weight: 700;
            letter-spacing: 0.5px;
            transition: var(--transition);
        }
        .nav-logo:hover {
            color: var(--accent);
        }
        .logo-icon {
            width: 42px;
            height: 42px;
            background: var(--accent);
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 1.4rem;
            color: var(--dark);
            flex-shrink: 0;
            box-shadow: 0 0 20px rgba(212, 167, 106, 0.3);
        }

        .nav-links {
            display: flex;
            list-style: none;
            gap: 32px;
            align-items: center;
        }
        .nav-links a {
            text-decoration: none;
            color: var(--cream-muted);
            font-weight: 500;
            font-size: 0.9rem;
            text-transform: uppercase;
            letter-spacing: 0.6px;
            position: relative;
            transition: var(--transition);
            padding: 6px 0;
        }
        .nav-links a::after {
            content: '';
            position: absolute;
            bottom: 0;
            left: 0;
            width: 0;
            height: 2px;
            background: var(--accent);
            border-radius: 2px;
            transition: width 0.3s ease;
        }
        .nav-links a:hover {
            color: var(--accent);
        }
        .nav-links a:hover::after {
            width: 100%;
        }
        .nav-cta {
            background: var(--accent);
            color: var(--dark) !important;
            padding: 10px 22px !important;
            border-radius: 50px;
            font-weight: 600 !important;
            transition: var(--transition) !important;
            box-shadow: var(--shadow-accent);
            text-transform: none !important;
        }
        .nav-cta:hover {
            background: var(--accent-light) !important;
            transform: translateY(-2px);
            box-shadow: 0 6px 24px rgba(212, 167, 106, 0.4);
        }

        /* Mobile Menu Toggle */
        .menu-toggle {
            display: none;
            flex-direction: column;
            gap: 6px;
            cursor: pointer;
            z-index: 1001;
            background: none;
            border: none;
            padding: 8px;
        }
        .menu-toggle span {
            display: block;
            width: 28px;
            height: 2.5px;
            background: var(--cream);
            border-radius: 3px;
            transition: 0.3s ease;
        }
        .menu-toggle.active span:nth-child(1) {
            transform: rotate(45deg) translate(6px, 6px);
        }
        .menu-toggle.active span:nth-child(2) {
            opacity: 0;
        }
        .menu-toggle.active span:nth-child(3) {
            transform: rotate(-45deg) translate(6px, -6px);
        }

        /* Mobile Menu Panel */
        .mobile-menu {
            position: fixed;
            top: 0;
            right: -100%;
            width: 80%;
            max-width: 320px;
            height: 100vh;
            background: var(--dark-light);
            border-left: 1px solid rgba(212, 167, 106, 0.1);
            z-index: 999;
            padding: 80px 32px 32px;
            transition: right 0.3s ease;
            box-shadow: var(--shadow-lg);
            display: flex;
            flex-direction: column;
            gap: 24px;
        }
        .mobile-menu.active {
            right: 0;
        }
        .mobile-menu a {
            color: var(--cream-muted);
            text-decoration: none;
            font-size: 1.2rem;
            font-weight: 500;
            padding: 8px 0;
            border-bottom: 1px solid rgba(212, 167, 106, 0.12);
            transition: var(--transition);
        }
        .mobile-menu a:hover {
            color: var(--accent);
        }
        .mobile-menu .mobile-cta {
            background: var(--accent);
            color: var(--dark);
            text-align: center;
            padding: 14px 20px;
            border-radius: 50px;
            font-weight: 600;
            margin-top: auto;
            border-bottom: none;
            box-shadow: var(--shadow-accent);
        }
        .menu-overlay {
            position: fixed;
            inset: 0;
            background: rgba(0,0,0,0.5);
            z-index: 998;
            opacity: 0;
            pointer-events: none;
            transition: opacity 0.3s ease;
        }
        .menu-overlay.active {
            opacity: 1;
            pointer-events: auto;
        }

        /* ========== HERO SECTION ========== */
        .hero {
            min-height: 100vh;
            display: flex;
            align-items: center;
            justify-content: center;
            background: radial-gradient(ellipse 70% 50% at 50% 35%, rgba(212, 167, 106, 0.08) 0%, transparent 65%),
                        radial-gradient(ellipse 60% 40% at 25% 75%, rgba(111, 78, 55, 0.2) 0%, transparent 55%),
                        radial-gradient(ellipse 50% 35% at 75% 70%, rgba(111, 78, 55, 0.15) 0%, transparent 50%),
                        var(--dark);
            padding: 100px 24px 60px;
            position: relative;
            overflow: hidden;
        }
        .hero-content {
            max-width: 800px;
            text-align: center;
            position: relative;
            z-index: 2;
        }
        .hero-badge {
            display: inline-flex;
            align-items: center;
            gap: 8px;
            background: rgba(212, 167, 106, 0.1);
            border: 1px solid rgba(212, 167, 106, 0.25);
            padding: 8px 20px;
            border-radius: 50px;
            margin-bottom: 24px;
            animation: fadeInUp 0.7s ease forwards;
        }
        .hero-badge .dot {
            width: 8px;
            height: 8px;
            background: var(--accent);
            border-radius: 50%;
            animation: pulse 2s infinite;
        }
        .hero h1 {
            font-family: var(--font-heading);
            font-size: clamp(2.5rem, 7vw, 5rem);
            font-weight: 800;
            line-height: 1.1;
            margin-bottom: 20px;
            animation: fadeInUp 0.7s 0.1s ease forwards;
            opacity: 0;
        }
        .hero h1 span {
            color: var(--accent);
        }
        .hero p {
            font-size: clamp(1rem, 2.5vw, 1.25rem);
            color: var(--cream-muted);
            max-width: 600px;
            margin: 0 auto 32px;
            animation: fadeInUp 0.7s 0.2s ease forwards;
            opacity: 0;
        }
        .hero-buttons {
            display: flex;
            gap: 16px;
            justify-content: center;
            flex-wrap: wrap;
            animation: fadeInUp 0.7s 0.3s ease forwards;
            opacity: 0;
        }
        @keyframes fadeInUp {
            from { opacity: 0; transform: translateY(30px); }
            to { opacity: 1; transform: translateY(0); }
        }
        @keyframes pulse {
            0%, 100% { opacity: 1; }
            50% { opacity: 0.5; }
        }

        /* Buttons */
        .btn {
            display: inline-flex;
            align-items: center;
            gap: 8px;
            padding: 14px 32px;
            border-radius: 50px;
            font-weight: 600;
            text-decoration: none;
            transition: var(--transition);
            border: none;
            cursor: pointer;
            font-size: 1rem;
        }
        .btn-primary {
            background: var(--accent);
            color: var(--dark);
            box-shadow: 0 4px 20px rgba(212, 167, 106, 0.3);
        }
        .btn-primary:hover {
            background: var(--accent-light);
            transform: translateY(-2px);
            box-shadow: 0 8px 30px rgba(212, 167, 106, 0.4);
        }
        .btn-outline {
            border: 2px solid rgba(196, 184, 173, 0.4);
            color: var(--cream);
            background: transparent;
        }
        .btn-outline:hover {
            border-color: var(--accent);
            color: var(--accent);
        }

        /* ========== SECTIONS ========== */
        .section {
            padding: 80px 24px;
            max-width: 1200px;
            margin: 0 auto;
        }
        .section-header {
            text-align: center;
            margin-bottom: 48px;
        }
        .section-header h2 {
            font-family: var(--font-heading);
            font-size: clamp(2rem, 4vw, 2.8rem);
            color: var(--cream);
            margin-bottom: 12px;
        }
        .section-header p {
            color: var(--cream-muted);
            font-size: 1.1rem;
            max-width: 500px;
            margin: 0 auto;
        }

        /* Cards */
        .card {
            background: var(--dark-card);
            border: 1px solid var(--dark-lighter);
            border-radius: var(--radius-md);
            padding: 28px;
            transition: transform 0.3s ease, box-shadow 0.3s ease;
        }
        .card:hover {
            transform: translateY(-4px);
            box-shadow: 0 20px 40px rgba(0,0,0,0.4);
            border-color: var(--accent);
        }
        .card-icon {
            width: 52px;
            height: 52px;
            background: rgba(212, 167, 106, 0.15);
            border-radius: var(--radius-sm);
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 1.6rem;
            color: var(--accent);
            margin-bottom: 16px;
        }
        .card h3 {
            font-size: 1.25rem;
            margin-bottom: 8px;
            color: var(--cream);
        }
        .card p {
            color: var(--cream-muted);
            font-size: 0.95rem;
        }

        /* Grid */
        .grid-2 { display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 24px; }
        .grid-3 { display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: 24px; }
        .grid-4 { display: grid; grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); gap: 24px; }

        /* Menu Item */
        .menu-item {
            background: var(--dark-card);
            border: 1px solid var(--dark-lighter);
            border-radius: var(--radius-md);
            overflow: hidden;
            transition: var(--transition);
        }
        .menu-item:hover {
            transform: translateY(-4px);
            box-shadow: 0 20px 40px rgba(0,0,0,0.4);
        }
        .menu-image {
            height: 160px;
            background: linear-gradient(135deg, rgba(111,78,55,0.6) 0%, rgba(30,24,20,0.9) 100%);
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 3rem;
            color: var(--accent);
        }
        .menu-details {
            padding: 20px;
        }
        .menu-details h3 {
            display: flex;
            justify-content: space-between;
            font-size: 1.1rem;
        }
        .price {
            color: var(--accent);
            font-weight: 700;
        }

        /* Testimonials Carousel */
        .testimonial-container {
            position: relative;
            max-width: 700px;
            margin: 0 auto;
            overflow: hidden;
        }
        .testimonial-track {
            display: flex;
            transition: transform 0.4s ease;
        }
        .testimonial-slide {
            min-width: 100%;
            padding: 0 20px;
            text-align: center;
        }
        .testimonial-slide blockquote {
            font-size: 1.2rem;
            color: var(--cream);
            font-weight: 500;
            margin-bottom: 20px;
            position: relative;
        }
        .testimonial-slide blockquote::before {
            content: "“";
            font-size: 3rem;
            color: var(--accent);
            position: absolute;
            left: -10px;
            top: -10px;
            opacity: 0.7;
        }
        .testimonial-author {
            color: var(--cream-muted);
            font-weight: 600;
        }
        .carousel-dots {
            display: flex;
            justify-content: center;
            gap: 8px;
            margin-top: 24px;
        }
        .carousel-dot {
            width: 10px;
            height: 10px;
            border-radius: 50%;
            background: var(--dark-lighter);
            cursor: pointer;
            transition: 0.3s ease;
        }
        .carousel-dot.active {
            background: var(--accent);
            width: 28px;
            border-radius: 20px;
        }

        /* Contact Form */
        .form-group {
            margin-bottom: 20px;
        }
        .form-group label {
            display: block;
            margin-bottom: 6px;
            font-weight: 500;
            color: var(--cream);
        }
        .form-group input,
        .form-group textarea {
            width: 100%;
            padding: 12px 16px;
            background: var(--dark-light);
            border: 1px solid var(--dark-lighter);
            border-radius: var(--radius-sm);
            color: var(--cream);
            font-family: var(--font-body);
            font-size: 1rem;
            transition: border-color 0.3s;
        }
        .form-group input:focus,
        .form-group textarea:focus {
            border-color: var(--accent);
            outline: none;
        }
        .error-message {
            color: #f87171;
            font-size: 0.85rem;
            margin-top: 4px;
            display: none;
        }
        .form-group.error input,
        .form-group.error textarea {
            border-color: #f87171;
        }
        .form-group.error .error-message {
            display: block;
        }
        .toast {
            position: fixed;
            bottom: 24px;
            right: 24px;
            background: var(--accent);
            color: var(--dark);
            padding: 14px 24px;
            border-radius: var(--radius-md);
            font-weight: 600;
            box-shadow: var(--shadow-lg);
            transform: translateY(120px);
            opacity: 0;
            transition: 0.4s ease;
            z-index: 9999;
        }
        .toast.show {
            transform: translateY(0);
            opacity: 1;
        }

        /* Reveal on scroll */
        .reveal {
            opacity: 0;
            transform: translateY(20px);
            transition: opacity 0.6s ease, transform 0.6s ease;
        }
        .reveal.visible {
            opacity: 1;
            transform: translateY(0);
        }

        @media (max-width: 768px) {
            .nav-links { display: none; }
            .menu-toggle { display: flex; }
            .hero { padding: 120px 24px 60px; }
        }
    </style>
</head>
<body>
    <a href="#main-content" class="skip-link">Skip to content</a>

    <!-- Navigation -->
    <header class="navbar" id="navbar">
        <div class="nav-container">
            <a href="#" class="nav-logo">
                <div class="logo-icon">☕</div>
                Coffee<span style="color:var(--accent)">Cove</span>
            </a>
            <ul class="nav-links">
                <li><a href="#features">Features</a></li>
                <li><a href="#menu">Menu</a></li>
                <li><a href="#about">About</a></li>
                <li><a href="#testimonials">Reviews</a></li>
                <li><a href="#contact">Contact</a></li>
                <li><a href="#contact" class="nav-cta">Order Now</a></li>
            </ul>
            <button class="menu-toggle" id="menuToggle" aria-label="Toggle menu">
                <span></span><span></span><span></span>
            </button>
        </div>
    </header>

    <!-- Mobile Menu -->
    <div class="mobile-menu" id="mobileMenu">
        <a href="#features">Features</a>
        <a href="#menu">Menu</a>
        <a href="#about">About</a>
        <a href="#testimonials">Reviews</a>
        <a href="#contact">Contact</a>
        <a href="#contact" class="mobile-cta">Order Now</a>
    </div>
    <div class="menu-overlay" id="menuOverlay"></div>

    <main id="main-content">
        <!-- Hero -->
        <section class="hero">
            <div class="hero-content">
                <div class="hero-badge">
                    <span class="dot"></span> Now Open in Downtown
                </div>
                <h1>Where Every Sip Feels Like <span>Coming Home</span></h1>
                <p>Handcrafted coffee, warm pastries, and a cozy atmosphere designed for your daily ritual. Slow down, savor the moment, and make yourself at home.</p>
                <div class="hero-buttons">
                    <a href="#menu" class="btn btn-primary">Explore Our Menu</a>
                    <a href="#about" class="btn btn-outline">Our Story</a>
                </div>
            </div>
        </section>

        <!-- Features -->
        <section id="features" class="section">
            <div class="section-header reveal">
                <h2>What Makes Us Special</h2>
                <p>Every detail crafted with care to give you the best coffee experience in town.</p>
            </div>
            <div class="grid-4 reveal" style="transition-delay: 0.1s;">
                <div class="card">
                    <div class="card-icon">🌱</div>
                    <h3>Single-Origin Beans</h3>
                    <p>Ethically sourced from small farms across Ethiopia, Colombia, and Guatemala.</p>
                </div>
                <div class="card">
                    <div class="card-icon">🔥</div>
                    <h3>Roasted In-House</h3>
                    <p>Every batch roasted daily to ensure peak freshness and the richest aroma.</p>
                </div>
                <div class="card">
                    <div class="card-icon">🥐</div>
                    <h3>Fresh Pastries Daily</h3>
                    <p>Buttery croissants and muffins baked fresh every morning by our pastry chefs.</p>
                </div>
                <div class="card">
                    <div class="card-icon">📶</div>
                    <h3>Cozy Workspace</h3>
                    <p>Free high-speed Wi-Fi, ample outlets, and quiet nooks perfect for work or study.</p>
                </div>
            </div>
        </section>

        <!-- Menu -->
        <section id="menu" class="section" style="background: rgba(42, 35, 30, 0.3);">
            <div class="section-header reveal">
                <h2>Our Signature Menu</h2>
                <p>Crafted with passion, served with warmth.</p>
            </div>
            <div class="grid-3 reveal">
                <div class="menu-item">
                    <div class="menu-image">☕</div>
                    <div class="menu-details">
                        <h3>Cove Latte <span class="price">$5.50</span></h3>
                        <p style="color:var(--cream-muted); font-size:0.95rem;">Espresso with steamed milk and our signature vanilla-honey syrup.</p>
                    </div>
                </div>
                <div class="menu-item">
                    <div class="menu-image">🧊</div>
                    <div class="menu-details">
                        <h3>Cold Brew <span class="price">$4.75</span></h3>
                        <p style="color:var(--cream-muted); font-size:0.95rem;">Smooth, slow-steeped for 18 hours, with a hint of chicory.</p>
                    </div>
                </div>
                <div class="menu-item">
                    <div class="menu-image">🍮</div>
                    <div class="menu-details">
                        <h3>Caramel Macchiato <span class="price">$6.00</span></h3>
                        <p style="color:var(--cream-muted); font-size:0.95rem;">Layered vanilla, espresso, and house-made caramel drizzle.</p>
                    </div>
                </div>
                <div class="menu-item">
                    <div class="menu-image">🥐</div>
                    <div class="menu-details">
                        <h3>Butter Croissant <span class="price">$3.95</span></h3>
                        <p style="color:var(--cream-muted); font-size:0.95rem;">Flaky, golden, baked fresh every morning.</p>
                    </div>
                </div>
                <div class="menu-item">
                    <div class="menu-image">🍫</div>
                    <div class="menu-details">
                        <h3>Mocha <span class="price">$5.95</span></h3>
                        <p style="color:var(--cream-muted); font-size:0.95rem;">Rich chocolate meets bold espresso, topped with whipped cream.</p>
                    </div>
                </div>
                <div class="menu-item">
                    <div class="menu-image">🍵</div>
                    <div class="menu-details">
                        <h3>Matcha Latte <span class="price">$5.75</span></h3>
                        <p style="color:var(--cream-muted); font-size:0.95rem;">Ceremonial-grade matcha whisked with steamed milk.</p>
                    </div>
                </div>
            </div>
        </section>

        <!-- About -->
        <section id="about" class="section">
            <div class="grid-2 reveal">
                <div style="display:flex; align-items:center; justify-content:center;">
                    <div style="width:100%; aspect-ratio:1/1; max-width:400px; background:linear-gradient(135deg, var(--primary), var(--dark-card)); border-radius: var(--radius-lg); display:flex; align-items:center; justify-content:center; font-size:5rem;">🏠</div>
                </div>
                <div>
                    <h2 style="font-family:var(--font-heading); font-size:2.2rem; margin-bottom:20px;">Our Story</h2>
                    <p style="color:var(--cream-muted); margin-bottom:16px;">Coffee Cove was born from a simple belief: great coffee brings people together. Founded in 2018, our downtown shop has become a beloved gathering place.</p>
                    <p style="color:var(--cream-muted); margin-bottom:24px;">We source our beans directly from farmers, roast them in-house, and craft every drink with intention. From cozy seating to friendly baristas, every detail is designed to make you feel at home.</p>
                    <div style="display:flex; gap:16px; flex-wrap:wrap;">
                        <span style="display:flex; align-items:center; gap:6px;">✅ Ethically Sourced</span>
                        <span style="display:flex; align-items:center; gap:6px;">✅ Roasted In-House</span>
                        <span style="display:flex; align-items:center; gap:6px;">✅ Community Focused</span>
                    </div>
                </div>
            </div>
        </section>

        <!-- Testimonials -->
        <section id="testimonials" class="section" style="background: rgba(42, 35, 30, 0.3);">
            <div class="section-header reveal">
                <h2>What Our Guests Say</h2>
            </div>
            <div class="testimonial-container reveal">
                <div class="testimonial-track" id="testimonialTrack">
                    <div class="testimonial-slide">
                        <blockquote>"The best latte I've ever had. The atmosphere is so warm and inviting—perfect for catching up with friends."</blockquote>
                        <div class="testimonial-author">— Sarah M.</div>
                    </div>
                    <div class="testimonial-slide">
                        <blockquote>"A true gem in the neighborhood. Their cold brew is smooth and never bitter. My go-to spot."</blockquote>
                        <div class="testimonial-author">— David L.</div>
                    </div>
                    <div class="testimonial-slide">
                        <blockquote>"I love working from here. The Wi-Fi is fast, the coffee is fantastic, and the staff are wonderful."</blockquote>
                        <div class="testimonial-author">— Emily R.</div>
                    </div>
                </div>
                <div class="carousel-dots" id="carouselDots">
                    <span class="carousel-dot active"></span>
                    <span class="carousel-dot"></span>
                    <span class="carousel-dot"></span>
                </div>
            </div>
        </section>

        <!-- Contact -->
        <section id="contact" class="section">
            <div class="section-header reveal">
                <h2>Visit Us or Drop a Message</h2>
                <p>We'd love to hear from you. Come by or reach out!</p>
            </div>
            <div class="grid-2 reveal">
                <div style="color:var(--cream-muted);">
                    <p style="margin-bottom:16px;"><strong style="color:var(--cream);">📍 Address:</strong> 123 Bean Street, Downtown</p>
                    <p style="margin-bottom:16px;"><strong style="color:var(--cream);">📞 Phone:</strong> (555) 234-5678</p>
                    <p style="margin-bottom:16px;"><strong style="color:var(--cream);">🕒 Hours:</strong> Mon-Fri 7am–7pm, Sat-Sun 8am–5pm</p>
                </div>
                <form id="contactForm" novalidate>
                    <div class="form-group">
                        <label for="name">Name</label>
                        <input type="text" id="name" placeholder="Your name" required>
                        <span class="error-message">Please enter your name.</span>
                    </div>
                    <div class="form-group">
                        <label for="email">Email</label>
                        <input type="email" id="email" placeholder="Your email" required>
                        <span class="