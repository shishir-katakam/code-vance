import type { Config } from "tailwindcss";

export default {
	darkMode: ["class"],
	content: [
		"./pages/**/*.{ts,tsx}",
		"./components/**/*.{ts,tsx}",
		"./app/**/*.{ts,tsx}",
		"./src/**/*.{ts,tsx}",
	],
	prefix: "",
	theme: {
		container: {
			center: true,
			padding: '2rem',
			screens: {
				'2xl': '1400px'
			}
		},
		extend: {
			colors: {
				border: 'hsl(var(--border))',
				input: 'hsl(var(--input))',
				ring: 'hsl(var(--ring))',
				background: 'hsl(var(--background))',
				foreground: 'hsl(var(--foreground))',
				primary: {
					DEFAULT: 'hsl(var(--primary))',
					foreground: 'hsl(var(--primary-foreground))'
				},
				secondary: {
					DEFAULT: 'hsl(var(--secondary))',
					foreground: 'hsl(var(--secondary-foreground))'
				},
				destructive: {
					DEFAULT: 'hsl(var(--destructive))',
					foreground: 'hsl(var(--destructive-foreground))'
				},
				muted: {
					DEFAULT: 'hsl(var(--muted))',
					foreground: 'hsl(var(--muted-foreground))'
				},
				accent: {
					DEFAULT: 'hsl(var(--accent))',
					foreground: 'hsl(var(--accent-foreground))'
				},
				popover: {
					DEFAULT: 'hsl(var(--popover))',
					foreground: 'hsl(var(--popover-foreground))'
				},
				card: {
					DEFAULT: 'hsl(var(--card))',
					foreground: 'hsl(var(--card-foreground))'
				},
				sidebar: {
					DEFAULT: 'hsl(var(--sidebar-background))',
					foreground: 'hsl(var(--sidebar-foreground))',
					primary: 'hsl(var(--sidebar-primary))',
					'primary-foreground': 'hsl(var(--sidebar-primary-foreground))',
					accent: 'hsl(var(--sidebar-accent))',
					'accent-foreground': 'hsl(var(--sidebar-accent-foreground))',
					border: 'hsl(var(--sidebar-border))',
					ring: 'hsl(var(--sidebar-ring))'
				}
			},
			borderRadius: {
				lg: 'var(--radius)',
				md: 'calc(var(--radius) - 2px)',
				sm: 'calc(var(--radius) - 4px)'
			},
			keyframes: {
				'accordion-down': {
					from: {
						height: '0'
					},
					to: {
						height: 'var(--radix-accordion-content-height)'
					}
				},
				'accordion-up': {
					from: {
						height: 'var(--radix-accordion-content-height)'
					},
					to: {
						height: '0'
					}
				},
				'fade-in': {
					'0%': {
						opacity: '0',
						transform: 'translateY(20px) scale(0.95)'
					},
					'100%': {
						opacity: '1',
						transform: 'translateY(0) scale(1)'
					}
				},
				'slide-up': {
					'0%': {
						opacity: '0',
						transform: 'translateY(30px)'
					},
					'100%': {
						opacity: '1',
						transform: 'translateY(0)'
					}
				},
				'float': {
					'0%, 100%': {
						transform: 'translateY(0px) rotate(0deg)'
					},
					'50%': {
						transform: 'translateY(-10px) rotate(2deg)'
					}
				},
				'glow': {
					'0%, 100%': {
						boxShadow: '0 0 20px rgba(168, 85, 247, 0.4)'
					},
					'50%': {
						boxShadow: '0 0 40px rgba(168, 85, 247, 0.6)'
					}
				},
				'shimmer': {
					'0%': {
						backgroundPosition: '-200% center'
					},
					'100%': {
						backgroundPosition: '200% center'
					}
				},
				'liquid-float': {
					'0%, 100%': {
						transform: 'translateY(0px) translateX(0px) rotate(0deg) scale(1)'
					},
					'25%': {
						transform: 'translateY(-8px) translateX(2px) rotate(1deg) scale(1.02)'
					},
					'50%': {
						transform: 'translateY(-12px) translateX(-1px) rotate(-1deg) scale(1.05)'
					},
					'75%': {
						transform: 'translateY(-6px) translateX(1px) rotate(0.5deg) scale(1.03)'
					}
				},
				'liquid-pulse': {
					'0%, 100%': {
						transform: 'scale(1)',
						filter: 'blur(0px)'
					},
					'50%': {
						transform: 'scale(1.1)',
						filter: 'blur(1px)'
					}
				},
				'liquid-wave': {
					'0%': {
						transform: 'translateX(-100%) skewX(0deg)'
					},
					'50%': {
						transform: 'translateX(0%) skewX(-5deg)'
					},
					'100%': {
						transform: 'translateX(100%) skewX(0deg)'
					}
				},
				'smooth-bounce': {
					'0%, 100%': {
						transform: 'translateY(0) scale(1)'
					},
					'50%': {
						transform: 'translateY(-10px) scale(1.05)'
					}
				}
			},
			animation: {
				'accordion-down': 'accordion-down 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
				'accordion-up': 'accordion-up 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
				'fade-in': 'fade-in 0.8s cubic-bezier(0.16, 1, 0.3, 1) forwards',
				'slide-up': 'slide-up 0.6s cubic-bezier(0.16, 1, 0.3, 1)',
				'float': 'float 6s cubic-bezier(0.4, 0, 0.6, 1) infinite',
				'glow': 'glow 3s cubic-bezier(0.4, 0, 0.6, 1) infinite alternate',
				'shimmer': 'shimmer 2.5s cubic-bezier(0.4, 0, 0.6, 1) infinite',
				'pulse': 'pulse 2.5s cubic-bezier(0.4, 0, 0.6, 1) infinite',
				'liquid-float': 'liquid-float 8s cubic-bezier(0.23, 1, 0.32, 1) infinite',
				'liquid-pulse': 'liquid-pulse 4s cubic-bezier(0.23, 1, 0.32, 1) infinite',
				'liquid-wave': 'liquid-wave 3s cubic-bezier(0.23, 1, 0.32, 1) infinite',
				'smooth-bounce': 'smooth-bounce 2s cubic-bezier(0.23, 1, 0.32, 1) infinite'
			},
			transitionTimingFunction: {
				'smooth': 'cubic-bezier(0.4, 0, 0.2, 1)',
				'bounce-smooth': 'cubic-bezier(0.68, -0.55, 0.265, 1.55)',
				'elastic': 'cubic-bezier(0.175, 0.885, 0.32, 1.275)',
				'liquid': 'cubic-bezier(0.23, 1, 0.32, 1)',
				'silk': 'cubic-bezier(0.25, 0.46, 0.45, 0.94)',
				'butter': 'cubic-bezier(0.165, 0.84, 0.44, 1)'
			},
			transitionDuration: {
				'2000': '2000ms',
				'3000': '3000ms',
				'4000': '4000ms'
			}
		}
	},
	plugins: [require("tailwindcss-animate")],
} satisfies Config;
