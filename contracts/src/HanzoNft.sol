// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

/**
 * @title HanzoNft
 * @dev Simple ERC721 NFT for Hanzo identity system
 * Only the registry (minter) can mint tokens
 */
contract HanzoNft is ERC721, Ownable {
    uint256 private _tokenIdCounter;
    address public minter;

    event MinterUpdated(address indexed newMinter);

    constructor() ERC721("Hanzo Identity NFT", "HNZI") {
        _tokenIdCounter = 1; // Start from 1
    }

    /**
     * @dev Set the minter address (usually the registry contract)
     */
    function grantMinterRole(address _minter) external onlyOwner {
        minter = _minter;
        emit MinterUpdated(_minter);
    }

    /**
     * @dev Mint a new NFT to the specified address
     * Can only be called by the minter (registry)
     */
    function mint(address to) external returns (uint256) {
        require(msg.sender == minter, "HanzoNft: caller is not the minter");
        require(to != address(0), "HanzoNft: mint to zero address");

        uint256 tokenId = _tokenIdCounter;
        _tokenIdCounter++;

        _safeMint(to, tokenId);
        return tokenId;
    }

    /**
     * @dev Burn an NFT
     * Can only be called by the token owner or approved address
     */
    function burn(uint256 tokenId) external {
        require(_isApprovedOrOwner(msg.sender, tokenId), "HanzoNft: caller is not owner nor approved");
        _burn(tokenId);
    }
}
