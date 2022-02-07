import hre from "hardhat";
import { expect } from "chai";
import { ethers } from "ethers";

import { getSchemaKey } from "../utils/LSPSchema";
import {
  getTimeoutForNetwork,
  setupTestFanzoneTokenContext,
  TestFanzoneTokenContext,
} from "./utils/setup";

describe("FanzoneToken", function () {
  mocha.suite.timeout(getTimeoutForNetwork(hre.network.name));

  let context: TestFanzoneTokenContext;
  before(async () => {
    context = await setupTestFanzoneTokenContext({
      fanzoneTokenParams: { tokenSupplyCap: "10" },
    });
  });

  let snapshot: number;
  beforeEach(async () => {
    snapshot = await hre.ethers.provider.send("evm_snapshot", []);
  });

  afterEach(async () => {
    await hre.ethers.provider.send("evm_revert", [snapshot]);
  });

  describe("owner", async () => {
    it("should return the owner address", async () => {
      const { universalProfiles, fanzoneToken } = context;

      const owner = await fanzoneToken.contract.owner();
      expect(ethers.utils.getAddress(owner)).to.eq(
        ethers.utils.getAddress(universalProfiles.owner.address),
        "contract starts being owned by UniversalProfile of owner accounts"
      );
    });
  });

  describe("name", async () => {
    it("should return the token name", async () => {
      const { fanzoneToken } = context;

      const name = await fanzoneToken.contract.name();
      expect(name).to.eq(
        fanzoneToken.deployParams.name,
        "can query token name"
      );
    });
  });

  describe("symbol", async () => {
    it("should return the token symbol", async () => {
      const { fanzoneToken } = context;

      const symbol = await fanzoneToken.contract.symbol();
      expect(symbol).to.eq(
        fanzoneToken.deployParams.symbol,
        "can query token symbol"
      );
    });
  });

  describe("decimals", async () => {
    it("should return the token decimals", async () => {
      const { fanzoneToken } = context;

      const symbol = await fanzoneToken.contract.decimals();
      expect(symbol).to.eq("18", "can query token decimals");
    });
  });

  describe("getData", () => {
    it("should allow querying the inherited ERC725Y store", async () => {
      const { fanzoneToken } = context;

      const [metadata] = await fanzoneToken.contract.getData([
        getSchemaKey("SupportedStandards:LSP4DigitalAsset"),
      ]);
      expect(metadata).to.eq(
        "0xa4d96624",
        "SupportedStandards:LSP4DigitalAsset should be set"
      );
    });
  });

  describe("totalSupply", async () => {
    it("should return the amount of cards that have been minted", async () => {
      const { fanzoneToken } = context;

      const totalSupply = await fanzoneToken.contract.totalSupply();
      expect(totalSupply).to.eq(
        fanzoneToken.deployParams.tokenSupplyCap,
        "contract starts with minted tokens equal to tokenSupplyCap"
      );
    });
  });

  describe("tokenSupplyCap", () => {
    it("should return the amount of cards that can be minted", async () => {
      const { fanzoneToken } = context;

      const tokenSupplyCap = await fanzoneToken.contract.tokenSupplyCap();
      expect(tokenSupplyCap).to.eq(
        fanzoneToken.deployParams.tokenSupplyCap,
        "contract tokenSupplyCap shows amount of tokens that can be minted"
      );
    });
  });

  describe("transferFrom", () => {
    it("should allow a user to transfer tokens", async () => {
      const { accounts, fanzoneToken } = context;

      const from = accounts.owner.address;
      const to = accounts.tokenReceiver.address;
      const amount = fanzoneToken.deployParams.tokenSupplyCap;

      // pre-conditions
      const [preBalanceOfFrom, preBalanceOfTo] = await Promise.all([
        fanzoneToken.contract.balanceOf(from),
        fanzoneToken.contract.balanceOf(to),
      ]);
      expect(preBalanceOfFrom.gte(amount)).to.eq(
        true,
        "from address must own at least `amount` tokens"
      );

      // effects
      await fanzoneToken.contract.transferFrom(from, to, amount);

      // post-conditions
      const [postBalanceOfFrom, postBalanceOfTo] = await Promise.all([
        fanzoneToken.contract.balanceOf(from),
        fanzoneToken.contract.balanceOf(to),
      ]);
      expect(postBalanceOfFrom).to.eq(
        preBalanceOfFrom.sub(amount),
        "from address balance decreases by `amount`"
      );
      expect(postBalanceOfTo).to.eq(
        preBalanceOfTo.add(amount),
        "to address balance increases by `amount`"
      );
    });
  });
});
