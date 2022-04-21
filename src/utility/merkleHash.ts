// @TODO: remove console.log
import { MerkleTree } from 'merkletreejs';
import keccak256 from 'keccak256';
import { Address } from '../utils/types';

export const getHexProof = (claimingAddress: Address) => {
  //List of addresses stored in seperate js file
  const whiteListAdsresses = [
    '0x87847d301E8Da1D7E95263c3478d7F6e229E3F4b',
    '0x7633972b0735e405C1F94055Af7F6ab2726047Fa',
    '0xd0938cF9B3056640D0ED39dC3339ffA126A091f6',
    '0x09aB21eE80EB8CBD9DCEe4309240721cC1dFe218',
    '0xdf9c1c71738a1ACDaCdb88D822298CFC3b4F0FBF',
    '0xA0ca13B9b691a1bDE06c1Ecc63b5f32e58F64CeA',
  ];

  const leafNodes = whiteListAdsresses.map((addr) => keccak256(addr));
  const merkelTree = new MerkleTree(leafNodes, keccak256, { sortPairs: true });

  return merkelTree.getHexProof(keccak256(claimingAddress));
};
