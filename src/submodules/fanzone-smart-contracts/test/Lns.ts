import hre, { ethers } from "hardhat";
import chai from "chai";

import { deployLns, LnsDeployResult } from "../utils/deployers";
import {
  getHdWalletAccounts,
  NamedAccountsToSignerMap,
} from "../utils/hdwallet";
import { vanityNameAsBytes32 } from "../utils/lns";
import {
  getUniversalProfiles,
  getKeyManagerContracts,
  NamedAccountsWithUniversalProfileMap,
} from "./utils/setup";

const { expect } = chai;

describe("LNS", function () {
  let context: LnsDeployResult;
  let accounts: NamedAccountsToSignerMap;
  let universalProfiles: NamedAccountsWithUniversalProfileMap;

  before(async () => {
    accounts = await getHdWalletAccounts(hre);
    universalProfiles = await getUniversalProfiles(accounts);
    await getKeyManagerContracts(accounts, universalProfiles);
    context = await deployLns(hre.network.name, accounts.owner, {
      name: "Lukso.me",
      symbol: "lns",
      price: ethers.utils.parseEther("0.5"),
    });
  });

  let snapshot: number;
  beforeEach(async () => {
    snapshot = await hre.ethers.provider.send("evm_snapshot", []);
  });

  afterEach(async () => {
    await hre.ethers.provider.send("evm_revert", [snapshot]);
  });

  describe("Set Vanity Name", async () => {
    it("should set name for a universal profile address", async () => {
      await context.contract.setVanityName(
        universalProfiles.athlete.address,
        vanityNameAsBytes32("fanzone"),
        { value: ethers.utils.parseEther("0.5") }
      );

      const vanityNameOwner = await context.contract.tokenOwnerOf(
        vanityNameAsBytes32("fanzone")
      );
      expect(vanityNameOwner).to.eq(universalProfiles.athlete.address);
    });

    it("should not be able to set name for EOA", async () => {
      try {
        await context.contract.setVanityName(
          universalProfiles.athlete.address,
          vanityNameAsBytes32("fanzone"),
          { value: ethers.utils.parseEther("0.5") }
        );
      } catch (e) {
        const message = new String(e);
        expect(message.includes("LSP8: token receiver is EOA")).to.be.true;
      }
    });

    it("should not set name of less than 5 characters", async () => {
      try {
        await context.contract.setVanityName(
          universalProfiles.athlete.address,
          vanityNameAsBytes32("fanz"),
          { value: ethers.utils.parseEther("0.5") }
        );
      } catch (e) {
        const message = new String(e);
        expect(
          message.includes("name should be between 5 to 15 characters long")
        ).to.be.true;
      }
    });

    it("should not set name of greater than 15 characters", async () => {
      try {
        await context.contract.setVanityName(
          universalProfiles.athlete.address,
          vanityNameAsBytes32("fanzonenamingservice"),
          { value: ethers.utils.parseEther("0.5") }
        );
      } catch (e) {
        const message = new String(e);
        expect(
          message.includes("name should be between 5 to 15 characters long")
        ).to.be.true;
      }
    });

    it("should not set name which includes restricted characters", async () => {
      try {
        await context.contract.setVanityName(
          universalProfiles.athlete.address,
          vanityNameAsBytes32("fanzone*"),
          { value: ethers.utils.parseEther("0.5") }
        );
      } catch (e) {
        const message = new String(e);
        expect(message.includes("character not allowed")).to.be.true;
      }
    });

    it("should not set name if the required amount is not paid", async () => {
      await expect(
        context.contract.setVanityName(
          universalProfiles.athlete.address,
          vanityNameAsBytes32("fanzone"),
          { value: ethers.utils.parseEther("0.4") }
        )
      ).to.be.revertedWith("wrong amount sent");
    });

    it("should not set multiple names for a address", async () => {
      await context.contract.setVanityName(
        universalProfiles.athlete.address,
        vanityNameAsBytes32("fanzone"),
        { value: ethers.utils.parseEther("0.5") }
      );
      await expect(
        context.contract.setVanityName(
          universalProfiles.athlete.address,
          vanityNameAsBytes32("fanzone1"),
          { value: ethers.utils.parseEther("0.5") }
        )
      ).to.be.revertedWith("you already have a vanity name");
    });
  });

  describe("Owner", async () => {
    it("owner can update the price of vanity names", async () => {
      const newPrice = ethers.utils.parseEther("1");
      await context.contract.updatePrice(newPrice);

      const getPrice = await context.contract.price();

      expect(getPrice).to.eq(newPrice);
    });

    it("anyone can not update the price of vanity names", async () => {
      const newPrice = ethers.utils.parseEther("1");
      await expect(
        context.contract.connect(accounts.athlete).updatePrice(newPrice)
      ).to.be.revertedWith("Ownable: caller is not the owner");
    });
  });
});
