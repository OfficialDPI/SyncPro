<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0, viewport-fit=cover" />
  <meta name="description" content="Handcrafted coffee, artisan pastries, and the perfect morning atmosphere. Visit our café today." />
  <title>Brew & Bean | Artisan Coffee House</title>
  <!-- Modern CSS Reset + Base Styles -->
  <style>
    *,
    *::before,
    *::after {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }

    :root {
      /* Coffee palette */
      --espresso: #2C1A14;
      --roasted: #4A3625;
      --mocha: #6b4c3a;
      --latte: #c8a27a;
      --cream: #f5f0eb;
      --foam: #fff9f5;
      --gold: #c28b5e;
      --dark-roast: #1e110a;
      --text-dark: #2c1810;
      --text-medium: #5c4a3d;
      --text-light: #8c7a6b;

      --radius-sm: 6px;
      --radius-md: 12px;
      --radius-lg: 24px;
      --shadow-soft: 0 4px 14px rgba(44, 26, 20, 0.08);
      --shadow-medium: 0 8px 24px rgba(44, 26, 20, 0.12);
      --transition: 0.3s ease;
    }

    body {
      font-family: 'Inter', system-ui, -apple-system, sans-serif;
      background-color: var(--foam);
      color: var(--text-dark);
      line-height: 1.6;
      scroll-behavior: smooth;
    }

    img {
      max-width: 100%;
      display: block;
    }

    a {
      color: inherit;
      text-decoration: none;
    }

    /* Layout */
    .container {
      max-width: 1200px;
      margin: 0 auto;
      padding: 0 1.5rem;
    }

    /* Header & Navigation */
    .site-header {
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      background: rgba(255, 249, 245, 0.9);
      backdrop-filter: blur(10px);
      box-shadow: 0 1px 0 rgba(44, 26, 20, 0.05);
      z-index: 100;
      padding: 0.8rem 0;
      transition: padding var(--transition);
    }

    .header-inner {
      display: flex;
      align-items: center;
      justify-content: space-between;
    }

    .logo {
      font-size: 1.8rem;
      font-weight: 700;
      color: var(--espresso);
      letter-spacing: -0.5px;
      display: flex;
      align-items: center;
      gap: 0.5rem;
    }

    .logo-icon {
      width: 36px;
      height: 36px;
      background: var(--roasted);
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      color: var(--cream);
      font-size: 1.2rem;
    }

    .main-nav ul {
      display: flex;
      gap: 2rem;
      list-style: none;
      font-weight: 500;
    }

    .main-nav a {
      color: var(--text-dark);
      position: relative;
      padding-bottom: 4px;
      transition: color var(--transition);
    }

    .main-nav a::after {
      content: '';
      position: absolute;
      bottom: 0;
      left: 0;
      width: 0;
      height: 2px;
      background: var(--gold);
      transition: width var(--transition);
    }

    .main-nav a:hover {
      color: var(--mocha);
    }

    .main-nav a:hover::after {
      width: 100%;
    }

    /* Hero */
    .hero {
      min-height: 100vh;
      display: flex;
      align-items: center;
      background: linear-gradient(135deg, rgba(44,26,20,0.75) 0%, rgba(75,54,41,0.65) 100%),
                  url('https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?ixlib=rb-1.2.1&auto=format&fit=crop&w=1950&q=80') center/cover no-repeat;
      color: var(--foam);
      padding-top: 80px;
      position: relative;
    }

    .hero-content {
      max-width: 600px;
      padding: 2rem 0 4rem;
    }

    .hero h1 {
      font-size: clamp(2.8rem, 6vw, 4.2rem);
      font-weight: 700;
      line-height: 1.15;
      margin-bottom: 1.5rem;
      letter-spacing: -1px;
    }

    .hero p {
      font-size: 1.2rem;
      margin-bottom: 2.5rem;
      opacity: 0.9;
      font-weight: 300;
      max-width: 450px;
    }

    .btn {
      display: inline-block;
      background-color: var(--gold);
      color: var(--dark-roast);
      font-weight: 600;
      padding: 0.9rem 2.2rem;
      border-radius: 50px;
      transition: all var(--transition);
      border: none;
      cursor: pointer;
      font-size: 1rem;
      letter-spacing: 0.3px;
      box-shadow: 0 4px 12px rgba(194, 139, 94, 0.4);
    }

    .btn:hover {
      background-color: #b07d4f;
      transform: translateY(-2px);
      box-shadow: 0 8px 20px rgba(194, 139, 94, 0.55);
    }

    /* Sections */
    section {
      padding: 5rem 0;
    }

    .section-title {
      font-size: 2.4rem;
      font-weight: 700;
      color: var(--espresso);
      text-align: center;
      margin-bottom: 0.8rem;
    }

    .section-subtitle {
      text-align: center;
      color: var