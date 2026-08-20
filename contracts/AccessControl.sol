// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

/**
 * @title VulnerableAccess
 * @notice Demonstrates common access control vulnerabilities
 * @dev DO NOT use in production
 */
contract VulnerableAccess {
    address public owner;
    mapping(address => bool) public authorized;
    mapping(address => uint256) public balances;

    modifier onlyOwner() {
        require(msg.sender == owner, "Not owner");
        _;
    }

    constructor() {
        owner = msg.sender;
    }

    // VULNERABILITY: tx.origin used for authorization
    function changeOwner(address newOwner) external {
        require(tx.origin == owner, "Not original sender");
        owner = newOwner;
    }

    // VULNERABILITY: No access control
    function setAuthorized(address user, bool status) external {
        authorized[user] = status;
    }

    // VULNERABILITY: Unprotected selfdestruct
    function destroy() external {
        selfdestruct(payable(msg.sender));
    }

    function deposit() external payable {
        balances[msg.sender] += msg.value;
    }

    function withdraw() external {
        require(balances[msg.sender] > 0, "No balance");
        uint256 amount = balances[msg.sender];
        balances[msg.sender] = 0;
        (bool success, ) = msg.sender.call{value: amount}("");
        require(success, "Transfer failed");
    }
}
