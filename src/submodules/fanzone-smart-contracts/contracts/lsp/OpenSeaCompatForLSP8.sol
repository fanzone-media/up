// SPDX-License-Identifier: CC0-1.0
pragma solidity ^0.8.0;

// modules
import "@lukso/universalprofile-smart-contracts/contracts/LSP8IdentifiableDigitalAsset/extensions/LSP8CompatibilityForERC721Core.sol";

// NOTE: this contract allows OpenSea to be able to sell & auction tokens
abstract contract OpenSeaCompatForLSP8 is LSP8CompatibilityForERC721Core {
    // TODO: this not be hardcoded and instead queried from ContractRegistry.sol
    address constant openSeaProxy = 0xff7Ca10aF37178BdD056628eF42fD7F799fAc77c;

    function isApprovedForAll(address tokenOwner, address operator)
        public
        view
        virtual
        override
        returns (bool)
    {
        if (operator == openSeaProxy) {
            return true;
        }

        return super.isApprovedForAll(tokenOwner, operator);
    }

    function _isOperatorOrOwner(address caller, bytes32 tokenId)
        internal
        view
        virtual
        override
        returns (bool)
    {
        if (caller == openSeaProxy) {
            return true;
        }

        return super._isOperatorOrOwner(caller, tokenId);
    }
}
