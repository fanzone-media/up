# Overview

An overview of the proposed architecture and workflows for the Fanzone smart contracts ecosystem.

Split into 2 sections:

1. Actors: describes accounts/roles and their actions
2. Contracts: describes the contracts in the Fanzone ecosystm and their relationships

## Actors

### Fanzone Owner

- this is the on-chain address that Fanzone uses when deploying contracts
- has a UniversalProfile, as it will be the `issuer` of all tokens appears in the UI
- main actions: deploys at least the CardManager contract, which is then the owner for all future admin actions

### League(s) / Team(s) / Player(s)

- there are addresses which have deployed a UniversalProfile, appears in the UI as `creators`
- main actions: receiving and withdrawing revenue share balances

## Contracts

### CardToken (ERC721, Ownable, ERC725Y, ERC721UniversalReceiver, possible proxy to save on gas costs at deployment)

- every card will be deployed as a CardToken (ie. 2021 Germany Mens Team - Player X)
- the UniversalProfiles of the associated league, team and player are added to this contract
- the revenue shares for league / team / player are associated with the token (likely)
- the total number of tokens possible is controlled by `scoreIds`, a list of values used to calculate score that become associated to a token when it is minted
- the formula to calculate a score given a scoreId, to be included in the contract as `function calculateScore`
- owner should be CardManager

#### interface

- ERC721 interface
- `function unpackCard(address to, unit256 scoreId) external onlyOwner returns(uint256)`: called by CardManager during an `openPack` request. the returned value is the `mintableSupply` after consuming one of the `scoreIds`, so the CardManager knows when this token has been exhausted, and is no longer available during `openPack` requests. NOTE: thinking we want to request exactly a `scoreId` to facilitate mirating from testnet to mainnet, as we can then provide exactly the same `scoreIds` during deployment, and call `unpackCard` to get the same effects.
- `function cardMetadataOf(uint256 tokenId) public view returns(address)`: returns the ERC725Y contract that is used for metadata storage; expected fields `{uint256 scoreId , ...upgraded card fields...}`
- `function scoreOf(uint256 tokenId) public view returns(unit256)`: shows the score for a token, using the associated `scoreId` & `calculateScore` function
- `function calculateScore(uint256 scoreId) internal view returns(uint256)`: calculates the score for a given scoreId
- marketplace functions: TODO: depending on how we want our marketplace to work (ie. do we support bids on any token at any time with the owner setting a minimum bid); setPrice / buy / bid / acceptBid / cancelBid

### CardManager (Ownable)

- knows about all CardTokens, and whether they are available for use in `openPack` requests
- the owner should be `Fanzone Owner` address, as this access to call admin functionality

#### interface

- `function packPrice`: a getter for the cost of opening a pack
- `function deployNewCard`: TODO: depending on whether we can create a new CardToken in one tx this is either deploying the CardToken, or is the final tx to register the CardToken with the CardManager so it can include during `requestOpenPack` requests
- `function requestOpenPack() payable`: accepts payment to open a pack of cards; will request randomness from an oracle, and store the requester address & oracle job id for callback
- `function fulfillRandomness(bytes32 requestId, uint256 randomess) onlyOracle`: the callback used by the oracle to fulfill a randomness request, the `randomness` will be used to select from available cards & their scoreIds

### RandomnessOracle

- this could be modelled on Chainlink VRF
- likely this infrastructure is missing on Lukso, and will be owned & operated by Fanzone

#### interface

- `function requestRandomness() returns(bytes32)`: returns a requestId that will be used when calling
