/* eslint-disable @typescript-eslint/no-empty-function */
import { Application } from 'lisk-sdk';
import { NftModule } from "./modules/nft/nft_module";


export const registerModules = (app: Application): void => {

    app.registerModule(NftModule);
};
