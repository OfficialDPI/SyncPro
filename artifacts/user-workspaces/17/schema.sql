<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>DarkLanding — Modern SaaS Platform</title>
    <style>
        :root {
            --bg: #0d0d12;
            --bg-secondary: #13131a;
            --bg-card: #16161f;
            --bg-card-hover: #1c1c26;
            --primary: #9333ea;
            --primary-hover: #a855f7;
            --primary-glow: rgba(147, 51, 234, 0.35);
            --accent: #22d3ee;
            --accent-glow: rgba(34, 211, 238, 0.25);
            --text: #e4e4e7;
            --text-secondary: #a1a1aa;
            --text-muted: #71717a;
            --border: #27272a;
            --border-light: #3f3f46;
            --radius-sm: 8px;
            --radius-md: 12px;
            --radius-lg: 20px;
            --radius-xl: 28px;
            --shadow-card: 0 1px 2px rgba(0, 0, 0, 0.4), 0 4px 24px rgba(0, 0, 0, 0.3);
            --shadow-glow: 0 0 40px var(--primary-glow);
            --transition: 0.25s cubic-bezier(0.4, 0, 0.2, 1);
            --font-sans: 'Inter', system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
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
            -webkit-font-smoothing: antialiased;
            -moz-osx-font-smoothing: grayscale;
        }

        body {
            font-family: var(--font-sans);
            background-color: var(--bg);
            color: var(--text);
            line-height: 1.6;
            min-height: 100vh;
            overflow-x: hidden;
        }

        /* ── Background ambient glow ── */
        body::before {
            content: '';
            position: fixed;
            inset: 0;
            pointer-events: none;
            z-index: 0;
            background:
                radial-gradient(ellipse 80% 60% at 50% -20%, rgba(147, 51, 234, 0.08) 0%, transparent 60%),
                radial-gradient(ellipse 50% 40% at 80% 70%, rgba(34, 211, 238, 0.04) 0%, transparent 55%),
                radial-gradient(ellipse 40% 50% at 20% 50%, rgba(147, 51, 234, 0.05) 0%, transparent 50%);
        }

        /* ── Container ── */
        .container {
            width: 100%;
            max-width: 1200px;
            margin: 0 auto;
            padding: 0 24px;
            position: relative;
            z-index: 1;
        }

        /* ── Navigation ── */
        .nav {
            position: sticky;
            top: 0;
            z-index: 100;
            backdrop-filter: blur(18px);
            -webkit-backdrop-filter: blur(18px);
            background: rgba(13, 13, 18, 0.75);
            border-bottom: 1px solid var(--border);
            transition: var(--transition);
        }

        .nav-inner {
            display: flex;
            align-items: center;
            justify-content: space-between;
            height: 64px;
        }

        .logo {
            display: flex;
            align-items: center;
            gap: 10px;
            font-weight: 700;
            font-size: 1.35rem;
            letter-spacing: -0.02em;
            color: var(--text);
            text-decoration: none;
            transition: var(--transition);
        }

        .logo-icon {
            width: 36px;
            height: 36px;
            border-radius: var(--radius-sm);
            background: linear-gradient(135deg, var(--primary), #7c3aed);
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 1.1rem;
            box-shadow: 0 0 20px var(--primary-glow);
        }

        .nav-links {
            display: flex;
            align-items: center;
            gap: 32px;
            list-style: none;
        }

        .nav-links a {
            color: var(--text-secondary);
            text-decoration: none;
            font-size: 0.925rem;
            font-weight: 500;
            transition: var(--transition);
            position: relative;
        }

        .nav-links a:hover {
            color: var(--text);
        }

        .nav-links a::after {
            content: '';
            position: absolute;
            bottom: -4px;
            left: 0;
            width: 0;
            height: 2px;
            background: var(--accent);
            border-radius: 2px;
            transition: var(--transition);
        }

        .nav-links a:hover::after {
            width: 100%;
        }

        .btn-nav {
            display: inline-flex;
            align-items: center;
            gap: 6px;
            padding: 9px 20px;
            border-radius: var(--radius-sm);
            font-weight: 600;
            font-size: 0.875rem;
            text-decoration: none;
            transition: var(--transition);
            cursor: pointer;
            border: 1px solid var(--border-light);
            background: transparent;
            color: var(--text);
            white-space: nowrap;
        }
        .btn-nav-primary {
            background: var(--primary);
            border-color: var(--primary);
            color: #fff;
            box-shadow: 0 0 20px var(--primary-glow);
        }
        .btn-nav-primary:hover {
            background: var(--primary-hover);
            border-color: var(--primary-hover);
            box-shadow: 0 0 30px var(--primary-glow);
            transform: translateY(-1px);
        }

        /* ── Hero ── */
        .hero {
            padding: 100px 0 80px;
            text-align: center;
            position: relative;
            z-index: 1;
        }

        .hero-badge {
            display: inline-flex;
            align-items: center;
            gap: 8px;
            background: rgba(147, 51, 234, 0.1);
            border: 1px solid rgba(147, 51, 234, 0.3);
            border-radius: 9999px;
            padding: 6px 18px;
            font-size: 0.8rem;
            font-weight: 600;
            color: #c084fc;
            letter-spacing: 0.03em;
            margin-bottom: 28px;
            animation: fadeInUp 0.7s ease-out;
        }
        .hero-badge-dot {
            width: 7px;
            height: 7px;
            border-radius: 50%;
            background: var(--accent);
            box-shadow: 0 0 8px var(--accent-glow);
            animation: pulse-dot 2s infinite;
        }