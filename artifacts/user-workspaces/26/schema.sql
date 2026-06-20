<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>DarkLanding — Modern Dark Theme</title>
    <style>
        :root {
            --bg-primary: #0f172a;
            --bg-secondary: #1e293b;
            --bg-card: #1a2332;
            --bg-elevated: #243044;
            --text-primary: #f1f5f9;
            --text-secondary: #94a3b8;
            --text-muted: #64748b;
            --accent: #3b82f6;
            --accent-hover: #2563eb;
            --accent-glow: rgba(59, 130, 246, 0.35);
            --primary: #8b5cf6;
            --primary-hover: #7c3aed;
            --primary-glow: rgba(139, 92, 246, 0.4);
            --gradient-hero: linear-gradient(135deg, #0f172a 0%, #1a1b3a 40%, #0f172a 100%);
            --gradient-cta: linear-gradient(135deg, #8b5cf6 0%, #3b82f6 100%);
            --gradient-card-border: linear-gradient(180deg, rgba(139, 92, 246, 0.3) 0%, rgba(59, 130, 246, 0.1) 100%);
            --border-subtle: rgba(255, 255, 255, 0.06);
            --border-card: rgba(255, 255, 255, 0.08);
            --shadow-lg: 0 25px 60px rgba(0, 0, 0, 0.5);
            --shadow-card: 0 4px 24px rgba(0, 0, 0, 0.3);
            --radius-sm: 8px;
            --radius-md: 12px;
            --radius-lg: 20px;
            --radius-xl: 28px;
            --font-sans: 'Inter', 'Segoe UI', system-ui, -apple-system, sans-serif;
            --font-mono: 'JetBrains Mono', 'Fira Code', 'Cascadia Code', monospace;
            --transition-fast: 0.2s cubic-bezier(0.4, 0, 0.2, 1);
            --transition-smooth: 0.35s cubic-bezier(0.4, 0, 0.2, 1);
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
            font-size: 16px;
        }

        body {
            font-family: var(--font-sans);
            background-color: var(--bg-primary);
            color: var(--text-primary);
            line-height: 1.6;
            min-height: 100vh;
            -webkit-font-smoothing: antialiased;
            -moz-osx-font-smoothing: grayscale;
            overflow-x: hidden;
        }

        /* ── Background ambient effects ── */
        body::before {
            content: '';
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            pointer-events: none;
            z-index: 0;
            background:
                radial-gradient(ellipse at 20% 20%, rgba(139, 92, 246, 0.08) 0%, transparent 55%),
                radial-gradient(ellipse at 80% 60%, rgba(59, 130, 246, 0.06) 0%, transparent 55%),
                radial-gradient(ellipse at 50% 100%, rgba(139, 92, 246, 0.04) 0%, transparent 50%);
        }

        /* ── Container ── */
        .container {
            max-width: 1200px;
            margin: 0 auto;
            padding: 0 2rem;
            position: relative;
            z-index: 1;
        }

        /* ── Navigation ── */
        .navbar {
            display: flex;
            align-items: center;
            justify-content: space-between;
            padding: 1.25rem 0;
            position: relative;
            z-index: 10;
        }

        .logo {
            display: flex;
            align-items: center;
            gap: 0.6rem;
            font-weight: 700;
            font-size: 1.35rem;
            letter-spacing: -0.02em;
            color: var(--text-primary);
            text-decoration: none;
            transition: opacity var(--transition-fast);
        }

        .logo:hover {
            opacity: 0.85;
        }

        .logo-icon {
            width: 38px;
            height: 38px;
            border-radius: var(--radius-sm);
            background: var(--gradient-cta);
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 1.1rem;
            color: #fff;
            box-shadow: 0 0 20px var(--primary-glow);
        }

        .nav-links {
            display: flex;
            gap: 2rem;
            align-items: center;
            list-style: none;
        }

        .nav-links a {
            color: var(--text-secondary);
            text-decoration: none;
            font-weight: 500;
            font-size: 0.95rem;
            transition: color var(--transition-fast);
            position: relative;
        }

        .nav-links a::after {
            content: '';
            position: absolute;
            bottom: -4px;
            left: 0;
            width: 0;
            height: 2px;
            background: var(--primary);
            border-radius: 2px;
            transition: width var(--transition-smooth);
        }

        .nav-links a:hover {
            color: var(--text-primary);
        }

        .nav-links a:hover::after {
            width: 100%;
        }

        .btn-nav {
            background: var(--bg-elevated);
            border: 1px solid var(--border-card);
            color: var(--text-primary);
            padding: 0.55rem 1.3rem;
            border-radius: 50px;
            font-weight: 600;
            font-size: 0.9rem;
            cursor: pointer;
            transition: all var(--transition-fast);
            text-decoration: none;
        }

        .btn-nav:hover {
            background: var(--bg-card);
            border-color: rgba(255, 255, 255, 0.2);
            box-shadow: 0 0 20px rgba(139, 92, 246, 0.2);
        }

        /* ── Hero Section ── */
        .hero {
            padding: 5rem 0 4rem;
            text-align: center;
            position: relative;
        }

        .hero-badge {
            display: inline-flex;
            align-items: center;
            gap: 0.5rem;
            background: rgba(139, 92, 246, 0.1);
            border: 1px solid rgba(139, 92, 246, 0.25);
            border-radius: 50px;
            padding: 0.45rem 1.1rem;
            font-size: 0.85rem;
            font-weight: 500;
            color: #c4b5fd;
            margin-bottom: 1.75rem;
            letter-spacing: 0.01em;
            animation: fadeInUp 0.7s ease-out;
        }

        .hero-badge .dot {
            width: 8px;
            height: 8px;
            border-radius: 50%;
            background: #8b5cf6;
            box-shadow: 0 0 10px var(--primary-glow);
            animation: pulse-dot 2s infinite;
        }

        @keyframes pulse-dot {
            0%,
            100% {
                box