// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "forge-std/Script.sol";
import "../lux/standard/src/AIToken.sol";
import "../lux/standard/src/HanzoRegistry.sol";
import "../lux/standard/src/AIFaucet.sol";
import "@openzeppelin/contracts/proxy/ERC1967/ERC1967Proxy.sol";

contract DeployLocal is Script {
    function run() external {
        uint256 deployerPrivateKey = vm.envOr("PRIVATE_KEY", uint256(0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80));
        address deployer = vm.addr(deployerPrivateKey);

        vm.startBroadcast(deployerPrivateKey);

        console.log("Deploying from:", deployer);
        console.log("Balance:", deployer.balance / 1e18, "ETH");

        // 1. Deploy AIToken
        console.log("\n1. Deploying AIToken...");
        AIToken aiToken = new AIToken(deployer);
        console.log("AIToken deployed at:", address(aiToken));

        // 2. Deploy simple NFT (minimal implementation for testing)
        console.log("\n2. Deploying minimal NFT...");
        address hanzoNft = address(0); // We'll use zero address for now
        console.log("HanzoNft at:", hanzoNft);

        // 3. Deploy HanzoRegistry implementation
        console.log("\n3. Deploying HanzoRegistry implementation...");
        HanzoRegistry registryImpl = new HanzoRegistry();
        console.log("HanzoRegistry implementation:", address(registryImpl));

        // 4. Encode initialize call
        bytes memory initData = abi.encodeWithSelector(
            HanzoRegistry.initialize.selector,
            deployer,
            address(aiToken),
            hanzoNft
        );

        // 5. Deploy ERC1967Proxy
        console.log("\n4. Deploying ERC1967Proxy...");
        ERC1967Proxy proxy = new ERC1967Proxy(address(registryImpl), initData);
        console.log("HanzoRegistry proxy:", address(proxy));

        // 6. Deploy AIFaucet
        console.log("\n5. Deploying AIFaucet...");
        uint256 dripAmount = 100 * 1e18; // 100 AI
        uint256 cooldownPeriod = 24 * 60 * 60; // 24 hours
        uint256 maxDailyLimit = 500 * 1e18; // 500 AI

        AIFaucet faucet = new AIFaucet(
            address(aiToken),
            dripAmount,
            cooldownPeriod,
            maxDailyLimit
        );
        console.log("AIFaucet deployed at:", address(faucet));

        // 7. Transfer tokens to faucet
        console.log("\n6. Transferring AI tokens to faucet...");
        uint256 faucetAmount = 100000 * 1e18; // 100,000 AI
        aiToken.transfer(address(faucet), faucetAmount);
        console.log("Transferred 100,000 AI to faucet");

        vm.stopBroadcast();

        // Print summary
        console.log("\n=== Deployment Summary ===");
        console.log("Network Chain ID: 31337");
        console.log("Deployer:", deployer);
        console.log("AIToken:", address(aiToken));
        console.log("HanzoNft:", hanzoNft);
        console.log("HanzoRegistry (Proxy):", address(proxy));
        console.log("HanzoRegistry (Implementation):", address(registryImpl));
        console.log("AIFaucet:", address(faucet));

        // Write addresses to file
        string memory addresses = string(abi.encodePacked(
            '{\n',
            '  "chainId": 31337,\n',
            '  "deployer": "', vm.toString(deployer), '",\n',
            '  "aiToken": "', vm.toString(address(aiToken)), '",\n',
            '  "hanzoNft": "', vm.toString(hanzoNft), '",\n',
            '  "registryProxy": "', vm.toString(address(proxy)), '",\n',
            '  "registryImpl": "', vm.toString(address(registryImpl)), '",\n',
            '  "faucet": "', vm.toString(address(faucet)), '"\n',
            '}\n'
        ));
        vm.writeFile("deployed-addresses.json", addresses);
        console.log("\nAddresses saved to deployed-addresses.json");
    }
}
