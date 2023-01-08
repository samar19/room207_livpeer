import GetTokenRequest from '../interfaces/getTokenRequest';
import GetTokenResponse, {
  GetTokenResponseFailure,
  GetTokenResponseSuccess,
} from '../interfaces/getTokenResponse';
import JwtAccessTokenPayload from '../interfaces/jwtAccessTokenPayload';
import { ethers } from 'ethers';
import Web3 from 'web3';
import { AbiItem } from 'web3-utils';
import jwt from 'jsonwebtoken';
import axios, { ResponseType } from 'axios';

async function doesWalletOwnNft({walletPublicAddress, nftContractAddress}:{walletPublicAddress: string, nftContractAddress: string}): Promise<boolean> {
  const resp = await axios({
    method: 'get',
    url: `https://testnet.coinex.net/api/v1/addresses/${walletPublicAddress}/tokens`,
    headers: { 
      'Content-Type': 'application/json',
      'apikey': process.env.COINEX_API_KEY ?? ''
    },
  });
  const items = resp.data.data.crc721 as any[];
  if (items && items?.length > 0) {
    // Check if the wallet has the correct NFT
    return items.filter(i => i.token_info.contract === nftContractAddress && Number(i.balance) >= 1)?.length > 0
  }
  return false;
}

export async function getContractDetails({nftContractAddress}: {nftContractAddress: string}): Promise<any> {
  const resp = await axios({
    method: 'get',
    url: `https://testnet.coinex.net/api/v1/contracts/${nftContractAddress}`,
    headers: { 
      'Content-Type': 'application/json',
      'apikey': process.env.COINEX_API_KEY ?? ''
    },
  });
  return resp.data;
}

async function didWalletCreateNft({walletPublicAddress, nftContractAddress}:{walletPublicAddress: string, nftContractAddress: string}): Promise<boolean> {
  const respData = await getContractDetails({nftContractAddress});
  const creator = respData.data.creator_info.creator as string;
  if (creator && creator?.length > 0) {
    // Check if the wallet has the correct NFT
    return creator === walletPublicAddress;
  }
  return false;
}

function createToken(secret: string, getTokenRequest: GetTokenRequest, accessLevel: 'read' | 'write'): string {
  const expiresIn = '1h';
  const { walletPublicAddress, nftContractAddress, nftId } = getTokenRequest;
  const jwtAccessTokenPayload: JwtAccessTokenPayload = {
    walletPublicAddress,
    nftContractAddress,
    nftId,
    accessLevel
  };
  return jwt.sign(jwtAccessTokenPayload, secret, { expiresIn });
}

export { GetTokenResponseSuccess, GetTokenResponseFailure, GetTokenResponse };
export { JwtAccessTokenPayload };
export default function AuthNft() {
  let _secret: string;
  let _web3: Web3;
  let _deployedContractAddress: string;
  let _deployedContractAbi: AbiItem[];

  return {
    init: function ({
      secret,
      networkEndpoint,
      deployedContractAddress,
      deployedContractAbi,
    }: {
      secret: string;
      networkEndpoint: string;
      deployedContractAddress: string;
      deployedContractAbi: AbiItem[];
    }) {
      _secret = secret;
      _deployedContractAddress = deployedContractAddress;
      _deployedContractAbi = deployedContractAbi;
      _web3 = new Web3(networkEndpoint);
    },
    getDeployedContractAddress: function () {
      return _deployedContractAddress;
    },
    getDeployedContractAbi: function () {
      return _deployedContractAbi;
    },
    getToken: async function (
      getTokenRequest: GetTokenRequest
    ): Promise<GetTokenResponse> {
      const {
        nonce,
        signature,
        walletPublicAddress,
        nftContractAddress,
        nftId,
      } = getTokenRequest;
      try {
        // Verify the signature.
        const signerAddr = ethers.utils.verifyMessage(nonce, signature);
        if (signerAddr !== walletPublicAddress) {
          return {
            data: {
              errorMessage: 'Invalid signature',
              errorCode: 'invalid_signature',
            },
            code: 400,
          };
        }
        // Check if the wallet created the NFT and give write access.
        if (await didWalletCreateNft({walletPublicAddress, nftContractAddress})) {
          const accessLevel = 'write';
          return {
            data: {
              accessToken: createToken(_secret, getTokenRequest, accessLevel),
              walletPublicAddress,
              nftContractAddress,
              accessLevel,
              nftId,
              iat: Date.now(),
              exp: Date.now() + 1000 * 60 * 60 * 24 * 30,
            },
            code: 200,
          };
        }
        // Check if the wallet owns the NFT and give read-only access.
        if (await doesWalletOwnNft({walletPublicAddress, nftContractAddress})) {
          const accessLevel = 'read';
          return {
            data: {
              accessToken: createToken(_secret, getTokenRequest, accessLevel),
              walletPublicAddress,
              nftContractAddress,
              accessLevel,
              nftId,
              iat: Date.now(),
              exp: Date.now() + 1000 * 60 * 60 * 24 * 30,
            },
            code: 200,
          };
        }
        
        return {
          data: {
            errorMessage: 'Invalid NFT',
            errorCode: 'invalid_nft',
          },
          code: 400,
        };
      } catch (err) {
        console.log(err);
        return {
          data: {
            errorMessage: 'Unknown error',
            errorCode: 'unknown_error',
          },
          code: 500,
        };
      }
    },
    verifyToken: function (token: string): boolean {
      try {
        const {accessLevel} = jwt.verify(token, _secret) as JwtAccessTokenPayload;
        return true;
      } catch (err) {
        return false;
      }
    },
  };
}
