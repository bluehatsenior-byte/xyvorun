// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {ERC20} from "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import {ERC20Burnable} from "@openzeppelin/contracts/token/ERC20/extensions/ERC20Burnable.sol";

contract XyvorunToken is ERC20, ERC20Burnable {
    uint256 public constant MAX_SUPPLY =
        1_000_000_000 * 10 ** 18;

    constructor() ERC20("Xyvorun Token", "XYV") {
        _mint(msg.sender, MAX_SUPPLY);
    }
}