import { TestCardMarket, TestCardMarket__factory } from "../../typechain";

import { waitForFactoryDeployTxOnNetwork } from "../../utils/network";

import type { SignerWithAddress } from "../../utils/types";

export type TestCardMarketDeployParams = {
  name: string;
  symbol: string;
};
export type TestCardMarketDeployResult = {
  contract: TestCardMarket;
  deployParams: TestCardMarketDeployParams;
};
export const deployTestCardMarket = async (
  networkName: string,
  deployer: SignerWithAddress,
  deployParams: TestCardMarketDeployParams,
  logger = (..._data: Array<any>) => {}
): Promise<TestCardMarketDeployResult> => {
  const factory = new TestCardMarket__factory(deployer);

  const contract = await factory.deploy(deployParams.name, deployParams.symbol);
  await waitForFactoryDeployTxOnNetwork(
    networkName,
    contract.deployTransaction,
    logger
  );

  return {
    contract,
    deployParams,
  };
};
