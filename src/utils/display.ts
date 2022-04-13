import chalk from "chalk";

const isObject = (x: any) => x === Object(x);

const displayJSON = (data: object) => JSON.stringify(data, null, 2);

const displayData = (data: any) => (isObject(data) ? displayJSON(data) : data);

export const displayOnChainData = (data: any) =>
  chalk.yellow(displayData(data));

export const displayTxData = (data: any) => chalk.magenta(displayData(data));

export const displayOffChainData = (data: any) => chalk.cyan(displayData(data));

export const displayError = (data: any) => chalk.red(displayData(data));
