import { getDefaultConfig } from '@rainbow-me/rainbowkit'
import { defineChain } from 'viem'

// Define custom chains
export const hanzo = defineChain({
  id: 36963,
  name: 'Hanzo',
  nativeCurrency: { name: 'Hanzo', symbol: 'HANZO', decimals: 18 },
  rpcUrls: {
    default: { http: ['https://rpc.hanzo.ai'] },
  },
  blockExplorers: {
    default: { name: 'Hanzo Explorer', url: 'https://explorer.hanzo.ai' },
  },
})

export const lux = defineChain({
  id: 96369,
  name: 'Lux',
  nativeCurrency: { name: 'Lux', symbol: 'LUX', decimals: 18 },
  rpcUrls: {
    default: { http: ['https://api.lux.network'] },
  },
  blockExplorers: {
    default: { name: 'Lux Explorer', url: 'https://explorer.lux.network' },
  },
})

export const zoo = defineChain({
  id: 200200,
  name: 'Zoo',
  nativeCurrency: { name: 'Zoo', symbol: 'ZOO', decimals: 18 },
  rpcUrls: {
    default: { http: ['https://rpc.zoo.network'] },
  },
  blockExplorers: {
    default: { name: 'Zoo Explorer', url: 'https://explorer.zoo.network' },
  },
})

export const localhost = defineChain({
  id: 31337,
  name: 'Localhost',
  nativeCurrency: { name: 'Ethereum', symbol: 'ETH', decimals: 18 },
  rpcUrls: {
    default: { http: ['http://127.0.0.1:8545'] },
  },
})

export const config = getDefaultConfig({
  appName: 'Hanzo Identity',
  projectId: process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID || 'YOUR_PROJECT_ID',
  chains: [localhost, hanzo, lux, zoo],
  ssr: true,
})
