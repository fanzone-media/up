import fs from "fs";
import path from "path";
import csvParse from "csv-parse/lib/sync";
import csvStringify from "csv-stringify";
import stripAnsi from "strip-ansi";
import { snakeCase } from "snake-case";
import { ethers } from "ethers";

import {
  setupUniversalProfileWithKeyManager,
  setupCardToken,
} from "../utils/deployers";
import {
  displayOnChainData,
  displayOffChainData,
  displayError,
  displayTxData,
} from "../utils/display";
import {
  getHdWalletAccounts,
  alreadyDeployedUniversalProfileContracts,
  NamedAccountsInHdWalletWithUniversalProfile,
} from "../utils/hdwallet";
import {
  executeCallToUniversalProfileViaKeyManager,
  executeCallToUniversalProfileViaKeyManagerWithMetaTx,
} from "../utils/universalProfile";
import {
  buildLSPImage,
  LSPMappings,
  LSP3ProfileData,
  getSchemaKey,
} from "../utils/LSPSchema";
import { catFile } from "../utils/ipfs";
import { isLocalTestnet, waitForTxOnNetwork } from "../utils/network";
import { tokenIdAsBytes32 } from "../utils/cardToken";
import {
  LSP6_KEY_MANAGER_PERMISSIONS,
  buildKeyManagerMetaTx,
} from "../utils/keyManager";
import {
  CardToken__factory,
  LSP6KeyManager__factory,
  UniversalProfile,
  UniversalProfile__factory,
} from "../typechain";

import type { TaskArguments, HardhatRuntimeEnvironment } from "hardhat/types";

//
// --- helpers
//

const readCsvFile = (filePath: string): Array<{ [key: string]: string }> => {
  if (!filePath.endsWith(".csv")) {
    throw new Error(`readCsvFile::ERROR file ${filePath} is not a csv file`);
  }

  const fileData = fs.readFileSync(filePath);

  return csvParse(fileData, { columns: true });
};

const buildCsvWriter = (filePath: string) => {
  if (fs.existsSync(filePath)) {
    throw new Error(
      `buildCsvWriter::ERROR file ${filePath} already exists. Will not overwrite.`
    );
  }

  const fileWriteStream = fs.createWriteStream(filePath);
  fileWriteStream.on("error", (error) =>
    console.log("csv fileWriteStream errored", error)
  );

  const csvStringifyStream = csvStringify({ header: true });
  csvStringifyStream.pipe(fileWriteStream);

  const csvWriter = (chunk: any) => {
    csvStringifyStream.write(chunk);
  };

  csvWriter.finish = async () => {
    return new Promise((resolve) => {
      fileWriteStream.on("finish", resolve);

      csvStringifyStream.end();
      fileWriteStream.end();
    });
  };

  return csvWriter;
};

const buildLogger = (filePath: string) => {
  const fileWriteStream = fs.createWriteStream(filePath);
  fileWriteStream.on("error", (error) =>
    console.log("logger fileWriteStream errored", error)
  );

  const logger = (...dataList: Array<any>) => {
    const now = new Date();

    const sanitizedData = stripAnsi(dataList.join(" ")).trim();

    const dataChunks = sanitizedData.split("\n");

    dataChunks.forEach((chunk) => {
      fileWriteStream.write(`[${now.toISOString()}] ${chunk}\n`);
    });

    console.log(...dataList);
  };

  logger.finish = async () => {
    return new Promise((resolve) => {
      fileWriteStream.on("finish", resolve);

      fileWriteStream.end();
    });
  };

  return logger;
};

const getDataFileHandles = (inputFileName: string, networkName: string) => {
  const inputFilePath = path.resolve(
    __dirname,
    "../setup-ecosystem-data",
    inputFileName
  );

  const now = new Date();
  const outputDirPath = inputFilePath.replace(
    /.csv$/,
    `-result-${networkName}-${now.toISOString()}`
  );
  fs.mkdirSync(outputDirPath);

  const outputFilePath = path.resolve(
    outputDirPath,
    inputFileName.replace(/.csv$/, `.output.csv`)
  );
  const logFilePath = path.resolve(
    outputDirPath,
    inputFileName.replace(/.csv$/, `.log.txt`)
  );

  return {
    inputDataList: readCsvFile(inputFilePath),
    csvWriter: buildCsvWriter(outputFilePath),
    logger: buildLogger(logFilePath),
  };
};

const validateCsvSchema = (
  expectedKeys: Array<string>,
  inputDataList: Array<{ [key: string]: string }>
) => {
  if (inputDataList.length === 0) {
    throw new Error("validateCsvSchema provided no records to verify with");
  }

  const sampleRecord = inputDataList[0];

  const missingKeys = expectedKeys.reduce((acc, key) => {
    if (!sampleRecord.hasOwnProperty(key)) {
      acc.push(key);
    }

    return acc;
  }, [] as Array<string>);

  if (missingKeys.length > 0) {
    throw new Error(
      `validateCsvSchema: missing keys "${missingKeys.join(",")}"`
    );
  }
};

const fetchImage = async (
  url: string
): Promise<{ cid: string; fileBuffer: Buffer }> => {
  if (!url.startsWith("ipfs://")) {
    throw new Error("The image should be in ipfs");
  }

  const cid = url.replace(/^ipfs:\/\//, "");
  const fileBuffer = await catFile(cid);

  return { cid, fileBuffer };
};

// l14 testnet is sometimes not importing txs and becomes unresponsive.. if we encounter multiple
// errors during setup tasks we want to exit early
const buildErrorBoundary = (logger: (...data: Array<any>) => void) => {
  const maxErrorCount = 3;

  let errorList: Array<{ recordLabel: string; recordIndex: number }> = [];

  const withErrorBoundary = async (
    recordLabel: string,
    recordIndex: number,
    fn: () => Promise<void>
  ): Promise<void> => {
    try {
      await fn();
    } catch (error: any) {
      logger(
        displayError(
          `error seen while processing record "${recordLabel}" record index "${recordIndex}"`
        )
      );
      logger(error);
      errorList.push({ recordLabel, recordIndex });

      if (errorList.length === maxErrorCount) {
        throw new Error(`reached error limit of ${maxErrorCount}`);
      }
    }
  };

  // to be used for final reporting of whether errors were seen..
  withErrorBoundary.displayErrorSummary = () => {
    if (errorList.length === 0) return;

    logger(
      displayError(
        "there were errors while processing records, fix / run this task again for:"
      )
    );
    logger(displayError(errorList));
  };

  return withErrorBoundary;
};

const verifyContractIsLSP3UniversalProfile = async (
  logger: (...data: Array<any>) => void,
  contract: UniversalProfile,
  fieldName: string
) => {
  logger(
    `checking if ${displayOnChainData(
      contract.address
    )} is a LSP3UniversalProfile`
  );
  const [value] = await contract.getData([
    getSchemaKey("SupportedStandards:LSP3UniversalProfile"),
  ]);
  if (value !== "0xabe425d6") {
    throw new Error(
      `"${fieldName}" ${contract.address} does not look like a LSP3UniversalProfile contract`
    );
  }
};

//
// --- setup tasks
//

type LSP3UniversalProfileDataTemplate = {
  name: string;
  description: string;
  profileImageHash: string;
  profileImageCid: string;
};
const lsp3ProfileDataTemplate: NamedAccountsInHdWalletWithUniversalProfile<LSP3UniversalProfileDataTemplate> =
  {
    owner: {
      name: "owner",
      description: "the deployer and owner of things",
      profileImageHash:
        "0x8b96170f65d156fda8b81d7d2c71df4a0b1f3927eaf23e2499b01bf8e0f082bc",
      profileImageCid: "QmPPnUCCEynNW3C4rRhngSt6osf9kqrmZ6W56vhybpyzv6",
    },
    tokenReceiver: {
      name: "a card receiver",
      description: "cards are transfered to them",
      profileImageHash:
        "0x08303fc75dde41f139d047020423cfc150933bb1d99aaeaf5325e228ccc6ccce",
      profileImageCid: "QmQWBUQwFU7oG5g1idagnJSSg41DTF9xQfEKJ1XF5tQKr2",
    },
    tokenBuyer: {
      name: "a card buyer",
      description: "buyer of cards",
      profileImageHash:
        "0x3a70a0f83171c7b44efa62fd8fbcf67d1bb9854ef1055e7bf50335a66bd7a34c",
      profileImageCid: "QmPr3NMiq89qaSLGZEgMJ4YKhGxzGhK2u9GddwAKjVAd1W",
    },
    athlete: {
      name: "some athlete",
      description: "scores all the goals, gets the high five",
      profileImageHash:
        "0x9a8326aacc0fb773a93de2fbff08f1c063fde600c7ca42ffd74d6e4ec6df3f18",
      profileImageCid: "QmWsX1Cvbk7qTa4T1guzMvXybderqnTq9r1RAYoxx5CR53",
    },
    team: {
      name: "some team",
      description: "their fans are the best",
      profileImageHash:
        "0x5760b624c8704d1f9a479ac5060fa2775312bd6faea82e3022f715c0869305f6",
      profileImageCid: "QmbENU6CzDbPpnRNbxHbizbaWy4oisMo8t961v2kReTDkn",
    },
    league: {
      name: "some league",
      description: "many teams play in this league",
      profileImageHash:
        "0xc7734bc6b7d8eacd335d679dc2f5ccecd9de90d101763688bf1e607721c48c5b",
      profileImageCid: "QmYbkb91YP98F2TQKyaPPU5S6VgDQoEVsniXqn857pLAkW",
    },
  };

const buildLSP3UniversalProfileFromTemplate = (
  template: LSP3UniversalProfileDataTemplate
): LSP3ProfileData => {
  return {
    name: template.name,
    description: template.description,
    profileImage: [
      {
        height: 300,
        width: 300,
        hashFunction: "keccak256(bytes)",
        hash: template.profileImageHash,
        url: `ipfs://${template.profileImageCid}`,
      },
    ],
    backgroundImage: [
      {
        height: 300,
        width: 300,
        hashFunction: "keccak256(bytes)",
        hash: "0x9bec105eb0fb4596b0a0c1b2f0766cc3d98a1db8447ef74ead398605af09c008",
        url: "ipfs://QmdqzTXMAxK9opWeDvmmz9HenzMmRRPZmhZW31yzeTBSVc",
      },
    ],
  };
};

export const setupNamedAccountsInHDWallet = async (
  _args: TaskArguments,
  hre: HardhatRuntimeEnvironment
) => {
  console.log(
    `\ncreating UniversalProfiles for named accounts in hdwallet on network ${displayOnChainData(
      hre.network.name
    )}\n`
  );

  const accounts = await getHdWalletAccounts(hre);

  const deployer = accounts.owner;
  console.log(
    `using deployer address ${displayOnChainData(deployer.address)}\n`
  );

  const accountsWithUniversalProfile = Object.keys(
    alreadyDeployedUniversalProfileContracts
  ) as Array<keyof NamedAccountsInHdWalletWithUniversalProfile<string>>;

  const deployedUniversalProfiles = await accountsWithUniversalProfile.reduce(
    async (accPromise, accountName, index) => {
      const acc = await accPromise;

      const universalProfileOwner = accounts[accountName];

      console.log(
        `---\n(${index + 1}/${
          accountsWithUniversalProfile.length
        }) setting up UniversalProfile for ${displayOffChainData(
          accountName
        )} - START`
      );

      const keyManagerPermissions = {
        keys: [
          LSPMappings.LSP6KeyManagerAddressPermissions.buildKey(
            universalProfileOwner.address
          ),
        ],
        values: [LSP6_KEY_MANAGER_PERMISSIONS.ALL_PERMISSIONS],
      };

      const result = await setupUniversalProfileWithKeyManager(
        hre.network.name,
        deployer,
        buildLSP3UniversalProfileFromTemplate(
          lsp3ProfileDataTemplate[accountName]
        ),
        keyManagerPermissions,
        console.log
      );

      console.log(
        `deployed contracts for UniversalProfile:\n`,
        displayOnChainData({
          UniversalProfile: result.deployedUniversalProfile.contract.address,
          UniversalReceiverDelegate:
            result.deployedUniversalReceiverDelegate.contract.address,
          KeyManager: result.deployedKeyManager.contract.address,
        })
      );

      acc.push({
        name: accountName,
        deployedUniversalProfile:
          result.deployedUniversalProfile.contract.address,
        deployedUniversalReceiverDelegate:
          result.deployedUniversalReceiverDelegate.contract.address,
        deployedKeyManager: result.deployedKeyManager.contract.address,
      });

      console.log(
        `(${index + 1}/${
          accountsWithUniversalProfile.length
        }) setting up UniversalProfile for ${displayOffChainData(
          accountName
        )} - DONE`
      );

      return acc;
    },
    Promise.resolve(
      [] as Array<{
        name: string;
        deployedUniversalProfile: string;
        deployedUniversalReceiverDelegate: string;
        deployedKeyManager: string | undefined;
      }>
    )
  );

  console.log(
    "\ndeployed all UniversalProfiles:\n",
    displayOnChainData(JSON.stringify(deployedUniversalProfiles, null, 2))
  );

  console.log(
    `\n${displayOffChainData("--- copy paste the following to .env file:")}\n`
  );
  console.log(
    "# expected profile addresses (ordered from index 0 of the hdwallet)"
  );
  const envVarUniversalProfileList = deployedUniversalProfiles.reduce(
    (acc, { name, deployedUniversalProfile }) => {
      const envVar = snakeCase(`PROFILE_ADDRESS_${name}`).toUpperCase();

      acc.push(`${envVar}=${deployedUniversalProfile}`);

      return acc;
    },
    [] as Array<string>
  );
  console.log(envVarUniversalProfileList.join("\n"));

  console.log(
    "\n# expected meta tx recipient addresses (ordered from index 0 of the hdwallet)"
  );
  const envVarKeyManagerList = deployedUniversalProfiles.reduce(
    (acc, { name, deployedKeyManager }) => {
      const envVar = snakeCase(`KEY_MANAGER_${name}`).toUpperCase();

      acc.push(`${envVar}=${deployedKeyManager || ""}`);

      return acc;
    },
    [] as Array<string>
  );

  console.log(envVarKeyManagerList.join("\n"));
};

export const setupUniversalProfilesFromCsv = async (
  args: TaskArguments,
  hre: HardhatRuntimeEnvironment
) => {
  const { inputFile } = args;

  const { inputDataList, csvWriter, logger } = getDataFileHandles(
    inputFile,
    hre.network.name
  );

  const withErrorBoundary = buildErrorBoundary(logger);
  try {
    validateCsvSchema(
      [
        "profile_name",
        "profile_description",
        "profile_imageUrl",
        "profile_backgroundImageUrl",
      ],
      inputDataList
    );

    logger(
      "\nbegin setup for UniversalProfiles on network",
      displayOnChainData(hre.network.name),
      "\n"
    );

    const accounts = await getHdWalletAccounts(hre);
    const deployer = accounts.owner;
    logger(`using deployer address ${displayOnChainData(deployer.address)}`);

    for (let [index, inputProfileData] of inputDataList.entries()) {
      await withErrorBoundary(
        inputProfileData.profile_name,
        index,
        async () => {
          logger(
            `---\n(${index + 1}/${inputDataList.length}) creating profile for`,
            displayOffChainData(inputProfileData.profile_name),
            "- START"
          );

          logger("fetching profile image");
          const profileImage = await fetchImage(
            inputProfileData.profile_imageUrl
          );
          const encodedProfileImage = inputProfileData.profile_imageUrl
            ? await buildLSPImage(profileImage.fileBuffer, profileImage.cid)
            : null;

          logger("fetching background image");
          const backgroundImage = await fetchImage(
            inputProfileData.profile_backgroundImageUrl
          );
          const encodedProfileBackgroundImage =
            inputProfileData.profile_backgroundImageUrl
              ? await buildLSPImage(
                  backgroundImage.fileBuffer,
                  backgroundImage.cid
                )
              : null;

          const lsp3ProfileData = {
            name: inputProfileData.profile_name,
            description: inputProfileData.profile_description,
            profileImage: encodedProfileImage ? [encodedProfileImage] : [],
            backgroundImage: encodedProfileBackgroundImage
              ? [encodedProfileBackgroundImage]
              : [],
          };

          const keyManagerPermissions = {
            keys: [
              LSPMappings.LSP6KeyManagerAddressPermissions.buildKey(
                deployer.address
              ),
            ],
            values: [
              // TODO: determine if some subset of permissions is better to give deployer address
              LSP6_KEY_MANAGER_PERMISSIONS.ALL_PERMISSIONS,
            ],
          };

          const result = await setupUniversalProfileWithKeyManager(
            hre.network.name,
            deployer,
            lsp3ProfileData,
            keyManagerPermissions,
            logger
          );

          // TODO: some of this is extra as we are just echoing it from the input.csv, whats the
          // minimum required fields for the output.csv
          csvWriter({
            profile_address: result.deployedUniversalProfile.contract.address,
            profile_name: inputProfileData.profile_name,
            profile_description: inputProfileData.profile_name,
            profile_imageUrl: encodedProfileImage?.url,
            profile_backgroundImageUrl: encodedProfileBackgroundImage?.url,
            profile_keyManager: result.deployedKeyManager.contract.address,
          });

          logger(
            `(${index + 1}/${inputDataList.length}) creating profile for`,
            displayOffChainData(inputProfileData.profile_name),
            "- END"
          );
        }
      );
    }

    logger(`---\nDONE - processed ${inputDataList.length} profiles`);
  } catch (error: any) {
    logger(
      `\n${displayError(
        "TASK ERROR - please review what records were processed"
      )}\n`
    );
    logger(error);
  } finally {
    withErrorBoundary.displayErrorSummary();

    await Promise.all([csvWriter.finish(), logger.finish()]);
  }
};

export const setupCardsFromCsv = async (
  args: TaskArguments,
  hre: HardhatRuntimeEnvironment
) => {
  const { inputFile, withMetaTx } = args;

  const { inputDataList, csvWriter, logger } = getDataFileHandles(
    inputFile,
    hre.network.name
  );

  const withErrorBoundary = buildErrorBoundary(logger);
  try {
    validateCsvSchema(
      [
        "card_amount",
        "card_batch",
        "card_batchMax",
        "card_cardType",
        "card_edition",
        "card_editionCategory",
        "card_editionSet",
        "card_imageUrl",
        "card_leagueLabel",
        "card_metacardIndex",
        "card_scoreMax",
        "card_scoreMin",
        "card_scoreScale",
        "card_scoreMaxTokenId",
        "card_season",
        "card_teamLabel",
        "card_tier",
        "card_tierLabel",
        "card_zoneLabel",
        "card_creatorLeague",
        "card_creatorTeam",
        "card_creatorPlayer",
        "card_mergedName",
      ],
      inputDataList
    );

    logger(
      "\nbegin setup for CardTokens on network",
      displayOnChainData(hre.network.name),
      "\n"
    );

    const accounts = await getHdWalletAccounts(hre);
    const deployer = accounts.owner;
    const deployerUniversalProfile = UniversalProfile__factory.connect(
      alreadyDeployedUniversalProfileContracts.owner,
      deployer
    );
    logger(`using deployer address ${displayOnChainData(deployer.address)}`);
    logger(
      `using deployer profile address ${displayOnChainData(
        deployerUniversalProfile.address
      )}`
    );

    const alreadyDeployedKeyManager = process.env.KEY_MANAGER_OWNER as string;
    const deployerKeyManager = LSP6KeyManager__factory.connect(
      alreadyDeployedKeyManager,
      deployer
    );

    // sanity check that deployerKeyManager is deployed at address & setup correctly
    const keyManagerAccount = await deployerKeyManager.account();
    if (keyManagerAccount !== deployerUniversalProfile.address) {
      throw new Error(
        `KeyManager.account is not connected to correct UniversalProfile, expected: ${deployerUniversalProfile.address} got: ${keyManagerAccount}`
      );
    }

    for (let [index, inputCardData] of inputDataList.entries()) {
      await withErrorBoundary(
        inputCardData.card_mergedName,
        index,
        async () => {
          logger(
            `---\n(${index + 1}/${inputDataList.length}) creating card for`,
            displayOffChainData(inputCardData.card_mergedName),
            "- START"
          );

          logger("fetching card image");
          const cardImage = await fetchImage(inputCardData.card_imageUrl);
          const encodedCardImage = await buildLSPImage(
            cardImage.fileBuffer,
            cardImage.cid
          );

          const contractDeployParams = {
            name: inputCardData.card_mergedName,
            symbol: inputCardData.card_symbol || "FNZ",
            tokenSupplyCap: inputCardData.card_amount,
            scoreMin: inputCardData.card_scoreMin,
            scoreMax: inputCardData.card_scoreMax,
            scoreScale: inputCardData.card_scoreScale,
            scoreMaxTokenId: inputCardData.card_scoreMaxTokenId,
            creators: [
              inputCardData.card_creatorPlayer,
              inputCardData.card_creatorTeam,
              inputCardData.card_creatorLeague,
            ],
            creatorRevenueShares: [
              inputCardData.card_creatorPlayerRevenueShare || 100,
              inputCardData.card_creatorTeamRevenueShare || 0,
              inputCardData.card_creatorLeagueRevenueShare || 0,
            ],
            isMigrating: false,
          };
          const lsp4MetadataData = {
            description: inputCardData.metadata_description,
            images: encodedCardImage ? [[encodedCardImage]] : [[]],
          };
          const lsp4MetadataDataExtra = {
            // extra Fanzone fields
            batch: inputCardData.card_batch,
            batchMax: inputCardData.card_batchMax,
            cardType: inputCardData.card_cardType,
            edition: inputCardData.card_edition,
            editionCategory: inputCardData.card_editionCategory,
            editionSet: inputCardData.card_editionSet,
            leagueLabel: inputCardData.card_leagueLabel,
            metacardIndex: inputCardData.card_metacardIndex,
            scoreMax: inputCardData.card_scoreMax,
            scoreMin: inputCardData.card_scoreMin,
            season: inputCardData.card_season,
            teamLabel: inputCardData.card_teamLabel,
            tier: inputCardData.card_tier,
            tierLabel: inputCardData.card_tierLabel,
            zoneLabel: inputCardData.card_zoneLabel,
            // extra Opensea fields
            // https://docs.opensea.io/docs/metadata-standards
            image: encodedCardImage.url,
          };

          const result = await setupCardToken(
            hre.network.name,
            deployer,
            deployerUniversalProfile,
            deployerKeyManager,
            contractDeployParams,
            lsp4MetadataData,
            lsp4MetadataDataExtra,
            withMetaTx,
            logger
          );

          // use hardhat-etherscan plugin to verify the contract on etherscan/polygonscan or their testnets
          try {
            await hre.run("verify:verify", {
              address: result.deployedCardToken.contract.address,
              constructorArguments: [
                contractDeployParams.name,
                contractDeployParams.symbol,
                contractDeployParams.creators,
                contractDeployParams.creatorRevenueShares,
                contractDeployParams.tokenSupplyCap,
                contractDeployParams.scoreMin,
                contractDeployParams.scoreMax,
                contractDeployParams.scoreScale,
                contractDeployParams.scoreMaxTokenId,
                contractDeployParams.isMigrating,
              ],
            });
          } catch (error: any) {
            // plugin "@nomiclabs/hardhat-etherscan" errors if the bytecode has already been verfied
            const expectedErrorRegExp = new RegExp(/Reason: Already Verified/);
            if (expectedErrorRegExp.test(error.message)) {
              console.log(error.message);
            } else {
              throw error;
            }
          }

          // TODO: some of this is extra as we are just echoing it from the input.csv, whats the
          // minimum required fields for the output.csv
          csvWriter({
            card_address: result.deployedCardToken.contract.address,
            card_name: inputCardData.card_mergedName,
            card_tokenSupplyCap: inputCardData.card_amount,
            card_imageUrl: encodedCardImage.url,
            card_creatorLeague: inputCardData.card_creatorLeague,
            card_creatorTeam: inputCardData.card_creatorTeam,
            card_creatorPlayer: inputCardData.card_creatorPlayer,
          });

          logger(
            `(${index + 1}/${inputDataList.length}) creating card for`,
            displayOffChainData(inputCardData.card_mergedName),
            "- END"
          );
        }
      );
    }

    logger(`---\nDONE - processed ${inputDataList.length} cards`);
  } catch (error: any) {
    logger(
      `\n${displayError(
        "TASK ERROR - please review what records were processed"
      )}\n`
    );
    logger(error);
  } finally {
    withErrorBoundary.displayErrorSummary();

    await Promise.all([csvWriter.finish(), logger.finish()]);
  }
};

export const setupCardUnpacksFromCsv = async (
  args: TaskArguments,
  hre: HardhatRuntimeEnvironment
) => {
  const { inputFile, withMetaTx } = args;

  const { inputDataList, csvWriter, logger } = getDataFileHandles(
    inputFile,
    hre.network.name
  );

  const withErrorBoundary = buildErrorBoundary(logger);
  try {
    validateCsvSchema(
      ["to_profile", "card_address", "card_tokenId"],
      inputDataList
    );

    logger(
      `\nbegin setup for CardToken transfers via unpacking on network ${displayOnChainData(
        hre.network.name
      )}\n`
    );

    const accounts = await getHdWalletAccounts(hre);
    const deployer = accounts.owner;
    const deployerUniversalProfile = UniversalProfile__factory.connect(
      alreadyDeployedUniversalProfileContracts.owner,
      deployer
    );
    logger(`using deployer address ${displayOnChainData(deployer.address)}`);
    logger(
      `using deployer profile address ${displayOnChainData(
        deployerUniversalProfile.address
      )}`
    );

    const alreadyDeployedKeyManager = process.env.KEY_MANAGER_OWNER as string;
    const deployerKeyManager = LSP6KeyManager__factory.connect(
      alreadyDeployedKeyManager,
      deployer
    );

    // sanity check that deployerKeyManager is deployed at address & setup correctly
    const keyManagerAccount = await deployerKeyManager.account();
    if (keyManagerAccount !== deployerUniversalProfile.address) {
      throw new Error(
        `KeyManager.account is not connected to correct profile, expected: ${deployerUniversalProfile.address} got: ${keyManagerAccount}`
      );
    }

    logger(
      `using deployerKeyManager address ${displayOnChainData(
        deployerKeyManager.address
      )}`
    );

    for (let [index, inputCardUnpackData] of inputDataList.entries()) {
      await withErrorBoundary(
        `${inputCardUnpackData.card_address} - tokenId ${inputCardUnpackData.card_tokenId}`,
        index,
        async () => {
          logger(
            `---\n(${index + 1}/${inputDataList.length}) unpackCard`,
            displayOnChainData(inputCardUnpackData.card_address),
            `tokenId ${inputCardUnpackData.card_tokenId}`,
            "->",
            displayOnChainData(inputCardUnpackData.to_profile),
            "- START"
          );

          const toUniversalProfile = UniversalProfile__factory.connect(
            inputCardUnpackData.to_profile,
            deployer
          );

          await verifyContractIsLSP3UniversalProfile(
            logger,
            toUniversalProfile,
            "to_profile"
          );

          const cardToken = CardToken__factory.connect(
            inputCardUnpackData.card_address,
            deployer
          );

          logger(
            `checking if ${displayOnChainData(
              cardToken.address
            )} is a CardToken`
          );
          await cardToken.calculateScore(
            tokenIdAsBytes32(inputCardUnpackData.card_tokenId)
          );

          logger(
            `checking if tokenId ${displayOnChainData(
              inputCardUnpackData.card_tokenId
            )} is available to unpack`
          );
          try {
            const preTokenOwnerOf = await cardToken.tokenOwnerOf(
              tokenIdAsBytes32(inputCardUnpackData.card_tokenId)
            );

            throw new Error(
              `tokenId ${inputCardUnpackData.card_tokenId} already owned by ${preTokenOwnerOf}`
            );
          } catch (error: any) {
            const expectedError = "LSP8: can not query non existent token";
            if (
              isLocalTestnet(hre.network.name) &&
              error.message.indexOf(expectedError) === -1
            ) {
              throw error;
            }
          }

          let sentTx;
          logger("calling unpackCard on CardToken");

          const unpackCardTxData = cardToken.interface.encodeFunctionData(
            "unpackCard",
            [
              inputCardUnpackData.to_profile,
              tokenIdAsBytes32(inputCardUnpackData.card_tokenId),
            ]
          );

          const universalProfileExecuteTxData =
            deployerUniversalProfile.interface.encodeFunctionData("execute", [
              "0x0",
              cardToken.address,
              "0",
              unpackCardTxData,
            ]);

          if (withMetaTx) {
            logger("using meta tx");

            const { metaTxNonce, metaTxSignature } =
              await buildKeyManagerMetaTx(
                deployerKeyManager,
                deployer,
                universalProfileExecuteTxData
              );

            const txResult = await waitForTxOnNetwork(
              hre.network.name,
              executeCallToUniversalProfileViaKeyManagerWithMetaTx(
                deployerKeyManager.connect(deployer),
                universalProfileExecuteTxData,
                metaTxNonce,
                metaTxSignature
              )
            );

            sentTx = txResult.sentTx;
          } else {
            const txResult = await waitForTxOnNetwork(
              hre.network.name,
              executeCallToUniversalProfileViaKeyManager(
                deployerKeyManager,
                universalProfileExecuteTxData
              )
            );

            sentTx = txResult.sentTx;
          }

          logger("checking that unpack was successful");
          const postTokenOwnerOf = await cardToken.tokenOwnerOf(
            tokenIdAsBytes32(inputCardUnpackData.card_tokenId)
          );
          if (
            ethers.utils.getAddress(postTokenOwnerOf) !==
            ethers.utils.getAddress(toUniversalProfile.address)
          ) {
            logger("tx failed", displayTxData(sentTx.hash));
            throw new Error("unpackCard tx was not successful");
          }

          // TODO: anything useful for output csv here?
          csvWriter({
            card_address: inputCardUnpackData.card_address,
            card_tokenId: inputCardUnpackData.card_tokenId,
            to_profile: inputCardUnpackData.to_profile,
          });

          logger(
            `(${index + 1}/${inputDataList.length}) unpackCard`,
            displayOnChainData(inputCardUnpackData.card_address),
            `tokenId ${inputCardUnpackData.card_tokenId}`,
            " -> ",
            displayOnChainData(inputCardUnpackData.to_profile),
            "- END"
          );
        }
      );
    }
  } catch (error: any) {
    logger(
      `\n${displayError(
        "TASK ERROR - please review what records were processed"
      )}\n`
    );
    logger(error);
  } finally {
    withErrorBoundary.displayErrorSummary();

    await Promise.all([csvWriter.finish(), logger.finish()]);
  }
};

export const setupCardTransfersFromCsv = async (
  args: TaskArguments,
  hre: HardhatRuntimeEnvironment
) => {
  const { inputFile, withMetaTx } = args;

  const { inputDataList, csvWriter, logger } = getDataFileHandles(
    inputFile,
    hre.network.name
  );

  const withErrorBoundary = buildErrorBoundary(logger);
  try {
    validateCsvSchema(
      ["from_profile", "to_profile", "card_address", "card_tokenId"],
      inputDataList
    );

    logger(
      `\nbegin setup for CardToken transfers on network ${displayOnChainData(
        hre.network.name
      )}\n`
    );

    const accounts = await getHdWalletAccounts(hre);
    const deployer = accounts.owner;

    for (let [index, inputCardTransferData] of inputDataList.entries()) {
      await withErrorBoundary(
        `${inputCardTransferData.card_address} - tokenId ${inputCardTransferData.card_tokenId}`,
        index,
        async () => {
          logger(
            `---\n(${index + 1}/${inputDataList.length}) transfer card`,
            displayOnChainData(inputCardTransferData.card_address),
            `tokenId ${inputCardTransferData.card_tokenId}`,
            "->",
            displayOnChainData(inputCardTransferData.to_profile),
            "- START"
          );

          const fromUniversalProfile = UniversalProfile__factory.connect(
            inputCardTransferData.from_profile,
            deployer
          );

          await verifyContractIsLSP3UniversalProfile(
            logger,
            fromUniversalProfile,
            "from_profile"
          );

          const toUniversalProfile = UniversalProfile__factory.connect(
            inputCardTransferData.to_profile,
            deployer
          );

          await verifyContractIsLSP3UniversalProfile(
            logger,
            toUniversalProfile,
            "to_profile"
          );

          const cardToken = CardToken__factory.connect(
            inputCardTransferData.card_address,
            deployer
          );

          logger(
            `checking if ${displayOnChainData(
              cardToken.address
            )} is a CardToken`
          );
          await cardToken.calculateScore(
            tokenIdAsBytes32(inputCardTransferData.card_tokenId)
          );

          logger(
            `checking if tokenId ${displayOnChainData(
              inputCardTransferData.card_tokenId
            )} is owned by ${displayOnChainData(
              inputCardTransferData.from_profile
            )}`
          );
          const preTokenOwnerOf = await cardToken.tokenOwnerOf(
            tokenIdAsBytes32(inputCardTransferData.card_tokenId)
          );
          if (
            ethers.utils.getAddress(preTokenOwnerOf) !==
            ethers.utils.getAddress(inputCardTransferData.from_profile)
          )
            throw new Error(
              `tokenId ${inputCardTransferData.card_tokenId} is owned by ${preTokenOwnerOf}, expected owner ${inputCardTransferData.from_profile}`
            );

          let sentTx;
          logger("calling transfer on CardToken");

          const keyManagerAddress = await fromUniversalProfile.owner();
          const fromKeyManager = LSP6KeyManager__factory.connect(
            keyManagerAddress,
            deployer
          );

          // sanity check that fromKeyManager is deployed at address & setup correctly
          const keyManagerAccount = await fromKeyManager.account();
          if (keyManagerAccount !== fromUniversalProfile.address) {
            throw new Error(
              `KeyManager.account is not connected to correct profile, expected: ${fromUniversalProfile.address} got: ${keyManagerAccount}`
            );
          }

          logger(
            `using fromKeyManager address ${displayOnChainData(
              fromKeyManager.address
            )}`
          );

          const transferFromTxData = cardToken.interface.encodeFunctionData(
            "transferFrom",
            [
              inputCardTransferData.from_profile,
              inputCardTransferData.to_profile,
              tokenIdAsBytes32(inputCardTransferData.card_tokenId),
            ]
          );

          const universalProfileExecuteTxData =
            fromUniversalProfile.interface.encodeFunctionData("execute", [
              "0x0",
              cardToken.address,
              "0",
              transferFromTxData,
            ]);

          if (withMetaTx) {
            logger("using meta tx");

            const { metaTxNonce, metaTxSignature } =
              await buildKeyManagerMetaTx(
                fromKeyManager,
                deployer,
                universalProfileExecuteTxData
              );

            const txResult = await waitForTxOnNetwork(
              hre.network.name,
              executeCallToUniversalProfileViaKeyManagerWithMetaTx(
                fromKeyManager.connect(deployer),
                universalProfileExecuteTxData,
                metaTxNonce,
                metaTxSignature
              )
            );

            sentTx = txResult.sentTx;
          } else {
            const txResult = await waitForTxOnNetwork(
              hre.network.name,
              executeCallToUniversalProfileViaKeyManager(
                fromKeyManager,
                universalProfileExecuteTxData
              )
            );
            sentTx = txResult.sentTx;
          }

          logger("checking that transfer was successful");
          const postTokenOwnerOf = await cardToken.tokenOwnerOf(
            tokenIdAsBytes32(inputCardTransferData.card_tokenId)
          );
          if (
            ethers.utils.getAddress(postTokenOwnerOf) !==
            ethers.utils.getAddress(toUniversalProfile.address)
          ) {
            logger("tx failed", displayTxData(sentTx.hash));
            throw new Error("transfer tx was not successful");
          }

          // TODO: anything useful for output csv here?
          csvWriter({
            from_profile: inputCardTransferData.from_profile,
            to_profile: inputCardTransferData.to_profile,
            card_address: inputCardTransferData.card_address,
            card_tokenId: inputCardTransferData.card_tokenId,
          });

          logger(
            `(${index + 1}/${inputDataList.length}) transfer card`,
            displayOnChainData(inputCardTransferData.card_address),
            `tokenId ${inputCardTransferData.card_tokenId}`,
            " -> ",
            displayOnChainData(inputCardTransferData.to_profile),
            "- END"
          );
        }
      );
    }
  } catch (error: any) {
    logger(
      `\n${displayError(
        "TASK ERROR - please review what records were processed"
      )}\n`
    );
    logger(error);
  } finally {
    withErrorBoundary.displayErrorSummary();

    await Promise.all([csvWriter.finish(), logger.finish()]);
  }
};
