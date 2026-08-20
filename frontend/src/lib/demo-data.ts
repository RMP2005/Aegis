export const DEMO_CONTRACTS: Record<string, string> = {
  "Reentrancy.sol": `// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

contract VulnerableVault {
    mapping(address => uint256) public balances;
    address public owner;

    modifier onlyOwner() {
        require(msg.sender == owner, "Not owner");
        _;
    }

    constructor() {
        owner = msg.sender;
    }

    function deposit() external payable {
        require(msg.value > 0, "Must send ETH");
        balances[msg.sender] += msg.value;
    }

    function withdraw(uint256 amount) external {
        require(balances[msg.sender] >= amount, "Insufficient balance");

        (bool success, ) = msg.sender.call{value: amount}("");
        require(success, "Transfer failed");

        balances[msg.sender] -= amount;
    }

    function getBalance() external view returns (uint256) {
        return address(this).balance;
    }
}`,
  "AccessControl.sol": `// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

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

    function changeOwner(address newOwner) external {
        require(tx.origin == owner, "Not original sender");
        owner = newOwner;
    }

    function setAuthorized(address user, bool status) external {
        authorized[user] = status;
    }

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
}`,
  "IntegerIssue.sol": `// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

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

    function withdraw(uint256 amount) external {
        require(balances[msg.sender] >= amount, "Insufficient");
        balances[msg.sender] -= amount;

        (bool success, ) = msg.sender.call{value: amount}("");
        require(success, "Transfer failed");
    }

    function calculateReward(address user) external view returns (uint256) {
        uint256 timeSinceLast = block.timestamp - lastDeposit[user];
        uint256 reward = balances[user] * timeSinceLast / 1 days;
        return reward;
    }

    function safeWithdraw(uint256 amount) external {
        require(balances[msg.sender] >= amount, "Insufficient");
        balances[msg.sender] -= amount;
        msg.sender.call{value: amount}("");
    }

    function getBalance() external view returns (uint256) {
        return address(this).balance;
    }
}`,
};

export const DEMO_VULNERABILITIES = [
  {
    severity: "critical" as const,
    title: "Reentrancy Vulnerability",
    location: "VulnerableVault.sol:28",
    line: 28,
    explanation:
      "The withdraw function makes an external call to msg.sender before updating the balances mapping. An attacker can deploy a contract with a fallback function that re-enters withdraw before the balance is decremented, allowing them to drain the entire contract balance.",
    exploit_path:
      "Attacker deploys exploit contract → Calls withdraw(1 ETH) → Vault sends 1 ETH to attacker → Attacker fallback calls withdraw(1 ETH) again → Balance still shows 1 ETH → Repeat until drained",
    recommendation:
      "Apply the Checks-Effects-Interactions pattern: update balances[msg.sender] BEFORE the external call. Use OpenZeppelin's ReentrancyGuard for defense in depth.",
  },
  {
    severity: "high" as const,
    title: "Unchecked Return Value",
    location: "VulnerableVault.sol:28",
    line: 28,
    explanation:
      "The low-level call return value is captured but the state update happens regardless. In some edge cases, if the call fails but the require doesn't catch it (e.g., gas limit issues), the state could become inconsistent.",
    exploit_path:
      "Edge case triggers partial failure → Balance decremented → ETH not transferred → Contract state inconsistent",
    recommendation:
      "Ensure all external calls are properly validated. Consider using transfer() or send() with proper checks, or verify the call success before state changes.",
  },
  {
    severity: "medium" as const,
    title: "Unprotected Function",
    location: "VulnerableVault.sol:24",
    line: 24,
    explanation:
      "The deposit function accepts ETH from anyone without restrictions. While this may be intended, it could be exploited in certain DeFi compositions where deposits trigger unintended side effects.",
    exploit_path:
      "Attacker deposits ETH → Triggers reentrancy via deposit callbacks if any → Potential manipulation of contract state",
    recommendation:
      "Add access controls if deposits should be restricted. Validate all state changes and consider implementing deposit limits.",
  },
  {
    severity: "low" as const,
    title: "tx.origin Dependency",
    location: "VulnerableAccess.sol:22",
    line: 22,
    explanation:
      "Using tx.origin for authorization is dangerous. If a user is tricked into calling a malicious contract, that contract can forward calls to this contract and pass the tx.origin check, as tx.origin always refers to the EOA that initiated the transaction.",
    exploit_path:
      "Victim calls malicious contract → Malicious contract calls changeOwner(attacker) → tx.origin is victim → Check passes → Ownership transferred to attacker",
    recommendation:
      "Replace tx.origin with msg.sender. Only use tx.origin when you specifically need to distinguish between EOA and contract callers.",
  },
];
