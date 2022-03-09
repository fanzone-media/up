import { ERC725, ERC725JSONSchema } from "@erc725/erc725.js";
import { encodeArrayKey, encodeKeyValue } from "@erc725/erc725.js/build/main/lib/utils";
import { ethers, Signer } from "ethers";
import { LSP6KeyManager__factory, UniversalProfile__factory } from "../../submodules/fanzone-smart-contracts/typechain";
import KeyChain from "../utilities/KeyChain";

const LSP6KeyManagerSchemaList: ERC725JSONSchema =
    {
      name: "AddressPermissions[]",
      key: "0xdf30dba06db6a30e65354d9a64c609861f089545ca58c6b4dbe31a5f338cb0e3",
      keyType: "Array",
      valueContent: "Number",
      valueType: "uint256",
    };

type permissionObject = {
    [k: string]: boolean
}

const addPermissions = 
    async (universalProfileAddress: string, address: string, permissions: permissionObject, signer: Signer,) => {
        const encodedData = {
            keys: [],
            values: []
        } as { keys: string[], values: string[]}
        const universalProfileContract = UniversalProfile__factory.connect(universalProfileAddress, signer);
        const owner = await universalProfileContract.owner();
        const KeyManagerContract = LSP6KeyManager__factory.connect(owner, signer);

        const [currentIndex] = await universalProfileContract.getData([KeyChain.LSP6AddressPermissions]);
        const nextIndex  = currentIndex === "0x" ? 0 : ethers.BigNumber.from(currentIndex).toNumber();
        
        const totalIndexvalue = encodeKeyValue(LSP6KeyManagerSchemaList.valueContent, LSP6KeyManagerSchemaList.valueType, String(nextIndex + 1), LSP6KeyManagerSchemaList.name);
        encodedData.keys.push(LSP6KeyManagerSchemaList.key);
        encodedData.values.push(totalIndexvalue);

        const indexArrayKey = encodeArrayKey(LSP6KeyManagerSchemaList.key, nextIndex);
        encodedData.keys.push(indexArrayKey);
        encodedData.values.push(address);

        const encodedPermissionsKey = ERC725.encodeKeyName(`AddressPermissions:Permissions:${address.replace("0x", "")}`);
        const encodedPermissionsValue = ERC725.encodePermissions(permissions);
        encodedData.keys.push(encodedPermissionsKey);
        encodedData.values.push(encodedPermissionsValue);

        const encodedSetDataFunction = universalProfileContract.interface.encodeFunctionData("setData", [
            encodedData.keys,
            encodedData.values
        ]);
        
        await KeyManagerContract.execute(encodedSetDataFunction);
    };

export const KeyManagerApi = {
    addPermissions
};