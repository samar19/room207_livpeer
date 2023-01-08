import { useEffect, useState } from "react";
import { COINEX_TESTNET_EXPLORER } from "../constants";
import { getNftsForAccount } from "../utils/connectWallet";
import { SendIcon } from "./sendIcon";
import SendNft from "./SendNft";
import { ViewIcon } from "./viewIcon";


const TokensView = (props) => {
  const [showDonateModal, setShowDonateModal] = useState(false);
  const [nfts, setNfts] = useState([]);
  const [nftToBeGifted, setNftToBeGifted] = useState({});
  
  useEffect(() => {
    const address = localStorage.getItem('address');
    if (address && !['', 'undefined'].includes(address)) {
      (getNftsForAccount(address)).then(resp => {
        setNfts(resp);
      });
    }
  }, []);

  const onDonateClick = async (nft) => {
    setShowDonateModal(true);
    setNftToBeGifted(nft);
  };
  const onDonateClose = async () => {
    setShowDonateModal(false);
    setNftToBeGifted({});
  };


  return (
    <div className="overflow-x-auto mt-[8rem]">
      <div className="min-w-screen min-h-screen bg-[#FFF5E4] flex items-start justify-center font-sans overflow-hidden">
        <div className="w-full lg:w-5/6">
          <div className="bg-white shadow-md rounded my-6">
            <table className="min-w-max w-full table-auto">
              <thead>
                <tr className="bg-[#FFD1D1] text-gray-600 uppercase text-3xl leading-normal">
                <th className="py-3 px-6 text-left">{' '}</th>
                <th className="py-3 px-6 text-left">Title</th>
                <th className="py-3 px-6 text-left">Creator</th>
                <th className="py-3 px-6 text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="text-gray-600 text-3xl font-light">
                {nfts && nfts.length > 0 && nfts.map((nft, i) => (
                  <tr className="border-b border-[#FFF5E4] hover:bg-[#FFF5E4]/[0.9] bg-[#FFE3E1]" key={`${i}`}>
                    <td className="py-3 px-6 text-left whitespace-nowrap">
                      <div className="flex items-center">
                        <img src={nft.image} alt={nft.title} className="w-[8rem]"/>
                      </div>
                    </td>
                    <td className="py-3 px-6 text-left whitespace-nowrap">
                      <div className="flex items-center">
                        <span className="font-medium">{nft.title}</span>
                      </div>
                    </td>
                    <td className="p-0 text-center">
                      <div className="flex item-center justify-center">
                      <img src="/taylor.jpg" alt="..." className=" w-[3rem] shadow rounded-full align-middle border-none" />
                      <div className="flex items-center px-[1rem]">
                        <span className="font-medium">Taylor S.</span>
                      </div>
                      </div>
                    </td>
                    <td className="p-0 text-center">
                      <div className="flex item-center justify-center">
                        <a href={`${COINEX_TESTNET_EXPLORER}/token/${nft.nftContractAddress}?a=${nft.nftId}`} target="_blank">
                          <div className="w-8 mr-2 transform hover:text-[#FF9494] hover:scale-110" data-bs-toggle="tooltip" title="View this NFT">
                            <ViewIcon />
                          </div>
                        </a>
                        <div onClick={() => {onDonateClick(nft)}} className="w-8 mr-2 transform hover:text-[#FF9494] hover:scale-110" data-bs-toggle="tooltip" title="Gift this NFT">
                          <SendIcon />
                        </div>
                      </div>
                    </td>
                  </tr>
                ))}
                { showDonateModal && <SendNft onClose={onDonateClose} nftId={nftToBeGifted.nftId} nftImage={nftToBeGifted.image} nftTitle={nftToBeGifted.title}/> }
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TokensView;
