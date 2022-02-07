// SPDX-License-Identifier: CC0-1.0
pragma solidity ^0.8.0;

// interfaces
import "@lukso/universalprofile-smart-contracts/contracts/LSP7DigitalAsset/ILSP7DigitalAsset.sol";
import "./ICardMarket.sol";

// modules
import "@openzeppelin/contracts/utils/Context.sol";
import "@lukso/universalprofile-smart-contracts/contracts/LSP8IdentifiableDigitalAsset/LSP8IdentifiableDigitalAsset.sol";

abstract contract CardMarket is
    Context,
    LSP8IdentifiableDigitalAssetCore,
    ICardMarket
{
    //
    // --- Storage
    //

    mapping(bytes32 => MarketState) private marketStateForTokenId;

    //
    // --- Market queries
    //

    function marketFor(bytes32 tokenId)
        public
        view
        override
        returns (MarketState memory)
    {
        MarketState storage market = marketStateForTokenId[tokenId];
        require(market.minimumAmount > 0, "CardMarket: no market for tokenId");

        return market;
    }

    //
    // --- Market logic
    //

    function setMarketFor(
        bytes32 tokenId,
        address acceptedToken,
        uint256 minimumAmount
    ) public override {
        require(
            tokenOwnerOf(tokenId) == _msgSender(),
            "CardMarket: can not set market, caller is not the owner of token"
        );
        require(minimumAmount > 0, "CardMarket: minimumAmount must be set");

        marketStateForTokenId[tokenId] = MarketState({
            minimumAmount: minimumAmount,
            acceptedToken: acceptedToken
        });

        emit MarketSet(tokenId, acceptedToken, minimumAmount);
    }

    function removeMarketFor(bytes32 tokenId) public override {
        require(
            tokenOwnerOf(tokenId) == _msgSender(),
            "CardMarket: can not remove market, caller is not the owner of token"
        );
        MarketState storage market = marketStateForTokenId[tokenId];
        require(market.minimumAmount > 0, "CardMarket: no market for tokenId");

        delete marketStateForTokenId[tokenId];

        emit MarketRemove(tokenId);
    }

    function buyFromMarket(bytes32 tokenId, uint256 amount)
        public
        payable
        override
    {
        MarketState memory market = marketStateForTokenId[tokenId];
        require(market.minimumAmount > 0, "CardMarket: no market for tokenId");
        require(
            market.minimumAmount <= amount,
            "CardMarket: amount is less than minimum amount"
        );

        address buyer = _msgSender();
        address tokenOwner = tokenOwnerOf(tokenId);

        delete marketStateForTokenId[tokenId];

        if (market.acceptedToken == address(0)) {
            require(msg.value == amount, "CardMarket: buy amount incorrect");
            // solhint-disable-next-line avoid-low-level-calls
            (bool success, ) = payable(tokenOwner).call{ value: amount }("");
            require(success, "CardMarket: transfer failed");
        } else {
            require(
                msg.value == 0,
                "CardMarket: buy with token included native coin"
            );
            ILSP7DigitalAsset(market.acceptedToken).transfer(
                buyer,
                tokenOwner,
                amount,
                true,
                ""
            );
        }

        _transfer(tokenOwner, buyer, tokenId, true, "");

        emit MarketBuy(tokenId, buyer, amount);
    }

    //
    // --- Internal overrides
    //

    function _transfer(
        address from,
        address to,
        bytes32 tokenId,
        bool force,
        bytes memory data
    ) internal virtual override {
        delete marketStateForTokenId[tokenId];

        super._transfer(from, to, tokenId, force, data);
    }

    function _burn(bytes32 tokenId, bytes memory data)
        internal
        virtual
        override
    {
        delete marketStateForTokenId[tokenId];

        super._burn(tokenId, data);
    }
}
