import { useEffect, useState } from "react";

import Navbar from "./components/Navbar";
import Showcase from "./components/showcase";
import { generateTokenUri, getContent, listContents } from "./utils/rest";

import { ethers } from 'ethers';
import { useCookies } from "react-cookie";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import Minter7 from './artifacts/contracts/Minter7.sol/Minter7.json';
import Sidebar from "./components/Sidebar";
import SingleFileView from "./components/SingleFileView";
import TokensView from "./components/TokensView";
import Welcome from "./components/Welcome";
import { MINT_PRICE, NEXT_PUBLIC_MINTER_ADDRESS } from "./constants";
import { connectWallet, disconnectWallet, hasEthereum } from "./utils/connectWallet";
import { getAccessToken, removeAccessToken } from "./utils/rest";

const App = () => {
  const [loading, setLoading] = useState(false);
  const [account, setAccount] = useState("");
  const [content, setContent] = useState(null);
  const [error, setError] = useState(null);
  const [accessToken, setAccessToken] = useState("");
  const [rerender, setRerender] = useState(false);
  const [photos, setPhotos] = useState([]);
  const [openManageTokensScreen, setOpenManageTokensScreen] = useState(false);

  const [cookies, setCookie] = useCookies();

  useEffect(() => {
    if (!loading) {
      setLoading(true);
      onGetContent()
    }
  }, []);

  const onConnectWallet = async () => {
    const { address, message, signature} = await connectWallet();
    localStorage.setItem('address', address);
    setAccount(address);
    const {accessToken, accessLevel, error} = await getAccessToken({signature, walletPublicAddress:address, ttlFileUri: localStorage.getItem('ttlFileUri')});
    if (error) {
      alert("Could not get access token. Make sure you have either minted a Long-NFT or a Quick-NFT in the last 24 hours!");
      setError(error);
    }
    if (accessToken) {
      localStorage.setItem('accessLevel', accessLevel);
      setAccessToken(accessToken);
      await onGetContent()
    }
  };

  const ondisconnectWallet = async () => {
    await disconnectWallet();
    localStorage.removeItem('address');
    localStorage.removeItem('accessLevel');
    setAccount("");
    const resp = await removeAccessToken();
    setAccessToken(null);
    setPhotos([]);
  };

  const onGetContent = async () => {
    try {
      setLoading(true);
      const contentList = (await listContents());
      contentList.forEach(async item => {
        const { uri, error } = await getContent(item.name);
        if (!error) {
          setPhotos(photos => [...photos, {uri, filename: item.name}]);
        }
      });
    } catch (err) {
      console.error(err.message);
    }
    setLoading(false);
  };

  const mint = async () =>  {
    // Get wallet details
    if(!hasEthereum()) return;
    try {
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const signer = provider.getSigner()

      const contract = new ethers.Contract(NEXT_PUBLIC_MINTER_ADDRESS, Minter7.abi, signer)
      const { data, error } = await generateTokenUri();
      if (error) {
        console.error(error);
        return;
      }
      const { tokenUri, ttlFileUri } = data;
      localStorage.setItem('ttlFileUri', ttlFileUri);
      if (!tokenUri) {
        const msg = `Could not find tokenUri`;
        console.error(msg);
        alert(msg);
        return;
      }
      const transaction = await contract.mint(tokenUri, { value: ethers.utils.parseEther(MINT_PRICE.toString()) })
      await transaction.wait()

    } catch(error) {
      console.error(error);
      alert(error.data?.message ?? 'Something went wrong!');
    }
  }

  
  const donate = async () =>  {}

  return (
    <div>
      <BrowserRouter>
        <Navbar
          account={account}
          setAccount={setAccount}
          error={error}
          setError={setError}
          accessToken={accessToken}
          setAccessToken={setAccessToken}
          onGetContent={onGetContent}
          setPhotos={setPhotos}
          onConnectWallet={onConnectWallet}
          ondisconnectWallet={ondisconnectWallet}
          setOpenManageTokensScreen={setOpenManageTokensScreen}
        />
        <Routes>
          <Route path="/" element={
            photos && photos.length > 0
              ? <Showcase photos={photos}/>
              : !account || ['', 'undefined'].includes(account)
                ? <Welcome show={"connect-wallet"} onCtaClick ={onConnectWallet}/>
                : !accessToken || ['', 'undefined'].includes(accessToken)
                  ? <Welcome show={"mint"} onCtaClick={mint}/>
                  : <Welcome show={"empty"} onCtaClick={donate}/>
          }/>
          <Route path="/resource/:slug" element={<SingleFileView />}/>
          <Route path="/admin/:slug" element={<Sidebar photos={photos}/>} />
          <Route path="/manage" element={<TokensView />} />
        </Routes>
      </BrowserRouter>
    </div>
  );
};

export default App;
