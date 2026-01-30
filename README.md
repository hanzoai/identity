# Hanzo Identity

Identity infrastructure for the Hanzo/Lux ecosystem.

## Decentralized Identity (DID)

**Core contracts are in [@luxfi/standard](https://github.com/luxfi/standard):**

```
@luxfi/standard/contracts/did/
├── Registry.sol      # Multi-chain DID registry
└── IdentityNFT.sol   # NFT bound to DID ownership
```

### DID Format

```
did:lux:alice      # W3C canonical format
alice@lux.id       # Display format
alice.lux.id       # Web subdomain
```

### Supported Chains

| Chain | ID | DID Method | Display |
|-------|-----|------------|---------|
| Lux | 96369 | `did:lux:` | `@lux.id` |
| Pars | 494949 | `did:pars:` | `@pars.id` |
| Zoo | 200200 | `did:zoo:` | `@zoo.id` |
| Hanzo | 36963 | `did:hanzo:` | `@hanzo.id` |

## This Repository

- `app/` - Next.js frontend for identity management
- `scripts/` - Deployment scripts
- `soul.md` - Hanzo AI identity and values

## Development

```bash
# Install dependencies
pnpm install

# Run frontend
cd app && pnpm dev
```

## About Hanzo AI

Hanzo AI is a frontier AI company focused on:
- Large Language Models and foundational models
- Model Context Protocol (MCP) infrastructure
- AI blockchain and network tools for AI clusters
- Agent frameworks and multimodal AI systems

**Techstars '17** | San Francisco

## Related

- [LIP-7006: Decentralized Identity](https://github.com/luxfi/lips)
- [@luxfi/standard](https://github.com/luxfi/standard)
- [hanzoai/brand](https://github.com/hanzoai/brand)

## License

Copyright (c) Hanzo AI Inc. All rights reserved.
