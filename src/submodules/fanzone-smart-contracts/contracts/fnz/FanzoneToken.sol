// SPDX-License-Identifier: CC0-1.0
pragma solidity ^0.8.0;

// modules
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/security/Pausable.sol";
import "@lukso/universalprofile-smart-contracts/contracts/LSP7DigitalAsset/LSP7DigitalAsset.sol";
import "@lukso/universalprofile-smart-contracts/contracts/LSP7DigitalAsset/extensions/LSP7CappedSupply.sol";
import "@lukso/universalprofile-smart-contracts/contracts/LSP7DigitalAsset/extensions/LSP7CompatibilityForERC20.sol";
import "@lukso/universalprofile-smart-contracts/contracts/LSP4DigitalAssetMetadata/LSP4Compatibility.sol";

contract FanzoneToken is
    Pausable,
    LSP7CappedSupply,
    LSP7CompatibilityForERC20,
    LSP4Compatibility
{
    //
    // --- Initialize
    //

    constructor(
        string memory name,
        string memory symbol,
        uint256 tokenSupplyCap
    )
        LSP7CompatibilityForERC20(name, symbol, msg.sender)
        LSP7CappedSupply(tokenSupplyCap)
    {
        // TODO: do we want to enforce the deployer being a UniversalProfile?
        //
        // using force=true so that EOA and any contract may receive the tokens
        _mint(msg.sender, tokenSupplyCap, true, "");
    }

    //
    // --- Pause logic
    //

    function pause() public onlyOwner {
        _pause();
    }

    //
    // --- Internal Overrides
    //

    function _mint(
        address to,
        uint256 amount,
        bool force,
        bytes memory data
    ) internal virtual override(LSP7DigitalAssetCore, LSP7CappedSupply) {
        super._mint(to, amount, force, data);
    }
}
