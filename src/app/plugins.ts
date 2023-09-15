/* eslint-disable @typescript-eslint/no-empty-function */
import { Application } from "lisk-sdk";
import { FaucetPlugin } from "@liskhq/lisk-framework-faucet-plugin";

export const registerPlugins = (app: Application): void => {
  app.registerPlugin(FaucetPlugin);
};
