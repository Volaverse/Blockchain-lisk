/* eslint-disable @typescript-eslint/no-unsafe-return */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable eqeqeq */
import { BaseAsset } from 'lisk-sdk';
import { getAllNFTTokens, setAllNFTTokens } from '../nft';

export class SellNftAsset extends BaseAsset {
	public name = 'sellNft';
	public id = 2;

	// define schema for asset
	public schema = {
		$id: 'nft/sellNft-asset',
		title: 'SellNftAsset transaction asset for nft module',
		type: 'object',
		required: ['nftId', 'minPurchaseMargin'],
		properties: {
			nftId: {
				dataType: 'bytes',
				fieldNumber: 1,
			},
			minPurchaseMargin: {
				dataType: 'uint32',
				fieldNumber: 2,
			},
			name: {
				dataType: 'string',
				fieldNumber: 3,
			},
		},
	};

	public validate({ asset }): void {
		if (asset.nftId == '' || !asset.nftId) {
			throw new Error('NFT id should have value');
		}
		if (asset.minPurchaseMargin == '' || !asset.minPurchaseMargin) {
			throw new Error('NFT id should have value');
		}
		if (asset.minPurchaseMargin < 0) {
			throw new Error('Minimum Purchase Margin value should be more than 0');
		}
	}

	// eslint-disable-next-line @typescript-eslint/require-await
	public async apply({ asset, transaction, stateStore }): Promise<void> {
		const nftTokens = await getAllNFTTokens(stateStore);
		const nftTokenIndex = nftTokens.findIndex(t => t.id.equals(asset.nftId));

		// verify if the nft exists
		if (nftTokenIndex < 0) {
			throw new Error('Token id not found');
		}
		if (asset.minPurchaseMargin < 0 || asset.minPurchaseMargin > 100) {
			throw new Error('The NFT minimum purchase value needs to be between 0 and 100.');
		}
		const token = nftTokens[nftTokenIndex];
		const tokenOwnerAddress = token.ownerAddress;
		const { senderAddress } = transaction;
		// verify that the sender owns the nft

		if (!tokenOwnerAddress.equals(senderAddress)) {
			throw new Error('An NFT can only be sold by the owner of the NFT.');
		}

		// setting the minimum sell value

		token.minPurchaseMargin = asset.minPurchaseMargin;
		nftTokens[nftTokenIndex] = token;
		await setAllNFTTokens(stateStore, nftTokens);
	}
}
