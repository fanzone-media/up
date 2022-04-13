# IMPORTANT

This folder is a soft copy of (fanzone-smart-contracts/utils)[https://github.com/fanzone-media/fanzone-smart-contracts/tree/main/utils].

## Why does this folder exist?

When importing modules from (fanzone-smart-contracts/utils)[https://github.com/fanzone-media/fanzone-smart-contracts/tree/main/utils], things were being compiled fine in development environment, e.g. when running `npm start`, but some modules were causing either compilation errors or were being important with `undefined` value when building the web client in production environment, e.g. when running `npm run build`.

Days and weeks worth of effort were put into this problem without any result. It was decided to fix the problem with making a soft copy of the files needed. For example some things like import paths had to be changed and some unused files were removed.
The remaining files still contain unused code which will remain there to maintain similarity between the files.

## TODO

The realy fix is to find the error that's being caused when building in `production` mode. The error is probably caused by webpack. Good luck finding it :)
Don't forget to notify the team when a solution is found!
