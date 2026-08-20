// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

/**
 * @title VulnerableMath
 * @notice Demonstrates integer overflow/underflow issues
 * @dev DO NOT use in production
 */
contract VulnerableMath {
    mapping(address => uint256) public balances;
    mapping(address => uint256) public lastDeposit;
    address public owner;

    constructor() {
        owner = msg.sender;
    }

    function deposit() external payable {
        balances[msg.sender] += msg.value;
        lastDeposit[msg.sender] = block.timestamp;
    }

    // VULNERABILITY: Arithmetic underflow potential
    function withdraw(uint256 amount) external {
        require(balances[msg.sender] >= amount, "Insufficient");

        // Underflow possible if amount > balance in edge cases with assembly
        balances[msg.sender] -= amount;

        (bool success, ) = msg.sender.call{value: amount}("");
        require(success, "Transfer failed");
    }

    // VULNERABILITY: Unchecked arithmetic
    function calculateReward(address user) external view returns (uint256) {
        uint256 timeSinceLast = block.timestamp - lastDeposit[user];
        uint256 reward = balances[user] * timeSinceLast / 1 days;
        return reward;
    }

    // VULNERABILITY: Unchecked low-level call return
    function safeWithdraw(uint256 amount) external {
        require(balances[msg.sender] >= amount, "Insufficient");
        balances[msg.sender] -= amount;
        msg.sender.call{value: amount}(""); // Return value unchecked
    }

    function getBalance() external view returns (uint256) {
        return address(this).balance;
    }
}
