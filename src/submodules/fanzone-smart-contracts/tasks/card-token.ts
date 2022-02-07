import { fetchLSP4Data } from "../utils/LSPSchema";
import { displayOnChainData, displayOffChainData } from "../utils/display";
import { CardToken, CardToken__factory, ERC725Y } from "../typechain";
import { tokenIdAsBytes32 } from "../utils/cardToken";

import type { TaskArguments, HardhatRuntimeEnvironment } from "hardhat/types";
import type { BigNumberish } from "ethers";

const displayTokenInfo = async (contract: CardToken) => {
  const [
    name,
    symbol,
    owner,
    totalSupply,
    mintableSupply,
    tokenSupplyCap,
    allTokenHolders,
  ] = await Promise.all([
    contract.name(),
    contract.symbol(),
    contract.owner(),
    contract.totalSupply(),
    contract.mintableSupply(),
    contract.tokenSupplyCap(),
    contract.allTokenHolders(),
  ]);

  const tokenInfo = {
    name,
    symbol,
    owner,
    totalSupply: totalSupply.toString(),
    mintableSupply: mintableSupply.toString(),
    tokenSupplyCap: tokenSupplyCap.toString(),
    allTokenHolders,
  };
  console.log("--- token info");
  console.log(displayOnChainData(tokenInfo));

  // TODO: turn on when latest LSP8CompatERC721 is available
  const [
    // tokenURI,
    // contractURI,
  ] = await Promise.all([
    // contract.tokenURI(tokenIdAsBytes32("1")),
    // contract.contractURI(tokenIdAsBytes32("1")),
  ]);

  const openseaInfo = {
    // tokenURI,
    // contractURI,
  };
  console.log("--- opensea info");
  console.log(displayOnChainData(openseaInfo));
};

const displayTokenIdInfo = async (
  contract: CardToken,
  tokenIdAsNumber: BigNumberish
) => {
  const tokenId = tokenIdAsBytes32(tokenIdAsNumber);
  const [score] = await Promise.all([contract.calculateScore(tokenId)]);

  let tokenOwnerOf;
  try {
    tokenOwnerOf = await contract.tokenOwnerOf(tokenId);
  } catch (_) {
    tokenOwnerOf = "no-owner";
  }

  const tokenIdInfo = {
    score,
    tokenOwnerOf,
  };

  console.log("--- tokenId info");
  console.log(displayOnChainData(tokenIdInfo));
};

const displayTokenMetadata = async (contract: CardToken) => {
  const metadata = await fetchLSP4Data(contract as ERC725Y);

  console.log("--- token metadata");
  console.log(displayOffChainData(metadata));
};

export const getCardData = async (
  args: TaskArguments,
  hre: HardhatRuntimeEnvironment
) => {
  const { address, tokenId } = args;

  console.log(
    `\ngetting data for CardToken ${displayOnChainData(
      address
    )} on network ${displayOnChainData(hre.network.name)}\n`
  );

  const contract = CardToken__factory.connect(address, hre.ethers.provider);

  await displayTokenInfo(contract);
  if (tokenId) {
    await displayTokenIdInfo(contract, tokenId);
  }
  await displayTokenMetadata(contract);
};
