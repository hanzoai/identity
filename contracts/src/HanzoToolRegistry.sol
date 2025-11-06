// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";
import "@openzeppelin/contracts-upgradeable/proxy/utils/UUPSUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/access/Ownable2StepUpgradeable.sol";

interface HanzoRegistryInterface {
    function ownerOf(string calldata identity) external view returns (address);
}

/**
 * @title HanzoToolRegistry
 * @dev Registry for linking tools, agents, and MCP servers to Hanzo identities
 *
 * Allows identity owners to register and manage their tools/agents on-chain.
 * Provides verification and resolution for the Hanzo ecosystem.
 */
contract HanzoToolRegistry is Initializable, UUPSUpgradeable, Ownable2StepUpgradeable {

    // Structs
    struct ToolMetadata {
        string name;              // @hanzo/audio-insight
        string identity;          // @hanzo (mainnet) or @alice.hanzotest (testnet)
        string repository;        // github.com/hanzoai/tools
        string path;              // /agents/audio-insight
        string version;           // 1.0.0
        string license;           // MIT
        string category;          // Education
        string description;       // Tool description
        string codeHash;          // git commit SHA or IPFS hash
        string[] tags;            // ["audio", "analysis"]
        string mcpCommand;        // MCP command
        string[] mcpArgs;         // MCP arguments
        bool active;              // Is tool active/published
        uint256 createdAt;        // Registration timestamp
        uint256 updatedAt;        // Last update timestamp
    }

    // State variables
    HanzoRegistryInterface public hanzoRegistry;

    // Mappings
    mapping(string => ToolMetadata) private _tools;           // name → metadata
    mapping(string => string[]) private _identityTools;       // identity → tool names
    mapping(string => mapping(string => uint256)) private _identityToolIndex; // identity → tool name → index
    mapping(string => uint256) private _toolVersionCounter;   // name → version count

    // Events
    event ToolRegistered(
        string indexed name,
        string indexed identity,
        string repository,
        string version
    );
    event ToolUpdated(
        string indexed name,
        string version,
        string codeHash
    );
    event ToolDeactivated(string indexed name);
    event ToolActivated(string indexed name);
    event ToolTransferred(
        string indexed name,
        string indexed fromIdentity,
        string indexed toIdentity
    );

    // Errors
    error Unauthorized();
    error ToolAlreadyExists(string name);
    error ToolNotFound(string name);
    error InvalidIdentity(string identity);
    error InvalidToolName(string name);

    /// @custom:oz-upgrades-unsafe-allow constructor
    constructor() {
        _disableInitializers();
    }

    function initialize(
        address owner_,
        address hanzoRegistry_
    ) public initializer {
        __Ownable_init();
        __Ownable2Step_init();
        __UUPSUpgradeable_init();
        _transferOwnership(owner_);

        hanzoRegistry = HanzoRegistryInterface(hanzoRegistry_);
    }

    function _authorizeUpgrade(address newImplementation) internal override onlyOwner {}

    /**
     * @dev Register a new tool/agent
     */
    function registerTool(
        string calldata name,
        string calldata identity,
        string calldata repository,
        string calldata path,
        string calldata version,
        string calldata license,
        string calldata category,
        string calldata description,
        string calldata codeHash,
        string[] calldata tags,
        string calldata mcpCommand,
        string[] calldata mcpArgs
    ) external {
        // Verify caller owns the identity
        address identityOwner = hanzoRegistry.ownerOf(identity);
        if (identityOwner != msg.sender) revert Unauthorized();

        // Check if tool already exists
        if (_tools[name].createdAt != 0) revert ToolAlreadyExists(name);

        // Validate tool name format (@namespace/tool-name)
        if (!_validToolName(name)) revert InvalidToolName(name);

        // Create tool metadata
        _tools[name] = ToolMetadata({
            name: name,
            identity: identity,
            repository: repository,
            path: path,
            version: version,
            license: license,
            category: category,
            description: description,
            codeHash: codeHash,
            tags: tags,
            mcpCommand: mcpCommand,
            mcpArgs: mcpArgs,
            active: true,
            createdAt: block.timestamp,
            updatedAt: block.timestamp
        });

        // Add to identity's tools
        _identityTools[identity].push(name);
        _identityToolIndex[identity][name] = _identityTools[identity].length - 1;
        _toolVersionCounter[name] = 1;

        emit ToolRegistered(name, identity, repository, version);
    }

    /**
     * @dev Update tool metadata and version
     */
    function updateTool(
        string calldata name,
        string calldata version,
        string calldata codeHash,
        string calldata description,
        string[] calldata tags
    ) external {
        ToolMetadata storage tool = _tools[name];
        if (tool.createdAt == 0) revert ToolNotFound(name);

        // Verify caller owns the identity
        address identityOwner = hanzoRegistry.ownerOf(tool.identity);
        if (identityOwner != msg.sender) revert Unauthorized();

        // Update metadata
        tool.version = version;
        tool.codeHash = codeHash;
        tool.description = description;
        tool.tags = tags;
        tool.updatedAt = block.timestamp;

        _toolVersionCounter[name]++;

        emit ToolUpdated(name, version, codeHash);
    }

    /**
     * @dev Deactivate a tool (mark as deprecated/removed)
     */
    function deactivateTool(string calldata name) external {
        ToolMetadata storage tool = _tools[name];
        if (tool.createdAt == 0) revert ToolNotFound(name);

        // Verify caller owns the identity
        address identityOwner = hanzoRegistry.ownerOf(tool.identity);
        if (identityOwner != msg.sender) revert Unauthorized();

        tool.active = false;
        tool.updatedAt = block.timestamp;

        emit ToolDeactivated(name);
    }

    /**
     * @dev Reactivate a tool
     */
    function activateTool(string calldata name) external {
        ToolMetadata storage tool = _tools[name];
        if (tool.createdAt == 0) revert ToolNotFound(name);

        // Verify caller owns the identity
        address identityOwner = hanzoRegistry.ownerOf(tool.identity);
        if (identityOwner != msg.sender) revert Unauthorized();

        tool.active = true;
        tool.updatedAt = block.timestamp;

        emit ToolActivated(name);
    }

    /**
     * @dev Transfer tool ownership to another identity
     */
    function transferTool(
        string calldata name,
        string calldata toIdentity
    ) external {
        ToolMetadata storage tool = _tools[name];
        if (tool.createdAt == 0) revert ToolNotFound(name);

        string memory fromIdentity = tool.identity;

        // Verify caller owns the current identity
        address fromOwner = hanzoRegistry.ownerOf(fromIdentity);
        if (fromOwner != msg.sender) revert Unauthorized();

        // Verify toIdentity exists
        address toOwner = hanzoRegistry.ownerOf(toIdentity);
        if (toOwner == address(0)) revert InvalidIdentity(toIdentity);

        // Remove from old identity
        uint256 index = _identityToolIndex[fromIdentity][name];
        uint256 lastIndex = _identityTools[fromIdentity].length - 1;
        if (index != lastIndex) {
            string memory lastTool = _identityTools[fromIdentity][lastIndex];
            _identityTools[fromIdentity][index] = lastTool;
            _identityToolIndex[fromIdentity][lastTool] = index;
        }
        _identityTools[fromIdentity].pop();
        delete _identityToolIndex[fromIdentity][name];

        // Add to new identity
        _identityTools[toIdentity].push(name);
        _identityToolIndex[toIdentity][name] = _identityTools[toIdentity].length - 1;

        // Update tool
        tool.identity = toIdentity;
        tool.updatedAt = block.timestamp;

        emit ToolTransferred(name, fromIdentity, toIdentity);
    }

    // View functions

    /**
     * @dev Get tool metadata
     */
    function getTool(string calldata name) external view returns (ToolMetadata memory) {
        return _tools[name];
    }

    /**
     * @dev Get all tools for an identity
     */
    function getIdentityTools(string calldata identity) external view returns (string[] memory) {
        return _identityTools[identity];
    }

    /**
     * @dev Get tool count for an identity
     */
    function getIdentityToolCount(string calldata identity) external view returns (uint256) {
        return _identityTools[identity].length;
    }

    /**
     * @dev Check if tool exists and is active
     */
    function isToolActive(string calldata name) external view returns (bool) {
        return _tools[name].createdAt != 0 && _tools[name].active;
    }

    /**
     * @dev Get tool version count
     */
    function getToolVersionCount(string calldata name) external view returns (uint256) {
        return _toolVersionCounter[name];
    }

    /**
     * @dev Validate tool name format
     * Must be @namespace/tool-name
     */
    function _validToolName(string calldata name) private pure returns (bool) {
        bytes memory b = bytes(name);
        if (b.length < 3) return false; // Minimum @x/y

        // Must start with @
        if (b[0] != 0x40) return false; // @

        // Must contain /
        bool foundSlash = false;
        for (uint256 i = 1; i < b.length; i++) {
            if (b[i] == 0x2F) { // /
                foundSlash = true;
                break;
            }
        }

        return foundSlash;
    }
}
