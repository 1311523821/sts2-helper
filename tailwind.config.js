/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        // 暖色米白背景系统 - 小米风格
        warm: {
          50: '#FFFAF5',
          100: '#FFF5EB',
          150: '#FFF0E0',
          200: '#FFEBD5',
          250: '#FFE5C9',
          300: '#FFE0BD',
          400: '#FFD6A8',
          500: '#FFC78A',
          600: '#F5B572',
        },
        // 主色 - 小米橙
        xm: {
          primary: '#FF6B35',
          'primary-hover': '#E85D2C',
          'primary-active': '#D44A1A',
          secondary: '#F59E0B',
          'secondary-hover': '#D97706',
          light: '#FFF0E6',
          'light-hover': '#FFE0CC',
        },
        // 暗色主题背景
        dark: {
          50: '#1E1E2E',
          100: '#252536',
          200: '#2D2D3F',
          300: '#363649',
          400: '#44445A',
          500: '#52526B',
          600: '#6B6B85',
        },
        // STS主题配色 - 杀戮尖塔风格
        sts: {
          // 背景色
          'bg-primary': '#0D0D1A',
          'bg-secondary': '#141428',
          'bg-card': '#1A1A2E',
          // 文字色
          'text-primary': '#E8E4DC',
          'text-secondary': '#A8A0B4',
          // 强调色 - 金色
          accent: '#C9A227',
          'accent-hover': '#D4B23A',
          'accent-active': '#B8911F',
          // 卡牌类型色
          'card-attack': '#D94437',
          'card-skill': '#2B7DB5',
          'card-power': '#C9A227',
        },
        // STS稀有度色
        'sts-rarity': {
          basic: '#5A5A6E',
          common: '#C8C8C8',
          uncommon: '#2E8B57',
          rare: '#4169E1',
          special: '#9932CC',
        },
        // 暗色主题文字
        'dark-text': {
          primary: '#E8E0D8',
          secondary: '#B8A898',
          muted: '#8A7D72',
        },
        // 暖色文字
        text: {
          primary: '#2D1810',
          secondary: '#7A5D4A',
          muted: '#8B7355',
          'muted-light': '#D4C4B6',
        },
        // 暖色边框
        border: {
          light: '#F0E6DB',
          DEFAULT: '#E8DCCF',
          medium: '#DCCCB8',
        },
        // 稀有度
        rarity: {
          basic: '#B8A08E',
          common: '#7A5D4A',
          uncommon: '#F59E0B',
          rare: '#FF6B35',
          special: '#A855F7',
        },
        // 评分
        score: {
          high: '#E85D2C',
          medium: '#F59E0B',
          low: '#DC2626',
        },
        // 流派
        archetype: {
          strength: '#E85D2C',
          defense: '#0EA5E9',
          poison: '#A855F7',
          draw: '#F59E0B',
        },
      },
      animation: {
        'fade-in': 'fadeIn 0.6s ease-out forwards',
        'fade-in-up': 'fadeInUp 0.6s ease-out forwards',
        'fade-in-down': 'fadeInDown 0.5s ease-out forwards',
        'slide-in-left': 'slideInLeft 0.5s ease-out forwards',
        'slide-in-right': 'slideInRight 0.5s ease-out forwards',
        'scale-in': 'scaleIn 0.4s ease-out forwards',
        'float': 'float 6s ease-in-out infinite',
        'float-delayed': 'float 6s ease-in-out 2s infinite',
        'pulse-glow': 'pulseGlow 2s ease-in-out infinite',
        'shimmer': 'shimmer 2.5s linear infinite',
        'spin-slow': 'spin 3s linear infinite',
        'bounce-subtle': 'bounceSubtle 2s ease-in-out infinite',
        'card-tilt': 'cardTilt 0.3s ease-out forwards',
        'ripple': 'ripple 1.5s ease-out infinite',
        'star-twinkle': 'starTwinkle 2s ease-in-out infinite',
        'particle-drift': 'particleDrift 20s linear infinite',
        'card-enter': 'cardEnter 0.4s cubic-bezier(0.22, 1, 0.36, 1) forwards',
        'card-exit': 'cardExit 0.25s ease-in forwards',
        'stagger-fade-in': 'staggerFadeIn 0.5s ease-out forwards',
        'slide-up-stagger': 'slideUpStagger 0.45s cubic-bezier(0.22, 1, 0.36, 1) forwards',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        fadeInUp: {
          '0%': { opacity: '0', transform: 'translateY(24px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        fadeInDown: {
          '0%': { opacity: '0', transform: 'translateY(-16px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        slideInLeft: {
          '0%': { opacity: '0', transform: 'translateX(-24px)' },
          '100%': { opacity: '1', transform: 'translateX(0)' },
        },
        slideInRight: {
          '0%': { opacity: '0', transform: 'translateX(24px)' },
          '100%': { opacity: '1', transform: 'translateX(0)' },
        },
        scaleIn: {
          '0%': { opacity: '0', transform: 'scale(0.9)' },
          '100%': { opacity: '1', transform: 'scale(1)' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-12px)' },
        },
        pulseGlow: {
          '0%, 100%': { boxShadow: '0 0 20px rgba(255, 107, 53, 0.3)' },
          '50%': { boxShadow: '0 0 40px rgba(255, 107, 53, 0.6)' },
        },
        shimmer: {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
        bounceSubtle: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-6px)' },
        },
        cardTilt: {
          '0%': { transform: 'perspective(800px) rotateY(0) rotateX(0)' },
          '100%': { transform: 'perspective(800px) rotateY(5deg) rotateX(-3deg)' },
        },
        ripple: {
          '0%': { transform: 'scale(1)', opacity: '0.6' },
          '100%': { transform: 'scale(2.5)', opacity: '0' },
        },
        starTwinkle: {
          '0%, 100%': { opacity: '0.3', transform: 'scale(0.8)' },
          '50%': { opacity: '1', transform: 'scale(1.2)' },
        },
        particleDrift: {
          '0%': { transform: 'translateY(100vh) rotate(0deg)', opacity: '0' },
          '10%': { opacity: '1' },
          '90%': { opacity: '1' },
          '100%': { transform: 'translateY(-100vh) rotate(720deg)', opacity: '0' },
        },
        cardEnter: {
          '0%': { opacity: '0', transform: 'perspective(800px) rotateY(-5deg) scale(0.92)' },
          '100%': { opacity: '1', transform: 'perspective(800px) rotateY(0) scale(1)' },
        },
        cardExit: {
          '0%': { opacity: '1', transform: 'scale(1)' },
          '100%': { opacity: '0', transform: 'scale(0.95)' },
        },
        staggerFadeIn: {
          '0%': { opacity: '0', transform: 'translateY(16px)' },
          '60%': { opacity: '0.8' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        slideUpStagger: {
          '0%': { opacity: '0', transform: 'translateY(20px) scale(0.97)' },
          '100%': { opacity: '1', transform: 'translateY(0) scale(1)' },
        },
      },
      perspective: {
        '800': '800px',
        '1000': '1000px',
      },
    },
  },
  plugins: [],
}
