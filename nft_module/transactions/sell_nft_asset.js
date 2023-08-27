const { BaseAsset } = require("lisk-sdk");
const { getAllNFTTokens, setAllNFTTokens } = require("../nft");

// 1.extend base asset to implement your custom asset
class SellNFTAsset extends BaseAsset {
  // 2.define unique asset name and id
  name = "sellNFT";
  id = 3;
  // 3.define asset schema for serialization
  schema = {
    $id: "lisk/nft/sell",
    type: "object",
    required: ["nftId", "minPurchaseMargin"],
    properties: {
      nftId: {
        dataType: "bytes",
        fieldNumber: 1,
      },
      minPurchaseMargin: {
        dataType: "uint32",
        fieldNumber: 2,
      },
      name: {
        dataType: "string",
        fieldNumber: 3,
      },
    },
  };

  validate({asset}){
    if(asset.nftId==""){
      throw new Error("NFT id should have value");
    }
    if(asset.minPurchaseMargin<0){
      throw new Error(
        "Minimum Purchase Margin value should be more than 0"
      );
    }

  }

  async apply({ asset, stateStore, transaction }) {
    const nftTokens = await getAllNFTTokens(stateStore);
    const nftTokenIndex = nftTokens.findIndex((t) => t.id.equals(asset.nftId));

    // 4.verify if the nft exists
    if (nftTokenIndex < 0) {
      throw new Error("Token id not found");
    }
    if (asset.minPurchaseMargin < 0 || asset.minPurchaseMargin > 100) {
      throw new Error(
        "The NFT minimum purchase value needs to be between 0 and 100."
      );
    }
    const token = nftTokens[nftTokenIndex];
    const tokenOwnerAddress = token.ownerAddress;
    const senderAddress = transaction.senderAddress;
    // 5.verify that the sender owns the nft

    if (!tokenOwnerAddress.equals(senderAddress)) {
      throw new Error("An NFT can only be sold by the owner of the NFT.");
    }

    // setting the minimum sell value

    token.minPurchaseMargin = asset.minPurchaseMargin;
    nftTokens[nftTokenIndex] = token;
    await setAllNFTTokens(stateStore, nftTokens);
  }
}

module.exports = SellNFTAsset;
