## Overview

Volaverse is an education-focused metaverse powered by the Lisk blockchain. It provides a platform where users can engage in immersive educational experiences using blockchain technology.

## Getting Started

### Prerequisites

To use this backend, you will need to install the following dependencies:

- Nvm
- Node.js v12.0.0(Please note that blockchain might not run on the other versions of nodeJs)

### Installation

1. After installing Node.js, clone the Volaverse repository:

   ```sh
   git clone https://github.com/Volaverse/Blockchain-lisk.git
2. Go to the blockchain directory
   ```sh
    cd Blockchain-lisk
2. Install the dependencies
   ```sh
    npm install

## Modules
Our NFT module empowers developers to create, manage, and trade non-fungible tokens seamlessly within our blockchain ecosystem

## Assets
Following are the assets in our blockchain:

1. Create nft asset- It’s to create NFT on blockchain
2. Edit nft description asset- It’s to edit the description of NFT
3. Edit nft name asset- It’s to edit the name of NFT
4. Purchase nft asset- It’s to purchase the NFT
5. Sell nft asset - It’s to sell the nft 
6. Transfer nft asset - It’s to transfer the nft

## Plugins
NFThttp Plugin: Seamlessly access NFT-related APIs through this plugin for enhanced functionality within the blockchain application
## Public facing Apis
The following are the public facing apis:

1. To get information about blockchain, you would make a GET request to the following URL:
http://localhost:4000/api/node/info

2. To information about a particular address, you would make a GET request to the following URL:
http://localhost:4000/api/accounts/${address}

3. To get information about transactions, you would make a GET request to the following URL:
http://localhost:8080/api/transactions

4. To get list of NFT’s in the blockchain, you would make a GET request to the following URL:
http://localhost:8080/api/nft_tokens

5. To get information about a particular NFT, you would make a GET request to the following URL:
http://localhost:8080/api/nft_tokens/${id}

6. To send transaction to blockchain, you would make a POST request to the following URL:
http://localhost:4000/api/transactions
       The request body would contain the following JSON data: {transaction}


# License
[Apache License](LICENSE)

