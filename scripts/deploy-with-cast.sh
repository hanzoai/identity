#!/bin/bash

# Deploy Identity System using Foundry cast
# This properly handles UUPS proxies

RPC_URL="http://localhost:8545"
PRIVATE_KEY="0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80"
DEPLOYER="0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266"

echo "Deploying from: $DEPLOYER"

# Deploy AIToken
echo -e "\n1. Deploying AIToken..."
AI_TOKEN=$(cast send --rpc-url $RPC_URL --private-key $PRIVATE_KEY --create \
  $(cat /Users/z/work/lux/standard/artifacts/AIToken.sol/AIToken.json | jq -r '.bytecode') \
  --constructor-args $DEPLOYER --json | jq -r '.contractAddress')
echo "AIToken deployed at: $AI_TOKEN"

# Deploy HanzoNft (simple implementation for testing)
echo -e "\n2. Deploying HanzoNft..."
NFT_BYTECODE="0x608060405234801561001057600080fd5b50600280546001600160a01b031916339081179091556000818152600360205260409020805460ff1916600117905561059d8061004f6000396000f3fe608060405234801561001057600080fd5b50600436106100625760003560e01c80636352211e1461006757806370a08231146100945780638da5cb5b146100a757806395d89b41146100b2578063a9059cbb146100ba578063b88d4fde146100cd575b600080fd5b61007a610075366004610466565b6100e0565b604080516001600160a01b039092168252519081900360200190f35b61007a6100a2366004610466565b6100fb565b61007a610116565b61007a610125565b61007a6100c8366004610479565b610134565b61007a6100db3660046104c3565b610147565b6001602052600090815260409020546001600160a01b031681565b6001600160a01b031660009081526003602052604090205460ff1690565b6002546001600160a01b031681565b6000546001600160a01b031681565b6000610141338484610159565b92915050565b6000610154858585610159565b90509392505050565b60008054600180820183556001600160a01b0385168252602082905260409091205490919061018f9190610530565b60008181526001602052604080822080546001600160a01b0319166001600160a01b0387169081179091559051909250907fddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef908390a35092915050565b80356001600160a01b038116811461020157600080fd5b919050565b600082601f83011261021757600080fd5b813567ffffffffffffffff81111561022e57600080fd5b602061024260208301601f1916830161"
HANZO_NFT=$(cast send --rpc-url $RPC_URL --private-key $PRIVATE_KEY --create $NFT_BYTECODE --json | jq -r '.contractAddress' || echo "0x0000000000000000000000000000000000000000")
echo "HanzoNft deployed at: $HANZO_NFT"

# Deploy HanzoRegistry implementation
echo -e "\n3. Deploying HanzoRegistry implementation..."
REGISTRY_IMPL=$(cast send --rpc-url $RPC_URL --private-key $PRIVATE_KEY --create \
  $(cat /Users/z/work/lux/standard/artifacts/HanzoRegistry.sol/HanzoRegistry.json | jq -r '.bytecode') \
  --json | jq -r '.contractAddress')
echo "HanzoRegistry implementation: $REGISTRY_IMPL"

# Encode initialize call
echo -e "\n4. Encoding initialize call data..."
INIT_DATA=$(cast calldata "initialize(address,address,address)" $DEPLOYER $AI_TOKEN $HANZO_NFT)
echo "Initialize data: $INIT_DATA"

# Deploy ERC1967Proxy
echo -e "\n5. Deploying ERC1967Proxy..."
# Use OpenZeppelin's ERC1967Proxy from artifacts
PROXY_BYTECODE=$(cat /Users/z/work/lux/standard/lib/openzeppelin-contracts/artifacts/contracts/proxy/ERC1967/ERC1967Proxy.sol/ERC1967Proxy.json 2>/dev/null | jq -r '.bytecode' || echo "")

if [ -z "$PROXY_BYTECODE" ] || [ "$PROXY_BYTECODE" = "null" ]; then
  echo "ERC1967Proxy bytecode not found, compiling..."
  cd /Users/z/work/lux/standard/lib/openzeppelin-contracts
  forge build --contracts contracts/proxy/ERC1967/ERC1967Proxy.sol
  PROXY_BYTECODE=$(cat artifacts/contracts/proxy/ERC1967/ERC1967Proxy.sol/ERC1967Proxy.json | jq -r '.bytecode')
fi

REGISTRY_PROXY=$(cast send --rpc-url $RPC_URL --private-key $PRIVATE_KEY --create \
  $PROXY_BYTECODE \
  --constructor-args $REGISTRY_IMPL $INIT_DATA \
  --json | jq -r '.contractAddress')
echo "HanzoRegistry proxy: $REGISTRY_PROXY"

# Deploy AIFaucet
echo -e "\n6. Deploying AIFaucet..."
DRIP_AMOUNT="100000000000000000000"  # 100 AI
COOLDOWN="86400"  # 24 hours
MAX_DAILY="500000000000000000000"  # 500 AI

FAUCET=$(cast send --rpc-url $RPC_URL --private-key $PRIVATE_KEY --create \
  $(cat /Users/z/work/lux/standard/artifacts/AIFaucet.sol/AIFaucet.json | jq -r '.bytecode') \
  --constructor-args $AI_TOKEN $DRIP_AMOUNT $COOLDOWN $MAX_DAILY \
  --json | jq -r '.contractAddress')
echo "AIFaucet deployed at: $FAUCET"

# Transfer tokens to faucet
echo -e "\n7. Transferring AI tokens to faucet..."
FAUCET_AMOUNT="100000000000000000000000"  # 100,000 AI
cast send --rpc-url $RPC_URL --private-key $PRIVATE_KEY $AI_TOKEN \
  "transfer(address,uint256)" $FAUCET $FAUCET_AMOUNT
echo "Transferred 100,000 AI to faucet"

# Save addresses
echo -e "\n8. Saving addresses..."
cat > /Users/z/work/hanzo/identity-contracts/deployed-addresses.json <<EOF
{
  "chainId": 31337,
  "deployer": "$DEPLOYER",
  "aiToken": "$AI_TOKEN",
  "hanzoNft": "$HANZO_NFT",
  "registryProxy": "$REGISTRY_PROXY",
  "registryImpl": "$REGISTRY_IMPL",
  "faucet": "$FAUCET"
}
EOF

echo -e "\n=== Deployment Summary ==="
echo "Network Chain ID: 31337"
echo "Deployer: $DEPLOYER"
echo "AIToken: $AI_TOKEN"
echo "HanzoNft: $HANZO_NFT"
echo "HanzoRegistry (Proxy): $REGISTRY_PROXY"
echo "HanzoRegistry (Implementation): $REGISTRY_IMPL"
echo "AIFaucet: $FAUCET"
echo -e "\nAddresses saved to deployed-addresses.json"
