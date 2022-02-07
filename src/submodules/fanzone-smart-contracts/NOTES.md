# Notes

Collection of ideas / questions / explanations during development.

## what makes a universal profile know about tokens it holds?

- a UniversalProfile is deployed (known as `profileContract`)
- a UniversalReceiverAddressStore is deployed (known as `addressStore`)
- on the `profileContract`, setData for LSP1Delegate is called with `addressStore` address
- during a token transfer we end up in the hook during ERC777:
  - ERC777 token contract calls `_callTokensToSend`, during transfer
  - `function _callTokensToSend` calls into `universalReceiver`
  - the `profileContract` will have `universalReceiver` called
- during a token transfer for ERC721 we need to use the hook

## lukso contracts

### issues with current contracts

- ERC725X does not return error / data from calls
  - should be easy to implement this
  - update `function executeCall` and `function executeDelegateCall`, and returned in the calling `function execute`
- UniversalReceiverAddressStore only knows how to handle one `typeId`
  - right now it knows about "ERC777TokensRecipient"
  - should also know about "ERC777TokensSender" and ERC721 sender/receiver
  - is it worthwhile to already make this dynamic, or just add these two "kinds" of token hooks
- UniversalReceiverAddressStore does not remove addresses when the final token is transfered
  - should be easy to fix this
  - pre-req: handling more than one kind of typeId in `function universalReceiverDelegate`
- LSP4DigitalCertificate
  - why is `_tokenHolders` there at all.. there is a "TODO remove in main chain" but seems to be used in the universalprofile.cloud web client

### keymanager questions

- how useful is it to use, does it allow for the meta-tx use cases Fanzone has (called "executeRelayedCall" in LSP6KeyManager)
- permissions
  - why dont we have a control for (from, recipient, functionSelector)? instead its split between `function _isAllowedAddress(from, recipient)` & `_isAllowedFunction(from, functionSelector)` (https://github.com/lukso-network/universalprofile-smart-contracts/blob/d8c60a14fb4eff66f4e7daabb206a8b70e12754c/contracts/KeyManager/KeyManager.sol)
  - why are they coding their own permission set, instead of using AccessControl/RBAC from openzeppelin?
- vaults
  - there is some vault concept, where is an example of this?

### relayer api

(https://docs.lukso.tech/tools/relayer-api/)

- is this a real relayer, or just something to deploy UniversalProfiles on the testnet?
  - if fanzone wants to do meta-tx with the proposed Lukso way, would be good to rally around an open/shared implementation
