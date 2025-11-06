import Link from 'next/link'
import { Button } from '@/components/ui/button'

export default function HomePage() {
  return (
    <div className="container mx-auto px-4 py-12">
      {/* Hero Section */}
      <div className="max-w-4xl mx-auto text-center mb-16">
        <h1 className="text-5xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-primary via-accent to-secondary bg-clip-text text-transparent">
          Decentralized Identity Registry
        </h1>
        <p className="text-xl text-muted-foreground mb-8">
          Secure your identity on the Hanzo blockchain network with NFT-backed registration
        </p>
        <div className="flex gap-4 justify-center">
          <Link href="/register">
            <Button size="lg" className="text-lg">
              Register Identity
            </Button>
          </Link>
          <Link href="/identities">
            <Button size="lg" variant="outline" className="text-lg">
              Browse Identities
            </Button>
          </Link>
        </div>
      </div>

      {/* Features Grid */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto mb-16">
        <FeatureCard
          icon="🌐"
          title="Multi-Network"
          description="Register identities on Hanzo network and test environments"
        />
        <FeatureCard
          icon="🎨"
          title="NFT Binding"
          description="Each identity is bound to a unique NFT for true ownership"
        />
        <FeatureCard
          icon="💰"
          title="Dynamic Pricing"
          description="Pricing tiers from 10 to 100,000 AI based on name length"
        />
        <FeatureCard
          icon="🔥"
          title="Token Staking"
          description="Stake AI tokens to claim and maintain your identity"
        />
        <FeatureCard
          icon="🎁"
          title="Referral Bonus"
          description="Get 50% discount with a referral code"
        />
        <FeatureCard
          icon="🔐"
          title="Upgradeable"
          description="UUPS proxy pattern for seamless contract upgrades"
        />
      </div>

      {/* Pricing Table */}
      <div className="max-w-4xl mx-auto">
        <h2 className="text-3xl font-bold text-center mb-8">Pricing Tiers</h2>
        <div className="bg-card border border-border rounded-lg overflow-hidden">
          <table className="w-full">
            <thead className="bg-muted">
              <tr>
                <th className="px-6 py-4 text-left">Name Length</th>
                <th className="px-6 py-4 text-right">Base Price</th>
                <th className="px-6 py-4 text-right">With Referral</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              <PricingRow length="1 character" base="100,000 AI" referral="50,000 AI" />
              <PricingRow length="2 characters" base="10,000 AI" referral="5,000 AI" />
              <PricingRow length="3 characters" base="1,000 AI" referral="500 AI" />
              <PricingRow length="4 characters" base="100 AI" referral="50 AI" />
              <PricingRow length="5+ characters" base="10 AI" referral="5 AI" />
            </tbody>
          </table>
        </div>
        <p className="text-sm text-muted-foreground text-center mt-4">
          * All transfers include a 0.1% burn fee
        </p>
      </div>
    </div>
  )
}

function FeatureCard({
  icon,
  title,
  description,
}: {
  icon: string
  title: string
  description: string
}) {
  return (
    <div className="bg-card border border-border rounded-lg p-6 hover:border-primary transition-colors">
      <div className="text-4xl mb-4">{icon}</div>
      <h3 className="text-xl font-semibold mb-2">{title}</h3>
      <p className="text-muted-foreground">{description}</p>
    </div>
  )
}

function PricingRow({
  length,
  base,
  referral,
}: {
  length: string
  base: string
  referral: string
}) {
  return (
    <tr className="hover:bg-muted/50 transition-colors">
      <td className="px-6 py-4 font-medium">{length}</td>
      <td className="px-6 py-4 text-right">{base}</td>
      <td className="px-6 py-4 text-right text-accent">{referral}</td>
    </tr>
  )
}
