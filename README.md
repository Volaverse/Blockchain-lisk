## Overview

Volaverse is an education-focused metaverse powered by the Lisk blockchain. It provides a platform where users can engage in immersive educational experiences using blockchain technology.

## Getting Started

### Prerequisites

To use this backend, you will need to install the following dependencies:

- Nvm
- Node.js v16.15.0(Please note that blockchain might not run on the other versions of Node.js)

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

### Start a node

```
./bin/run start
```
It will take some time to sync the blocks
### Run Tests

```
npm test
```

## Modules
Our NFT module empowers developers to create, manage, and trade non-fungible tokens seamlessly within our blockchain ecosystem

## Assets
Following are the assets in our blockchain:

1. Create NFT asset- It’s to create NFT on blockchain
2. Edit NFT description asset- It’s to edit the description of NFT
3. Edit NFT name asset- It’s to edit the name of NFT
4. Purchase NFT asset- It’s to purchase the NFT
5. Sell NFT asset - It’s to sell the NFT 
6. Transfer NFT asset - It’s to transfer the NFT

 ### Add a new asset

```
lisk generate:asset ModuleName AssetName AssetID
// Example
lisk generate:asset token transfer 1
```

## Plugins
- Faucet- This plugin allows the transfer of faucets to a particular account
   ### Add a new plugin
```
   lisk generate:plugin PluginAlias
   // Example
   lisk generate:plugin httpAPI
```
## Registring Delegate
To register as a delegate, kindly refer to [documentation](https://lisk.com/documentation/run-blockchain/forging.html#registering-a-delegate)
## Learn More

You can learn more in the [documentation](https://lisk.io/documentation/lisk-sdk/index.html).

# License
[Apache License](LICENSE)

