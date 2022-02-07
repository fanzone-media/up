// SPDX-License-Identifier: CC0-1.0

pragma solidity ^0.8.0;

interface ICardToken {
    //
    // --- Token queries
    //

    /**
     * @dev Returns the number of tokens available to be minted.
     */
    function mintableSupply() external view returns (uint256);

    //
    // --- TokenId queries
    //

    /**
     * @dev Returns the score for a given `tokenId`.
     */
    function calculateScore(bytes32 tokenId) external returns (string memory);

    //
    // --- Unpacking logic
    //

    /**
     * @dev Mints a `tokenId` and transfers it to `to`.
     *
     * Returns the `mintableSupply` for the caller to know when it is no longer available for unpack
     * requests.
     *
     * Requirements:
     *
     * - `mintableSupply()` must be greater than zero.
     * - `tokenId` must not exist.
     * - `to` cannot be the zero address.
     *
     * Emits a {Transfer} event.
     */
    function unpackCard(address to, bytes32 tokenId) external returns (uint256);

    //
    // --- Owner logic
    //

    /*
     * @dev Creates a metadata contract (ERC725Y) for `tokenId`.
     *
     * Returns the created contract address.
     *
     * Requirements:
     *
     * - `tokenId` must exist.
     */
    function createMetadataFor(bytes32 tokenId) external returns (address);
}
