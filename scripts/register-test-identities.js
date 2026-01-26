const { ethers } = require('ethers');

const REGISTRY_ABI = [
    "function claimIdentity((string name, uint256 namespace, uint256 stakeAmount, address owner, string referrer)) external",
    "function identityStakeRequirement(string name, uint256 namespace, bool hasReferrer) external view returns (uint256)"
];

const TOKEN_ABI = [
    "function approve(address spender, uint256 amount) external returns (bool)",
    "function balanceOf(address owner) external view returns (uint256)"
];

async function main() {
    const provider = new ethers.providers.JsonRpcProvider('http://localhost:8545');

    // Use first 5 Anvil accounts
    const privateKeys = [
        '0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80',
        '0x59c6995e998f97a5a0044966f0945389dc9e86dae88c7a8412f4603b6b78690d',
        '0x5de4111afa1a4b94908f83103eb1f1706367c2e68ca870fc3fb9a804cdab365a',
        '0x7c852118294e51e653712a81e05800f419141751be58f605c371e15141b007a6',
        '0x47e179ec197488593b187f80a00eb0da91f1b9d0b13f8733639f19c30a34926a'
    ];

    const testIdentities = [
        { name: 'alice', namespace: 31337 },
        { name: 'bob', namespace: 31337 },
        { name: 'charlie', namespace: 31337 },
        { name: 'dave', namespace: 31337 },
        { name: 'eve', namespace: 31337 }
    ];

    const registryAddress = '0xCf7Ed3AccA5a467e9e704C703E8D87F634fB0Fc9';
    const tokenAddress = '0x5FbDB2315678afecb367f032d93F642f64180aa3';

    console.log('Registering test identities...\n');

    for (let i = 0; i < testIdentities.length; i++) {
        const wallet = new ethers.Wallet(privateKeys[i], provider);
        const registry = new ethers.Contract(registryAddress, REGISTRY_ABI, wallet);
        const token = new ethers.Contract(tokenAddress, TOKEN_ABI, wallet);

        const { name, namespace } = testIdentities[i];

        try {
            console.log(`${i + 1}. Registering @@${name} with account ${wallet.address.slice(0, 6)}...${wallet.address.slice(-4)}`);

            // Get faucet tokens first
            const faucet = new ethers.Contract('0xDc64a140Aa3E981100a9becA4E685f962f0cF6C9', [
                "function drip() external"
            ], wallet);

            try {
                await faucet.drip();
                console.log(`   ✓ Got tokens from faucet`);
            } catch (e) {
                console.log(`   ℹ Already has tokens or cooldown active`);
            }

            // Calculate stake
            const stake = await registry.identityStakeRequirement(name, namespace, false);
            console.log(`   Required stake: ${ethers.utils.formatEther(stake)} AI`);

            // Approve tokens
            const approveTx = await token.approve(registryAddress, ethers.constants.MaxUint256);
            await approveTx.wait();
            console.log(`   ✓ Tokens approved`);

            // Register identity
            const params = {
                name: name,
                namespace: namespace,
                stakeAmount: stake,
                owner: wallet.address,
                referrer: ''
            };

            const tx = await registry.claimIdentity(params);
            const receipt = await tx.wait();
            console.log(`   ✓ Identity registered! TX: ${receipt.transactionHash.slice(0, 10)}...`);

            // Check balance
            const balance = await token.balanceOf(wallet.address);
            console.log(`   Remaining balance: ${ethers.utils.formatEther(balance)} AI\n`);

        } catch (error) {
            if (error.message.includes('already claimed')) {
                console.log(`   ⚠ Identity already registered\n`);
            } else {
                console.log(`   ✗ Error: ${error.message}\n`);
            }
        }
    }

    console.log('✅ Done registering test identities!');
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });
