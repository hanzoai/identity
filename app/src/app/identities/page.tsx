'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePublicClient, useChainId } from 'wagmi'
import { Button } from '@hanzo/ui'
import { CONTRACTS, REGISTRY_ABI } from '@/lib/contracts'
import { ClientOnly } from '@/components/client-only'

const ITEMS_PER_PAGE = 10

interface Identity {
  name: string
  owner: string
  network: string
  timestamp: string
  nftId: string
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

function IdentitiesContent() {
  const [identities, setIdentities] = useState<Identity[]>([])
  const [loading, setLoading] = useState(true)
  const publicClient = usePublicClient()
  const chainId = useChainId()

  useEffect(() => {
    async function fetchIdentities() {
      if (!publicClient) return

      setLoading(true)
      try {
        const contracts = CONTRACTS[chainId as keyof typeof CONTRACTS]
        if (!contracts) {
          setIdentities([])
          setLoading(false)
          return
        }

        // Fetch IdentityClaimed events
        const events = await publicClient.getContractEvents({
          address: contracts.registryProxy,
          abi: REGISTRY_ABI,
          eventName: 'IdentityClaimed',
          fromBlock: 0n,
        })

        // Parse events into identities
        const parsedIdentities: Identity[] = await Promise.all(
          events.map(async (event) => {
            const { name, namespace, owner, nftId } = event.args as {
              name: string
              namespace: bigint
              owner: string
              nftId: bigint
            }

            // Get block timestamp
            const block = await publicClient.getBlock({ blockNumber: event.blockNumber })
            const timestamp = new Date(Number(block.timestamp) * 1000).toISOString().split('T')[0]

            // Get network name from namespace/chainId
            const network = getNetworkName(Number(namespace))

            return {
              name,
              owner: `${owner.slice(0, 6)}...${owner.slice(-4)}`,
              network,
              timestamp,
              nftId: nftId.toString(),
            }
          })
        )

        // Sort by newest first
        parsedIdentities.sort((a, b) => b.timestamp.localeCompare(a.timestamp))
        setIdentities(parsedIdentities)
      } catch (error) {
        console.error('Error fetching identities:', error)
        setIdentities([])
      } finally {
        setLoading(false)
      }
    }

    fetchIdentities()
  }, [publicClient, chainId])

  const [page, setPage] = useState(0)
  const [search, setSearch] = useState('')
  const [networkFilter, setNetworkFilter] = useState<string>('all')

  const filteredIdentities = identities.filter((identity) => {
    const matchesSearch = identity.name.toLowerCase().includes(search.toLowerCase())
    const matchesNetwork = networkFilter === 'all' || identity.network === networkFilter
    return matchesSearch && matchesNetwork
  })

  const totalPages = Math.ceil(filteredIdentities.length / ITEMS_PER_PAGE)
  const displayedIdentities = filteredIdentities.slice(
    page * ITEMS_PER_PAGE,
    (page + 1) * ITEMS_PER_PAGE
  )

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold mb-8 text-center">Registered Identities</h1>

        {/* Search and Filter */}
        <div className="mb-8 space-y-4">
          <div className="flex gap-4">
            <input
              type="text"
              value={search}
              onChange={(e) => {
                setSearch(e.target.value)
                setPage(0)
              }}
              placeholder="Search identities..."
              className="flex-1 px-4 py-2 bg-card border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
            />
            <select
              value={networkFilter}
              onChange={(e) => {
                setNetworkFilter(e.target.value)
                setPage(0)
              }}
              className="px-4 py-2 bg-card border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
            >
              <option value="all">All Networks</option>
              <option value="Hanzo">Hanzo</option>
              <option value="Lux">Lux</option>
              <option value="Zoo">Zoo</option>
              <option value="Localhost">Localhost</option>
            </select>
          </div>

          <div className="text-sm text-muted-foreground">
            Showing {displayedIdentities.length} of {filteredIdentities.length} identities
          </div>
        </div>

        {/* Identities List */}
        <div className="space-y-4 mb-8">
          {loading ? (
            <div className="text-center py-12 bg-card border border-border rounded-lg">
              <div className="animate-pulse">
                <div className="h-4 bg-muted rounded w-32 mx-auto mb-2" />
                <div className="h-3 bg-muted rounded w-24 mx-auto" />
              </div>
            </div>
          ) : displayedIdentities.length === 0 ? (
            <div className="text-center py-12 bg-card border border-border rounded-lg">
              <p className="text-muted-foreground">No identities found</p>
            </div>
          ) : (
            displayedIdentities.map((identity) => (
              <Link
                key={identity.name}
                href={`/profile?name=${identity.name}`}
                className="block bg-card border border-border rounded-lg p-6 hover:border-primary transition-colors"
              >
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <h3 className="text-xl font-semibold mb-2">{identity.name}</h3>
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <span className="font-mono">{identity.owner}</span>
                      <span className="text-primary">•</span>
                      <span>{identity.timestamp}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-medium ${
                        identity.network === 'Hanzo'
                          ? 'bg-primary/10 text-primary'
                          : identity.network === 'Lux'
                          ? 'bg-secondary/10 text-secondary'
                          : 'bg-accent/10 text-accent'
                      }`}
                    >
                      {identity.network}
                    </span>
                    <svg
                      className="w-5 h-5 text-muted-foreground"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 5l7 7-7 7"
                      />
                    </svg>
                  </div>
                </div>
              </Link>
            ))
          )}
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex justify-center gap-2">
            <Button
              onClick={() => setPage(Math.max(0, page - 1))}
              disabled={page === 0}
              variant="outline"
            >
              Previous
            </Button>
            <div className="flex items-center gap-2 px-4">
              <span className="text-sm text-muted-foreground">
                Page {page + 1} of {totalPages}
              </span>
            </div>
            <Button
              onClick={() => setPage(Math.min(totalPages - 1, page + 1))}
              disabled={page === totalPages - 1}
              variant="outline"
            >
              Next
            </Button>
          </div>
        )}
      </div>
    </div>
  )
}

export default function IdentitiesPage() {
  return (
    <ClientOnly>
      <IdentitiesContent />
    </ClientOnly>
  )
}
