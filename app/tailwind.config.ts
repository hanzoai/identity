import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
    './node_modules/@hanzo/ui/dist/**/*.{js,mjs}',
  ],
  theme: {
    extend: {
      colors: {
        background: 'hsl(0 0% 3.9%)',
        foreground: 'hsl(0 0% 98%)',
        card: 'hsl(0 0% 3.9%)',
        'card-foreground': 'hsl(0 0% 98%)',
        popover: 'hsl(0 0% 3.9%)',
        'popover-foreground': 'hsl(0 0% 98%)',
        primary: '#FF6B35',
        'primary-foreground': '#ffffff',
        secondary: '#004E89',
        'secondary-foreground': '#ffffff',
        muted: 'hsl(0 0% 14.9%)',
        'muted-foreground': 'hsl(0 0% 63.9%)',
        accent: '#ffffff',
        'accent-foreground': 'hsl(0 0% 9%)',
        destructive: 'hsl(0 62.8% 30.6%)',
        'destructive-foreground': 'hsl(0 0% 98%)',
        border: 'hsl(0 0% 14.9%)',
        input: 'hsl(0 0% 14.9%)',
        ring: '#FF6B35',
      },
      borderRadius: {
        lg: '0.5rem',
        md: '0.375rem',
        sm: '0.125rem',
      },
    },
  },
  plugins: [],
}
export default config
