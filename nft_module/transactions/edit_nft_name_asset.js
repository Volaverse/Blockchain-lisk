const { BaseAsset } = require("lisk-sdk");
const { getAllNFTTokens, setAllNFTTokens } = require("../nft");

// 1.extend base asset to implement your custom asset
class EditNFTNameAsset extends BaseAsset {
  // 2.define unique asset name and id
  name = "editNFTName";
  id = 5;
  // 3.define asset schema for serialization
  schema = {
    $id: "lisk/nft/editName",
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
  validate({asset}){

    if(asset.nftId==""){
      throw new Error("NFT id should have value");
    }
    if (asset.name == "") {
      throw new Error("description cannot be empty");
    }

  }

  async apply({ asset, stateStore, reducerHandler, transaction }) {
    const nftTokens = await getAllNFTTokens(stateStore);
    const nftTokenIndex = nftTokens.findIndex((t) => t.id.equals(asset.nftId));

    if (asset.name == "") {
      throw new Error("Name cannot be empty");
    }

    // 4.verify if the nft exists
    if (nftTokenIndex < 0) {
      throw new Error("Token id not found");
    }
    var dup = [];
    if (nftTokens.length > 0) {
      dup = nftTokens.filter((item) => item.name == asset.name);
    }

    console.log("check for dup length " + dup.length);

    if (dup.length > 0) {
      throw new Error("Name of nft should be unique");
    }
    const token = nftTokens[nftTokenIndex];
    const tokenOwnerAddress = token.ownerAddress;
    const senderAddress = transaction.senderAddress;
    // 5.verify that the sender owns the nft

    if (!tokenOwnerAddress.equals(senderAddress)) {
      throw new Error("An NFT can only be renamed by the owner of the NFT.");
    }

    // setting the minimum sell value
    token.name = asset.name;
    nftTokens[nftTokenIndex] = token;
    await setAllNFTTokens(stateStore, nftTokens);
  }
}

module.exports = EditNFTNameAsset;
