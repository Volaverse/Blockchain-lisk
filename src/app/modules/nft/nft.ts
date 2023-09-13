/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unsafe-return */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */

import { codec, cryptography } from 'lisk-sdk';

export interface nftInterface {
	id: {
		dataType: 'bytes';
	};
	value: {
		dataType: 'uint64';
	};
	ownerAddress: {
		dataType: 'bytes';
	};
	minPurchaseMargin: {
		dataType: 'uint32';
	};
	name: {
		dataType: 'string';
	};
	description: {
		dataType: 'string';
	};
	category: {
		dataType: 'uint32';
	};
}
interface RegisteredNFT {
	registeredNFTTokens: nftInterface[];
}

export const registeredNFTTokensSchema = {
	$id: 'lisk/nft/registeredTokens',
	type: 'object',
	required: ['registeredNFTTokens'],
	properties: {
		registeredNFTTokens: {
			type: 'array',
			fieldNumber: 1,
			items: {
				type: 'object',
				required: ['id', 'value', 'ownerAddress', 'minPurchaseMargin', 'name', 'category'],
				properties: {
					id: {
						dataType: 'bytes',
						fieldNumber: 1,
					},
					value: {
						dataType: 'uint64',
						fieldNumber: 2,
					},
					ownerAddress: {
						dataType: 'bytes',
						fieldNumber: 3,
					},
					minPurchaseMargin: {
						dataType: 'uint32',
						fieldNumber: 4,
					},
					name: {
						dataType: 'string',
						fieldNumber: 5,
					},
					description: {
						dataType: 'string',
						fieldNumber: 6,
					},
					category: {
						dataType: 'uint32',
						fieldNumber: 7,
					},
				},
			},
		},
	},
};

export const CHAIN_STATE_NFT_TOKENS = 'nft:registeredNFTTokens';

// returns nft object with id
export const createNFTToken = ({
	name,
	description,
	ownerAddress,
	nonce,
	value,
	minPurchaseMargin,
	category,
}) => {
	const nonceBuffer = Buffer.alloc(8);
	nonceBuffer.writeBigInt64LE(nonce);
	const seed = Buffer.concat([ownerAddress, nonceBuffer]);
	const id = cryptography.hash(seed);

	return {
		id,
		minPurchaseMargin,
		name,
		description,
		ownerAddress,
		value,
		category,
	};
};
// get list of all nft tokens
export const getAllNFTTokens = async stateStore => {
	const registeredTokensBuffer = await stateStore.chain.get(CHAIN_STATE_NFT_TOKENS);
	if (!registeredTokensBuffer) {
		return [];
	}

	const registeredTokens: any = codec.decode(registeredNFTTokensSchema, registeredTokensBuffer);

	return registeredTokens.registeredNFTTokens;
};
// returns nft tokens as json
export const getAllNFTTokensAsJSON = async dataAccess => {
	const registeredTokensBuffer = await dataAccess.getChainState(CHAIN_STATE_NFT_TOKENS);

	if (!registeredTokensBuffer) {
		return [];
	}

	const registeredTokens = codec.decode<RegisteredNFT>(
		registeredNFTTokensSchema,
		registeredTokensBuffer,
	);

	return codec.toJSON<RegisteredNFT>(registeredNFTTokensSchema, registeredTokens)
		.registeredNFTTokens;
};
// set nft tokens to state store
export const setAllNFTTokens = async (stateStore, NFTTokens) => {
	const registeredTokens = {
		registeredNFTTokens: NFTTokens.sort((a, b) => a.id.compare(b.id)),
	};

	await stateStore.chain.set(
		CHAIN_STATE_NFT_TOKENS,
		codec.encode(registeredNFTTokensSchema, registeredTokens),
	);
};

module.exports = {
	registeredNFTTokensSchema,
	CHAIN_STATE_NFT_TOKENS,
	getAllNFTTokens,
	setAllNFTTokens,
	getAllNFTTokensAsJSON,
	createNFTToken,
};
