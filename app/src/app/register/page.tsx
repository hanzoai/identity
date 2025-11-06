'use client'

import { useState, useEffect } from 'react'
import { useAccount, useChainId, useReadContract, useWriteContract, useWaitForTransactionReceipt } from 'wagmi'
import { formatUnits, parseUnits } from 'viem'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { CONTRACTS, REGISTRY_ABI, TOKEN_ABI, getPriceWithReferral } from '@/lib/contracts'

export default function RegisterPage() {
  const { address, isConnected } = useAccount()
  const chainId = useChainId()

  const [name, setName] = useState('')
  const [referrer, setReferrer] = useState('')
  const [price, setPrice] = useState(0n)
  const [status, setStatus] = useState('')
  const [step, setStep] = useState<'input' | 'approve' | 'register' | 'success'>('input')

  const contracts = CONTRACTS[chainId as keyof typeof CONTRACTS]

  // Read token balance
  const { data: balance } = useReadContract({
    address: contracts?.aiToken,
    abi: TOKEN_ABI,
    functionName: 'balanceOf',
    args: address ? [address] : undefined,
    query: { enabled: !!address && !!contracts },
  }) as { data: bigint | undefined }

  // Read allowance
  const { data: allowance } = useReadContract({
    address: contracts?.aiToken,
    abi: TOKEN_ABI,
    functionName: 'allowance',
    args: address && contracts ? [address, contracts.registryProxy] : undefined,
    query: { enabled: !!address && !!contracts },
  }) as { data: bigint | undefined }

  // Approve tokens
  const { writeContract: approve, data: approveHash } = useWriteContract()
  const { isLoading: isApproving } = useWaitForTransactionReceipt({ hash: approveHash })

  // Register identity
  const { writeContract: register, data: registerHash } = useWriteContract()
  const { isLoading: isRegistering } = useWaitForTransactionReceipt({ hash: registerHash })

  // Update price when name or referrer changes
  useEffect(() => {
    if (name) {
      const calculatedPrice = getPriceWithReferral(name.length, !!referrer)
      setPrice(calculatedPrice)
    } else {
      setPrice(0n)
    }
  }, [name, referrer])

  const handleApprove = async () => {
    if (!contracts || !price) return

    try {
      setStatus('Approving tokens...')
      setStep('approve')
      await approve({
        address: contracts.aiToken,
        abi: TOKEN_ABI,
        functionName: 'approve',
        args: [contracts.registryProxy, price],
      })
      setStatus('Tokens approved! You can now register.')
      setStep('register')
    } catch (error: any) {
      setStatus(`Approval failed: ${error.message}`)
      setStep('input')
    }
  }

  const handleRegister = async () => {
    if (!contracts || !address || !name || !price) return

    try {
      setStatus('Registering identity...')
      await register({
        address: contracts.registryProxy,
        abi: REGISTRY_ABI,
        functionName: 'claimIdentity',
        args: [{
          name,
          namespace: BigInt(chainId),
          stakeAmount: price,
          owner: address,
          referrer: referrer || '',
        }],
      })
      setStatus('Identity registered successfully!')
      setStep('success')
      setName('')
      setReferrer('')
    } catch (error: any) {
      setStatus(`Registration failed: ${error.message}`)
      setStep('input')
    }
  }

  if (!isConnected) {
    return (
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-md mx-auto text-center">
          <h1 className="text-3xl font-bold mb-4">Connect Your Wallet</h1>
          <p className="text-muted-foreground">
            Please connect your wallet to register an identity
          </p>
        </div>
      </div>
    )
  }

  const hasEnoughBalance = balance && price ? balance >= price : false
  const hasEnoughAllowance = allowance && price ? allowance >= price : false
  const canApprove = name && price > 0n && hasEnoughBalance && !hasEnoughAllowance
  const canRegister = name && price > 0n && hasEnoughBalance && hasEnoughAllowance

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-4xl font-bold mb-8 text-center">Register Identity</h1>

        <div className="bg-card border border-border rounded-lg p-8 mb-6">
          {/* Balance Display */}
          <div className="mb-6 p-4 bg-muted rounded-lg">
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">Your Balance:</span>
              <span className="font-mono font-semibold">
                {balance ? formatUnits(balance, 18) : '0'} AI
              </span>
            </div>
          </div>

          {/* Name Input */}
          <div className="mb-6">
            <label className="block text-sm font-medium mb-2">Identity Name</label>
            <Input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value.toLowerCase())}
              placeholder="Enter your identity name"
              className="w-full"
            />
            <p className="text-xs text-muted-foreground mt-2">
              Lowercase letters only. Shorter names are more expensive.
            </p>
          </div>

          {/* Referrer Input */}
          <div className="mb-6">
            <label className="block text-sm font-medium mb-2">
              Referrer Code (Optional)
            </label>
            <Input
              type="text"
              value={referrer}
              onChange={(e) => setReferrer(e.target.value)}
              placeholder="Enter referrer name for 50% discount"
              className="w-full"
            />
          </div>

          {/* Price Display */}
          {price > 0n && (
            <div className="mb-6 p-4 bg-primary/10 border border-primary rounded-lg">
              <div className="flex justify-between items-center">
                <span className="font-medium">Total Price:</span>
                <span className="text-2xl font-bold text-primary">
                  {formatUnits(price, 18)} AI
                </span>
              </div>
              {referrer && (
                <p className="text-sm text-accent mt-2">
                  ✨ 50% referral discount applied!
                </p>
              )}
            </div>
          )}

          {/* Action Buttons */}
          <div className="space-y-3">
            {step === 'input' && (
              <Button
                onClick={handleApprove}
                disabled={!canApprove || isApproving}
                className="w-full"
                size="lg"
              >
                {isApproving ? 'Approving...' : 'Approve Tokens'}
              </Button>
            )}

            {(step === 'register' || step === 'approve') && (
              <Button
                onClick={handleRegister}
                disabled={!canRegister || isRegistering}
                className="w-full"
                size="lg"
              >
                {isRegistering ? 'Registering...' : 'Register Identity'}
              </Button>
            )}

            {step === 'success' && (
              <Button
                onClick={() => setStep('input')}
                className="w-full"
                size="lg"
              >
                Register Another
              </Button>
            )}
          </div>

          {/* Status Messages */}
          {status && (
            <div
              className={`mt-4 p-4 rounded-lg ${
                status.includes('failed') || status.includes('Error')
                  ? 'bg-destructive/10 text-destructive'
                  : status.includes('success')
                  ? 'bg-accent/10 text-accent'
                  : 'bg-muted text-muted-foreground'
              }`}
            >
              {status}
            </div>
          )}

          {/* Warnings */}
          {name && !hasEnoughBalance && (
            <div className="mt-4 p-4 bg-destructive/10 text-destructive rounded-lg">
              Insufficient balance. You need {formatUnits(price, 18)} AI but only have{' '}
              {balance ? formatUnits(balance, 18) : '0'} AI.
            </div>
          )}
        </div>

        {/* Info Cards */}
        <div className="grid md:grid-cols-2 gap-4">
          <div className="bg-card border border-border rounded-lg p-6">
            <h3 className="font-semibold mb-2">📝 How it works</h3>
            <ol className="text-sm text-muted-foreground space-y-1">
              <li>1. Enter your desired identity name</li>
              <li>2. Approve AI tokens for staking</li>
              <li>3. Register and receive your NFT</li>
            </ol>
          </div>
          <div className="bg-card border border-border rounded-lg p-6">
            <h3 className="font-semibold mb-2">💡 Tips</h3>
            <ul className="text-sm text-muted-foreground space-y-1">
              <li>• Shorter names cost more</li>
              <li>• Use a referrer for 50% off</li>
              <li>• 0.1% burn fee on transfers</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  )
}
