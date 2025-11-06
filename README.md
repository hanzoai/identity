# Hanzo Identity Registration System

A decentralized identity registration system with smart contracts and UI for Hanzo, Lux, and Zoo blockchain networks.

## 🎯 Features

- **Multi-Network Support**: Register identities on Hanzo, Lux, Zoo, and test networks
- **Configurable Pricing**: Dynamic pricing based on identity name length (1-5+ characters)
- **NFT Binding**: Each identity is bound to a unique NFT
- **Token Staking**: Stake AI tokens to claim and maintain identities
- **Referral System**: 50% discount for referred users
- **Deflationary Token**: 0.1% burn rate on all transfers
- **UUPS Upgradeable**: Proxy pattern for seamless contract upgrades
- **Faucet**: Get AI tokens for testing

## 📁 Project Structure

```
identity-contracts/
├── contracts/
│   └── src/
│       ├── AIToken.sol          # ERC20 token with burn mechanism
│       ├── HanzoRegistry.sol    # Main identity registry (UUPS upgradeable)
│       ├── HanzoNft.sol        # ERC721 NFT for identity binding
│       ├── AIFaucet.sol        # Token faucet for testing
│       └── Proxy.sol           # ERC1967 proxy import
├── public/
│   └── index.html              # Web UI for identity registration
├── tests/
│   └── e2e.spec.js            # Playwright e2e tests
├── test-all.js                 # Contract test suite (35 tests)
├── deploy.js                   # Deployment script
├── server.js                   # Simple HTTP server for UI
├── run-all-tests.sh           # Complete test runner
└── playwright.config.js        # Playwright configuration
```

## 🚀 Quick Start

### Prerequisites

- Node.js v20+
- Foundry (forge, anvil)
- MetaMask or Web3 wallet

### Installation

```bash
npm install
npx playwright install chromium
```

### Run All Tests

```bash
./run-all-tests.sh
```

This will:
1. Start Anvil local blockchain
2. Deploy all contracts
3. Run 35 contract tests
4. Start web server
5. Run 11 e2e tests

### Development

```bash
# Start Anvil
anvil --port 8545 --chain-id 31337

# Deploy contracts
npm run deploy

# Run contract tests only
npm test

# Run e2e tests only
npm run test:e2e

# Start UI server
npm run serve
# Visit http://localhost:3000
```

## 📋 Test Coverage

### Contract Tests (35/35 ✅)

**Test Suite 1: Contract Deployment** (3/3)
- ✅ AIToken deployment
- ✅ HanzoRegistry deployment
- ✅ AIFaucet deployment

**Test Suite 2: Token Configuration** (4/4)
- ✅ Token name and symbol
- ✅ Initial balances
- ✅ Faucet allocation

**Test Suite 3: Pricing Configuration** (6/6)
- ✅ 1 char price: 100,000 AI
- ✅ 2 char price: 10,000 AI
- ✅ 3 char price: 1,000 AI
- ✅ 4 char price: 100 AI
- ✅ 5+ char price: 10 AI
- ✅ 50% referrer discount

**Test Suite 4: Stake Requirement Calculation** (6/6)
- ✅ All character length calculations
- ✅ Namespace validation

**Test Suite 5: Referrer Discount** (2/2)
- ✅ Discount application across lengths

**Test Suite 6: Token Approval Flow** (2/2)
- ✅ Token approval
- ✅ Allowance verification

**Test Suite 7: Identity Registration** (4/4)
- ✅ Stake calculation
- ✅ Registration transaction
- ✅ Token transfer
- ✅ NFT minting

**Test Suite 8: Faucet Functionality** (3/3)
- ✅ Drip amount configuration
- ✅ Cooldown period
- ✅ Token distribution

**Test Suite 9: Namespace Configuration** (4/4)
- ✅ Localhost (31337)
- ✅ Hanzo mainnet (36963)
- ✅ Lux mainnet (96369)
- ✅ Zoo mainnet (200200)

### E2E Tests (11/11 ✅)

**Functional Tests** (9/9)
- ✅ Page loads correctly
- ✅ Form elements present
- ✅ Price calculation updates
- ✅ Name validation
- ✅ Button states
- ✅ Styling and layout
- ✅ Responsive design
- ✅ Accessibility features
- ✅ External dependencies

**Visual Regression Tests** (2/2)
- ✅ Homepage snapshot
- ✅ Form with input snapshot

## 🔧 Smart Contracts

### HanzoRegistry (UUPS Proxy)

Main identity registry contract with:
- Multi-namespace support
- Configurable pricing tiers
- NFT binding
- Token staking
- Referral system

**Key Functions:**
```solidity
function claimIdentity(ClaimIdentityParams) external
function identityStakeRequirement(string, uint256, bool) view returns (uint256)
function unclaimIdentity(string) external
```

### AIToken (ERC20)

Deflationary token with:
- 0.1% burn rate on transfers
- ERC20Votes for governance
- ERC20Permit for gasless approvals
- Pausable functionality

### HanzoNft (ERC721)

Identity-bound NFTs:
- Minter role for registry
- Simple ownership tracking
- Burnable tokens

### AIFaucet

Test token distribution:
- 100 AI per drip
- 24-hour cooldown
- Daily limits

## 🌐 Supported Networks

| Network | Chain ID | Namespace ID | Status |
|---------|----------|--------------|--------|
| Localhost | 31337 | 31337 | ✅ Active |
| Hanzo Mainnet | 36963 | 36963 | ✅ Active |
| Lux Mainnet | 96369 | 96369 | ✅ Active |
| Zoo Mainnet | 200200 | 200200 | ✅ Active |
| Sepolia | 11155111 | 11155111 | ✅ Active |
| Arbitrum Sepolia | 421614 | 421614 | ✅ Active |

## 💰 Pricing

| Name Length | Base Price | With Referral (50% off) |
|-------------|------------|-------------------------|
| 1 character | 100,000 AI | 50,000 AI |
| 2 characters | 10,000 AI | 5,000 AI |
| 3 characters | 1,000 AI | 500 AI |
| 4 characters | 100 AI | 50 AI |
| 5+ characters | 10 AI | 5 AI |

**Note**: All transfers include a 0.1% burn fee.

## 🎨 UI Features

- Connect Web3 wallet (MetaMask)
- Real-time balance display
- Dynamic price calculation
- Network selection
- Responsive design (mobile-friendly)
- Beautiful gradient UI

## 📦 Deployed Addresses (Localhost)

```json
{
  "chainId": 31337,
  "aiToken": "0x5FbDB2315678afecb367f032d93F642f64180aa3",
  "hanzoNft": "0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512",
  "registryProxy": "0xCf7Ed3AccA5a467e9e704C703E8D87F634fB0Fc9",
  "registryImpl": "0x9fE46736679d2D9a65F0992F2272dE9f3c7fa6e0",
  "faucet": "0xDc64a140Aa3E981100a9becA4E685f962f0cF6C9"
}
```

## 🔐 Security

- UUPS upgradeable proxy pattern
- Ownable2Step for secure ownership transfer
- Pausable contracts
- Custom errors for gas efficiency
- Reentrancy protection
- Input validation

## 🧪 Testing

```bash
# Run only contract tests
npm test

# Run only e2e tests
npm run test:e2e

# Run e2e tests with UI
npm run test:e2e:ui

# Run all tests
./run-all-tests.sh

# Update visual regression snapshots
npx playwright test --update-snapshots
```

## 📝 License

MIT

## 🤝 Contributing

Contributions welcome! Please ensure all tests pass before submitting PRs.

## 🔗 Links

- [Hanzo AI](https://hanzo.ai)
- [Lux Network](https://lux.network)
- [Zoo Network](https://zoo.network)

---

**Test Status**: ✅ All 46 tests passing (35 contract + 11 e2e)
