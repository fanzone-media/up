const { MerkleTree } = require('merkletreejs')
const keccak256 = require('keccak256');
//const { sha256 } = require('@ethersproject/sha2');

/*
let whiteListAdsresses = [
    "0x87847d301E8Da1D7E95263c3478d7F6e229E3F4b",
    "0x7633972b0735e405C1F94055Af7F6ab2726047Fa",
    "0xd0938cF9B3056640D0ED39dC3339ffA126A091f6",
    "0x09aB21eE80EB8CBD9DCEe4309240721cC1dFe218",
    "0xdf9c1c71738a1ACDaCdb88D822298CFC3b4F0FBF",
    "0xA0ca13B9b691a1bDE06c1Ecc63b5f32e58F64CeA"
]; */
let whiteListAdsresses = [
    "0x5B38Da6a701c568545dCfcB03FcB875f56beddC4",
    "0xAb8483F64d9C6d1EcF9b849Ae677dD3315835cb2",
    "0x4B20993Bc481177ec7E8f571ceCaE8A9e22C02db",
    "0x78731D3Ca6b7E34aC0F824c42a7cC18A495cabaB",
    "0x617F2E2fD72FD9D5503197092aC168c91465E7f2",
    "0x17F6AD8Ef982297579C203069C1DbfFE4348c372",
    "0x5c6B0f7Bf3E7ce046039Bd8FABdfD3f9F5021678",
    "0x03C6FcED478cBbC9a4FAB34eF9f40767739D1Ff7",
    "0x1aE0EA34a72D944a8C7603FfB3eC30a6669E454C",
    "0x0A098Eda01Ce92ff4A4CCb7A4fFFb5A43EBC70DC",
    "0xCA35b7d915458EF540aDe6068dFe2F44E8fa733c",
    "0x14723A09ACff6D2A60DcdF7aA4AFf308FDDC160C"
]; //List of addresses stored in seperate js file

let tempAddress = "0x78731D3Ca6b7E34aC0F824c42a7cC18A495cabaB"; //address coming from Metamask

const leafNodes = whiteListAdsresses.map(addr => keccak256(addr)); //to be included

const merkelTree = new MerkleTree(leafNodes, keccak256, {sortPairs: true}); //to be included
const rootHash = merkelTree.getRoot(); //not to be included

console.log('Whitelist Merkel Tree\n', merkelTree.toString('hex'));

console.log('Root Hash: ', rootHash.toString('hex')); 

//let claimingAddress = leafNodes[0];

let claimingAddress = keccak256(tempAddress); //to be included

const hexProof = merkelTree.getHexProof(claimingAddress); //to be included, this the Merkel Proof to be passed as a parameter

console.log('\nMerkel Proof for Address: ', tempAddress);//whiteListAdsresses[0]);
console.log('\n', hexProof);
