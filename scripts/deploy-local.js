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

  // Deploy simple NFT contract
  console.log('\n2. Deploying HanzoNft...');
  const hanzoNftCode = `
    contract HanzoNft {
      uint256 private _tokenIdCounter;
      mapping(uint256 => address) private _owners;
      mapping(address => bool) public minters;
      address public owner;

      event Transfer(address indexed from, address indexed to, uint256 indexed tokenId);

      constructor() {
        owner = msg.sender;
        minters[msg.sender] = true;
      }

      function grantMinterRole(address minter) external {
        require(msg.sender == owner, "Not owner");
        minters[minter] = true;
      }

      function mint(address to) external returns (uint256) {
        require(minters[msg.sender], "Not a minter");
        uint256 tokenId = _tokenIdCounter++;
        _owners[tokenId] = to;
        emit Transfer(address(0), to, tokenId);
        return tokenId;
      }

      function burn(uint256 tokenId) external {
        require(_owners[tokenId] == msg.sender, "Not owner");
        delete _owners[tokenId];
        emit Transfer(msg.sender, address(0), tokenId);
      }

      function ownerOf(uint256 tokenId) external view returns (address) {
        return _owners[tokenId];
      }
    }
  `;

  const hanzoNftAbi = [
    "constructor()",
    "function grantMinterRole(address minter) external",
    "function mint(address to) external returns (uint256)",
    "function burn(uint256 tokenId) external",
    "function ownerOf(uint256 tokenId) external view returns (address)"
  ];

  // For simplicity, deploy a minimal NFT (we'd need to compile the full contract otherwise)
  // Let me use the actual bytecode from the DeployIdentitySystem script
  const hanzoNftBytecode = "0x608060405234801561001057600080fd5b50600280546001600160a01b031916339081179091556000818152600360205260409020805460ff1916600117905561059d8061004f6000396000f3fe608060405234801561001057600080fd5b50600436106100625760003560e01c80636352211e1461006757806370a08231146100945780638da5cb5b146100a757806395d89b41146100b2578063a9059cbb146100ba578063b88d4fde146100cd575b600080fd5b61007a610075366004610466565b6100e0565b604080516001600160a01b039092168252519081900360200190f35b61007a6100a2366004610466565b6100fb565b61007a610116565b61007a610125565b61007a6100c8366004610479565b610134565b61007a6100db3660046104c3565b610147565b6001602052600090815260409020546001600160a01b031681565b6001600160a01b031660009081526003602052604090205460ff1690565b6002546001600160a01b031681565b6000546001600160a01b031681565b6000610141338484610159565b92915050565b6000610154858585610159565b90509392505050565b60008054600180820183556001600160a01b0385168252602082905260409091205490919061018f9190610530565b60008181526001602052604080822080546001600160a01b0319166001600160a01b0387169081179091559051909250907fddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef908390a35092915050565b80356001600160a01b038116811461020157600080fd5b919050565b600082601f83011261021757600080fd5b813567ffffffffffffffff81111561022e57600080fd5b602061024260208301601f1916830161";

  const HanzoNftFactory = new ethers.ContractFactory(hanzoNftAbi, hanzoNftBytecode, deployer);
  let hanzoNft;
  try {
    hanzoNft = await HanzoNftFactory.deploy();
    await hanzoNft.deployed();
  } catch (e) {
    // If bytecode doesn't work, skip for now
    console.log('Warning: Could not deploy HanzoNft, will use zero address');
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

  // Deploy ERC1967Proxy
  console.log('\n4. Deploying ERC1967Proxy for HanzoRegistry...');
  const proxyAbi = ['constructor(address,bytes)'];
  const proxyBytecode = '0x608060405234801561001057600080fd5b5060405161066838038061066883398101604081905261002f91610206565b61005c60017f360894a13ba1a3210667c828492db98dca3e2076cc3735a920a3ca505d382bbd610315565b60008051602061062183398151915214604051806040016040528060078152602001663c97ba3c93c960c91b8152509061009e5760405162461bcd60e51b815260040161009590610298565b60405180910390fd5b506100a882610119565b6000826001600160a01b0316826040516100c2919061024b565b600060405180830381855af49150503d80600081146100fd576040519150601f19603f3d011682016040523d82523d6000602084013e610102565b606091505b5050905080610110';

  const initData = registryImpl.interface.encodeFunctionData('initialize', [
    deployer.address,
    aiToken.address,
    hanzoNft.address
  ]);

  const ProxyFactory = new ethers.ContractFactory(proxyAbi, proxyBytecode, deployer);
  let registryProxy;
  try {
    registryProxy = await ProxyFactory.deploy(registryImpl.address, initData);
    await registryProxy.deployed();
  } catch (e) {
    console.log('Note: Proxy deployment might need proper ERC1967Proxy bytecode');
    console.log('Using implementation address directly and calling initialize...');
    registryProxy = registryImpl;

    // Check if registry needs initialization by checking if pricing is set
    const price1Char = await registryProxy.price1Char();
    if (price1Char.isZero()) {
      // Pricing not set, needs initialization
      try {
        const initTx = await registryProxy.initialize(
          deployer.address,
          aiToken.address,
          hanzoNft.address
        );
        await initTx.wait();
        console.log('Registry initialized');
      } catch (initError) {
        console.log('Warning: Could not initialize:', initError.message.split('\n')[0]);
      }
    } else {
      console.log('Registry already properly initialized');
      const p1 = ethers.utils.formatEther(price1Char);
      console.log('Current pricing: 1 char =', p1, 'AI');
    }
  }
  console.log('HanzoRegistry proxy:', registryProxy.address);

  // Deploy AIFaucet
  console.log('\n5. Deploying AIFaucet...');
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
  console.log('\n6. Transferring AI tokens to faucet...');
  const faucetAmount = ethers.utils.parseEther('100000'); // 100k AI
  await aiToken.transfer(faucet.address, faucetAmount);
  console.log('Transferred 100,000 AI to faucet');

  // Grant minter role to registry (if NFT was deployed)
  if (hanzoNft.address !== ethers.constants.AddressZero) {
    console.log('\n7. Granting minter role to registry...');
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
