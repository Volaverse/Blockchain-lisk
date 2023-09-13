/* eslint-disable @typescript-eslint/restrict-template-expressions */
/* eslint-disable @typescript-eslint/restrict-plus-operands */
/* eslint-disable @typescript-eslint/no-unsafe-return */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
import { BaseAsset } from 'lisk-sdk';

import { getAllNFTTokens, setAllNFTTokens } from '../nft';

export class PurchaseNftAsset extends BaseAsset {
	public name = 'purchaseNft';
	public id = 1;

	// define schema for asset
	public schema = {
		$id: 'nft/purchaseNft-asset',
		title: 'PurchaseNftAsset transaction asset for nft module',
		type: 'object',
		required: ['nftId', 'purchaseValue'],
		properties: {
			nftId: {
				dataType: 'bytes',
				fieldNumber: 1,
			},
			purchaseValue: {
				dataType: 'uint64',
				fieldNumber: 2,
			},
			name: {
				dataType: 'string',
				fieldNumber: 3,
			},
		},
	};

	public validate({ asset }): void {
		// validate your asset
		if (asset.nftId === '' || !asset.nftId) {
			throw new Error('NFT id should have value');
		}
		if (asset.purchaseValue === '' || !asset.purchaseValue) {
			throw new Error('purchaseValue should have value');
		}
		if (asset.purchaseValue <= 0) {
			throw new Error('The NFT purchase value needs to be more than 0');
		}
	}

	// eslint-disable-next-line @typescript-eslint/require-await
	public async apply({ asset, transaction, stateStore, reducerHandler }): Promise<void> {
		const nftTokens = await getAllNFTTokens(stateStore);
		const nftTokenIndex = nftTokens.findIndex(t => t.id.equals(asset.nftId));

		// verify if purchasing nft exists
		if (nftTokenIndex < 0) {
			throw new Error('Token id not found');
		}
		const token = nftTokens[nftTokenIndex];
		const tokenOwner = await stateStore.account.get(token.ownerAddress);
		const tokenOwnerAddress = tokenOwner.address;

		// 5.verify if minimum nft purchasing condition met
		if (token && token.minPurchaseMargin === 0) {
			throw new Error('This NFT token can not be purchased');
		}

		const tokenCurrentValue = token.value;
		const tokenMinPurchaseValue =
			tokenCurrentValue + (tokenCurrentValue * BigInt(token.minPurchaseMargin)) / BigInt(100);
		const { purchaseValue } = asset;

		if (tokenMinPurchaseValue > purchaseValue) {
			throw new Error(
				`Token can not be purchased. Purchase value is too low. Minimum value: ${tokenMinPurchaseValue}`,
			);
		}

		const purchaserAddress = transaction.senderAddress;
		const purchaserAccount = await stateStore.account.get(purchaserAddress);

		// remove nft from owner account
		const ownerTokenIndex = tokenOwner.nft.ownNFTs.findIndex(a => a.equals(token.id));
		tokenOwner.nft.ownNFTs.splice(ownerTokenIndex, 1);
		await stateStore.account.set(tokenOwnerAddress, tokenOwner);

		// add nft to purchaser account
		purchaserAccount.nft.ownNFTs.push(token.id);
		await stateStore.account.set(purchaserAddress, purchaserAccount);

		token.ownerAddress = purchaserAddress;
		token.value = purchaseValue;
		token.minPurchaseMargin = 0;
		nftTokens[nftTokenIndex] = token;
		await setAllNFTTokens(stateStore, nftTokens);

		// debit LSK tokens from purchaser account
		await reducerHandler.invoke('token:debit', {
			address: purchaserAddress,
			amount: purchaseValue,
		});

		// credit LSK tokens to purchaser account
		await reducerHandler.invoke('token:credit', {
			address: tokenOwnerAddress,
			amount: purchaseValue,
		});
	}
}
