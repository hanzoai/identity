export const CONTRACTS = {
  31337: { // Localhost
    aiToken: '0x5FbDB2315678afecb367f032d93F642f64180aa3' as `0x${string}`,
    hanzoNft: '0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512' as `0x${string}`,
    registryProxy: '0xCf7Ed3AccA5a467e9e704C703E8D87F634fB0Fc9' as `0x${string}`,
    faucet: '0xDc64a140Aa3E981100a9becA4E685f962f0cF6C9' as `0x${string}`,
  },
  36963: { // Hanzo
    aiToken: '0x0000000000000000000000000000000000000000' as `0x${string}`,
    hanzoNft: '0x0000000000000000000000000000000000000000' as `0x${string}`,
    registryProxy: '0x0000000000000000000000000000000000000000' as `0x${string}`,
    faucet: '0x0000000000000000000000000000000000000000' as `0x${string}`,
  },
  96369: { // Lux
    aiToken: '0x0000000000000000000000000000000000000000' as `0x${string}`,
    hanzoNft: '0x0000000000000000000000000000000000000000' as `0x${string}`,
    registryProxy: '0x0000000000000000000000000000000000000000' as `0x${string}`,
    faucet: '0x0000000000000000000000000000000000000000' as `0x${string}`,
  },
  200200: { // Zoo
    aiToken: '0x0000000000000000000000000000000000000000' as `0x${string}`,
    hanzoNft: '0x0000000000000000000000000000000000000000' as `0x${string}`,
    registryProxy: '0x0000000000000000000000000000000000000000' as `0x${string}`,
    faucet: '0x0000000000000000000000000000000000000000' as `0x${string}`,
  },
} as const

export const REGISTRY_ABI = [
  'function claimIdentity((string name, uint256 namespace, uint256 stakeAmount, address owner, string referrer)) external',
  'function identityStakeRequirement(string name, uint256 namespace, bool hasReferrer) external view returns (uint256)',
  'function identities(string) external view returns (address owner, uint256 namespace, uint256 nftId, uint256 stakeAmount)',
  'function unclaimIdentity(string name) external',
  'event IdentityClaimed(string indexed name, uint256 indexed namespace, address indexed owner, uint256 nftId, uint256 stakeAmount)',
] as const

export const TOKEN_ABI = [
  'function balanceOf(address owner) external view returns (uint256)',
  'function approve(address spender, uint256 amount) external returns (bool)',
  'function allowance(address owner, address spender) external view returns (uint256)',
  'function transfer(address to, uint256 amount) external returns (bool)',
  'function decimals() external view returns (uint8)',
  'function symbol() external view returns (string)',
  'function name() external view returns (string)',
] as const

export const NFT_ABI = [
  'function ownerOf(uint256 tokenId) external view returns (address)',
  'function tokenURI(uint256 tokenId) external view returns (string)',
  'function balanceOf(address owner) external view returns (uint256)',
] as const

export const FAUCET_ABI = [
  'function drip() external',
  'function dripAmount() external view returns (uint256)',
  'function lastDrip(address) external view returns (uint256)',
  'function cooldownPeriod() external view returns (uint256)',
] as const

// Pricing tiers
export const PRICING = {
  1: 100000n * 10n ** 18n, // 100,000 AI
  2: 10000n * 10n ** 18n,  // 10,000 AI
  3: 1000n * 10n ** 18n,   // 1,000 AI
  4: 100n * 10n ** 18n,    // 100 AI
  5: 10n * 10n ** 18n,     // 10 AI (5+ chars)
} as const

export const REFERRER_DISCOUNT = 0.5 // 50% discount

export function getPriceForLength(length: number): bigint {
  if (length === 1) return PRICING[1]
  if (length === 2) return PRICING[2]
  if (length === 3) return PRICING[3]
  if (length === 4) return PRICING[4]
  return PRICING[5]
}

export function getPriceWithReferral(length: number, hasReferrer: boolean): bigint {
  const basePrice = getPriceForLength(length)
  if (hasReferrer) {
    return basePrice / 2n
  }
  return basePrice
}
