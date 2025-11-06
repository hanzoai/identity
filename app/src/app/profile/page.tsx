'use client'

import { useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { useChainId, useReadContract } from 'wagmi'
import { formatUnits } from 'viem'
import { Button } from '@hanzo/ui'
import { CONTRACTS, REGISTRY_ABI } from '@/lib/contracts'
import { ClientOnly } from '@/components/client-only'

function ProfileContent() {
  const searchParams = useSearchParams()
  const name = searchParams.get('name') || ''
  const chainId = useChainId()
  const contracts = CONTRACTS[chainId as keyof typeof CONTRACTS]

  // Read identity data
  const { data: identity, isLoading } = useReadContract({
    address: contracts?.registryProxy,
    abi: REGISTRY_ABI,
    functionName: 'identities',
    args: [name],
    query: { enabled: !!contracts && !!name },
  }) as { data: readonly [string, bigint, bigint, bigint] | undefined; isLoading: boolean }

  if (!name) {
    return (
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-2xl mx-auto text-center">
          <h1 className="text-3xl font-bold mb-4">No Identity Specified</h1>
          <p className="text-muted-foreground mb-6">
            Please provide an identity name in the URL.
          </p>
          <Link href="/identities">
            <Button>Browse Identities</Button>
          </Link>
        </div>
      </div>
    )
  }

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-2xl mx-auto text-center">
          <div className="animate-pulse">
            <div className="h-8 bg-muted rounded w-48 mx-auto mb-4" />
            <div className="h-4 bg-muted rounded w-64 mx-auto" />
          </div>
        </div>
      </div>
    )
  }

  if (!identity || identity[0] === '0x0000000000000000000000000000000000000000') {
    return (
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-2xl mx-auto text-center">
          <h1 className="text-3xl font-bold mb-4">Identity Not Found</h1>
          <p className="text-muted-foreground mb-6">
            The identity &quot;{name}&quot; does not exist on this network.
          </p>
          <Link href="/identities">
            <Button>Browse Identities</Button>
          </Link>
        </div>
      </div>
    )
  }

  const [owner, namespace, nftId, stakeAmount] = identity

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="max-w-2xl mx-auto">
        <Link
          href="/identities"
          className="inline-flex items-center text-sm text-muted-foreground hover:text-primary mb-6"
        >
          <svg className="w-4 h-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Back to Identities
        </Link>

        <div className="bg-card border border-border rounded-lg p-8 mb-6">
          {/* Identity Header */}
          <div className="text-center mb-8">
            <div className="w-24 h-24 mx-auto mb-4 bg-gradient-to-br from-primary via-accent to-secondary rounded-full flex items-center justify-center">
              <span className="text-4xl font-bold text-white">
                {name.charAt(0).toUpperCase()}
              </span>
            </div>
            <h1 className="text-4xl font-bold mb-2">{name}</h1>
            <p className="text-muted-foreground">Decentralized Identity</p>
          </div>

          {/* Identity Details */}
          <div className="space-y-4">
            <DetailRow label="Owner Address" value={owner} mono />
            <DetailRow label="Network" value={getNetworkName(Number(namespace))} />
            <DetailRow label="Namespace ID" value={namespace.toString()} />
            <DetailRow label="NFT Token ID" value={nftId.toString()} />
            <DetailRow
              label="Staked Amount"
              value={`${formatUnits(stakeAmount, 18)} AI`}
              mono
            />
          </div>
        </div>

        {/* Info Cards */}
        <div className="grid md:grid-cols-2 gap-4">
          <div className="bg-card border border-border rounded-lg p-6">
            <h3 className="font-semibold mb-2">🎨 NFT Binding</h3>
            <p className="text-sm text-muted-foreground">
              This identity is bound to NFT #{nftId.toString()} and represents true ownership
              on the blockchain.
            </p>
          </div>
          <div className="bg-card border border-border rounded-lg p-6">
            <h3 className="font-semibold mb-2">🔒 Token Staking</h3>
            <p className="text-sm text-muted-foreground">
              {formatUnits(stakeAmount, 18)} AI tokens are staked to maintain this identity.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

function DetailRow({
  label,
  value,
  mono = false,
}: {
  label: string
  value: string
  mono?: boolean
}) {
  return (
    <div className="flex justify-between items-center py-3 border-b border-border last:border-0">
      <span className="text-muted-foreground">{label}:</span>
      <span className={`font-medium ${mono ? 'font-mono text-sm' : ''}`}>{value}</span>
    </div>
  )
}

function getNetworkName(chainId: number): string {
  switch (chainId) {
    case 31337:
      return 'Localhost'
    case 36963:
      return 'Hanzo'
    case 96369:
      return 'Lux'
    case 200200:
      return 'Zoo'
    default:
      return 'Unknown'
  }
}

export default function ProfilePage() {
  return (
    <ClientOnly>
      <ProfileContent />
    </ClientOnly>
  )
}
