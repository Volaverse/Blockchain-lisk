/* eslint-disable @typescript-eslint/restrict-template-expressions */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */

import { BaseAsset } from 'lisk-sdk';
import { getAllNFTTokens, setAllNFTTokens, createNFTToken } from '../nft';

export class CreateNftAsset extends BaseAsset {
	public name = 'createNft';
	public id = 0;

	// define schema for asset
	public schema = {
		$id: 'nft/createNft-asset',
		title: 'CreateNftAsset transaction asset for nft module',
		type: 'object',
		required: ['minPurchaseMargin', 'initValue', 'name', 'description', 'category'],
		properties: {
			minPurchaseMargin: {
				dataType: 'uint32',
				fieldNumber: 1,
			},
			initValue: {
				dataType: 'uint64',
				fieldNumber: 2,
			},
			name: {
				dataType: 'string',
				fieldNumber: 3,
			},
			description: {
				dataType: 'string',
				fieldNumber: 4,
			},
			category: {
				dataType: 'uint32',
				fieldNumber: 5,
			},
		},
	};

	public validate({ asset }): void {
		// validate your asset
		if (asset.initValue <= 0) {
			throw new Error('NFT init value is too low.');
		} else if (asset.minPurchaseMargin < 0 || asset.minPurchaseMargin > 100) {
			throw new Error('The NFT minimum purchase value needs to be between 0 and 100.');
		}
	}

	public async apply({ asset, transaction, stateStore, reducerHandler }): Promise<void> {
		const allTokens = await getAllNFTTokens(stateStore);
		const { senderAddress } = transaction;
		const senderAccount = await stateStore.account.get(senderAddress);
		let dup = [];
		// Checking for unique nft name
		if (allTokens.length > 0) {
			dup = allTokens.filter(item => item.name === asset.name);
		}

		if (dup.length > 0) {
			throw new Error('Name of nft should be unique');
		}
		// category 3 is for usernameNFT which anyone can create
		// Other categories NFT can only be created by a particular address
		if (
			senderAddress.toString('hex') !== '16c70194f16fa137d96168823f695d2ddb232554' &&
			!(asset.category === 3 || asset.category === '3')
		) {
			throw new Error(`NFT cannot be created from this account ${senderAddress.toString('hex')}`);
		}
		// create nft
		const nftToken = createNFTToken({
			name: asset.name,
			description: asset.description,
			ownerAddress: senderAddress,
			nonce: transaction.nonce,
			value: asset.initValue,
			minPurchaseMargin: asset.minPurchaseMargin,
			category: asset.category,
		});

		// 6.update sender account with unique nft id
		senderAccount.nft.ownNFTs.push(nftToken.id);
		await stateStore.account.set(senderAddress, senderAccount);

		// 7.debit tokens from sender account to create nft
		await reducerHandler.invoke('token:debit', {
			address: senderAddress,
			amount: asset.initValue,
		});

		// 8.save nfts

		allTokens.push(nftToken);
		await setAllNFTTokens(stateStore, allTokens);
	}
}
