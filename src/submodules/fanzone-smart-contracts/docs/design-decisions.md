## design decisions

Prompted by the question from Claudio

```

next steps: for our Unique NFTs:

- can the contract inherent from LSP4 and be fully compatible?

  - contain the LSP-2 Card-Metadata

- can the contract inherent or like ERC721?

  - with Mint-ID and Base-Score (could be integrata math-formula based on the mint id)

- could we have a 'only if' people upgraded their individual card an extra individual ERC725Y to it?

- Could we enhance the creators list by a revenue share percentage each
```

---

### contract standard to use for cards (supposedly NFT-like)

#### using lsp4 as base

- pros

  - this is "compatible" with lukso things
  - already implemented by lukso
  - erc777 has hooks

- cons

  - no concept of tokenId to track individual tokens, only amount of tokens

- implementation concept
  - we would expect lots of difficulty if an address holds more than one of a LSP4, since there is no tokenId to track
    -> this results in needing different mapping / function to call when transfering to keep a token tracked when it has metadata
  - likely done via token hook `_beforeTokenTransfer`
  - once we do all these work arounds.. dont we end up with something that looks like erc721 anyways?

#### using erc721 as base

- pros

  - gives tokenId to allow tracking
  - can add additional hooks as 721 includes

- cons

  - possibly not "compatible" with lukso things so far
    -> although this seems doable with ERC725Y (ie. ERC721-UniversalReceiver like ERC777-UniversalReceiver)
    -> is there really an issue here?

- implementation concept
  - create a contract that is ERC721 & UniversalReceiver compatible
  - check that the expected entities are displayed in universalprofile.cloud
    -> owner profile shows created assets (with correct counts for `owned / total supply`)
    -> asset owner profiles show asset (with correct counts for `owned / total supply`)
    -> asset profile shows issuer, designer, available, total supply
  - update UniversalReceiverAddressStore.universalReceiverDelegate
    -> this should add address for ERC721-UniversalReceiver
    -> the current implementation in fanzone-blockchain looks like it almost works, main difference is that modifier `supportsType` will throw, whereas the spec implementation will only `addAddress` when the typeId is supported
  - is there something to do when transfering a token to do bookkeeping like when receiving?

#### summary

- still thinking ERC721 is the best option.. without a tokenId its not possible to have uniqueness!

---

### nft metadata ("only if people upgrade their individual card")

- this seems like a good idea for some cost savings / overall metrics

  - no need to mark cards with extra data when they are not being "actively used"

- will we have an "extra" ERC725Y attached, or will there just be one
  - if we use LSP4 (or make a ERC721-UniversalReceiver) this inherits ERC725Y
    -> something seen in other Ethereum based card games, unless the card is rare (or as asked here "upgraded") then there is no ERC721 minted as the resale value is not there. this seems to then be a blend of off-chain (central server) and on-chain cards
    -> additionally there will be already some "base score" that is not the same for all cards.. so from the beginning of every minted card it seems we need additional data. likely this means we should have a struct for this like `mapping(uint256 => CardScoreStruct) public cardScore;` to keep all this data local to the contract

#### summary

- seems that a mapping will be easier, and that there is always some `CardScoreStruct` data set at mint time (when tokens are minted is another choice to be made)
- if there is some `BaseCardScoreStruct` and `UpgradedCardStruct` then we just have two mapping, and dont pay the cost of upgraded data until something triggers that

---

### marketplace (needed for revenue share)

- how the marketplace looks will determine how to do revenue share

  - the marketplace mechanism will need to payout correct amount to creators
  - creators list is encoded in ERC725Y "setData"
  - we need a way to set fee (ie. 5% of resale price)
    -> will this fee be per card, or standard on the entire marketplace?
  - we need a way to set fee percentages among creator addresses
    -> do we need to guarantee this is the same addresses as the `setData` creator list, or can be separate mapping?
    -> will we transfer to the addresses on a sale, or have a FeeCollector style contract that they can pull from?
  - we could offer a market on each NFT, and aggregate that in a UI
    -> then the setPrice / buy / bid / acceptBid / cancelBid functions are also on the NFT contract itself

- test gas costs

  - when we are loading from setData vs having separate mapping
    -> cost at set time (setData & mapping)
    -> cost at read time (must read & parse vs using mapping)
  - expectation: that its cheaper via mapping, as creators are likely not changing often
  - expectation: we need some mapping anyways to manage the revenue split

- controls on transfer

  - most NFTs are always transferable, but this means that someone could make a uncontrolled sale and then later transfer.. there is trust there / some additional contract that would escrow the token for a non-fanzone-sale
    -> do we want to completely lock this down by blocking transfers unless a fanzone-sale occured guaranteeing that the revenue share was respected?
    -> what knockon effects does this have?
    -> expecting that since we offer users the universal profile setup, they will never need to make a transfer of a token to another profile unless its a sale.. but is this always the case?

- known NFT marketplaces with revenue / royalty (NOTE: they are in an "easy" case as there is a royalty to creator & platform fee only)
  - Superrare
  - OpenSea
  - rarible
  - foundation

#### summary

- probably we end up with a mapping if we want to optimise gas costs
- if we want to enforce the setData for creators list is the same, then we need to create a single function to set this
  -> guarantee only creator addresses are in the revenue share
  -> guarantee the total revenue split sums to 100 (or whatever precision we decide on)
- probably we want the sale functions on each ERC721 contract, and can aggregate in a UI
