'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Button } from '@hanzo/ui'

// Mock data - in production this would come from blockchain events or indexer
const MOCK_IDENTITIES = [
  { name: 'alice', owner: '0x1234...5678', network: 'Hanzo', timestamp: '2024-01-15' },
  { name: 'bob', owner: '0x2345...6789', network: 'Lux', timestamp: '2024-01-14' },
  { name: 'charlie', owner: '0x3456...7890', network: 'Zoo', timestamp: '2024-01-13' },
  { name: 'david', owner: '0x4567...8901', network: 'Hanzo', timestamp: '2024-01-12' },
  { name: 'eve', owner: '0x5678...9012', network: 'Lux', timestamp: '2024-01-11' },
  { name: 'frank', owner: '0x6789...0123', network: 'Zoo', timestamp: '2024-01-10' },
]

const ITEMS_PER_PAGE = 10

export default function IdentitiesPage() {
  const [page, setPage] = useState(0)
  const [search, setSearch] = useState('')
  const [networkFilter, setNetworkFilter] = useState<string>('all')

  const filteredIdentities = MOCK_IDENTITIES.filter((identity) => {
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
            </select>
          </div>

          <div className="text-sm text-muted-foreground">
            Showing {displayedIdentities.length} of {filteredIdentities.length} identities
          </div>
        </div>

        {/* Identities List */}
        <div className="space-y-4 mb-8">
          {displayedIdentities.length === 0 ? (
            <div className="text-center py-12 bg-card border border-border rounded-lg">
              <p className="text-muted-foreground">No identities found</p>
            </div>
          ) : (
            displayedIdentities.map((identity) => (
              <Link
                key={identity.name}
                href={`/profile/${identity.name}`}
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
