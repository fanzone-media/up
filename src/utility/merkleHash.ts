// @TODO: remove console.log
import { MerkleTree } from 'merkletreejs';
import keccak256 from 'keccak256';
import { Address } from '../utils/types';

export const getHexProof = async (claimingAddress: Address) => {
  //List of addresses stored in seperate js file
  const whiteListAdsresses = await fetch('./whitelistedAddresses.json').then(
    function (response) {
      return response.json();
    },
  );

  const leafNodes = whiteListAdsresses.map((addr: Address) => keccak256(addr));
  const merkelTree = new MerkleTree(leafNodes, keccak256, { sortPairs: true });

  return merkelTree.getHexProof(keccak256(claimingAddress));
};
