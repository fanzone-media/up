# nft marketplace functionality

The Fanzone NFTs are purchaseable, and should respect the revenue share set per token contract among the creators.

A token owner is allowed to set a price for a tokenId, allowing for "you see a picture, there is a price tag, you can buy it".

## royalty standard

To encourage potential marketplaces to also respect the royalties fanzone sets out in their tokens,

### Revenue share from token sales

To allow revenue share between all creators of an nft, whenever a token is sold the payment for a token should support the native coin of the host chain, and ERC20-like tokens as payment.

```solidity
/*
 * @dev Sets the price for a tokenId
 *
 * Requirements:
 * - tokenId exists
 * - The caller must own the token or be an approved operator.
 */
function setPriceOf(
  bytes32 tokenId,
  address tokenAddress,
  uint256 tokenAmount
) external;

/*
 * @dev Reads the price for a tokenId
 *
 * Requirements:
 * - tokenId exists
 * - tokenAmount is greater than 0
 */
function getPriceOf(bytes32 tokenId)
  external
  view
  returns (address tokenAddress, uint256 tokenAmount);

```

When a nft is sold there is a known royalty percentage that is taken from the sale price. A referral address may be included during the sale, using a known referral percentage that is applied on the royalty token amount.

The precision of the percentages can either be

```solidity
/*
 * @dev Sets the royalty fee, with the precision determined by numerator / denominator.(TODO: denominator could be fixed as 1e18, to match ether unit scale)
 */
function setRoyaltyPercentage(uint256 numerator, uint256 denominator)
  external
  view;

/*
 * @dev Returns the royalty fee for the provided tokenAmount
 */
function getRoyaltyPercentage(uint256 tokenAmount)
  external
  view
  returns (uint256 royaltyTokenAmount);

/*
 * @dev Sets the referral fee, with the precision determined by numerator / denominator.(TODO: denominator could be fixed as 1e18, to match ether unit scale)
 */
function setReferralPercentage(uint256 numerator, uint256 denominator) external;

/*
 * @dev Returns the referral fee for the provided tokenAmount
 */
function getReferralPercentage(uint256 royaltyTokenAmount)
  external
  view
  returns (uint256 referralTokenAmount);

```

There does exist recent a ERC for royalty payments [ERC2981](https://github.com/ethereum/EIPs/blob/master/EIPS/eip-2981.md) which has a simple interface:

```solidity
///
/// @dev Interface for the NFT Royalty Standard
///
interface IERC2981 is IERC165 {
  /// ERC165 bytes to add to interface array - set in parent contract
  /// implementing this standard
  ///
  /// bytes4(keccak256("royaltyInfo(uint256,uint256)")) == 0x2a55205a
  /// bytes4 private constant _INTERFACE_ID_ERC2981 = 0x2a55205a;
  /// _registerInterface(_INTERFACE_ID_ERC2981);

  /// @notice Called with the sale price to determine how much royalty
  //          is owed and to whom.
  /// @param _tokenId - the NFT asset queried for royalty information
  /// @param _salePrice - the sale price of the NFT asset specified by _tokenId
  /// @return receiver - address of who should be sent the royalty payment
  /// @return royaltyAmount - the royalty payment amount for _salePrice
  function royaltyInfo(uint256 _tokenId, uint256 _salePrice)
    external
    view
    returns (address receiver, uint256 royaltyAmount);
}

```

The simple interface of ERC2981 can work well for the Fanzone use case, especially when combined with the idea of a RoyaltyVault (described below) as the `address receiver`.

When a transfer of coins/tokens is received that matches or exceeds the set price for a tokenId

```solidity
/*
 * @dev
 *
 * - Requirements
 */
 function buyToken(bytes32 tokenId)
  payable
  returns (bool)
```

### token sale scenario

If a sale is made for `tokenAmount = 1000` with a royalty percentage of 10% and a referral percentage of 5% then:

- `royaltyTokenAmount = tokenAmount * (royaltyPercentage) 1000 * (10 / 100) = 100`
- `referralTokenAmount = royaltyTokenAmount * (referralPercentage) = 100 * (5 / 100) = 5`
- `creatorTokenAmount = royaltyTokenAmount - referralTokenAmount = 100 - 5 = 95`

### receiving payments as a creator

- since there are many creators, and many card tokens, with more than one way to be paid (ie. native coin vs custom token) it would be nice for royalties to be aggregated into one place
- if we force a transfer to occur on payment, this could increase gas usage (? by how much?)
- one way out is: payment goes to royalty contract itself, which then knows the revenue share percentages and records this into a FanzoneRoyaltyVault like `(address[] creators, uint256[] revenueShare, address token, uint256 tokenAmount)` which can receive all royalty payments. when a creator wants to know what their current royalty is, they can query the vault and can send a withdraw transaction to receive the funds.

```
// pseudo code for royaltyVault
mapping vaultBalances = {
  tokenAddress: tokenAmount
}

mapping addressBalances = {
  tokenAddress: tokenAmount
}

function withdraw(address tokenAddress) {
  if (addressBalances(_msgSender()) != 0) revert("No balance");

  this.
}
```

## Open questions

- is the royalty fee a system wide percentage, or custom per token contract and possibly per tokenId.

  - when this is system wide, we can have this set in some common contract

- if a tokenId does not have a price set, is it possible that someone can open any bid?
  - if its allowed to bid, what happens when a second bid arrives and no price has been set by the owner
    - either it is ignored, or is also recorded (address tokenAddress, uint256 tokenAmount).. then if the owner wants to accept a bid, they must have the ability to identify the bid they will accept
    - is there a minimum bid increase to control bidding
  - then the bid sender must also be able to later cancel a bid & receive back their tokens / coins
