import { ethers } from 'ethers';

export const nameHashMap = {
  //
  // --- needed ecosystem contracts
  //

  FeeCollector: ethers.utils.keccak256(
    ethers.utils.toUtf8Bytes('FeeCollector'),
  ),
  CardTokenScoring: ethers.utils.keccak256(
    ethers.utils.toUtf8Bytes('CardTokenScoring'),
  ),
  OpenSeaProxy: ethers.utils.keccak256(
    ethers.utils.toUtf8Bytes('OpenSeaProxy'),
  ),

  //
  // --- proxy factories
  //

  CardTokenProxyFactory: ethers.utils.keccak256(
    ethers.utils.toUtf8Bytes('CardTokenProxyFactory'),
  ),
  FeeReceiverProxyFactory: ethers.utils.keccak256(
    ethers.utils.toUtf8Bytes('FeeReceiverProxyFactory'),
  ),
  UniversalProfileProxyFactory: ethers.utils.keccak256(
    ethers.utils.toUtf8Bytes('UniversalProfileProxyFactory'),
  ),
  LSP6KeyManagerProxyFactory: ethers.utils.keccak256(
    ethers.utils.toUtf8Bytes('LSP6KeyManagerProxyFactory'),
  ),
  LSP1UniversalReceiverDelegateUPProxyFactory: ethers.utils.keccak256(
    ethers.utils.toUtf8Bytes('LSP1UniversalReceiverDelegateUPProxyFactory'),
  ),
};
