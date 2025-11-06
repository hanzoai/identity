'use client'

import Link from 'next/link'
import { ConnectButton } from '@rainbow-me/rainbowkit'
import { usePathname } from 'next/navigation'

export function Header() {
  const pathname = usePathname()

  const links = [
    { href: '/', label: 'Home' },
    { href: '/register', label: 'Register' },
    { href: '/identities', label: 'Identities' },
  ]

  return (
    <header className="border-b border-border bg-card">
      <div className="container mx-auto px-4">
        <nav className="flex items-center justify-between h-16">
          <Link href="/" className="flex items-center gap-2 text-xl font-bold">
            <svg className="w-8 h-8" viewBox="0 0 24 24" fill="none">
              <path
                d="M12 2L2 7L12 12L22 7L12 2Z"
                fill="currentColor"
                className="text-primary"
              />
              <path
                d="M2 17L12 22L22 17"
                stroke="currentColor"
                className="text-primary"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <path
                d="M2 12L12 17L22 12"
                stroke="currentColor"
                className="text-primary"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
            <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
              Hanzo Identity
            </span>
          </Link>

          <div className="flex items-center gap-6">
            <div className="hidden md:flex items-center gap-4">
              {links.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`text-sm font-medium transition-colors hover:text-primary ${
                    pathname === link.href ? 'text-primary' : 'text-muted-foreground'
                  }`}
                >
                  {link.label}
                </Link>
              ))}
            </div>
            <ConnectButton />
          </div>
        </nav>
      </div>
    </header>
  )
}
