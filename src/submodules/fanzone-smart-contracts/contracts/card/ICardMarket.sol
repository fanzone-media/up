// SPDX-License-Identifier: CC0-1.0

pragma solidity ^0.8.0;

//
// --- Structs
//

struct MarketState {
    uint256 minimumAmount;
    address acceptedToken;
}

interface ICardMarket {
    //
    // --- Events
    //

    event MarketSet(
        bytes32 indexed tokenId,
        address indexed acceptedToken,
        uint256 amount
    );

    event MarketRemove(bytes32 indexed tokenId);

    event MarketBuy(
        bytes32 indexed tokenId,
        address indexed buyer,
        uint256 amount
    );

    //
    // --- Market queries
    //

    function marketFor(bytes32 tokenId) external returns (MarketState memory);

    //
    // --- Market logic
    //

    function setMarketFor(
        bytes32 tokenId,
        address acceptedToken,
        uint256 minimumAmount
    ) external;

    function removeMarketFor(bytes32 tokenId) external;

    function buyFromMarket(bytes32 tokenId, uint256 amount) external payable;
}
