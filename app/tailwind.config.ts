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
        'primary': '#FF6B35',
        'secondary': '#004E89',
        'accent': '#ffffff',
        'hanzo-orange': '#FF6B35',
        'hanzo-blue': '#004E89',
        'hanzo-cyan': '#00D9FF',
      },
    },
  },
  plugins: [],
}
export default config
