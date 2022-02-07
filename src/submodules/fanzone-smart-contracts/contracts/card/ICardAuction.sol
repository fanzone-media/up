// SPDX-License-Identifier: CC0-1.0

pragma solidity ^0.8.0;

//
// --- Structs
//

struct CardAuctionState {
    address seller;
    address lsp8Contract;
    address acceptedToken;
    uint256 minimumBid;
    uint256 endTime;
    address activeBidder;
    uint256 activeBidAmount;
}

interface ICardAuction {
    //
    // --- Events
    //

    event AuctionOpen(
        address indexed lsp8Contract,
        bytes32 indexed tokenId,
        address indexed acceptedToken,
        uint256 minimumBid,
        uint256 endTime
    );

    event AuctionBidSubmit(
        address indexed lsp8Contract,
        bytes32 indexed tokenId,
        address indexed bidder,
        uint256 bidAmount
    );

    event AuctionCancel(address indexed lsp8Contract, bytes32 indexed tokenId);

    event AuctionClose(
        address indexed lsp8Contract,
        bytes32 indexed tokenId,
        address indexed auctionWinner,
        uint256 bidAmount
    );

    //
    // --- Auction queries
    //

    function auctionDurationRange() external returns (uint256, uint256);

    function auctionFor(address lsp8Contract, bytes32 tokenId)
        external
        returns (CardAuctionState memory);

    //
    // --- Auction logic
    //

    function openAuctionFor(
        address lsp8Contract,
        bytes32 tokenId,
        address acceptedToken,
        uint256 minimumBid,
        uint256 duration
    ) external;

    function submitBid(
        address lsp8Contract,
        bytes32 tokenId,
        uint256 amount
    ) external payable;

    function cancelAuctionFor(address lsp8Contract, bytes32 tokenId) external;

    function closeAuctionFor(address lsp8Contract, bytes32 tokenId) external;

    //
    // --- Claimable queries
    //

    function claimableAmountsFor(address account, address token)
        external
        view
        returns (uint256);

    //
    // --- Claimable logic
    //

    function claimToken(address account, address token)
        external
        returns (uint256);
}
