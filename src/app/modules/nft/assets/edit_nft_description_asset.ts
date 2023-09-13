/* eslint-disable @typescript-eslint/no-unsafe-return */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
import { BaseAsset } from 'lisk-sdk';
import { getAllNFTTokens, setAllNFTTokens } from '../nft';

export class EditNftDescriptionAsset extends BaseAsset {
	public name = 'editNftDescription';
	public id = 4;

	// define schema for asset
	public schema = {
		$id: 'nft/editNftDescription-asset',
		title: 'EditNftDescriptionAsset transaction asset for nft module',
		type: 'object',
		required: ['nftId', 'description'],
		properties: {
			nftId: {
				dataType: 'bytes',
				fieldNumber: 1,
			},
			description: {
				dataType: 'string',
				fieldNumber: 2,
			},
		},
	};

	public validate({ asset }): void {
		if (asset.nftId === '' || !asset.nftId) {
			throw new Error('NFT id should have value');
		}
		if (asset.description === '' || !asset.description) {
			throw new Error('description cannot be empty');
		}
	}

	public async apply({ asset, transaction, stateStore }): Promise<void> {
		const nftTokens = await getAllNFTTokens(stateStore);
		const nftTokenIndex = nftTokens.findIndex(t => t.id.equals(asset.nftId));

		// verify if the nft exists
		if (nftTokenIndex < 0) {
			throw new Error('Token id not found');
		}

		const token = nftTokens[nftTokenIndex];
		const tokenOwnerAddress = token.ownerAddress;
		const { senderAddress } = transaction;
		// verify that the sender owns the nft

		if (!tokenOwnerAddress.equals(senderAddress)) {
			throw new Error('An NFT description can only be changed by the owner of the NFT.');
		}

		// setting the minimum sell value
		token.description = asset.description;
		nftTokens[nftTokenIndex] = token;
		await setAllNFTTokens(stateStore, nftTokens);
	}
}
