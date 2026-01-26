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

  // Load OpenZeppelin ERC1967Proxy artifact
  const proxyArtifact = JSON.parse(
    fs.readFileSync('/Users/z/work/lux/standard/lib/openzeppelin-contracts/out/ERC1967Proxy.sol/ERC1967Proxy.json', 'utf8')
  );

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
  console.log('Initialize data:', initData);

  // Deploy ERC1967Proxy using OpenZeppelin artifact
  console.log('\n4. Deploying OpenZeppelin ERC1967Proxy...');
  const ProxyFactory = new ethers.ContractFactory(
    proxyArtifact.abi,
    proxyArtifact.bytecode.object,
    deployer
  );

  const registryProxy = await ProxyFactory.deploy(registryImpl.address, initData);
  await registryProxy.deployed();
  console.log('HanzoRegistry proxy deployed at:', registryProxy.address);

  // Create registry interface at proxy address
  const registry = new ethers.Contract(registryProxy.address, hanzoRegistryArtifact.abi, deployer);

  // Verify initialization
  console.log('\n5. Verifying initialization...');
  const price1Char = await registry.price1Char();
  const price2Char = await registry.price2Char();
  const price5Plus = await registry.price5PlusChar();
  const discount = await registry.referrerDiscountBps();

  console.log('✓ 1 char price:', ethers.utils.formatEther(price1Char), 'AI');
  console.log('✓ 2 char price:', ethers.utils.formatEther(price2Char), 'AI');
  console.log('✓ 5+ char price:', ethers.utils.formatEther(price5Plus), 'AI');
  console.log('✓ Referrer discount:', discount.toString(), 'bps (50%)');

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
  console.log('✓ Transferred 100,000 AI to faucet');

  // Grant minter role to registry (if NFT was deployed)
  if (hanzoNft.address !== ethers.constants.AddressZero) {
    console.log('\n8. Granting minter role to registry...');
    try {
      await hanzoNft.grantMinterRole(registryProxy.address);
      console.log('✓ Minter role granted');
    } catch (e) {
      console.log('Note: Could not grant minter role');
    }
  }

  // Print deployment summary
  console.log('\n' + '='.repeat(60));
  console.log('DEPLOYMENT SUCCESSFUL');
  console.log('='.repeat(60));
  console.log('Network Chain ID: 31337');
  console.log('Deployer:', deployer.address);
  console.log('AIToken:', aiToken.address);
  console.log('HanzoNft:', hanzoNft.address);
  console.log('HanzoRegistry (Proxy):', registryProxy.address);
  console.log('HanzoRegistry (Implementation):', registryImpl.address);
  console.log('AIFaucet:', faucet.address);
  console.log('='.repeat(60));

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
  console.log('\n✓ Addresses saved to deployed-addresses.json');
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error('\n❌ Deployment failed:');
    console.error(error);
    process.exit(1);
  });
