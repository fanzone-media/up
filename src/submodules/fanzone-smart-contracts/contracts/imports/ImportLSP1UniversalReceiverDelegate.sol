// SPDX-License-Identifier: CC0-1.0
pragma solidity ^0.8.0;

// modules
import "@lukso/universalprofile-smart-contracts/contracts/LSP1UniversalReceiver/LSP1UniversalReceiverDelegateUP/LSP1UniversalReceiverDelegateUP.sol";

/* solhint-disable no-empty-blocks */

// NOTE: need to make this an abstract class to get hardhat to compile it (and get typechain generated classes)
abstract contract ImportLSP1UniversalReceiverDelegateUP is
    LSP1UniversalReceiverDelegateUP
{

}
