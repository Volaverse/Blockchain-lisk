import { codec, testing } from 'lisk-sdk';
import { NftModule } from '../../../../src/app/modules/nft/nft_module';
import { createNFTToken, registeredNFTTokensSchema } from '../../../../src/app/modules/nft/nft';

describe('NftModuleModule', () => {
	let nftModule: NftModule;
	let account;
	let nft;
	let nftObj;
	let stateStore;

	beforeEach(async () => {
		nftModule = new NftModule(testing.fixtures.defaultConfig.genesisConfig);
		account = testing.fixtures.createDefaultAccount([NftModule]);
		nft = createNFTToken({
			value: BigInt('1000000000'),
			ownerAddress: account.address,
			minPurchaseMargin: 1,
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
		nftModule.init({
			channel: testing.mocks.channelMock,
			logger: testing.mocks.loggerMock,
			dataAccess: new testing.mocks.DataAccessMock(),
		});

		await stateStore.chain.set(
			'nft:registeredNFTTokens',
			codec.encode(registeredNFTTokensSchema, nftObj),
		);
	});

	describe('constructor', () => {
		it('should have valid id', () => {
			expect(nftModule.id).toEqual(1024);
		});

		it('should have valid name', () => {
			expect(nftModule.name).toEqual('nft');
		});
	});

	describe('getAllNFTTokens action', () => {
		it('should return the array  of NFTs stored in chain state of the nft module', async () => {
			jest
				.spyOn(nftModule['_dataAccess'], 'getChainState')
				.mockResolvedValue(codec.encode(registeredNFTTokensSchema, nftObj));
			const NFTTokens = await nftModule.actions.getAllNFTTokens();

			expect(NFTTokens).toHaveLength(1);
		});
	});
});
