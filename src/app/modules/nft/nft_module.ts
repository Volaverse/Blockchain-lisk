/* eslint-disable class-methods-use-this */

import { BaseModule } from 'lisk-sdk';
import { CreateNftAsset } from './assets/create_nft_asset';
import { EditNftDescriptionAsset } from './assets/edit_nft_description_asset';
import { EditNftNameAsset } from './assets/edit_nft_name_asset';
import { PurchaseNftAsset } from './assets/purchase_nft_asset';
import { SellNftAsset } from './assets/sell_nft_asset';
import { getAllNFTTokensAsJSON } from './nft';

export class NftModule extends BaseModule {
	public actions = {
		getAllNFTTokens: async () => getAllNFTTokensAsJSON(this._dataAccess),
	};
	public reducers = {};
	public name = 'nft';
	public transactionAssets = [
		new CreateNftAsset(),
		new PurchaseNftAsset(),
		new SellNftAsset(),
		new EditNftNameAsset(),
		new EditNftDescriptionAsset(),
	];
	public events = [];
	public id = 1024;
	public accountSchema = {
		type: 'object',
		required: ['ownNFTs'],
		properties: {
			ownNFTs: {
				type: 'array',
				fieldNumber: 1,
				items: {
					dataType: 'bytes',
				},
			},
		},
		default: {
			ownNFTs: [],
		},
	};
}
