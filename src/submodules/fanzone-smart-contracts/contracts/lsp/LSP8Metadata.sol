// SPDX-License-Identifier: CC0-1.0
pragma solidity ^0.8.0;

// libraries
import "@lukso/universalprofile-smart-contracts/contracts/Utils/ERC725Utils.sol";

// modules
import "@lukso/universalprofile-smart-contracts/contracts/LSP8IdentifiableDigitalAsset/LSP8IdentifiableDigitalAssetCore.sol";
import "@erc725/smart-contracts/contracts/ERC725YCore.sol";

// TODO: this should be in
// "@lukso/universalprofile-smart-contracts/contracts/LSP8IdentifiableDigitalAsset/extensions"

abstract contract LSP8Metadata is
    LSP8IdentifiableDigitalAssetCore,
    ERC725YCore
{
    //
    // --- Metadata queries
    //

    event MetadataAddressCreated(
        bytes32 indexed tokenId,
        address metadataAddress
    );

    function metadataAddressOf(bytes32 tokenId) public view returns (address) {
        require(
            _exists(tokenId),
            "LSP8Metadata: metadata query for nonexistent token"
        );

        bytes memory value = ERC725Utils.getDataSingle(
            this,
            _buildMetadataKey(tokenId, true)
        );

        if (value.length == 0) {
            return address(0);
        } else {
            return address(bytes20(value));
        }
    }

    function metadataJsonOf(bytes32 tokenId)
        public
        view
        returns (string memory)
    {
        require(
            _exists(tokenId),
            "LSP8Metadata: metadata query for nonexistent token"
        );

        bytes memory value = ERC725Utils.getDataSingle(
            this,
            _buildMetadataKey(tokenId, false)
        );

        return abi.decode(value, (string));
    }

    function _buildMetadataKey(bytes32 tokenId, bool buildAddressKey)
        internal
        pure
        returns (bytes32)
    {
        return
            bytes32(
                abi.encodePacked(
                    buildAddressKey
                        ? _LSP8_METADATA_ADDRESS_KEY_PREFIX
                        : _LSP8_METADATA_JSON_KEY_PREFIX,
                    bytes20(keccak256(abi.encodePacked(tokenId)))
                )
            );
    }

    //
    // --- Metadata functionality
    //

    /**
     * @dev Create a ERC725Y contract to be used for metadata storage of `tokenId`.
     */
    function _createMetadataFor(bytes32 tokenId)
        internal
        virtual
        returns (address)
    {
        require(
            _exists(tokenId),
            "LSP8: metadata creation for nonexistent token"
        );

        bytes32 metadataKeyForTokenId = _buildMetadataKey(tokenId, true);

        bytes memory existingMetadataValue = _getData(metadataKeyForTokenId);
        if (existingMetadataValue.length > 0) {
            address existingMetadataAddress = address(
                bytes20(existingMetadataValue)
            );
            return existingMetadataAddress;
        }

        // TODO: can use a proxy pattern here
        address metadataAddress = address(new ERC725Y(_msgSender()));
        _setData(metadataKeyForTokenId, abi.encodePacked(metadataAddress));

        emit MetadataAddressCreated(tokenId, metadataAddress);

        return metadataAddress;
    }
}
