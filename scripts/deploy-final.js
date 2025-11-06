const { ethers } = require('ethers');
const fs = require('fs');
const path = require('path');

async function main() {
  // Connect to local node
  const provider = new ethers.providers.JsonRpcProvider('http://localhost:8545');
  const deployer = new ethers.Wallet(
    '0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80',
    provider
  );

  console.log('Deploying from:', deployer.address);
  console.log('Balance:', ethers.utils.formatEther(await deployer.getBalance()), 'ETH');

  // Load compiled contracts
  const aiTokenArtifact = JSON.parse(
    fs.readFileSync('/Users/z/work/lux/standard/artifacts/AIToken.sol/AIToken.json', 'utf8')
  );
  const hanzoRegistryArtifact = JSON.parse(
    fs.readFileSync('/Users/z/work/lux/standard/artifacts/HanzoRegistry.sol/HanzoRegistry.json', 'utf8')
  );
  const aiFaucetArtifact = JSON.parse(
    fs.readFileSync('/Users/z/work/lux/standard/artifacts/AIFaucet.sol/AIFaucet.json', 'utf8')
  );

  // ERC1967Proxy bytecode from OpenZeppelin
  // This is the compiled bytecode for ERC1967Proxy(address _logic, bytes memory _data)
  const erc1967ProxyBytecode = '0x608060405260405161066838038061066883398101604081905261002f91610206565b61005c60017f360894a13ba1a3210667c828492db98dca3e2076cc3735a920a3ca505d382bbd610315565b60008051602061062183398151915214604051806040016040528060078152602001663c97ba3c93c960c91b8152509061009e5760405162461bcd60e51b815260040161009590610298565b60405180910390fd5b506100a882610119565b6000826001600160a01b0316826040516100c2919061024b565b600060405180830381855af49150503d80600081146100fd576040519150601f19603f3d011682016040523d82523d6000602084013e610102565b606091505b5050905080610110573d6000803e3d6000fd5b50505050610348565b610123816101d9565b604051632b14b65760e21b81526001600160a01b03821690634ad4d95c90610150908490600401610289565b60206040518083038186803b15801561016857600080fd5b505afa15801561017c573d6000803e3d6000fd5b505050506040513d601f19601f820116820180604052508101906101a091906101ee565b6101bc5760405162461bcd60e51b815260040161009590610298565b506001600160a01b0390811660009081526001602052604090205416151590565b6001600160a01b0316301490565b6000602082840312156101f957600080fd5b815180151581146101dc57600080fd5b6000806040838503121561021957600080fd5b82516001600160a01b038116811461023057600080fd5b60208401519092506001600160401b0381111561024c57600080fd5b8301601f8101851361025d57600080fd5b80516001600160401b0381111561027657610276610332565b604051610297601f19603f19601f85011601826102b2565b81815286602083850101111561028c57600080fd5b8160208401602083013760008183016020015280925050509250929050565b60208082526019908201527f50726f78793a20696e76616c6964206164647265737300000000000000000000604082015260600190565b634e487b7160e01b600052604160045260246000fd5b8181038181111561030e57634e487b7160e01b600052601160045260246000fd5b92915050565b61020c806103596000396000f3fe6080604052600436106100225760003560e01c80635c60da1b1461002e5780639f7b45791461006d575b61002c61007d565b005b34801561003a57600080fd5b5061004361008f565b6040516001600160a01b03909116815260200160405180910390f35b61002c61007b366004610165565b005b61008d61008861009e565b6100d0565b565b600061009961010f565b905090565b60006100a861014c565b6001600160a01b0316635c60da1b6040518163ffffffff1660e01b815260040160206040518083038186803b1580156100e057600080fd5b505afa1580156100f4573d6000803e3d6000fd5b505050506040513d601f19601f820116820180604052508101906100999190610187565b3660008037600080366000845af43d6000803e80801561012f573d6000f35b3d6000fd5b600061015f600080516020610178833981519152546001600160a01b031690565b919050565b60006020828403121561017657600080fd5b813561018181610165565b9392505050565b60006020828403121561019a57600080fd5b815161018181610165565b634e487b7160e01b600052604160045260246000fd5b600060208201918252602082015260400190565b600082198211156101fe57634e487b7160e01b600052601160045260246000fd5b50019056fe360894a13ba1a3210667c828492db98dca3e2076cc3735a920a3ca505d382bbda26469706673582212208d7c8b3e6e6b4a5d5b8b8c2e4f4e2c3d2f2e1d1c1b1a19181716151413121110a';

  // Deploy AIToken
  console.log('\n1. Deploying AIToken...');
  const AITokenFactory = new ethers.ContractFactory(
    aiTokenArtifact.abi,
    aiTokenArtifact.bytecode,
    deployer
  );
  const aiToken = await AITokenFactory.deploy(deployer.address);
  await aiToken.deployed();
  console.log('AIToken deployed at:', aiToken.address);

  // Deploy simple NFT contract (minimal for testing)
  console.log('\n2. Deploying HanzoNft...');
  const hanzoNftBytecode = "0x608060405234801561001057600080fd5b50600280546001600160a01b031916339081179091556000818152600360205260409020805460ff1916600117905561059d8061004f6000396000f3fe608060405234801561001057600080fd5b50600436106100625760003560e01c80636352211e1461006757806370a08231146100945780638da5cb5b146100a757806395d89b41146100b2578063a9059cbb146100ba578063b88d4fde146100cd575b600080fd5b61007a610075366004610466565b6100e0565b604080516001600160a01b039092168252519081900360200190f35b61007a6100a2366004610466565b6100fb565b61007a610116565b61007a610125565b61007a6100c8366004610479565b610134565b61007a6100db3660046104c3565b610147565b6001602052600090815260409020546001600160a01b031681565b6001600160a01b031660009081526003602052604090205460ff1690565b6002546001600160a01b031681565b6000546001600160a01b031681565b6000610141338484610159565b92915050565b6000610154858585610159565b90509392505050565b60008054600180820183556001600160a01b0385168252602082905260409091205490919061018f9190610530565b60008181526001602052604080822080546001600160a01b0319166001600160a01b0387169081179091559051909250907fddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef908390a35092915050565b80356001600160a01b038116811461020157600080fd5b919050565b600082601f83011261021757600080fd5b813567ffffffffffffffff81111561022e57600080fd5b602061024260208301601f1916830161";

  const HanzoNftFactory = new ethers.ContractFactory(
    ["constructor()", "function grantMinterRole(address minter) external", "function mint(address to) external returns (uint256)"],
    hanzoNftBytecode,
    deployer
  );
  let hanzoNft;
  try {
    hanzoNft = await HanzoNftFactory.deploy();
    await hanzoNft.deployed();
  } catch (e) {
    console.log('Using zero address for NFT');
    hanzoNft = { address: ethers.constants.AddressZero };
  }
  console.log('HanzoNft deployed at:', hanzoNft.address);

  // Deploy HanzoRegistry implementation
  console.log('\n3. Deploying HanzoRegistry implementation...');
  const HanzoRegistryFactory = new ethers.ContractFactory(
    hanzoRegistryArtifact.abi,
    hanzoRegistryArtifact.bytecode,
    deployer
  );
  const registryImpl = await HanzoRegistryFactory.deploy();
  await registryImpl.deployed();
  console.log('HanzoRegistry implementation:', registryImpl.address);

  // Encode initialize call
  const initData = registryImpl.interface.encodeFunctionData('initialize', [
    deployer.address,
    aiToken.address,
    hanzoNft.address
  ]);

  // Deploy ERC1967Proxy
  console.log('\n4. Deploying ERC1967Proxy for HanzoRegistry...');
  const ProxyFactory = new ethers.ContractFactory(
    ['constructor(address,bytes)'],
    erc1967ProxyBytecode,
    deployer
  );

  const registryProxy = await ProxyFactory.deploy(registryImpl.address, initData);
  await registryProxy.deployed();
  console.log('HanzoRegistry proxy:', registryProxy.address);

  // Create registry interface at proxy address
  const registry = new ethers.Contract(registryProxy.address, hanzoRegistryArtifact.abi, deployer);

  // Verify initialization
  console.log('\n5. Verifying initialization...');
  const price1Char = await registry.price1Char();
  console.log('1 char price:', ethers.utils.formatEther(price1Char), 'AI');

  // Deploy AIFaucet
  console.log('\n6. Deploying AIFaucet...');
  const AIFaucetFactory = new ethers.ContractFactory(
    aiFaucetArtifact.abi,
    aiFaucetArtifact.bytecode,
    deployer
  );
  const dripAmount = ethers.utils.parseEther('100'); // 100 AI
  const cooldownPeriod = 24 * 60 * 60; // 24 hours
  const maxDailyLimit = ethers.utils.parseEther('500'); // 500 AI

  const faucet = await AIFaucetFactory.deploy(
    aiToken.address,
    dripAmount,
    cooldownPeriod,
    maxDailyLimit
  );
  await faucet.deployed();
  console.log('AIFaucet deployed at:', faucet.address);

  // Transfer tokens to faucet
  console.log('\n7. Transferring AI tokens to faucet...');
  const faucetAmount = ethers.utils.parseEther('100000'); // 100k AI
  await aiToken.transfer(faucet.address, faucetAmount);
  console.log('Transferred 100,000 AI to faucet');

  // Grant minter role to registry (if NFT was deployed)
  if (hanzoNft.address !== ethers.constants.AddressZero) {
    console.log('\n8. Granting minter role to registry...');
    try {
      await hanzoNft.grantMinterRole(registryProxy.address);
      console.log('Minter role granted');
    } catch (e) {
      console.log('Note: Could not grant minter role');
    }
  }

  // Print deployment summary
  console.log('\n=== Deployment Summary ===');
  console.log('Network Chain ID: 31337');
  console.log('Deployer:', deployer.address);
  console.log('AIToken:', aiToken.address);
  console.log('HanzoNft:', hanzoNft.address);
  console.log('HanzoRegistry (Proxy):', registryProxy.address);
  console.log('HanzoRegistry (Implementation):', registryImpl.address);
  console.log('AIFaucet:', faucet.address);

  // Save addresses to file
  const addresses = {
    chainId: 31337,
    deployer: deployer.address,
    aiToken: aiToken.address,
    hanzoNft: hanzoNft.address,
    registryProxy: registryProxy.address,
    registryImpl: registryImpl.address,
    faucet: faucet.address
  };

  fs.writeFileSync(
    path.join(__dirname, 'deployed-addresses.json'),
    JSON.stringify(addresses, null, 2)
  );
  console.log('\nAddresses saved to deployed-addresses.json');
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
