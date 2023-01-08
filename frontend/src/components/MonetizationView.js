import { useEffect, useState } from "react";
import { getMonetizationInfo } from "../utils/connectWallet";
import { CoinexIcon } from "./coinexIcon";

const MonetizationView = (props) => {
  const [monetization, setMonetization] = useState({});
  
  useEffect(() => {
    (getMonetizationInfo()).then(resp => {
      setMonetization(resp);
    });
  }, []);
  
  return (
    <div className="overflow-x-auto">
      <div className="min-w-screen min-h-screen bg-gray-100 flex items-start justify-center bg-gray-100 font-sans overflow-hidden">
        <div className="w-full lg:w-5/6">
          <div className="bg-white shadow-md rounded my-6">
              <div className="flex flex-row px-[1rem] py-[1rem] text-2xl">
                <span className="flex flex-row font-medium">
                  Total Donation Revenue: <div className="ml-[1rem] w-[2.5rem]"><CoinexIcon/></div> {monetization?.donationRevenues && monetization.donationRevenues.length > 0 ? `${monetization.donationRevenues.reduce((sum, current) => sum + (+ current.revenue), 0)}` : '0'}
                </span>
              </div>
              <div className="flex flex-row px-[1rem] pb-[1rem] text-2xl">
                <span className="flex flex-row font-medium">
                  Total Minting Revenue: <div className="ml-[1rem] w-[2.5rem]"><CoinexIcon/></div> {monetization?.mintRevenues && monetization.mintRevenues.length > 0 ? `${monetization.mintRevenues.reduce((sum, current) => sum + (+ current.revenue), 0)}` : '0'}
                </span>
              </div>
            <table className="min-w-max w-full table-auto">
              <thead>
                <tr className="bg-gray-200 text-gray-600 uppercase text-3xl leading-normal">
                  <th className="py-3 px-6 text-left">Address</th>
                  <th className="py-3 px-6 text-left">Revenue (in CET)</th>
                  <th className="py-3 px-6 text-left">Source</th>
                </tr>
              </thead>
              <tbody className="text-gray-600 text-3xl font-light">
                {monetization?.donationRevenues && monetization.donationRevenues.length > 0 && monetization.donationRevenues.map((donationRevenue, i) => (
                  <tr className="border-b border-gray-200 hover:bg-gray-100" key={i}>
                    <td className="py-3 px-6 text-left whitespace-nowrap">
                      <div className="flex items-center">
                        <span className="font-medium">{(donationRevenue.address)}</span>
                      </div>
                    </td>
                    <td className="py-3 px-6 text-left whitespace-nowrap">
                      <div className="flex items-center">
                        <span className="font-medium">{(donationRevenue.revenue)}</span>
                      </div>
                    </td>
                    <td className="py-3 px-6 text-left whitespace-nowrap">
                      <div className="flex items-center">
                        <span className="font-medium">Donation</span>
                      </div>
                    </td>
                  </tr>
                ))}
                {monetization?.mintRevenues && monetization.mintRevenues.length > 0 && monetization.mintRevenues.map((mintRevenue, i) => (
                  <tr className="border-b border-gray-200 hover:bg-gray-100" key={i}>
                    <td className="py-3 px-6 text-left whitespace-nowrap">
                      <div className="flex items-center">
                        <span className="font-medium">{(mintRevenue.address)}</span>
                      </div>
                    </td>
                    <td className="py-3 px-6 text-left whitespace-nowrap">
                      <div className="flex items-center">
                        <span className="font-medium">{(mintRevenue.revenue)}</span>
                      </div>
                    </td>
                    <td className="py-3 px-6 text-left whitespace-nowrap">
                      <div className="flex items-center">
                        <span className="font-medium">Minting</span>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MonetizationView;
