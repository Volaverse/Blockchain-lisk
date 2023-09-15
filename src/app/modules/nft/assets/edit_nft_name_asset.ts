/* eslint-disable @typescript-eslint/restrict-plus-operands */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-return */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
import { BaseAsset } from "lisk-sdk";
import { getAllNFTTokens, setAllNFTTokens } from "../nft";

export class EditNftNameAsset extends BaseAsset {
  public name = "editNftName";
  public id = 3;

  // define schema for asset
  public schema = {
    $id: "nft/editNftName-asset",
    title: "EditNftNameAsset transaction asset for nft module",
    type: "object",
    required: ["nftId", "name"],
    properties: {
      nftId: {
        dataType: "bytes",
        fieldNumber: 1,
      },
      name: {
        dataType: "string",
        fieldNumber: 2,
      },
    },
  };

  public validate({ asset }): void {
    if (asset.nftId === "" || !asset.nftId) {
      throw new Error("NFT id should have value");
    }
    if (asset.name === "" || !asset.name) {
      throw new Error("description cannot be empty");
    }
  }

  // eslint-disable-next-line @typescript-eslint/require-await
  public async apply({ asset, transaction, stateStore }): Promise<void> {
    const nftTokens = await getAllNFTTokens(stateStore);
    const nftTokenIndex = nftTokens.findIndex((t) => t.id.equals(asset.nftId));

    if (asset.name === "") {
      throw new Error("Name cannot be empty");
    }

    // verify if the nft exists
    if (nftTokenIndex < 0) {
      throw new Error("Token id not found");
    }
    // checking for unique nft name
    let dup = [];
    if (nftTokens.length > 0) {
      dup = nftTokens.filter((item) => item.name === asset.name);
    }

    if (dup.length > 0) {
      throw new Error("Name of nft should be unique");
    }
    const token = nftTokens[nftTokenIndex];
    if (token.category !== 3) {
      throw new Error("Name can only be changed of username category");
    }
    const tokenOwnerAddress = token.ownerAddress;
    const { senderAddress } = transaction;
    // verify that the sender owns the nft

    if (!tokenOwnerAddress.equals(senderAddress)) {
      throw new Error("An NFT can only be renamed by the owner of the NFT.");
    }

    // setting the minimum sell value
    token.name = asset.name;
    nftTokens[nftTokenIndex] = token;
    await setAllNFTTokens(stateStore, nftTokens);
  }
}
