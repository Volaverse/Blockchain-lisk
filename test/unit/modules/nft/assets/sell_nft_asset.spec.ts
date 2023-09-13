import { ReducerHandler, StateStore, codec, testing } from 'lisk-sdk';
import { SellNftAsset } from '../../../../../src/app/modules/nft/assets/sell_nft_asset';
import {
	createNFTToken,
	getAllNFTTokens,
	registeredNFTTokensSchema,
} from '../../../../../src/app/modules/nft/nft';
import { NftModule } from '../../../../../src/app/modules/nft/nft_module';

describe('SellNftAsset', () => {
	let transactionAsset: SellNftAsset;

	beforeEach(() => {
		transactionAsset = new SellNftAsset();
	});

	describe('constructor', () => {
		it('should have valid id', () => {
			expect(transactionAsset.id).toEqual(2);
		});

		it('should have valid name', () => {
			expect(transactionAsset.name).toEqual('sellNft');
		});

		it('should have valid schema', () => {
			expect(transactionAsset.schema).toMatchSnapshot();
		});
	});

	describe('validate', () => {
		describe('schema validation', () => {
			it('should throw errors for missing NFT id', () => {
				const context = testing.createValidateAssetContext({
					asset: {
						minPurchaseMargin: '1',
					},
					transaction: { senderAddress: Buffer.alloc(0) } as any,
				});

				expect(() => transactionAsset.validate(context)).toThrow();
			});
			it('should throw errors for missing  minPurchaseMargin', () => {
				const context = testing.createValidateAssetContext({
					asset: {
						nftId: '2dfr1',
					},
					transaction: { senderAddress: Buffer.alloc(0) } as any,
				});

				expect(() => transactionAsset.validate(context)).toThrow();
			});
			it('should pass on validate asset', () => {
				const context = testing.createValidateAssetContext({
					asset: {
						nftId: '2dfr1',
						name: 'name',
						minPurchaseMargin: 1,
					},
					transaction: { senderAddress: Buffer.alloc(0) } as any,
				});

				expect(() => transactionAsset.validate(context)).not.toThrow();
			});
		});
	});

	describe('apply', () => {
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
				value: BigInt('1000000000'),
				ownerAddress: account.address,
				minPurchaseMargin: 0,
				name: 'nft 1',
				description: 'description',
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
				'nft:registeredNFTTokens',
				codec.encode(registeredNFTTokensSchema, nftObj),
			);

			reducerHandler = testing.mocks.reducerHandlerMock;
			context = testing.createApplyAssetContext({
				stateStore,
				reducerHandler,
				asset: {
					nftId: nft.id,
					name: 'nft 1',
					minPurchaseMargin: 2,
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
					name: 'nft 1',
					minPurchaseMargin: 2,
				},
				transaction: {
					senderAddress: Buffer.alloc(0),
					nonce: BigInt(0),
				} as any,
			});
			jest.spyOn(stateStore.chain, 'get');
			jest.spyOn(stateStore.chain, 'set');
			jest.spyOn(reducerHandler, 'invoke');
		});

		describe('valid cases', () => {
			it('should change minPurchaseMargin from 0 of the nft', async () => {
				await transactionAsset.apply(context);
				const tokens = await getAllNFTTokens(stateStore);

				expect(tokens[0].minPurchaseMargin).toEqual(2);
			});
		});

		describe('invalid cases', () => {
			it('it should throw error as only owner can sell the nft', async () => {
				await expect(transactionAsset.apply(invalidContext)).rejects.toThrow();
			});
		});
	});
});
