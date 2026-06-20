<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Nexus — Modern SaaS Platform</title>
    <style>
        /* ============ CSS RESET & ROOT ============ */
        *,
        *::before,
        *::after {
            box-sizing: border-box;
            margin: 0;
            padding: 0;
        }

        :root {
            --bg-primary: #0d0d12;
            --bg-secondary: #15151c;
            --bg-card: #191922;
            --bg-card-hover: #1e1e2a;
            --text-primary: #f1f1f3;
            --text-secondary: #a0a0b0;
            --text-muted: #6b6b7d;
            --accent: #7c3aed;
            --accent-hover: #8b5cf6;
            --accent-glow: rgba(124, 58, 237, 0.35);
            --accent-subtle: rgba(124, 58, 237, 0.08);
            --border: #23232e;
            --border-light: #2a2a38;
            --radius-sm: 8px;
            --radius-md: 14px;
            --radius-lg: 20px;
            --radius-xl: 24px;
            --shadow-card: 0 1px 2px rgba(0, 0, 0, 0.4), 0 4px 16px rgba(0, 0, 0, 0.25);
            --shadow-card-hover: 0 2px 4px rgba(0, 0, 0, 0.5), 0 8px 32px rgba(0, 0, 0, 0.35);
            --shadow-button: 0 0 20px rgba(124, 58, 237, 0.3), 0 4px 12px rgba(0, 0, 0, 0.4);
            --transition-fast: 0.2s cubic-bezier(0.4, 0, 0.2, 1);
            --transition-smooth: 0.35s cubic-bezier(0.4, 0, 0.2, 1);
            --font-sans: 'Inter', 'Segoe UI', system-ui, -apple-system, sans-serif;
            --max-width: 1200px;
        }

        html {
            scroll-behavior: smooth;
            -webkit-font-smoothing: antialiased;
            -moz-osx-font-smoothing: grayscale;
        }

        body {
            font-family: var(--font-sans);
            background-color: var(--bg-primary);
            color: var(--text-primary);
            line-height: 1.6;
            min-height: 100vh;
            display: flex;
            flex-direction: column;
        }

        /* ============ CONTAINER ============ */
        .container {
            width: 100%;
            max-width: var(--max-width);
            margin: 0 auto;
            padding: 0 clamp(1.5rem, 5vw, 2.5rem);
        }

        /* ============ NAVIGATION ============ */
        .nav {
            position: sticky;
            top: 0;
            z-index: 100;
            background: rgba(13, 13, 18, 0.78);
            backdrop-filter: blur(18px);
            -webkit-backdrop-filter: blur(18px);
            border-bottom: 1px solid var(--border);
            transition: var(--transition-fast);
        }

        .nav-inner {
            display: flex;
            align-items: center;
            justify-content: space-between;
            height: 64px;
        }

        .nav-logo {
            font-weight: 700;
            font-size: 1.35rem;
            letter-spacing: -0.02em;
            color: var(--text-primary);
            text-decoration: none;
            display: flex;
            align-items: center;
            gap: 0.5rem;
            transition: opacity var(--transition-fast);
        }

        .nav-logo:hover {
            opacity: 0.85;
        }

        .nav-logo .logo-dot {
            width: 10px;
            height: 10px;
            border-radius: 50%;
            background: var(--accent);
            box-shadow: 0 0 14px var(--accent-glow);
            display: inline-block;
        }

        .nav-cta {
            display: inline-flex;
            align-items: center;
            gap: 0.4rem;
            padding: 0.55rem 1.3rem;
            background: var(--accent);
            color: #fff;
            font-weight: 600;
            font-size: 0.9rem;
            border-radius: 999px;
            text-decoration: none;
            letter-spacing: -0.01em;
            transition: all var(--transition-fast);
            border: none;
            cursor: pointer;
            white-space: nowrap;
            box-shadow: 0 0 12px rgba(124, 58, 237, 0.2);
        }

        .nav-cta:hover {
            background: var(--accent-hover);
            box-shadow: 0 0 22px rgba(124, 58, 237, 0.4);
            transform: translateY(-1px);
        }

        /* ============ HERO SECTION ============ */
        .hero {
            padding: clamp(4rem, 10vw, 7rem) 0 clamp(3rem, 8vw, 5rem);
            text-align: center;
            position: relative;
            overflow: hidden;
        }

        .hero::before {
            content: '';
            position: absolute;
            top: -30%;
            left: 50%;
            transform: translateX(-50%);
            width: 700px;
            height: 700px;
            background: radial-gradient(circle at center, rgba(124, 58, 237, 0.13) 0%, transparent 70%);
            border-radius: 50%;
            pointer-events: none;
            z-index: 0;
        }

        .hero-content {
            position: relative;
            z-index: 1;
            max-width: 780px;
            margin: 0 auto;
        }

        .hero-badge {
            display: inline-flex;
            align-items: center;
            gap: 0.45rem;
            padding: 0.4rem 1rem;
            background: var(--accent-subtle);
            border: 1px solid rgba(124, 58, 237, 0.2);
            border-radius: 999px;
            font-size: 0.85rem;
            font-weight: 500;
            color: #c4b5fd;
            margin-bottom: 1.8rem;
            letter-spacing: -0.01em;
        }

        .hero-badge .badge-dot {
            width: 7px;
            height: 7px;
            border-radius: 50%;
            background: #a78bfa;
            box-shadow: 0 0 8px rgba(167, 139, 250, 0.6);
            animation: pulse-dot 2s infinite;
        }

        @keyframes pulse-dot {
            0%,
            100% {
                opacity: 1;
                transform: scale(1);
            }
            50% {
                opacity: 0.5;
                transform: scale(1.6);
            }
        }

        .hero h1 {
            font-size: clamp(2.5rem, 7vw, 4rem);
            font-weight: 800;
            letter-spacing: -0.03em;
            line-height: 1.08;
            margin-bottom: 1.4rem;
            color: var(--text-primary);
        }

        .hero h1 .highlight {
            background: linear-gradient(135deg, #a78bfa 0%, #7c3aed 40%, #6d28d9 100%);
            -webkit-background-clip: text;
            background-clip: text;
            -webkit-text-fill-color: transparent;
        }

        .hero-subtitle {
            font-size: clamp(1.05rem, 2.5vw, 1.2rem);
            color: var(--text-secondary);
            max