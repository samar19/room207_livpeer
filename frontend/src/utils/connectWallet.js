import axios from 'axios';
import { ethers } from 'ethers';
import Minter7 from '../artifacts/contracts/Minter7.sol/Minter7.json';
import { NEXT_PUBLIC_MINTER_ADDRESS } from '../constants';

// Check for MetaMask wallet browser extension
export const hasEthereum = () => {
  return typeof window !== 'undefined' && typeof window.ethereum !== 'undefined'
}

export const connectWallet = async () => {
  // e.preventDefault();
  try {
    const message = "message";
    if (!window.ethereum)
      throw new Error('No crypto wallet found. Please install it.');
    await window.ethereum.send('eth_requestAccounts');
    const provider = new ethers.providers.Web3Provider(window.ethereum);
    const signer = provider.getSigner();
    const signature = await signer.signMessage(message);
    const address = await signer.getAddress();

    return {
      message,
      signature,
      address,
    };
  } catch (err) {
    return (err.message);
  }
}

export const disconnectWallet = async () => {
  document.cookie = 'Authorization=; Path=/; Expires=Thu, 01 Jan 1970 00:00:01 GMT;';
}

export const getNftsForAccount = async (account) => {
  const nfts = [];
  if(!hasEthereum()) return nfts;
  try {
    const provider = new ethers.providers.Web3Provider(window.ethereum);
    const signer = provider.getSigner()
    const contract = new ethers.Contract(NEXT_PUBLIC_MINTER_ADDRESS, Minter7.abi, signer)
    const balance = await contract.balanceOf(account);
    for(let i = 0; i < balance.toNumber(); i++) {
      const tokenId = (await contract.tokenOfOwnerByIndex(account, i)).toNumber();
      const tokenUri = await contract.tokenURI(tokenId);
      const content = (await axios.get(tokenUri)).data;
      nfts.push({...content, nftId: tokenId, nftContractAddress: contract.address });
    }
  } catch(error) {
    console.error(error);
    alert(error.data?.message ?? 'Something went wrong!');
  }
  return nfts;
}

export const sendNft = async (account, nftId) => {
  if(!hasEthereum()) return;
  try {    
    const provider = new ethers.providers.Web3Provider(window.ethereum);
    const signer = provider.getSigner()
    const contract = new ethers.Contract(NEXT_PUBLIC_MINTER_ADDRESS, Minter7.abi, signer)
    const transaction = await contract["safeTransferFrom(address,address,uint256)"](localStorage.getItem("address") /* from */, account /* to */, nftId);
    await transaction.wait()
  } catch(error) {
    console.error(error);
    alert(error.data?.message ?? 'Something went wrong!');
  }
}

export const getMonetizationInfo = async () => {
  const res = {mintRevenues:[], donationRevenues: []};
  if(!hasEthereum()) return res;
  try {
    const provider = new ethers.providers.Web3Provider(window.ethereum);
    const signer = provider.getSigner()

    const address = await signer.getAddress()
    const contract = new ethers.Contract(NEXT_PUBLIC_MINTER_ADDRESS, Minter7.abi, signer)
    const owners = new Set();
    const totalSupply = await contract.totalSupply();
    for (let i=0; i<totalSupply; i++) {
      owners.add(await contract.ownerOf(i))
    }
    for (const owner of owners) {
      res.mintRevenues.push({address: owner, revenue: ethers.utils.formatEther(await contract.addressToAmountMint(owner))});
      res.donationRevenues.push({address: owner, revenue: ethers.utils.formatEther(await contract.addressToAmountDonate(owner))});
    }
  } catch(error) {
    console.error(error);
    alert(error.data?.message ?? 'Something went wrong!');
  }
  return res;
}

export const getContractBalance = async (nftContractAddress) => {
  if (!hasEthereum) return {data: null, error: 'No wallet found!'};
  try {
    const provider = ethers.getDefaultProvider();
    const balance = await provider.getBalance(nftContractAddress);
    return {data: balance.toNumber(), error: null};
  } catch(error) {
    console.error(error);
    return {data: null, error};
  }
}

export const sendCet = async ({amountInCet}) => {
  if(!hasEthereum()) return
  try {
    const provider = new ethers.providers.Web3Provider(window.ethereum);
    const signer = provider.getSigner()

    const address = await signer.getAddress()
    const contract = new ethers.Contract(NEXT_PUBLIC_MINTER_ADDRESS, Minter7.abi, signer)
    const transaction = await contract.donate( { value: ethers.utils.parseEther(amountInCet) })

    await transaction.wait()
  } catch(error) {
    console.error(error);
    alert(error.data?.message ?? 'Something went wrong!');
  }
}