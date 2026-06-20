<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0, viewport-fit=cover">
  <title>DarkLanding | Modern SaaS Solution</title>
  <style>
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }

    body {
      background-color: #0a0a0f;
      font-family: 'Inter', system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      color: #e0e0e0;
      line-height: 1.6;
      -webkit-font-smoothing: antialiased;
      -moz-osx-font-smoothing: grayscale;
    }

    .container {
      max-width: 1200px;
      margin: 0 auto;
      padding: 0 2rem;
    }

    /* Hero Section */
    .hero {
      min-height: 100vh;
      display: flex;
      align-items: center;
      justify-content: center;
      background: radial-gradient(circle at 20% 30%, #1a1a2e, #0a0a0f);
      padding: 4rem 0;
    }

    .hero-content {
      text-align: center;
      max-width: 800px;
    }

    .hero h1 {
      font-size: clamp(2.5rem, 8vw, 4.5rem);
      font-weight: 800;
      letter-spacing: -0.03em;
      background: linear-gradient(to right, #d8b4fe, #818cf8);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      background-clip: text;
      margin-bottom: 1.5rem;
    }

    .hero p {
      font-size: 1.25rem;
      color: #a0a0b0;
      max-width: 600px;
      margin: 0 auto 2.5rem;
      font-weight: 400;
    }

    .btn {
      display: inline-flex;
      align-items: center;
      gap: 0.5rem;
      background-color: #7c3aed; /* purple-600 */
      color: white;
      font-weight: 600;
      padding: 1rem 2.5rem;
      border-radius: 50px;
      text-decoration: none;
      font-size: 1.1rem;
      transition: all 0.3s ease;
      border: 1px solid rgba(124, 58, 237, 0.5);
      box-shadow: 0 8px 20px rgba(124, 58, 237, 0.3);
      letter-spacing: 0.02em;
    }

    .btn:hover {
      background-color: #6d28d9;
      transform: translateY(-2px);
      box-shadow: 0 12px 28px rgba(124, 58, 237, 0.5);
    }

    .btn::after {
      content: '→';
      font-size: 1.2rem;
      transition: transform 0.2s;
    }

    .btn:hover::after {
      transform: translateX(4px);
    }

    /* Features Section */
    .features {
      padding: 6rem 0;
      background-color: #0a0a0f;
    }

    .section-title {
      text-align: center;
      font-size: 2.3rem;
      font-weight: 700;
      margin-bottom: 3rem;
      color: #ffffff;
    }

    .features-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
      gap: 2rem;
    }

    .feature-card {
      background: rgba(255, 255, 255, 0.03);
      backdrop-filter: blur(10px);
      border: 1px solid rgba(124, 58, 237, 0.2);
      border-radius: 20px;
      padding: 2rem 1.5rem;
      transition: all 0.3s ease;
      text-align: center;
    }

    .feature-card:hover {
      transform: translateY(-8px);
      border-color: rgba(59, 130, 246, 0.5); /* blue-400 accent */
      box-shadow: 0 20px 30px -10px rgba(59, 130, 246, 0.2);
      background: rgba(255, 255, 255, 0.06);
    }

    .feature-icon {
      font-size: 2.5rem;
      margin-bottom: 1.2rem;
      color: #60a5fa; /* blue-400 accent */
    }

    .feature-card h3 {
      font-size: 1.4rem;
      margin-bottom: 0.8rem;
      font-weight: 600;
      color: #f0f0f0;
    }

    .feature-card p {
      color: #b0b0c0;
      font-size: 0.95rem;
    }

    /* CTA Section (standalone block) */
    .cta-section {
      padding: 5rem 0;
      text-align: center;
      background: linear-gradient(180deg, rgba(124, 58, 237, 0.1) 0%, transparent 80%);
    }

    .cta-section h2 {
      font-size: 2.5rem;
      margin-bottom: 1rem;
      font-weight: 700;
    }

    .cta-section p {
      color: #a0a0b0;
      margin-bottom: 2rem;
      font-size: 1.1rem;
    }

    footer {
      text-align: center;
      padding: 2rem;
      color: #606070;
      font-size: 0.85rem;
      border-top: 1px solid rgba(255, 255, 255, 0.05);
      background-color: #0a0a0f;
    }

    @media (max-width: 768px) {
      .container {
        padding: 0 1.5rem;
      }

      .hero h1 {
        font-size: 2.8rem;
      }

      .features-grid {
        grid-template-columns: 1fr;
      }
    }

    /* Accessibility & smooth scroll */
    html {
      scroll-behavior: smooth;
    }
  </style>
</head>
<body>
  <!-- Hero Section -->
  <section class="hero">
    <div class="hero-content container">
      <h1>Build the Future,<br>DarkLanding</h1>
      <p>Powerful, elegant, and developer-friendly tools to launch your next big idea — all with a stunning dark interface.</p>
      <a href="#cta" class="btn">Get Early Access</a>
    </div>
  </section>

  <!-- Features Section -->
  <section class="features" id="features">
    <div class