// SPDX-License-Identifier: CC0-1.0
pragma solidity ^0.8.0;

// modules
import "@lukso/universalprofile-smart-contracts/contracts/LSP8IdentifiableDigitalAsset/LSP8IdentifiableDigitalAsset.sol";
import "../card/CardMarket.sol";

/* solhint-disable no-empty-blocks */

contract TestCardMarket is LSP8IdentifiableDigitalAsset, CardMarket {
    constructor(string memory name, string memory symbol)
        LSP8IdentifiableDigitalAsset(name, symbol, msg.sender)
    {}

    function mint(
        address to,
        bytes32 tokenId,
        bool force,
        bytes memory data
    ) public {
        _mint(to, tokenId, force, data);
    }

    function burn(bytes32 tokenId, bytes memory data) public {
        _burn(tokenId, data);
    }

    function _transfer(
        address from,
        address to,
        bytes32 tokenId,
        bool force,
        bytes memory data
    ) internal virtual override(LSP8IdentifiableDigitalAssetCore, CardMarket) {
        super._transfer(from, to, tokenId, force, data);
    }

    function _burn(bytes32 tokenId, bytes memory data)
        internal
        virtual
        override(LSP8IdentifiableDigitalAssetCore, CardMarket)
    {
        super._burn(tokenId, data);
    }
}
