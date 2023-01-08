import axios from "axios";
import { API_BASE_URL, NFT_CONTRACT_ADDRESS } from '../constants';

export const getAccessToken = async ({signature, walletPublicAddress, ttlFileUri}) => {
  try{
    const res = await axios.post(
      `${API_BASE_URL}/token`, 
      {
        nonce: 'message',
        signature,
        walletPublicAddress,
        nftContractAddress: NFT_CONTRACT_ADDRESS,
        nftId: '0',
        ttlFileUri
      },
      {
        withCredentials: true,
      }
    );
    return { accessToken: res.data.accessToken, accessLevel: res.data.accessLevel, error: null };
  } catch (error) {
    return { accessToken: null, accessToken: null, error };
  }
};

export const removeAccessToken = async () => {
  const res = await axios.delete(
    `${API_BASE_URL}/token`, {
      withCredentials: true,
    }
  );
  return res.data;
}

export const getContent = async (filename) => {
  try {
    const res = await axios.post(
      `${API_BASE_URL}/download`,
      {
        "filename": filename
      },
      {
        responseType: 'blob',
        withCredentials: true
      }
    );
    return {uri: URL.createObjectURL(res.data), error: null};
  } catch (err) {
    return {uri: null, error: err};
  }
}

export const deleteContent = async (filename) => {
  try {
    const res = await axios.post(
      `${API_BASE_URL}/delete`,
      {
        "filename": filename
      },
      {
        withCredentials: true
      }
    );
    return { data: res.data, error: null };
  } catch (error) {
    return { data: null, error };
  }
}

export const listContents = async () => {
  const res = await axios.post(
    `${API_BASE_URL}/list`,
    {},
    {
      withCredentials: true
    }
  );
  return res.data;
}

export const getContractDetails = async () => {
  try{
    const res = await axios.get(
      `${API_BASE_URL}/contract/${NFT_CONTRACT_ADDRESS}`,
      {
        withCredentials: true,
      }
    );
    return { data: res.data, error: null };
  } catch (error) {
    return { data: null, error };
  }
};

export const generateTokenUri = async () => {
  try{
    const res = await axios.get(
      `${API_BASE_URL}/token-uri/`,
      {
        withCredentials: true,
      }
    );
    return { data: res.data, error: null };
  } catch (error) {
    return { data: null, error };
  }
};


export const uploadTxn = async ({senderAddress, amount}) => {
  try {
    const res = await axios.post(
      `${API_BASE_URL}/upload-txn`,
      {
        senderAddress,
        amount
      },
      {
        withCredentials: true
      }
    );
    return { data: res.data, error: null };
  } catch (error) {
    return { data: null, error };
  }
}