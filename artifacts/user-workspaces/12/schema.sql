<!DOCTYPE html>
<html lang="en" class="scroll-smooth">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta name="description" content="Coffee Cove — Handcrafted coffee experiences in a cozy, welcoming space. Discover our artisan brews, fresh pastries, and the perfect atmosphere for your daily ritual.">
    <meta name="theme-color" content="#1E1814">
    <meta property="og:title" content="Coffee Cove — Handcrafted Coffee & Cozy Vibes">
    <meta property="og:description" content="Discover artisan coffee, fresh pastries, and the perfect atmosphere for your daily ritual. Visit Coffee Cove today.">
    <meta property="og:type" content="website">
    <meta name="twitter:card" content="summary_large_image">

    <title>Coffee Cove — Handcrafted Coffee & Cozy Vibes</title>

    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&family=Outfit:wght@400;500;600;700;800&display=swap" rel="stylesheet">

    <script src="https://cdn.tailwindcss.com">
    </script>
    <script>
        tailwind.config = {
            theme: {
                extend: {
                    colors: {
                        primary: '#6F4E37',
                        'primary-light': '#8B6346',
                        'primary-dark': '#4A3325',
                        accent: '#D4A76A',
                        'accent-light': '#E0BF8A',
                        'accent-dark': '#B8894A',
                        dark: '#1E1814',
                        'dark-light': '#2A231E',
                        'dark-lighter': '#352D27',
                        'dark-card': '#231D18',
                        cream: '#F5EDE4',
                        'cream-muted': '#B8AFA5',
                    },
                    fontFamily: {
                        outfit: ['Outfit', 'sans-serif'],
                        inter: ['Inter', 'sans-serif'],
                    },
                    animation: {
                        'float': 'float 6s ease-in-out infinite',
                        'pulse-soft': 'pulseSoft 3s ease-in-out infinite',
                        'fade-in-up': 'fadeInUp 0.7s ease-out forwards',
                        'fade-in': 'fadeIn 0.6s ease-out forwards',
                        'bounce-gentle': 'bounceGentle 2s ease-in-out infinite',
                    },
                    keyframes: {
                        float: {
                            '0%, 100%': { transform: 'translateY(0px)' },
                            '50%': { transform: 'translateY(-14px)' },
                        },
                        pulseSoft: {
                            '0%, 100%': { opacity: '1' },
                            '50%': { opacity: '0.6' },
                        },
                        fadeInUp: {
                            '0%': { opacity: '0', transform: 'translateY(30px)' },
                            '100%': { opacity: '1', transform: 'translateY(0)' },
                        },
                        fadeIn: {
                            '0%': { opacity: '0' },
                            '100%': { opacity: '1' },
                        },
                        bounceGentle: {
                            '0%, 100%': { transform: 'translateY(0)' },
                            '50%': { transform: 'translateY(-8px)' },
                        },
                    },
                },
            },
        };
    </script>
    <script src="https://unpkg.com/lucide@latest">
    </script>

    <style>
        * {
            scroll-behavior: smooth;
        }
        @media (prefers-reduced-motion: reduce) {
            * {
                scroll-behavior: auto !important;
                animation-duration: 0.01ms !important;
                animation-iteration-count: 1 !important;
                transition-duration: 0.01ms !important;
            }
        }

        ::-webkit-scrollbar {
            width: 7px;
        }
        ::-webkit-scrollbar-track {
            background: #1E1814;
        }
        ::-webkit-scrollbar-thumb {
            background: #6F4E37;
            border-radius: 9999px;
        }
        ::-webkit-scrollbar-thumb:hover {
            background: #8B6346;
        }

        .skip-link {
            position: absolute;
            top: -100px;
            left: 20px;
            z-index: 9999;
            padding: 12px 24px;
            background: #D4A76A;
            color: #1E1814;
            font-weight: 700;
            border-radius: 8px;
            font-family: 'Inter', sans-serif;
            transition: top 0.2s ease;
            text-decoration: none;
        }
        .skip-link:focus {
            top: 16px;
            outline: 3px solid #D4A76A;
            outline-offset: 3px;
        }
        *:focus-visible {
            outline: 2.5px solid #D4A76A !important;
            outline-offset: 2px !important;
            border-radius: 4px;
        }

        .reveal {
            opacity: 0;
            transform: translateY(30px);
            transition: opacity 0.7s ease, transform 0.7s ease;
        }
        .reveal.visible {
            opacity: 1;
            transform: translateY(0);
        }
        @media (prefers-reduced-motion: reduce) {
            .reveal {
                opacity: 1;
                transform: none;
                transition: none;
            }
        }

        .mobile-backdrop {
            opacity: 0;
            pointer-events: none;
            transition: opacity 0.3s ease;
        }
        .mobile-backdrop.open {
            opacity: 1;
            pointer-events: auto;
        }
        .mobile-menu-panel {
            transform: translateX(100%);
            transition: transform 0.3s ease-in-out;
        }
        .mobile-menu-panel.open {
            transform: translateX(0);
        }

        .hero-bg {
            background:
                radial-gradient(ellipse 70% 50% at 50% 35%, rgba(212, 167, 106, 0.10) 0%, transparent 65%),
                radial-gradient(ellipse 60% 40% at 25% 75%, rgba(111, 78, 55, 0.18) 0%, transparent 55%),
                radial-gradient(ellipse 50% 35% at 75% 70%, rgba(111, 78, 55, 0.12) 0%, transparent 50%),
                #1E1814;
        }

        .card-hover {
            transition: all 0.35s cubic-bezier(0.4, 0, 0.2, 1);
        }
        .card-hover:hover {
            transform: translateY(-4px);
            box-shadow: 0 20px 50px rgba(0, 0, 0, 0.35), 0 0 0 1px rgba(212, 167, 106, 0.25);
        }

        .testimonial-slide {
            opacity: 0;
            pointer-events: none;
            transition: opacity 0.5s ease, transform 0.5s ease;
            transform: translateX(30px);
            position: absolute;
            inset: 0;
        }
        .testimonial-slide.active {
            opacity: 1;
            pointer-events: auto;
            transform: translateX(0);
            position: relative;
        }

        .carousel-dot {
            transition: all 0.3s ease;
            cursor: pointer;
        }
        .carousel-dot.active {
            background-color: #D4A76A;
            width: 32px;
            border-radius: 999px;
        }

        input:-webkit-autofill {
            -webkit-box-shadow: 0 0 0 30px #2A231E inset !important;
            -webkit-text-fill-color: #F5EDE4 !important;
        }
        input::placeholder {
            color: #9A8E84;
        }

        .toast {
            position: fixed;
            bottom: 32px;
            right: 24px;
            z-index: 9999;
            transform: translateY(120px);
            opacity: 0;
            transition: all 0.4