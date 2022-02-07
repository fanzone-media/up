## Open questions

### smart contracts

#### when we want to open card packs on-chain, this will require a randomness oracle

- if this oracle is "trusted", then we can send any off-chain seed we like
- possibly use chainlink VRF (verifiable randomness function)
  - this allows for some flexibility in the future for oracle provider that is not fanzone & trustlessness about randomness
- we can use one random value to derive multiple values (https://docs.chain.link/docs/get-a-random-number/)
  - this can then be used to select from available scoreIds
- it should be possible for a user to withdraw their request for opening a card pack
  - if oracle fails to provide randomness, then user can cancel the pack opening and receive their coins back
- some inspiration for unpacking
  - https://github.com/immutable/platform-contracts/blob/develop/contracts/gods-unchained/contracts/EXPLAINER.md
  - https://github.com/horizon-games/Skyweaver-contracts/blob/master/src/contracts/tokens/SkyweaverAssets.sol

#### when moving from testnet to mainnet, we need to snapshot on testnet & migrate the state to mainnet

- to snapshot on testnet, we should pause all interactions on card tokens (set `_phase = Phase.FrozenMigrating`)
  - no transfers
  - no minting
  - no pack opening
  - no upgrades
  - have ability to snapshot all token state (likely we have something that is tracking Transfer events)
- to migrate to mainnet
  - deploy all contracts, set them to migrating (ie. `_phase = Phase.SetupMigrating`)
  - have ability to send transactions that will use snapshot data and set correct token data (ownership, CardMetadata `function migrateCard`)
  - after migration, turn off ability to do migration in the future on same contracts (ie. `_phase = Phase.Active` and modifiers that prevent from ever going back to an earlier `Phase`)

#### revenue sharing

- the addresses involved should be the same as the creators (athlete, team, league)
- this can be part of the setup for a card token
  - ie `function initialize (..., address[] creators, uint256[] creatorRevenueShare, ...)`
  - check that lengths are the same, total sum in creatorRevenueShare is 100

#### UniversalReceiverAddressStore recording what tokens they have received

- the implementation as-is will automatically `addAddress` when the interface hash is `ERC777TokensRecipient`
  - https://github.com/lukso-network/standards-implementations/blob/e4ad91e8d836d273fad6f778cae222529c30919d/contracts/UniversalReceiver/UniversalReceiverAddressStore.sol#L54
- we likely want to override this to support the token standard that we choose
- additionally we might want to use `removeAddress` when a Profile / address transfers away their last token
  - nice to have, gas overhead per transfer is likely small to check via `balanceOf`

#### what does "upgrade" to a card token do

- who is allowed to call upgrade?
  - ? on the first upgrade, we expect that we are creating a new struct for a token to save on gas for cards that are never upgraded OR are we packing it together with card score ?
- what fields are added to the metadata storage contract when a card is upgraded?

#### what secondary markets for card tokens will exist / do we expect on Lukso?

- since there is no mainnet, there are no markets at this time
- has any team signalled the intention to build something
- this might impact how we build the card tokens / revenue sharing expectations
  - expectation: transfer are always possible, our marketplace will respect revenue sharing, other marketplaces will have their own fee structure & likely not respect revenue sharing of fanzone

#### marketplace

- if we are focused on selling cards individually, then the marketplace functionality can be on the CardToken itself
  - are supporting "sell any card at any time"? then we will want to support that wil `setPrice / buy / bid / acceptBid / cancelBid` on the CardToken
- if we are going to support re-selling cards in a group.. then we need to spec this out and probably need a Marketplace contract to have approval to sell multiple cards

### accessing on-chain data

- are we going to run our own Lukso node?

  - could be useful for when we need to do some kind of analytics / monitoring
  - possibly we could run an instance of the-graph & build a subgraph for fanzone
    - useful if graphql is considered "nice" to the team
    - when not, we can consider what the team wants for on-chain analytics / monitoring

- will likely want some kind of dashboard to track minting of cards / other on-chain activity
  - possibly there is some open-sourced dashboard to use
  - if the team also wants to have graphQL, would it be useful to run a the-graph node?
