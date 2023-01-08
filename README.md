# ✨Dappstar ✨

https://dorahacks.io/buidl/3553
Ethereum · Arweave

_Decentralized, temporary & secure access to your favourite content!_
- - -
Before we start, if you are the judge/panelist for , here are important quick links:
1. Live Project: https://dappstar.vercel.app/
2. Demo: https://youtu.be/jwnS7M9jhys
3. How to interact with the live project: https://github.com/ankitshubham97/dappstar#interacting-with-the-live-project

- - -
# Problems with the current state of creator economy?
## Dependency on centralized system
What if the service on which the creator hosted their content goes down? What if the service decides to ban that particular creator for whatever reason? The creator is helpless before such centralized systems!

## Not encrypted, prone to leaks
It is not new to hear of news that due to certain vulnerabilities in the centralized system, the content got leaked. On top of it, they rarely care to encrypt the data and then store it.

## No provision of temporary access (we will solve this with Arseeding!)
Its common that there is a person who is not financially strong enough to pay for expensive subscriptions. Also, they need it only for a brief period of time and not necessarily throughout year; maybe because they are not able to dedicate a daily time to watching the content. But they want to watch it on a Sunday. There are no solutions that enables him to get this 'temporary access'.
- - -
# Solution: Enters Dappstar 😎
Dappstar is a decentralized-yet-private content sharing platform for creators where they can:

- Store by-default-encrypted content on IPFS(so zero dependency on centralized system and protection of their data)
- Token-gate their content; so only that fan who possesses a certain NFT (call this 'Long-NFT') can access the content forever.
- Feature of [Quick-NFTs][quick-nft] (Quick-NFTs are special NFTs that is designed as part of this project which provides its holder a temporary access to the creator's private content. **Quick-NFTs are made possible by Arseeding & we will focus on Quick-NFTs for this hackathon ❤️**)
- - -
# Dappstar walkthrough
The app is live at https://dappstar.vercel.app/ and here is the [demo video][demo]. Let's break down the walkthrough into 2 segments:
- Creator's perspective
- Fan's perspective

For this hackathon, our focus is on [Quick-NFTs][quick-nft] and how arseeding and web3infra helped in their implementation. Feel free to skip to [Quick-NFTs][quick-nft] section.

## Creator's perspective.
Let's assume that Taylor is the creator. For the sake of this hackathon, let's assume that there is only one creator on the Dappstar's platform. Also, her wallet address is 0x4ad53d31Cb104Cf5f7622f1AF8Ed09C3ca980523 and she created an NFT smart contract via this wallet and is currently deployed on [Coinex testnet][chain] at the address [0x476eaA416e7f2DaE54600d86c657c41F4081Ff9C][nft-contract-address]. The NFT contract enables others to mint a token for themselves by paying certain amount in [CET][CET]. This amount flows back to her wallet address. And the holders of the NFT could get access to her content (whether the access is permanent or temporary depends on if the NFT minted was a Long-NFT or a Quick-NFT; we will focus on Quick-NFTs for this hackathon)!
When she signs in with her wallet, she can:
1. view her content
2. manage(add/delete) her content
3. check the revenue generated so far from:
a. others minting her NFTs.
b. others tipping/donating her.

## Fan's perspective
Let's assume Ankit is a fan of Taylor. But he cannot afford to mint one of her Long-NFTs and also, he only wants a temporary access to her content on the upcoming Sunday. So, he goes for minting her Quick-NFT. How? He just goes to the platform at https://dappstar.vercel.app/, connects his wallet and then since he does not own any of her NFTs, he sees an option to mint. He mints, pays the fee and reconnects his wallet. Voila! He is able to see her content. Also, since its a Quick-NFT, he would lose access after 24 hours.
- - -
# Quick-NFTs
Quick-NFTs are ERC-721 tokens which have the following additional features:
1. Charge a minting fee from minters and pass that to the creator.
2. Accept donations from any of the holders of the Quick-NFTs.
3. Give a 24-hour access to the protected content from the time it was minted.
4. They don't get burnt after the 24-hour period; so a holder can keep it as POAP/souvenir!
- - -
# Synergy of Arseeding with NFT: A deep dive
Let's understand how Arseeding is helping to create the Quick-NFTs. There is a feature of Arseeding ecosystem that says that:
```
If you use the Arseeding service provided by web3infra, you need to pay for the response order, otherwise the data will clear after 24 hours.
```
**We are using this limitation to create a real-life use case of providing temporary access!** From a very high level, whenever a Quick-NFT is minted, Dappstar also creates a file called ttlFile and uploads on web3infra without paying. Whenever the client tries to access any protected resource (i.e. the private content), Dappstar checks if the ttlFile was created by the back end and if it still exists. If it does, it means that the access could be given otherwise it is denied!

## Engineering the decentralized temporary access with Arseeding
Let's try to understand how it all works by going through the journey!
1. A fan initiates the journey by minting a Quick-NFT.
2. The client (Dappstar's front end), before initiating the mint call to the NFT smart contract, calls Dappstar's back end to get token-uri (it is for storing NFT metadata like title, NFT's image URI etc; can be ignored for now).
3. Back end, while generating the token-uri, also creates the ttlFile and uploads on web3infra without payment; it uses `createAndSubmitItem` method of `arseeding-js` SDK to do so.
4. Back end responds with the token-uri and ttlFileUri; ttlFileUri is the URI of the ttlFile that is uploaded on the web3infra.
5. Client saves the ttlFileUri in browser's local storage.
6. Client now proceeds to mint the Quick-NFT because now it has the token-uri.
7. User reconnects his wallet with the intention to view the private content.
8. When he connects the wallet, he basically signs a nonce. The client passes the nonce, signature, his wallet address and the saved ttlFileUri to the back end where the latter runs 4 checks: verifies the signature, verifies that the address holds the Quick-NFT, checks that the ttlFile was created by it (using `getItemMeta` method of `arseeding-js`) and ensures that ttlFile exists. If all are satisfied, it issues an access token to the client as a cookie. This access token is valid for an hour
9. The client passes this access token as a cookie to server for all the subsequent requests. If the access token is not expired, the back end responds with the protected content, otherwise it denies.
10. Let's say the access token expires after an hour. The client can again get a new access token until the ttlfile exists and the wallet holds the Quick-NFT!

## Benefits of using Arseeding to accomplish decentralized temporary access
1. Arseeding is a decentralized solution, thus there is a decentralized-trust that if the network commits to deleting the file after 24 hours, it would.
2. It is absolutely free to design the decentralized temporary access because the key is that you should not pay while uploading the file!

## Some negative user flows:
**User tries to connect a random wallet with no Quick-NFT**
He won't be able to get the access token because the wallet must be containing the Quick-NFT!

**User tries to connect a wallet with a Quick-NFT but 24-hour window is already over**
He won't be able to get the access token because the ttlFile must exist!

**User manually creates a duplicate ttlFile & stores its URI in the browser's localstorage**
The duplicate ttlFile's uri will be sent along with other parameters to get the access token. But it would be denied because since the ttlFile was not created by the back end, the check of 'verifying if the ttlFile was created by the back end' would fail!

- - -
# Interacting with the live project
The project is running live on https://dappstar.vercel.app/
[The smart contract is deployed on Coinex testnet.][nft-contract-address]

## Coinex testnet network details (for metamask):
| Network name | Coinex Chain Testnet |
| ------ | ------ |
| New RPC URL | https://testnet-rpc.coinex.net/ |
| Chain ID | 53 |
| Currency symbol | tCET |
| Block explorer | https://testnet.coinex.net/ |

## Checking happy path

If you want to interact with the live app, you would need a Metamask wallet switched to Coinex testnet which has at least one [Quick-NFT][nft-contract-address] (as told in the [demo video][demo]). Please note that if you are the creator of the Quick-NFT contract, then you don't need to own any Quick-NFT to gain access to your own content. Here is a list of valid wallets:

| User type | Public address | Private key |
| ------ | ------ | ------ |
| Creator | 0x4ad53d31Cb104Cf5f7622f1AF8Ed09C3ca980523 | dec5213b700bc944b06584aaf3d508f88a1ce0221b77067b7e7b95d7b88d2ae3 |
| Fan | 0x5d905Cd5734A457139bc04c77CAAf3DFCBf0bA33 | aa2f90405e3595239c83d51dcdb7070e14010c472bb69acc284f38558ddde8d7 |

## Checking unhappy path

To check the unhappy path, you could just use any random wallet to connect to the app.

## Extras
You could also check out these:
1. Use creator's wallet and explore adding/deleting content
2. Use creator's wallet and view revenues
3. Use fan's wallet and explore the private content
4. Use fan's wallet and view the NFTs that you own
5. Use fan's wallet and gift NFT to some other address
6. Use fan's wallet and donate some CETs to the creator
- - -

# Limitations & optimizations
1. The 24-hour period is not configurable because it is directly getting derived from the 24-hour period for which an unpaid uploaded file stays in the web3infra. But I believe this should be easy to make it configurable from web3infra side.
2. We don't verify the ttlFile validity on any request to access the protected resource. It is because it would result in higher API call latency. Instead, we do it lazily while (re)generating the access token. The access tokens are set to expire in an hour, so in order to continue getting access to the protected resource, the client has to fetch a new access token after an hour lapses.

- - -

# Future
I believe temporary access is one of the major pain points of the consumers of the creator economy(CE); especially in the regions with relatively lower-than-average per-capita-income. Temporary access can bring more consumers to the CE. This would undoubtedly benefit the producers of the CE as well as play a crucial role in uplifting the quality of life of the new consumers.

[chain]: <https://testnet.coinex.net/>
[nft-contract-address]: <https://testnet.coinex.net/address/0x476eaA416e7f2DaE54600d86c657c41F4081Ff9C>
[CET]: <https://www.coinex.com/token>
[demo]: <https://youtu.be/jwnS7M9jhys>
[quick-nft]: <https://github.com/ankitshubham97/dappstar#quick-nfts>
