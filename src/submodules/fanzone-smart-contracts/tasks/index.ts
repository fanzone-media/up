import fs from "fs";
import path from "path";
import { task, types } from "hardhat/config";

// hacky way to prevent error when 'typechain/' dir is missing
//
// this happens when we do a `npm run clean` and first time clone of the git repo
if (fs.existsSync(path.resolve(__dirname, "../typechain"))) {
  const { getBalances, getPrivateKeys } = require("./account");
  const { getTxCost } = require("./network");
  const { getCardData } = require("./card-token");
  const {
    getLSP3Data,
    getLSP4Data,
    getLSP5Data,
    getLSP6Data,
  } = require("./lsp");
  const {
    setupNamedAccountsInHDWallet,
    setupUniversalProfilesFromCsv,
    setupCardsFromCsv,
    setupCardUnpacksFromCsv,
    setupCardTransfersFromCsv,
  } = require("./setup-ecosystem");

  //
  // --- Account tasks
  //

  task(
    "fnz:get-account-balances",
    "gets balances of hdwallet accounts"
  ).setAction(getBalances);

  task(
    "fnz:get-account-private-keys",
    "gets private keys of hdwallet accounts"
  ).setAction(getPrivateKeys);

  //
  // --- Network tasks
  //

  task("fnz:get-tx-cost", "returns expected tx cost")
    .setAction(getTxCost)
    .addParam("gasUsed", "amount of gas used")
    .addParam("gasPrice", "gas price in gwei");

  //
  // --- LSP Schema tasks
  //

  task(
    "fnz:get-lsp3-data",
    "reads the LSP3UniversalProfileMetadata schema data"
  )
    .setAction(getLSP3Data)
    .addParam("address", "UniversalProfile address to check");

  task("fnz:get-lsp4-data", "reads the LSP4DigitalAssetMetadata schema data")
    .setAction(getLSP4Data)
    .addParam("address", "LSP 7/8 address to check");

  task("fnz:get-lsp5-data", "reads the LSP5ReceivedAssets schema data")
    .setAction(getLSP5Data)
    .addParam("address", "UniversalProfile address to check");

  task("fnz:get-lsp6-data", "reads the LSP6KeyManager schema data")
    .setAction(getLSP6Data)
    .addParam("address", "UniversalProfile address to check");

  //
  // --- CardToken tasks
  //

  task(
    "fnz:get-card-data",
    "gets on-chain data and LSP4DigitalAssetMetadata schema data for a CardToken"
  )
    .setAction(getCardData)
    .addParam("address", "address of CardToken contract")
    .addOptionalParam(
      "tokenId",
      "tokenId to show additional data for",
      "",
      types.string
    );

  //
  // --- Setup tasks
  //

  task(
    "fnz:setup-quick-deploy-local-testnet-ecosystem",
    "deploys baseline profiles for named accounts in hdwallet, with example profiles and cards"
  ).setAction(async (_args, hre) => {
    await hre.run("fnz:setup-named-accounts-in-hdwallet");
    await hre.run("fnz:setup-profiles-from-csv", {
      inputFile: "example-setup-profiles.csv",
    });
    await hre.run("fnz:setup-cards-from-csv", {
      inputFile: "example-setup-cards.csv",
    });
  });

  task(
    "fnz:setup-named-accounts-in-hdwallet",
    "builds and deploys UniversalProfile for all named accounts from hdwallet (first time setup / fresh deploy of profile contracts on a testnet)"
  ).setAction(setupNamedAccountsInHDWallet);

  task(
    "fnz:setup-profiles-from-csv",
    "setup task that deploys UniversalProfile contracts, sets IPFS data, and transfers ownership to randomly generated private keys for each entry in the input csv"
  )
    .setAction(setupUniversalProfilesFromCsv)
    .addParam("inputFile", "csv file for setup profile input");

  task(
    "fnz:setup-cards-from-csv",
    "setup task that deploys CardTokens contracts, sets IPFS data, and transfers ownership to hdwallet 'owner' for each entry in the input csv"
  )
    .setAction(setupCardsFromCsv)
    .addParam("inputFile", "csv file for setup cards input")
    .addOptionalParam(
      "withMetaTx",
      "whether meta txs should be used when submitting transactions to UniversalProfile via KeyManager",
      false,
      types.boolean
    );

  task(
    "fnz:setup-card-unpacks-from-csv",
    "setup task that unpacks a given tokenId from a CardToken to an address based on each entry in the input csv"
  )
    .setAction(setupCardUnpacksFromCsv)
    .addParam("inputFile", "csv file for setup card unpacks input")
    .addOptionalParam(
      "withMetaTx",
      "whether meta txs should be used when submitting transactions to UniversalProfile via KeyManager",
      false,
      types.boolean
    );

  task(
    "fnz:setup-card-transfers-from-csv",
    "setup task that transfers a given tokenId from a CardToken to an address based on each entry in the input csv"
  )
    .setAction(setupCardTransfersFromCsv)
    .addParam("inputFile", "csv file for setup card transfers input")
    .addOptionalParam(
      "withMetaTx",
      "whether meta txs should be used when submitting transactions to UniversalProfile via KeyManager",
      false,
      types.boolean
    );
}
