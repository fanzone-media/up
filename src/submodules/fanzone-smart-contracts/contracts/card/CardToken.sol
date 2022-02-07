// SPDX-License-Identifier: CC0-1.0
pragma solidity ^0.8.0;

// interfaces
import "./ICardToken.sol";

// modules
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/security/Pausable.sol";
import "@lukso/universalprofile-smart-contracts/contracts/LSP8IdentifiableDigitalAsset/extensions/LSP8CappedSupply.sol";
import "@lukso/universalprofile-smart-contracts/contracts/LSP8IdentifiableDigitalAsset/extensions/LSP8CompatibilityForERC721.sol";
import "../lsp/LSP8Metadata.sol";
import "../lsp/OpenSeaCompatForLSP8.sol";
import "./CardTokenScoring.sol";
import "./CardMarket.sol";
// TODO: remove me one day soon
import "../lsp/TemporaryLSP4Compatability.sol";

contract CardToken is
    Pausable,
    LSP8CappedSupply,
    LSP8Metadata,
    LSP8CompatibilityForERC721,
    CardMarket,
    // TODO: consider making this a deployed library to link against to save on gas when deploying
    // CardToken contracts.. if CardToken is also going to be a Proxy pattern, then making this a
    // library has a smaller impact and could remain as an inhertied contract
    CardTokenScoring,
    OpenSeaCompatForLSP8,
    ICardToken,
    // TODO: remove me one day soon
    TemporaryLSP4Compatability
{
    //
    // --- Enums
    //

    // TODO: this is just a sketch, figure out what the flow will be.
    // Dependant on: whether we build migration flow from v1, other phases being included
    enum Phase {
        SetupMigrating, // optional part of setup, used when this contract is "new" deployment
        Active, // everything is ready to go
        FrozenMigrating // contract is frozen, used when this contract is "old" deployment
    }

    //
    // --- Events
    //

    //
    // --- Storage
    //

    uint256 private _scoreMin;
    uint256 private _scoreMax;
    uint256 private _scoreScale;
    uint256 private _scoreMaxTokenId;
    Phase private _phase;

    // TODO: this will be implemented wherever we hook a randomness oracle.. likely CardManager when
    // we move from a EOA owner to a contract owner
    //
    // maps a jobId to the address that requested a pack open
    mapping(uint256 => address) private _pendingPackOpen;

    //
    // --- Errors
    //
    // TODO: should we use them at all, or just accept cost of strings?
    //
    // hardhat tooling not able to parse ABI yet, some functionality is missing during development

    //
    // --- Modifiers
    //

    modifier onlyPhase(Phase phase) {
        _onlyPhase(phase);

        _;
    }

    function _onlyPhase(Phase phase) internal view {
        require(_phase == phase, "CardToken: PhaseMismatch");
    }

    modifier onlyValidTokenId(bytes32 tokenId) {
        _onlyValidTokenId(tokenId);

        _;
    }

    function _onlyValidTokenId(bytes32 tokenId) internal view {
        uint256 tokenIdAsNumber = uint256(tokenId);

        require(
            0 < tokenIdAsNumber && tokenIdAsNumber <= tokenSupplyCap(),
            "CardToken: invalid tokenId"
        );
    }

    //
    // --- Initialize
    //

    constructor(
        string memory name,
        string memory symbol,
        address[] memory creators,
        uint256[] memory creatorRevenueShares,
        uint256 tokenSupplyCap,
        uint256 scoreMin,
        uint256 scoreMax,
        uint256 scoreScale,
        uint256 scoreMaxTokenId,
        bool isMigrating // TODO: should we include this from the first version?
    )
        LSP8CompatibilityForERC721(name, symbol, msg.sender)
        LSP8CappedSupply(tokenSupplyCap)
    {
        // TODO: could store the revenue share in ERC725Y.. the creators are already there
        // TODO: should we set the ERC725Y for creators here?
        // TODO: could also check that the creator addresses given exist & are UniversalProfiles
        //
        // verify creators & revenue sum
        require(creators.length > 0, "CardToken: CreatorsRequired");
        require(
            creators.length == creatorRevenueShares.length,
            "CardToken: CreatorsShareSize"
        );

        uint256 revenueShareSum;
        for (uint256 i = 0; i < creatorRevenueShares.length; i++) {
            revenueShareSum += creatorRevenueShares[i];
        }
        require(revenueShareSum == 100, "CardToken: CreatorsRevenueShareSum");

        require(scoreMin <= scoreMax, "CardToken: ScoreMinMaxRange");
        _scoreMin = scoreMin;
        _scoreMax = scoreMax;

        // this value should be a power of 10, but a sanity check for zero is enough
        require(scoreScale != 0, "CardToken: ScoreScaleZero");
        _scoreScale = scoreScale;

        require(scoreMaxTokenId != 0, "CardToken: ScoreMaxTokenIdZero");
        require(
            scoreMaxTokenId <= tokenSupplyCap,
            "CardToken: ScoreMaxTokenIdLargerThanSupplyCap"
        );
        _scoreMaxTokenId = scoreMaxTokenId;

        if (isMigrating) {
            _phase = Phase.SetupMigrating;
        } else {
            _phase = Phase.Active;
        }
    }

    //
    // --- Token queries
    //

    /**
     * @dev Returns the number of tokens available to be minted.
     */
    function mintableSupply() public view override returns (uint256) {
        return tokenSupplyCap() - totalSupply();
    }

    //
    // --- TokenId queries
    //

    /**
     * @dev Returns the score for a given `tokenId`.
     */
    function calculateScore(bytes32 tokenId)
        public
        view
        override
        onlyValidTokenId(tokenId)
        returns (string memory)
    {
        uint256 tokenIdAsNumber = uint256(tokenId);

        return
            CardTokenScoring.calculateScore(
                tokenSupplyCap(),
                _scoreMin,
                _scoreMax,
                _scoreScale,
                _scoreMaxTokenId,
                tokenIdAsNumber
            );
    }

    //
    // --- Unpacking logic
    //

    /**
     * @dev Mints a `tokenId` to `to`.
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
    function unpackCard(address to, bytes32 tokenId)
        public
        override
        onlyOwner
        onlyPhase(Phase.Active)
        onlyValidTokenId(tokenId)
        returns (uint256)
    {
        // TODO: eventually this function should be called from a CardManager contract for better
        // control of unpacking on-chain and visibility when creating new cards; instead of onlyOwner
        // modifier we might want a different access control pattern

        // using force=true to allow minting a token to an EOA or contract that isnt an UniversalProfile
        _mint(to, tokenId, true, "");

        // inform the caller about mintable supply
        return mintableSupply();
    }

    //
    // --- Migration logic
    //

    function migrateCard(address to, bytes32 tokenId)
        public
        onlyOwner
        onlyPhase(Phase.SetupMigrating)
    {
        // TODO: we will need something like this when migrating from testnet to mainnet.. maybe all
        // we need is to call into `unpackCard` with the phase check.
        this.unpackCard(to, tokenId);
    }

    function endSetupMigration()
        public
        onlyOwner
        onlyPhase(Phase.SetupMigrating)
    {
        // TODO: add tests for this
        _phase = Phase.Active;
    }

    function startFrozenMigration() public onlyOwner onlyPhase(Phase.Active) {
        // TODO: eventually this function could be called from a CardManager contract for better
        // control over all deployed CardTokens; instead of onlyOwner modifier we might want a
        // different access control pattern
        //
        // TODO: we might want to control this from CardManager instead of needing to call all
        // deployed CardToken contracts, as then we have just one tx to make when marking the start
        // of a migration
        _phase = Phase.FrozenMigrating;
    }

    //
    // --- Pause logic
    //

    function pause() public onlyOwner {
        _pause();
    }

    //
    // --- Metadata logic
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
    function createMetadataFor(bytes32 tokenId)
        public
        override
        onlyOwner
        onlyPhase(Phase.Active)
        onlyValidTokenId(tokenId)
        returns (address)
    {
        require(
            _exists(tokenId),
            "CardToken: create metadata for nonexistent token"
        );

        // TODO: eventually this function could be called from a CardManager contract for better
        // control over all deployed CardTokens; instead of onlyOwner modifier we might want a
        // different access control pattern

        return _createMetadataFor(tokenId);
    }

    //
    // --- Public override
    //

    /**
     * @dev Token is paused when `function pause` has been called
     */
    function paused() public view override returns (bool) {
        return super.paused() || _phase != Phase.Active;
    }

    function authorizeOperator(address operator, bytes32 tokenId)
        public
        virtual
        override(
            LSP8IdentifiableDigitalAssetCore,
            LSP8CompatibilityForERC721Core,
            LSP8CompatibilityForERC721
        )
    {
        super.authorizeOperator(operator, tokenId);
    }

    /**
     * @inheritdoc ILSP8CompatibilityForERC721
     * @dev Compatible with ERC721 safeTransferFrom.
     * Using force=true so that any address may receive the tokenId.
     * Change added to support transfer on third-party platforms (ex: OpenSea)
     */
    function safeTransferFrom(
        address from,
        address to,
        uint256 tokenId
    ) external virtual override {
        return
            transfer(
                from,
                to,
                bytes32(tokenId),
                true,
                "compat-safeTransferFrom"
            );
    }

    /**
     * @inheritdoc ILSP8CompatibilityForERC721
     * @dev Compatible with ERC721 safeTransferFrom.
     * Using force=true so that any address may receive the tokenId.
     * Change added to support transfer on third-party platforms (ex: OpenSea)
     */
    function safeTransferFrom(
        address from,
        address to,
        uint256 tokenId,
        bytes memory data
    ) external virtual override {
        return transfer(from, to, bytes32(tokenId), true, data);
    }

    function isApprovedForAll(address tokenOwner, address operator)
        public
        view
        virtual
        override(LSP8CompatibilityForERC721Core, OpenSeaCompatForLSP8)
        returns (bool)
    {
        return super.isApprovedForAll(tokenOwner, operator);
    }

    //
    // --- Internal override
    //

    function _transfer(
        address from,
        address to,
        bytes32 tokenId,
        bool force,
        bytes memory data
    )
        internal
        virtual
        override(
            LSP8IdentifiableDigitalAssetCore,
            LSP8CompatibilityForERC721Core,
            LSP8CompatibilityForERC721,
            CardMarket,
            TemporaryLSP4Compatability
        )
        onlyPhase(Phase.Active)
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
        override(
            LSP8IdentifiableDigitalAssetCore,
            LSP8CompatibilityForERC721Core,
            LSP8CompatibilityForERC721,
            LSP8CappedSupply,
            TemporaryLSP4Compatability
        )
        onlyPhase(Phase.Active)
    {
        super._mint(to, tokenId, force, data);
    }

    function _burn(bytes32 tokenId, bytes memory data)
        internal
        virtual
        override(
            LSP8IdentifiableDigitalAssetCore,
            LSP8CompatibilityForERC721Core,
            LSP8CompatibilityForERC721,
            CardMarket
        )
        onlyPhase(Phase.Active)
    {
        super._burn(tokenId, data);
    }

    function _isOperatorOrOwner(address caller, bytes32 tokenId)
        internal
        view
        virtual
        override(LSP8IdentifiableDigitalAssetCore, OpenSeaCompatForLSP8)
        returns (bool)
    {
        return super._isOperatorOrOwner(caller, tokenId);
    }
}
