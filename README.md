# Candy Machine v3 UI Introduction
Hi! This is a production ready **Candy Machine V3** responsive UI which can be easily customized.
Major features of the CMv3 such as Candy Guards are implemented & auto-detected.

#### IMPORTANT: Use of Sugar CLI with this UI
To deploy a Candy Machine using Sugar, be sure to use the version that creates account version v1 Candy Machines. The latest sugar version as of updating this readME (29/04/2023) that supports account version 1 CMs, and this UI is [sugar v2.0.0-beta.2](https://github.com/metaplex-foundation/sugar/releases/tag/v2.0.0-beta.2).

Will look into adding functionality for CMv3 Account version v2 (which supports pNFT, royalty enforcement).

### Preview
![Desktop preview of Candy Machine V3](https://cdn.discordapp.com/attachments/1039648022516215919/1072170298398474250/cmv3.png)
— Desktop preview.

Preview it live [here](https://wearekite-cmv3-ui.vercel.app/).

### Deploy with Vercel *(recommended)*
Vercel is great to host your Candy Machine on, deploy it instantly by clicking the button below.

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https%3A%2F%2Fgithub.com%2Fwearekite%2Fcandy-machine-v3-ui&env=NEXT_PUBLIC_SOLANA_NETWORK,NEXT_PUBLIC_RPC_HOST,NEXT_PUBLIC_CANDY_MACHINE_ID,NEXT_PUBLIC_COLLECTION_IMAGE_URL,NEXT_PUBLIC_COLLECTION_TITLE,NEXT_PUBLIC_COLLECTION_DESCRIPTION,NEXT_PUBLIC_TOKEN_TYPE,NEXT_PUBLIC_WEBSITE_URL,NEXT_PUBLIC_TWITTER_URL,NEXT_PUBLIC_DISCORD_URL&envDescription=For%20documentation%20about%20the%20ENV%20usage%2C%20click%20the%20link%20below&envLink=https%3A%2F%2Fgithub.com%2Fwearekite%2Fcandy-machine-v3-ui%23env-variables&project-name=my-kite-cmv3&repository-name=my-kite-cmv3&demo-title=Candy%20Machine%20UI%20for%20CMv3&demo-description=An%20all-in-one%2C%20production-ready%20candy%20machine%20v3%20UI%20with%20easy%20customization.&demo-url=https%3A%2F%2Fwearekite-cmv3-ui.vercel.app%2F&demo-image=https%3A%2F%2Fcamo.githubusercontent.com%2F0e9d50b8c682fa584d11a6edd89189f7a081e99d9cb4a284207d0bd927a31f73%2F68747470733a2f2f63646e2e646973636f72646170702e636f6d2f6174746163686d656e74732f313033393634383032323531363231353931392f313037323137303239383339383437343235302f636d76332e706e67)

### Implemented features
- [x] Responsive UI
- [x] Single Mint UI
- [x] Multi Mint UI
- [x] Start Time Countdown
- [x] Preview Minted NFTs
- [x] Guards Supported
  - [x] Start Date
  - [x] End Date
  - [x] Sol Payment
  - [x] Token Payment
  - [x] Mint Limit
  - [x] Bot Tax
  - [x] Token Burn
  - [x] Token Gate
  - [x] NFT Payment
  - [x] NFT Burn
  - [x] NFT Gate
  - [x] Redeemed Amount
  - [x] Address Gate
  - [x] Allow List
  - [x] Gatekeeper

### Multi Group 
*For Multi-group functionality use [multi-group](https://github.com/wearekite/candy-machine-v3-ui/tree/multi-group) branch*

![Desktop preview of Multi Group Functionality](https://media.discordapp.net/attachments/869952469516570694/1081582904582357094/multi-mint-groups.png)
— Desktop preview of multi group functionality.

*(PS: For optimal use, limit active/ongoing groups to 1 - button will be added automatically for each active group)*

### Env Variables
```
NEXT_PUBLIC_SOLANA_NETWORK=mainnet/devnet
```
```
NEXT_PUBLIC_RPC_HOST=networkURL
```
```
NEXT_PUBLIC_CANDY_MACHINE_ID=candyMachineID
```
```
optional: NEXT_PUBLIC_COLLECTION_IMAGE_URL=https://linktoyourcollectionimage.zyx
If left blank or undefined it will default to the example image
```
```
optional: NEXT_PUBLIC_COLLECTION_TITLE='Your Collection title'
If left blank or undefined it will default to the example title
```
```
optional: NEXT_PUBLIC_COLLECTION_DESCRIPTION='Your Description for the Collection.'
If left blank or undefined it will default to the example description
```
```
optional: NEXT_PUBLIC_TOKEN_TYPE='If needed, your accepted SPL token label, like e.g. USDC'
If left blank or undefined it will default to "Token"
```
```
optional: NEXT_PUBLIC_WEBSITE_URL=https://linktoyourwebsite.com
If left blank or undefined it will default to "#"
```
```
optional: NEXT_PUBLIC_TWITTER_URL=https://twitter.com/yourproject
If left blank or undefined it will default to "#"
```
```
optional: NEXT_PUBLIC_DISCORD_URL=https://discord.com/yourdiscordserver
If left blank or undefined it will default to "#"
```
*If on Vercel or a similar host you need to add these as environmental variables in your project settings.*

### Quick customization
Want to customize the color scheme? This frontend uses 6 main colors that can be found in [globals.css](/styles/globals.css) change these values and the changes will apply globally.
```
:root {
  --main-background-color: #0E0E0E;
  --alt-background-color: #202020;
  --white: #fff;
  --black: #000;
  --primary: #4E44CE;
  --error: #D92D20;
}
```

### Preview alternative Candy Machine states
![Candy Machine V3 with Start Date](https://media.discordapp.net/attachments/1039648022516215919/1072171560288399440/startdatecmv3.png)
— Candy Machine V3 with Start Date

![Candy Machine V3 with Address Gate, Allow List or other similar guards](https://cdn.discordapp.com/attachments/1039648022516215919/1072171559520833656/privatecmv3.png)
— Candy Machine V3 with Address Gate, Allow List or other similar guards

## Collaborating
Want to collaborate and make the repo better? Feel free to submit a pull request to the main branch.

## Feedback/Support
If you have any feedback or need support, please submit an issue through [Github Issues](https://github.com/wearekite/candy-machine-v3-ui/issues).
