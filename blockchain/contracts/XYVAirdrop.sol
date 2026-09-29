// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract XYVAirdrop is Ownable {
    IERC20 public immutable token;

    uint256 public claimAmount;
    mapping(address => bool) public hasClaimed;

    event Claimed(address indexed user, uint256 amount);
    event ClaimAmountUpdated(uint256 amount);

    constructor(
        address tokenAddress,
        uint256 initialClaimAmount
    ) Ownable(msg.sender) {
        require(
            tokenAddress != address(0),
            "Invalid token"
        );

        require(
            initialClaimAmount > 0,
            "Invalid claim amount"
        );

        token = IERC20(tokenAddress);
        claimAmount = initialClaimAmount;
    }

    function claim() external {
        require(
            !hasClaimed[msg.sender],
            "Already claimed"
        );

        require(
            token.balanceOf(address(this)) >= claimAmount,
            "Insufficient airdrop balance"
        );

        hasClaimed[msg.sender] = true;

        require(
            token.transfer(msg.sender, claimAmount),
            "Transfer failed"
        );

        emit Claimed(msg.sender, claimAmount);
    }

    function setClaimAmount(
        uint256 newAmount
    ) external onlyOwner {
        require(
            newAmount > 0,
            "Invalid amount"
        );

        claimAmount = newAmount;

        emit ClaimAmountUpdated(newAmount);
    }

    function withdrawTokens(
        uint256 amount
    ) external onlyOwner {
        require(
            token.transfer(owner(), amount),
            "Transfer failed"
        );
    }
}