# Hanzo Identity dApp

Modern Next.js application for registering and managing decentralized identities on Hanzo, Lux, and Zoo blockchain networks.

## 🚀 Quick Start

```bash
# Install dependencies
pnpm install

# Set up environment variables
cp .env.example .env.local
# Add your WalletConnect Project ID

# Run development server
pnpm dev

# Visit http://localhost:3000
```

## 📁 Project Structure

```
app/
├── src/
│   ├── app/              # Next.js 14 App Router
│   │   ├── page.tsx      # Home page
│   │   ├── register/     # Register identity
│   │   ├── identities/   # Browse identities
│   │   └── profile/      # Individual profiles
│   ├── components/       # Reusable components
│   │   └── header.tsx    # Navigation header
│   └── lib/              # Utilities and configs
│       ├── wagmi.ts      # Wagmi configuration
│       └── contracts.ts  # Contract ABIs and addresses
├── public/               # Static assets
└── package.json          # Dependencies
```

## 🎨 Features

- **@hanzo/ui Components**: Beautiful, branded UI components
- **Wagmi + Viem**: Type-safe Web3 integration
- **RainbowKit**: Wallet connection with custom theming
- **TypeScript**: Full type safety
- **Tailwind CSS**: Utility-first styling with Hanzo colors
- **Next.js 14**: App Router with server components

## 🛠 Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Styling**: Tailwind CSS + @hanzo/ui
- **Web3**: Wagmi v2 + Viem v2
- **Wallets**: RainbowKit
- **Language**: TypeScript
- **Package Manager**: pnpm

## 🌐 Supported Networks

- **Localhost** (31337) - For local development
- **Hanzo** (36963) - Hanzo mainnet
- **Lux** (96369) - Lux mainnet
- **Zoo** (200200) - Zoo mainnet

## 📝 Development

```bash
# Development server
pnpm dev

# Type checking
pnpm type-check

# Linting
pnpm lint

# Production build
pnpm build

# Start production server
pnpm start
```

## 🔗 Related

- [Smart Contracts](../contracts/) - Solidity contracts
- [Tests](../tests/) - E2E tests with Playwright
- [Scripts](../scripts/) - Deployment scripts

## 📄 License

MIT
