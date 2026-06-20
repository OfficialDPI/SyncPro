<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Brew & Bloom Coffee - Where Coffee Blossoms</title>
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link
        href="https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;500;600;700&family=Inter:wght@300;400;500;600;700&display=swap"
        rel="stylesheet"
   >
    <style>
        :root {
            --primary: #6f4e37;
            --primary-light: #8b6b4f;
            --primary-dark: #4a3325;
            --accent: #d4a574;
            --accent-light: #f0d5b8;
            --bg: #fdfbf7;
            --bg-warm: #f9f3ea;
            --text: #3d2e24;
            --text-light: #6b5d53;
            --white: #ffffff;
            --border: #e8d9ca;
            --shadow-sm: 0 1px 3px rgba(74, 51, 37, 0.08);
            --shadow-md: 0 4px 16px rgba(74, 51, 37, 0.1);
            --shadow-lg: 0 12px 40px rgba(74, 51, 37, 0.12);
            --radius-sm: 8px;
            --radius-md: 12px;
            --radius-lg: 20px;
            --radius-xl: 28px;
            --transition: 0.3s cubic-bezier(0.4, 0, 0.2, 1);
            --font-heading: 'Playfair Display', Georgia, serif;
            --font-body: 'Inter', system-ui, -apple-system, sans-serif;
        }

        *,
        *::before,
        *::after {
            box-sizing: border-box;
            margin: 0;
            padding: 0;
        }

        html {
            scroll-behavior: smooth;
            scroll-padding-top: 80px;
        }

        body {
            font-family: var(--font-body);
            background-color: var(--bg);
            color: var(--text);
            line-height: 1.7;
            -webkit-font-smoothing: antialiased;
            -moz-osx-font-smoothing: grayscale;
            overflow-x: hidden;
        }

        /* ---- NAVIGATION ---- */
        .navbar {
            position: fixed;
            top: 0;
            left: 0;
            right: 0;
            z-index: 1000;
            background: rgba(253, 251, 247, 0.85);
            backdrop-filter: blur(20px);
            -webkit-backdrop-filter: blur(20px);
            border-bottom: 1px solid var(--border);
            transition: var(--transition);
        }
        .navbar.scrolled {
            box-shadow: var(--shadow-md);
        }
        .nav-container {
            max-width: 1200px;
            margin: 0 auto;
            padding: 0 24px;
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
            color: var(--primary);
            font-family: var(--font-heading);
            font-size: 1.5rem;
            font-weight: 700;
            letter-spacing: -0.02em;
            transition: var(--transition);
        }
        .nav-logo:hover {
            color: var(--primary-dark);
        }
        .nav-logo-icon {
            width: 38px;
            height: 38px;
            background: var(--primary);
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            color: var(--white);
            font-size: 1.2rem;
        }
        .nav-links {
            display: flex;
            align-items: center;
            gap: 32px;
            list-style: none;
        }
        .nav-links a {
            text-decoration: none;
            color: var(--text);
            font-weight: 500;
            font-size: 0.95rem;
            position: relative;
            transition: var(--transition);
            padding: 4px 0;
        }
        .nav-links a::after {
            content: '';
            position: absolute;
            bottom: -2px;
            left: 0;
            width: 0;
            height: 2px;
            background: var(--accent);
            transition: width var(--transition);
            border-radius: 1px;
        }
        .nav-links a:hover,
        .nav-links a.active {
            color: var(--primary);
        }
        .nav-links a:hover::after,
        .nav-links a.active::after {
            width: 100%;
        }
        .nav-cta {
            background: var(--primary);
            color: var(--white) !important;
            padding: 10px 22px !important;
            border-radius: 50px;
            font-weight: 600;
            transition: var(--transition);
            text-decoration: none;
            font-size: 0.9rem;
            white-space: nowrap;
        }
        .nav-cta:hover {
            background: var(--primary-dark);
            transform: translateY(-1px);
            box-shadow: var(--shadow-md);
        }
        .nav-cta::after {
            display: none !important;
        }
        .hamburger {
            display: none;
            flex-direction: column;
            gap: 5px;
            cursor: pointer;
            background: none;
            border: none;
            padding: 8px;
            z-index: 1001;
        }
        .hamburger span {
            display: block;
            width: 26px;
            height: 2.5px;
            background: var(--text);
            border-radius: 2px;
            transition: var(--transition);
        }
        .hamburger.active span:nth-child(1) {
            transform: rotate(45deg) translate(5px, 5px);
        }
        .hamburger.active span:nth-child(2) {
            opacity: 0;
        }
        .hamburger.active span:nth-child(3) {
            transform: rotate(-45deg) translate(5px, -5px);
        }

        /* ---- HERO ---- */
        .hero {
            min-height: 100vh;
            display: flex;
            align-items: center;
            padding: 120px 24px 80px;
            background: linear-gradient(165deg,
                    var(--bg-warm) 0%,
                    var(--bg) 40%,
                    #fdf5ec 100%);
            position: relative;
            overflow: hidden;
        }
        .hero::before {
            content: '';
            position: absolute;
            top: -200px;
            right: -150px;
            width: 600px;
            height: 600px;
            background: radial-gradient(circle, rgba(212, 165, 116, 0.12) 0%, transparent 70%);
            border-radius: 50%;
            pointer-events: none;
        }
        .hero::after {
            content: '';
            position: absolute;
            bottom: -100px;
            left: -100px;
            width: 400px;
            height: 400px;
            background: radial-gradient(circle, rgba(111, 78, 55, 0.06) 0%, transparent 70%);
            border-radius: 50%;
            pointer-events: none;
        }
        .hero-container {
            max-width: 1200px;
            margin: 0 auto;
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 60px;
            align-items: center;
            width: 100%;
            position: relative;
            z-index: 1;
        }
        .hero-content {
            display: flex;
            flex-direction: column;
            gap: 24px;
        }
        .hero-badge {
            display: inline-flex;
            align-items: center;
            gap: