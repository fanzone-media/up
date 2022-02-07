// SPDX-License-Identifier: CC0-1.0
pragma solidity ^0.8.0;

// interfaces
import "./ICardAuction.sol";
import "@lukso/universalprofile-smart-contracts/contracts/LSP7DigitalAsset/ILSP7DigitalAsset.sol";

// modules
import "@openzeppelin/contracts/utils/Context.sol";
import "@lukso/universalprofile-smart-contracts/contracts/LSP8IdentifiableDigitalAsset/LSP8IdentifiableDigitalAsset.sol";

contract CardAuction is Context, ICardAuction {
    //
    // --- Constants
    //

    uint256 private constant AUCTION_MIN_DURATION = 1 days;
    uint256 private constant AUCTION_MAX_DURATION = 30 days;

    //
    // --- Storage
    //

    mapping(address => mapping(bytes32 => CardAuctionState))
        private auctionStateForTokenId;
    mapping(address => mapping(address => uint256))
        private claimableAmountsForAccount;

    //
    // --- Auction queries
    //

    function auctionDurationRange()
        public
        pure
        override
        returns (uint256, uint256)
    {
        return (AUCTION_MIN_DURATION, AUCTION_MAX_DURATION);
    }

    function auctionFor(address lsp8Contract, bytes32 tokenId)
        public
        view
        override
        returns (CardAuctionState memory)
    {
        CardAuctionState storage auction = auctionStateForTokenId[lsp8Contract][
            tokenId
        ];
        require(auction.minimumBid > 0, "CardAuction: no auction for tokenId");

        return auction;
    }

    //
    // --- Auction logic
    //

    function openAuctionFor(
        address lsp8Contract,
        bytes32 tokenId,
        address acceptedToken,
        uint256 minimumBid,
        uint256 duration
    ) public override {
        address seller = _msgSender();
        CardAuctionState storage auction = auctionStateForTokenId[lsp8Contract][
            tokenId
        ];
        require(
            auction.minimumBid == 0,
            "CardAuction: auction exists for tokenId"
        );
        require(minimumBid > 0, "CardAuction: minimumBid must be set");
        require(
            duration >= AUCTION_MIN_DURATION &&
                duration <= AUCTION_MAX_DURATION,
            "CardAuction: invalid duration"
        );

        // solhint-disable-next-line not-rely-on-time
        uint256 endTime = block.timestamp + duration;
        auctionStateForTokenId[lsp8Contract][tokenId] = CardAuctionState({
            seller: seller,
            lsp8Contract: lsp8Contract,
            acceptedToken: acceptedToken,
            minimumBid: minimumBid,
            endTime: endTime,
            activeBidder: address(0),
            activeBidAmount: 0
        });

        ILSP8IdentifiableDigitalAsset(lsp8Contract).transfer(
            seller,
            address(this),
            tokenId,
            true,
            ""
        );

        emit AuctionOpen(
            lsp8Contract,
            tokenId,
            acceptedToken,
            minimumBid,
            endTime
        );
    }

    function submitBid(
        address lsp8Contract,
        bytes32 tokenId,
        uint256 bidAmount
    ) public payable override {
        address bidder = _msgSender();
        CardAuctionState memory auction = auctionStateForTokenId[lsp8Contract][
            tokenId
        ];
        require(auction.minimumBid > 0, "CardAuction: no auction for tokenId");
        require(
            // TODO: assuming we want to use minimumBid as the threshold step between bids
            auction.activeBidAmount + auction.minimumBid <= bidAmount,
            "CardAuction: bid amount less than minimum bid"
        );
        require(
            // solhint-disable-next-line not-rely-on-time
            auction.endTime > block.timestamp,
            "CardAuction: auction is not active"
        );

        if (auction.activeBidAmount > 0) {
            _updateClaimableAmount(
                auction.acceptedToken,
                auction.activeBidder,
                auction.activeBidAmount
            );
        }

        // update auctions active bid
        auctionStateForTokenId[lsp8Contract][tokenId]
            .activeBidAmount = bidAmount;
        auctionStateForTokenId[lsp8Contract][tokenId].activeBidder = bidder;

        if (auction.acceptedToken == address(0)) {
            require(
                msg.value == bidAmount,
                "CardAuction: bid amount incorrect"
            );
        } else {
            require(
                msg.value == 0,
                "CardAuction: bid with token included native coin"
            );
            ILSP7DigitalAsset(auction.acceptedToken).transfer(
                bidder,
                address(this),
                bidAmount,
                true,
                ""
            );
        }

        emit AuctionBidSubmit(lsp8Contract, tokenId, bidder, bidAmount);
    }

    function cancelAuctionFor(address lsp8Contract, bytes32 tokenId)
        public
        override
    {
        CardAuctionState memory auction = auctionStateForTokenId[lsp8Contract][
            tokenId
        ];
        require(auction.minimumBid > 0, "CardAuction: no auction for tokenId");
        require(
            auction.seller == _msgSender(),
            "CardAuction: can not cancel auction for someone else"
        );
        require(
            auction.activeBidder == address(0),
            "CardAuction: can not cancel auction with bidder"
        );

        delete auctionStateForTokenId[lsp8Contract][tokenId];

        ILSP8IdentifiableDigitalAsset(auction.lsp8Contract).transfer(
            address(this),
            auction.seller,
            tokenId,
            true,
            ""
        );

        emit AuctionCancel(lsp8Contract, tokenId);
    }

    function closeAuctionFor(address lsp8Contract, bytes32 tokenId)
        public
        override
    {
        CardAuctionState memory auction = auctionStateForTokenId[lsp8Contract][
            tokenId
        ];
        require(auction.minimumBid > 0, "CardAuction: no auction for tokenId");
        require(
            // solhint-disable-next-line not-rely-on-time
            auction.endTime <= block.timestamp,
            "CardAuction: auction is active"
        );

        delete auctionStateForTokenId[lsp8Contract][tokenId];

        if (auction.activeBidAmount > 0) {
            _updateClaimableAmount(
                auction.acceptedToken,
                auction.seller,
                auction.activeBidAmount
            );

            ILSP8IdentifiableDigitalAsset(auction.lsp8Contract).transfer(
                address(this),
                auction.activeBidder,
                tokenId,
                true,
                ""
            );
        }

        emit AuctionClose(
            lsp8Contract,
            tokenId,
            auction.activeBidder,
            auction.activeBidAmount
        );
    }

    function _updateClaimableAmount(
        address token,
        address account,
        uint256 amount
    ) private {
        claimableAmountsForAccount[account][token] =
            claimableAmountsForAccount[account][token] +
            amount;
    }

    //
    // --- Claimable queries
    //

    function claimableAmountsFor(address account, address token)
        public
        view
        override
        returns (uint256)
    {
        return claimableAmountsForAccount[account][token];
    }

    //
    // --- Claimable logic
    //

    function claimToken(address account, address token)
        public
        override
        returns (uint256)
    {
        uint256 amount = claimableAmountsForAccount[account][token];
        require(amount > 0, "CardAuction: no claimable amount");

        delete claimableAmountsForAccount[account][token];

        if (token == address(0)) {
            // solhint-disable-next-line avoid-low-level-calls
            (bool success, ) = payable(account).call{ value: amount }("");
            require(success, "CardAuction: transfer failed");
        } else {
            ILSP7DigitalAsset(token).transfer(
                address(this),
                account,
                amount,
                true,
                ""
            );
        }

        return amount;
    }
}
