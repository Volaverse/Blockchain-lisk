const { BaseAsset } = require("lisk-sdk");
const { getAllNFTTokens, setAllNFTTokens } = require("../nft");

// 1.extend base asset to implement your custom asset
class EditNFTDescAsset extends BaseAsset {
  // 2.define unique asset name and id
  name = "editNFTDescription";
  id = 6;
  // 3.define asset schema for serialization
  schema = {
    $id: "lisk/nft/editDescription",
    type: "object",
    required: ["nftId", "description"],
    properties: {
      nftId: {
        dataType: "bytes",
        fieldNumber: 1,
      },
      description: {
        dataType: "string",
        fieldNumber: 2,
      },
    },
  };

  async apply({ asset, stateStore, reducerHandler, transaction }) {
    const nftTokens = await getAllNFTTokens(stateStore);
    const nftTokenIndex = nftTokens.findIndex((t) => t.id.equals(asset.nftId));

    if(asset.description==''){
      throw new Error("description cannot be empty")
    }

    // 4.verify if the nft exists
    if (nftTokenIndex < 0) {
      throw new Error("Token id not found");
    }
    
    const token = nftTokens[nftTokenIndex];
    const tokenOwnerAddress = token.ownerAddress;
    const senderAddress = transaction.senderAddress;
    // 5.verify that the sender owns the nft

    if (!tokenOwnerAddress.equals(senderAddress)) {
      throw new Error("An NFT description can only be changed by the owner of the NFT.");
    }

    // setting the minimum sell value
    token.description=asset.description;
    nftTokens[nftTokenIndex] = token;
    await setAllNFTTokens(stateStore, nftTokens);
  }
}

module.exports = EditNFTDescAsset;
