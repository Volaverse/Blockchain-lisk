const { BaseAsset } = require("lisk-sdk");
const {
  getAllNFTTokens,
  setAllNFTTokens,
  createNFTToken,
} = require("../nft");

// 1.extend base asset to implement your custom asset
class CreateNFTAsset extends BaseAsset {
  // 2.define unique asset name and id
  name = "createNFT";
  id = 0;
  // 3.define asset schema for serialization
  schema = {
    $id: "lisk/nft/create",
    type: "object",
    required: ["minPurchaseMargin", "initValue", "name","category","imageUrl","x","y","area","landmark","type","bodypart","gender","serialNo"],
    properties: {
      minPurchaseMargin: {
        dataType: "uint32",
        fieldNumber: 1,
      },
      initValue: {
        dataType: "uint64",
        fieldNumber: 2,
      },
      name: {
        dataType: "string",
        fieldNumber: 3,
      },
      description: {
        dataType: "string",
        fieldNumber: 4,
      },
      category: {
        dataType: "uint32",
        fieldNumber: 5,
      },
      imageUrl: {
        dataType: "string",
        fieldNumber: 6,
      },
      x: {
        dataType: "string",
        fieldNumber: 7,
      },
      y: {
        dataType: "string",
        fieldNumber: 8,
      },
      threeDUrl: {
        dataType: "string",
        fieldNumber: 9,
      },
      area: {
        dataType: "string",
        fieldNumber: 10,
      },
      landmark: {
        dataType: "string",
        fieldNumber: 11,
      },
      type: {
        dataType: "string",
        fieldNumber: 12,
      },
      bodypart: {
        dataType: "string",
        fieldNumber: 13,
      },
      gender: {
        dataType: "string",
        fieldNumber: 14,
      },
      serialNo: {
        dataType: "string",
        fieldNumber: 15,
      },
    },
  };
  validate({asset}) {
    if (asset.initValue <= 0) {
      throw new Error("NFT init value is too low.");
    } else if (asset.minPurchaseMargin < 0 || asset.minPurchaseMargin > 100) {
      throw new Error("The NFT minimum purchase value needs to be between 0 and 100.");
    }

  };
  async apply({ asset, stateStore, reducerHandler, transaction }) {
    // 4.verify if sender has enough balance
    const allTokens = await getAllNFTTokens(stateStore);
    const senderAddress = transaction.senderAddress;
    const senderAccount = await stateStore.account.get(senderAddress);
    var dup=[];
    if(allTokens.length>0){
       dup = allTokens.filter((item)=> item.name==asset.name)
    }

    console.log("check for dup length "+dup.length)

    if(dup.length>0){
      throw new Error("Name of nft should be unique");
    }

    if (senderAddress.toString("hex") !='16c70194f16fa137d96168823f695d2ddb232554' && !(asset.category==3 || asset.category=='3')) {
      throw new Error("NFT cannot be created from this account"+senderAddress.toString("hex"));
    }
    // 5.create nft
    const nftToken = createNFTToken({
      name: asset.name,
      description: asset.description,
      ownerAddress: senderAddress,
      nonce: transaction.nonce,
      value: asset.initValue,
      minPurchaseMargin: asset.minPurchaseMargin,
      category: asset.category,
      imageUrl: asset.imageUrl,
      x:asset.x,
      y:asset.y,
      threeDUrl:asset.threeDUrl,
      area: asset.area,
      landmark:asset.landmark,
      type:asset.type,
      bodypart:asset.bodypart,
      gender:asset.gender,
      serialNo:asset.serialNo

    });

    // 6.update sender account with unique nft id
    senderAccount.nft.ownNFTs.push(nftToken.id);
    await stateStore.account.set(senderAddress, senderAccount);

    // 7.debit tokens from sender account to create nft
    await reducerHandler.invoke("token:debit", {
      address: senderAddress,
      amount: asset.initValue,
    });

    // 8.save nfts
    
    allTokens.push(nftToken);
    await setAllNFTTokens(stateStore, allTokens);
  }
}

module.exports = CreateNFTAsset;
