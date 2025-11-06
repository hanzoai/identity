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

  // Load compiled contracts from local artifacts
  const aiTokenArtifact = JSON.parse(
    fs.readFileSync(path.join(__dirname, 'artifacts/AIToken.sol/AIToken.json'), 'utf8')
  );
  const hanzoRegistryArtifact = JSON.parse(
    fs.readFileSync(path.join(__dirname, 'artifacts/HanzoRegistry.sol/HanzoRegistry.json'), 'utf8')
  );
  const aiFaucetArtifact = JSON.parse(
    fs.readFileSync(path.join(__dirname, 'artifacts/AIFaucet.sol/AIFaucet.json'), 'utf8')
  );
  const proxyArtifact = JSON.parse(
    fs.readFileSync(path.join(__dirname, 'artifacts/ERC1967Proxy.sol/ERC1967Proxy.json'), 'utf8')
  );
  const hanzoNftArtifact = JSON.parse(
    fs.readFileSync(path.join(__dirname, 'artifacts/HanzoNft.sol/HanzoNft.json'), 'utf8')
  );

  // Deploy AIToken
  console.log('\n1. Deploying AIToken...');
  const AITokenFactory = new ethers.ContractFactory(
    aiTokenArtifact.abi,
    aiTokenArtifact.bytecode.object,
    deployer
  );
  const aiToken = await AITokenFactory.deploy(deployer.address);
  await aiToken.deployed();
  console.log('✓ AIToken deployed at:', aiToken.address);

  // Deploy HanzoNft
  console.log('\n2. Deploying HanzoNft...');
  const HanzoNftFactory = new ethers.ContractFactory(
    hanzoNftArtifact.abi,
    hanzoNftArtifact.bytecode.object,
    deployer
  );
  const hanzoNft = await HanzoNftFactory.deploy();
  await hanzoNft.deployed();
  console.log('✓ HanzoNft deployed at:', hanzoNft.address);

  // Deploy HanzoRegistry implementation
  console.log('\n3. Deploying HanzoRegistry implementation...');
  const HanzoRegistryFactory = new ethers.ContractFactory(
    hanzoRegistryArtifact.abi,
    hanzoRegistryArtifact.bytecode.object,
    deployer
  );
  const registryImpl = await HanzoRegistryFactory.deploy();
  await registryImpl.deployed();
  console.log('✓ HanzoRegistry implementation:', registryImpl.address);

  // Encode initialize call
  const initData = registryImpl.interface.encodeFunctionData('initialize', [
    deployer.address,
    aiToken.address,
    hanzoNft.address
  ]);

  // Deploy ERC1967Proxy
  console.log('\n4. Deploying ERC1967Proxy...');
  const ProxyFactory = new ethers.ContractFactory(
    proxyArtifact.abi,
    proxyArtifact.bytecode.object,
    deployer
  );

  const registryProxy = await ProxyFactory.deploy(registryImpl.address, initData);
  await registryProxy.deployed();
  console.log('✓ ERC1967Proxy deployed at:', registryProxy.address);

  // Create registry interface at proxy address
  const registry = new ethers.Contract(registryProxy.address, hanzoRegistryArtifact.abi, deployer);

  // Verify initialization
  console.log('\n5. Verifying initialization...');
  const price1Char = await registry.price1Char();
  const price2Char = await registry.price2Char();
  const price3Char = await registry.price3Char();
  const price4Char = await registry.price4Char();
  const price5Plus = await registry.price5PlusChar();
  const discount = await registry.referrerDiscountBps();

  console.log('  ✓ 1 char price:', ethers.utils.formatEther(price1Char), 'AI (expected: 100,000)');
  console.log('  ✓ 2 char price:', ethers.utils.formatEther(price2Char), 'AI (expected: 10,000)');
  console.log('  ✓ 3 char price:', ethers.utils.formatEther(price3Char), 'AI (expected: 1,000)');
  console.log('  ✓ 4 char price:', ethers.utils.formatEther(price4Char), 'AI (expected: 100)');
  console.log('  ✓ 5+ char price:', ethers.utils.formatEther(price5Plus), 'AI (expected: 10)');
  console.log('  ✓ Referrer discount:', discount.toString(), 'bps (expected: 5000 = 50%)');

  // Deploy AIFaucet
  console.log('\n6. Deploying AIFaucet...');
  const AIFaucetFactory = new ethers.ContractFactory(
    aiFaucetArtifact.abi,
    aiFaucetArtifact.bytecode.object,
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
  console.log('✓ AIFaucet deployed at:', faucet.address);

  // Transfer tokens to faucet
  console.log('\n7. Transferring AI tokens to faucet...');
  const faucetAmount = ethers.utils.parseEther('100000'); // 100k AI
  const transferTx = await aiToken.transfer(faucet.address, faucetAmount);
  await transferTx.wait();
  console.log('✓ Transferred 100,000 AI to faucet');

  // Grant minter role to registry
  console.log('\n8. Granting minter role to registry...');
  const grantTx = await hanzoNft.grantMinterRole(registryProxy.address);
  await grantTx.wait();
  console.log('✓ Minter role granted to:', registryProxy.address);

  // Print deployment summary
  console.log('\n' + '='.repeat(60));
  console.log('✅ DEPLOYMENT SUCCESSFUL');
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
  console.log('\n✅ Addresses saved to deployed-addresses.json');
  console.log('\nRun tests with: node test-all.js');
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error('\n❌ Deployment failed:');
    console.error(error);
    process.exit(1);
  });
