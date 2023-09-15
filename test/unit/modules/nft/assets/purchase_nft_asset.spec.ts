import { ReducerHandler, StateStore, codec, testing } from "lisk-sdk";
import { PurchaseNftAsset } from "../../../../../src/app/modules/nft/assets/purchase_nft_asset";
import { NftModule } from "../../../../../src/app/modules/nft/nft_module";
import {
  createNFTToken,
  getAllNFTTokens,
  registeredNFTTokensSchema,
} from "../../../../../src/app/modules/nft/nft";

describe("PurchaseNftAsset", () => {
  let transactionAsset: PurchaseNftAsset;

  beforeEach(() => {
    transactionAsset = new PurchaseNftAsset();
  });

  describe("constructor", () => {
    it("should have valid id", () => {
      expect(transactionAsset.id).toEqual(1);
    });

    it("should have valid name", () => {
      expect(transactionAsset.name).toEqual("purchaseNft");
    });

    it("should have valid schema", () => {
      expect(transactionAsset.schema).toMatchSnapshot();
    });
  });

  describe("validate", () => {
    describe("schema validation", () => {
      it("should throw errors for missing NFT id", () => {
        const context = testing.createValidateAssetContext({
          asset: {
            purchaseValue: "1",
          },
          transaction: { senderAddress: Buffer.alloc(0) } as any,
        });

        expect(() => transactionAsset.validate(context)).toThrow();
      });
      it("should throw errors for missing  purchase value", () => {
        const context = testing.createValidateAssetContext({
          asset: {
            nftId: "2dfr1",
          },
          transaction: { senderAddress: Buffer.alloc(0) } as any,
        });

        expect(() => transactionAsset.validate(context)).toThrow();
      });
      it("should throw errors for purchase value less than 0", () => {
        const context = testing.createValidateAssetContext({
          asset: {
            nftId: "2dfr1",
            purchaseValue: "-1",
            name: "name",
          },
          transaction: { senderAddress: Buffer.alloc(0) } as any,
        });

        expect(() => transactionAsset.validate(context)).toThrow();
      });
      it("should pass on validate asset", () => {
        const context = testing.createValidateAssetContext({
          asset: {
            nftId: "2dfr1",
            purchaseValue: "12",
            name: "name",
          },
          transaction: { senderAddress: Buffer.alloc(0) } as any,
        });

        expect(() => transactionAsset.validate(context)).not.toThrow();
      });
    });
  });

  describe("apply", () => {
    let stateStore: StateStore;
    let reducerHandler: ReducerHandler;
    let account: any;
    let context;
    let invalidContext;
    let nft;
    let nftObj;

    beforeEach(async () => {
      account = testing.fixtures.createDefaultAccount([NftModule]);
      nft = createNFTToken({
        value: "100",
        ownerAddress: account.address,
        minPurchaseMargin: 1,
        name: "nft 1",
        description: "description",
        category: 3,
        nonce: BigInt(0),
      });
      nftObj = {
        registeredNFTTokens: [nft],
      };

      stateStore = new testing.mocks.StateStoreMock({
        accounts: [account],
      });

      await stateStore.chain.set(
        "nft:registeredNFTTokens",
        codec.encode(registeredNFTTokensSchema, nftObj)
      );
      reducerHandler = testing.mocks.reducerHandlerMock;
      context = testing.createApplyAssetContext({
        stateStore,
        reducerHandler,
        asset: {
          nftId: nft.id,
          name: "name",
          purchaseValue: BigInt(200),
        },
        transaction: {
          senderAddress: account.address,
          nonce: BigInt(0),
        } as any,
      });
      invalidContext = testing.createApplyAssetContext({
        stateStore,
        reducerHandler,
        asset: {
          nftId: nft.id,
          name: "name",
          purchaseValue: BigInt(90),
        },
        transaction: {
          senderAddress: account.address,
          nonce: BigInt(0),
        } as any,
      });
      jest.spyOn(stateStore.chain, "get");
      jest.spyOn(stateStore.chain, "set");
      jest.spyOn(reducerHandler, "invoke");
    });

    describe("valid cases", () => {
      it("should purchase nft", async () => {
        await transactionAsset.apply(context);
        const tokens = await getAllNFTTokens(stateStore);

        expect(tokens[0].value).toEqual(BigInt(200));
      });
    });
    describe("invalid cases", () => {
      it("it should throw error as only owner can change the name", async () => {
        await expect(transactionAsset.apply(invalidContext)).rejects.toThrow();
      });
    });
  });
});
