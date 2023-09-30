/* eslint-disable @typescript-eslint/restrict-template-expressions */
/* eslint-disable jest/expect-expect */
import { ReducerHandler, StateStore, testing } from "lisk-sdk";
import { CreateNftAsset } from "../../../../../src/app/modules/nft/assets/create_nft_asset";
import { NftModule } from "../../../../../src/app/modules/nft/nft_module";

interface accountInterface {
  nft: {
    ownNFTs: any[];
  };
}

describe("CreateNftAsset", () => {
  let transactionAsset: CreateNftAsset;

  beforeEach(() => {
    transactionAsset = new CreateNftAsset();
  });

  describe("constructor", () => {
    it("should have valid id", () => {
      expect(transactionAsset.id).toEqual(0);
    });

    it("should have valid name", () => {
      expect(transactionAsset.name).toEqual("createNft");
    });

    it("should have valid schema", () => {
      expect(transactionAsset.schema).toMatchSnapshot();
    });
  });

  describe("validate", () => {
    describe("schema validation", () => {
      it("should pass on validate asset", () => {
        const context = testing.createValidateAssetContext({
          asset: {
            name: "testing name ",
            description: "description is ",
            minPurchaseMargin: "1",
            initValue: "10",
            category: "3",
            imageUrl:"imageUrl",
            threeDUrl:"threeDUrl"
          },
          transaction: { senderAddress: Buffer.alloc(0) } as any,
        });

        expect(() => transactionAsset.validate(context)).not.toThrow();
      });

      it("it should throw error that name is missing", () => {
        const context = testing.createValidateAssetContext({
          asset: {
            name: "test",
            description: "description is ",
            minPurchaseMargin: "1",
            initValue: "-1",
            category: "3",
          },
          transaction: { senderAddress: Buffer.alloc(0) } as any,
        });

        expect(() => transactionAsset.validate(context)).toThrow(
          "NFT init value is too low."
        );
      });
    });
  });

  describe("apply", () => {
    let stateStore: StateStore;
    let reducerHandler: ReducerHandler;
    let account: any;
    let context;
    let contextInvalid;

    beforeEach(() => {
      account = testing.fixtures.createDefaultAccount([NftModule]);
      stateStore = new testing.mocks.StateStoreMock({ accounts: [account] });
      reducerHandler = testing.mocks.reducerHandlerMock;
      context = testing.createApplyAssetContext({
        stateStore,
        reducerHandler,
        asset: {
          name: "test 1",
          description: "description is ",
          minPurchaseMargin: "1",
          initValue: "1",
          category: "3",
          imageUrl:"imageUrl",
          threeDUrl:"threeDUrl"
        },
        transaction: {
          senderAddress: account.address,
          nonce: BigInt(0),
        } as any,
      });
      contextInvalid = testing.createApplyAssetContext({
        stateStore,
        reducerHandler,
        asset: {
          name: "test 1",
          description: "description is ",
          minPurchaseMargin: "1",
          initValue: "1",
          category: "2",
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
      it("should create new nft", async () => {
        await transactionAsset.apply(context);
        const updatedSender: accountInterface = await stateStore.account.get(
          account.address
        );

        expect(updatedSender.nft.ownNFTs).toHaveLength(1);
      });
    });

    describe("invalid cases", () => {
      it("should not create new nft", async () => {
        await expect(transactionAsset.apply(contextInvalid)).rejects.toThrow();
      });
    });
  });
});
