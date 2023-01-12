const { BaseModule } = require("lisk-sdk");
const { getAllNFTTokensAsJSON } = require("./nft");

const CreateNFTAsset = require("./transactions/create_nft_asset");
const PurchaseNFTAsset = require("./transactions/purchase_nft_asset");
const TransferNFTAsset = require("./transactions/transfer_nft_asset");
const TransferTestNFTAsset = require("./transactions/transfer_test_nft_asset");
const SellNFTAsset = require("./transactions/sell_nft_asset");
const EditNFTNameAsset = require("./transactions/edit_title_nft_asset")
const EditNFTDescAsset = require("./transactions/edit_description_nft_asset")
// Extend base module to implement your custom module
class NFTModule extends BaseModule {
  name = "nft";
  id = 1024;
  accountSchema = {
    type: "object",
    required: ["ownNFTs"],
    properties: {
      ownNFTs: {
        type: "array",
        fieldNumber: 1,
        items: {
          dataType: "bytes",
        },
      },
    },
    default: {
      ownNFTs: [],
    },
  };
  transactionAssets = [new CreateNFTAsset(), new PurchaseNFTAsset(), new TransferNFTAsset(),new TransferTestNFTAsset(),new SellNFTAsset(),new EditNFTNameAsset(),new EditNFTDescAsset()];
  actions = {
    // get all the registered NFT tokens from blockchain
    getAllNFTTokens: async () => getAllNFTTokensAsJSON(this._dataAccess),
  };
}

module.exports = { NFTModule };
