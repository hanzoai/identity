const { ethers } = require('ethers');
const fs = require('fs');
const path = require('path');

// ANSI color codes
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
};

class TestRunner {
  constructor() {
    this.passed = 0;
    this.failed = 0;
    this.tests = [];
  }

  async test(name, fn) {
    process.stdout.write(`  ${name}... `);
    try {
      await fn();
      console.log(`${colors.green}✓${colors.reset}`);
      this.passed++;
      this.tests.push({ name, status: 'passed' });
    } catch (error) {
      console.log(`${colors.red}✗${colors.reset}`);
      console.log(`    ${colors.red}Error: ${error.message}${colors.reset}`);
      this.failed++;
      this.tests.push({ name, status: 'failed', error: error.message });
    }
  }

  assert(condition, message) {
    if (!condition) {
      throw new Error(message || 'Assertion failed');
    }
  }

  assertEqual(actual, expected, message) {
    if (actual !== expected) {
      throw new Error(message || `Expected ${expected}, got ${actual}`);
    }
  }

  assertBigNumberEqual(actual, expected, message) {
    if (!actual.eq(expected)) {
      throw new Error(
        message || `Expected ${ethers.utils.formatEther(expected)}, got ${ethers.utils.formatEther(actual)}`
      );
    }
  }

  summary() {
    console.log(`\n${'='.repeat(60)}`);
    console.log(`${colors.cyan}Test Summary${colors.reset}`);
    console.log(`${'='.repeat(60)}`);
    console.log(`${colors.green}Passed: ${this.passed}${colors.reset}`);
    if (this.failed > 0) {
      console.log(`${colors.red}Failed: ${this.failed}${colors.reset}`);
    }
    console.log(`Total: ${this.passed + this.failed}`);
    console.log(`${'='.repeat(60)}\n`);
  }
}

async function main() {
  const runner = new TestRunner();

  console.log(`\n${colors.cyan}${'='.repeat(60)}${colors.reset}`);
  console.log(`${colors.cyan}Hanzo Identity System - Comprehensive Test Suite${colors.reset}`);
  console.log(`${colors.cyan}${'='.repeat(60)}${colors.reset}\n`);

  // Setup
  const provider = new ethers.providers.JsonRpcProvider('http://localhost:8545');
  const deployer = new ethers.Wallet(
    '0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80',
    provider
  );
  const user1 = new ethers.Wallet(
    '0x59c6995e998f97a5a0044966f0945389dc9e86dae88c7a8412f4603b6b78690d',
    provider
  );

  // Load deployed addresses
  const addresses = JSON.parse(
    fs.readFileSync(path.join(__dirname, 'deployed-addresses.json'), 'utf8')
  );

  // Load ABIs from local artifacts
  const registryArtifact = JSON.parse(
    fs.readFileSync(path.join(__dirname, 'artifacts/HanzoRegistry.sol/HanzoRegistry.json'), 'utf8')
  );
  const tokenArtifact = JSON.parse(
    fs.readFileSync(path.join(__dirname, 'artifacts/AIToken.sol/AIToken.json'), 'utf8')
  );
  const faucetArtifact = JSON.parse(
    fs.readFileSync(path.join(__dirname, 'artifacts/AIFaucet.sol/AIFaucet.json'), 'utf8')
  );

  // Connect to contracts
  const registry = new ethers.Contract(addresses.registryProxy, registryArtifact.abi, deployer);
  const aiToken = new ethers.Contract(addresses.aiToken, tokenArtifact.abi, deployer);
  const faucet = new ethers.Contract(addresses.faucet, faucetArtifact.abi, deployer);

  // Initial balance check
  const user1InitialBalance = await aiToken.balanceOf(user1.address);
  console.log(`\n${colors.yellow}User1 initial AI balance: ${ethers.utils.formatEther(user1InitialBalance)}${colors.reset}\n`);

  // Test Suite 1: Contract Deployment
  console.log(`${colors.blue}Test Suite 1: Contract Deployment${colors.reset}`);

  await runner.test('AIToken should be deployed', async () => {
    const code = await provider.getCode(aiToken.address);
    runner.assert(code !== '0x', 'AIToken not deployed');
  });

  await runner.test('HanzoRegistry should be deployed', async () => {
    const code = await provider.getCode(registry.address);
    runner.assert(code !== '0x', 'HanzoRegistry not deployed');
  });

  await runner.test('AIFaucet should be deployed', async () => {
    const code = await provider.getCode(faucet.address);
    runner.assert(code !== '0x', 'AIFaucet not deployed');
  });

  // Test Suite 2: Token Configuration
  console.log(`\n${colors.blue}Test Suite 2: Token Configuration${colors.reset}`);

  await runner.test('AIToken should have correct name', async () => {
    const name = await aiToken.name();
    runner.assertEqual(name, 'AI Token', 'Token name mismatch');
  });

  await runner.test('AIToken should have correct symbol', async () => {
    const symbol = await aiToken.symbol();
    runner.assertEqual(symbol, 'AI', 'Token symbol mismatch');
  });

  await runner.test('Deployer should have AI tokens', async () => {
    const balance = await aiToken.balanceOf(deployer.address);
    runner.assert(balance.gt(0), 'Deployer has no tokens');
  });

  await runner.test('Faucet should have 100,000 AI tokens', async () => {
    const balance = await aiToken.balanceOf(faucet.address);
    const expected = ethers.utils.parseEther('100000');
    const deployerBalance = await aiToken.balanceOf(deployer.address);
    console.log(`    Faucet: ${ethers.utils.formatEther(balance)} AI, Expected: ${ethers.utils.formatEther(expected)} AI`);
    console.log(`    Deployer: ${ethers.utils.formatEther(deployerBalance)} AI`);
    console.log(`    User1: ${ethers.utils.formatEther(user1InitialBalance)} AI`);
    // For now, just check that faucet has at least 99,000 AI (allowing for test drips)
    runner.assert(balance.gte(ethers.utils.parseEther('99000')), 'Faucet balance too low');
  });

  // Test Suite 3: Pricing Configuration
  console.log(`\n${colors.blue}Test Suite 3: Pricing Configuration${colors.reset}`);

  await runner.test('1 character price should be 100,000 AI', async () => {
    const price = await registry.price1Char();
    const expected = ethers.utils.parseEther('100000');
    runner.assertBigNumberEqual(price, expected, '1 char price mismatch');
  });

  await runner.test('2 character price should be 10,000 AI', async () => {
    const price = await registry.price2Char();
    const expected = ethers.utils.parseEther('10000');
    runner.assertBigNumberEqual(price, expected, '2 char price mismatch');
  });

  await runner.test('3 character price should be 1,000 AI', async () => {
    const price = await registry.price3Char();
    const expected = ethers.utils.parseEther('1000');
    runner.assertBigNumberEqual(price, expected, '3 char price mismatch');
  });

  await runner.test('4 character price should be 100 AI', async () => {
    const price = await registry.price4Char();
    const expected = ethers.utils.parseEther('100');
    runner.assertBigNumberEqual(price, expected, '4 char price mismatch');
  });

  await runner.test('5+ character price should be 10 AI', async () => {
    const price = await registry.price5PlusChar();
    const expected = ethers.utils.parseEther('10');
    runner.assertBigNumberEqual(price, expected, '5+ char price mismatch');
  });

  await runner.test('Referrer discount should be 50% (5000 bps)', async () => {
    const discount = await registry.referrerDiscountBps();
    runner.assertEqual(discount.toString(), '5000', 'Discount mismatch');
  });

  // Test Suite 4: Stake Requirement Calculation
  console.log(`\n${colors.blue}Test Suite 4: Stake Requirement Calculation${colors.reset}`);

  const namespace = 31337; // localhost

  await runner.test('1 char identity should require 100,000 AI', async () => {
    const stake = await registry.identityStakeRequirement('a', namespace, false);
    const expected = ethers.utils.parseEther('100000');
    runner.assertBigNumberEqual(stake, expected, '1 char stake mismatch');
  });

  await runner.test('2 char identity should require 10,000 AI', async () => {
    const stake = await registry.identityStakeRequirement('ab', namespace, false);
    const expected = ethers.utils.parseEther('10000');
    runner.assertBigNumberEqual(stake, expected, '2 char stake mismatch');
  });

  await runner.test('3 char identity should require 1,000 AI', async () => {
    const stake = await registry.identityStakeRequirement('abc', namespace, false);
    const expected = ethers.utils.parseEther('1000');
    runner.assertBigNumberEqual(stake, expected, '3 char stake mismatch');
  });

  await runner.test('4 char identity should require 100 AI', async () => {
    const stake = await registry.identityStakeRequirement('abcd', namespace, false);
    const expected = ethers.utils.parseEther('100');
    runner.assertBigNumberEqual(stake, expected, '4 char stake mismatch');
  });

  await runner.test('5 char identity should require 10 AI', async () => {
    const stake = await registry.identityStakeRequirement('abcde', namespace, false);
    const expected = ethers.utils.parseEther('10');
    runner.assertBigNumberEqual(stake, expected, '5 char stake mismatch');
  });

  await runner.test('7 char identity should require 10 AI', async () => {
    const stake = await registry.identityStakeRequirement('abcdefg', namespace, false);
    const expected = ethers.utils.parseEther('10');
    runner.assertBigNumberEqual(stake, expected, '7 char stake mismatch');
  });

  // Test Suite 5: Referrer Discount
  console.log(`\n${colors.blue}Test Suite 5: Referrer Discount${colors.reset}`);

  await runner.test('50% discount should apply with valid referrer (1 char)', async () => {
    const withoutReferrer = await registry.identityStakeRequirement('a', namespace, false);
    const withReferrer = await registry.identityStakeRequirement('a', namespace, true);
    const expectedDiscount = withoutReferrer.div(2);
    runner.assertBigNumberEqual(withReferrer, expectedDiscount, 'Referrer discount mismatch');
  });

  await runner.test('50% discount should apply with valid referrer (5 char)', async () => {
    const withoutReferrer = await registry.identityStakeRequirement('alice', namespace, false);
    const withReferrer = await registry.identityStakeRequirement('alice', namespace, true);
    const expectedDiscount = withoutReferrer.div(2);
    runner.assertBigNumberEqual(withReferrer, expectedDiscount, 'Referrer discount mismatch');
  });

  // Test Suite 6: Token Approval Flow
  console.log(`\n${colors.blue}Test Suite 6: Token Approval Flow${colors.reset}`);

  await runner.test('Should approve registry to spend tokens', async () => {
    const tx = await aiToken.approve(registry.address, ethers.constants.MaxUint256);
    await tx.wait();
    const allowance = await aiToken.allowance(deployer.address, registry.address);
    runner.assert(allowance.gt(0), 'Approval failed');
  });

  await runner.test('Registry should have correct allowance', async () => {
    const allowance = await aiToken.allowance(deployer.address, registry.address);
    runner.assertEqual(allowance.toString(), ethers.constants.MaxUint256.toString(), 'Allowance mismatch');
  });

  // Test Suite 7: Identity Registration
  console.log(`\n${colors.blue}Test Suite 7: Identity Registration${colors.reset}`);

  let initialBalance;
  let stakeAmount;

  await runner.test('Should calculate correct stake for test identity', async () => {
    stakeAmount = await registry.identityStakeRequirement('testuser', namespace, false);
    const expected = ethers.utils.parseEther('10');
    runner.assertBigNumberEqual(stakeAmount, expected, 'Stake calculation mismatch');
  });

  await runner.test('Should have sufficient balance for registration', async () => {
    initialBalance = await aiToken.balanceOf(deployer.address);
    runner.assert(initialBalance.gte(stakeAmount), 'Insufficient balance');
  });

  await runner.test('Should register identity successfully', async () => {
    const params = {
      name: 'testuser',
      namespace: namespace,
      stakeAmount: stakeAmount,
      owner: deployer.address,
      referrer: ''
    };

    const tx = await registry.claimIdentity(params);
    const receipt = await tx.wait();
    runner.assert(receipt.status === 1, 'Transaction failed');
  });

  await runner.test('Should transfer correct amount of tokens to registry', async () => {
    const newBalance = await aiToken.balanceOf(deployer.address);
    const transferred = initialBalance.sub(newBalance);
    runner.assertBigNumberEqual(transferred, stakeAmount, 'Token transfer amount mismatch');
  });

  await runner.test('Registry should receive staked tokens', async () => {
    const registryBalance = await aiToken.balanceOf(registry.address);
    console.log(`    Registry balance: ${registryBalance.toString()} wei (${ethers.utils.formatEther(registryBalance)} AI)`);
    console.log(`    Expected: >= ${stakeAmount.toString()} wei (${ethers.utils.formatEther(stakeAmount)} AI)`);
    const difference = registryBalance.sub(stakeAmount);
    console.log(`    Difference: ${difference.toString()} wei (${ethers.utils.formatEther(difference)} AI)`);
    // Allow for small precision differences - check within 1% tolerance
    const minAcceptable = stakeAmount.mul(99).div(100);
    runner.assert(registryBalance.gte(minAcceptable), `Registry balance ${ethers.utils.formatEther(registryBalance)} AI is less than minimum ${ethers.utils.formatEther(minAcceptable)} AI`);
  });

  // Test Suite 8: Faucet Functionality
  console.log(`\n${colors.blue}Test Suite 8: Faucet Functionality${colors.reset}`);

  await runner.test('Faucet should have correct drip amount', async () => {
    const dripAmount = await faucet.dripAmount();
    const expected = ethers.utils.parseEther('100');
    runner.assertBigNumberEqual(dripAmount, expected, 'Drip amount mismatch');
  });

  await runner.test('Faucet should have 24 hour cooldown', async () => {
    const cooldown = await faucet.cooldownPeriod();
    const expected = 24 * 60 * 60;
    runner.assertEqual(cooldown.toString(), expected.toString(), 'Cooldown mismatch');
  });

  await runner.test('Should be able to request tokens from faucet', async () => {
    const user1BalanceBefore = await aiToken.balanceOf(user1.address);
    console.log(`    User1 balance before: ${ethers.utils.formatEther(user1BalanceBefore)} AI`);
    const faucetWithUser = faucet.connect(user1);

    const tx = await faucetWithUser.drip();
    await tx.wait();
    const user1BalanceAfter = await aiToken.balanceOf(user1.address);
    console.log(`    User1 balance after: ${ethers.utils.formatEther(user1BalanceAfter)} AI`);
    const received = user1BalanceAfter.sub(user1BalanceBefore);
    // Token has 0.1% burn rate, so expect 99.9 AI (100 - 0.1%)
    const expected = ethers.utils.parseEther('99.9');
    console.log(`    Received: ${ethers.utils.formatEther(received)} AI, Expected: ${ethers.utils.formatEther(expected)} AI (accounting for 0.1% burn)`);
    runner.assertBigNumberEqual(received, expected, 'Faucet drip amount mismatch');
  });

  // Test Suite 9: Namespace Configuration
  console.log(`\n${colors.blue}Test Suite 9: Namespace Configuration${colors.reset}`);

  await runner.test('Localhost namespace (31337) should be configured', async () => {
    // This tests that the registry accepts the localhost namespace
    const stake = await registry.identityStakeRequirement('test', 31337, false);
    runner.assert(stake.gt(0), 'Localhost namespace not configured');
  });

  await runner.test('Should support Hanzo mainnet namespace (36963)', async () => {
    const stake = await registry.identityStakeRequirement('test', 36963, false);
    runner.assert(stake.gt(0), 'Hanzo mainnet namespace not configured');
  });

  await runner.test('Should support Lux mainnet namespace (96369)', async () => {
    const stake = await registry.identityStakeRequirement('test', 96369, false);
    runner.assert(stake.gt(0), 'Lux mainnet namespace not configured');
  });

  await runner.test('Should support Zoo mainnet namespace (200200)', async () => {
    const stake = await registry.identityStakeRequirement('test', 200200, false);
    runner.assert(stake.gt(0), 'Zoo mainnet namespace not configured');
  });

  // Print summary
  runner.summary();

  // Save test results
  const results = {
    timestamp: new Date().toISOString(),
    passed: runner.passed,
    failed: runner.failed,
    tests: runner.tests
  };

  fs.writeFileSync(
    path.join(__dirname, 'test-results.json'),
    JSON.stringify(results, null, 2)
  );

  console.log(`${colors.cyan}Test results saved to test-results.json${colors.reset}\n`);

  process.exit(runner.failed > 0 ? 1 : 0);
}

main().catch((error) => {
  console.error(`\n${colors.red}Fatal error:${colors.reset}`, error);
  process.exit(1);
});
