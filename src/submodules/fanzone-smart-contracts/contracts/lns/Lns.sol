// SPDX-License-Identifier: CC0-1.0
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/security/Pausable.sol";
import "@lukso/universalprofile-smart-contracts/contracts/LSP8IdentifiableDigitalAsset/LSP8IdentifiableDigitalAsset.sol";
import "@lukso/universalprofile-smart-contracts/contracts/LSP8IdentifiableDigitalAsset/extensions/LSP8CompatibilityForERC721.sol";
import "../lsp/TemporaryLSP4Compatability.sol";

contract Lns is
    Pausable,
    LSP8CompatibilityForERC721,
    TemporaryLSP4Compatability
{
    uint256 public price;
    mapping(bytes1 => bool) private allowedChar;

    // events
    event PriceChanged(uint256 newPrice);
    event VanityNameSet(address addr, bytes32 vantiyName);
    using EnumerableSet for EnumerableSet.Bytes32Set;

    constructor(
        string memory name,
        string memory symbol,
        uint256 _price
    ) LSP8CompatibilityForERC721(name, symbol, msg.sender) {
        price = _price;
        _setAllowedChar();
    }

    function freeze() public onlyOwner {
        _pause();
    }

    function unFreeze() public onlyOwner {
        _unpause();
    }

    function setVanityName(address addr, bytes32 vanityName)
        public
        payable
        whenNotPaused
    {
        require(msg.value == price, "wrong amount sent");
        require(
            vanityName[4] != 0x00 && vanityName[15] == 0x00,
            "name should be between 5 to 15 characters long"
        );
        require(
            _ownedTokens[addr].length() == 0,
            "you already have a vanity name"
        );
        _inputValidation(vanityName);
        _mint(addr, vanityName, false, "");
        emit VanityNameSet(addr, vanityName);
    }

    function updatePrice(uint256 newPrice) public onlyOwner {
        price = newPrice;
        emit PriceChanged(price);
    }

    function _inputValidation(bytes32 vanityName) internal view {
        for (uint256 i = 0; i < 32; i++) {
            if (!allowedChar[vanityName[i]] && vanityName[i] != 0x00) {
                revert("character not allowed");
            }
        }
    }

    function _setAllowedChar() private {
        bytes26 allowedCharUc = "ABCDEFGHIGKLMNOPQRSTUVWXYZ";
        bytes26 allowedCharLc = "abcdefghijklmnopqrstuvwxyz";
        bytes10 allowedNum = "0123456789";
        bytes1 allowedSpecialChar = "_";

        for (uint256 i = 0; i < 26; i++) {
            allowedChar[allowedCharUc[i]] = true;
            allowedChar[allowedCharLc[i]] = true;
        }
        for (uint256 i = 0; i < 10; i++) {
            allowedChar[allowedNum[i]] = true;
        }
        allowedChar[allowedSpecialChar] = true;
    }

    // room for change
    function withdrawFunds() public onlyOwner {
        uint256 balance = address(this).balance;
        require(balance > 0, "contract balance is 0");
        payable(msg.sender).transfer(balance);
    }

    function authorizeOperator(address operator, bytes32 tokenId)
        public
        virtual
        override(LSP8IdentifiableDigitalAssetCore, LSP8CompatibilityForERC721)
    {
        super.authorizeOperator(operator, tokenId);
    }

    function _transfer(
        address from,
        address to,
        bytes32 tokenId,
        bool force,
        bytes memory data
    )
        internal
        virtual
        override(LSP8CompatibilityForERC721, TemporaryLSP4Compatability)
    {
        super._transfer(from, to, tokenId, force, data);
    }

    function _mint(
        address to,
        bytes32 tokenId,
        bool force,
        bytes memory data
    )
        internal
        virtual
        override(LSP8CompatibilityForERC721, TemporaryLSP4Compatability)
    {
        super._mint(to, tokenId, force, data);
    }

    function _burn(bytes32 tokenId, bytes memory data)
        internal
        virtual
        override(LSP8IdentifiableDigitalAssetCore, LSP8CompatibilityForERC721)
    {
        super._burn(tokenId, data);
    }
}
