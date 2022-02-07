// SPDX-License-Identifier: CC0-1.0
pragma solidity ^0.8.0;

//
// --- This file contains temporary code to support the change from old LSP4DigitalCertificate
//

import "@lukso/universalprofile-smart-contracts/contracts/LSP8IdentifiableDigitalAsset/LSP8IdentifiableDigitalAssetCore.sol";

// TODO: only here to satisfy current client expectation that token holders can be discovered
// directly from the contract (this is a leftover from LSP4DigitalCertificate)
import "@openzeppelin/contracts/utils/structs/EnumerableSet.sol";

abstract contract TemporaryLSP4Compatability is
    LSP8IdentifiableDigitalAssetCore
{
    //
    // --- Storage
    //

    // TODO: only here to satisfy current client expectation that token holders can be discovered
    // directly from the contract (this is a leftover from LSP4DigitalCertificate)
    using EnumerableSet for EnumerableSet.AddressSet;
    EnumerableSet.AddressSet private _tokenHolders;

    //
    // --- Queries
    //

    /**
     * @dev Returns a bytes32 array of all token holder addresses
     */
    function allTokenHolders() public view returns (bytes32[] memory) {
        // TODO: only here to satisfy current client expectation that token holders can be discovered
        // directly from the contract (this is a leftover from LSP4DigitalCertificate)
        return _tokenHolders._inner._values;
    }

    //
    // --- Overrides
    //

    function _transfer(
        address from,
        address to,
        bytes32 tokenId,
        bool force,
        bytes memory data
    ) internal virtual override {
        super._transfer(from, to, tokenId, force, data);

        // TODO: only here to satisfy current client expectation that token holders can be discovered
        // directly from the contract (this is a leftover from LSP4DigitalCertificate)
        _tokenHolders.add(to);
        if (balanceOf(from) == 0) {
            _tokenHolders.remove(from);
        }
    }

    function _mint(
        address to,
        bytes32 tokenId,
        bool force,
        bytes memory data
    ) internal virtual override {
        super._mint(to, tokenId, force, data);

        // TODO: only here to satisfy current client expectation that token holders can be discovered
        // directly from the contract (this is a leftover from LSP4DigitalCertificate)
        _tokenHolders.add(to);
    }
}
