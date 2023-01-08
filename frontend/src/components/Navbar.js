import { useEffect } from "react";
import { Link } from "react-router-dom";

const Navbar = (props) => {
  const  {
    account,
    setAccount,
    setError,
    setAccessToken,
    onGetContent,
    setPhotos,
    onConnectWallet,
    ondisconnectWallet,
    setOpenManageTokensScreen,
    getNftsForAccount
  } = props;

  useEffect(() => {
    const address = localStorage.getItem('address');
    if (address && address !== 'undefined') {
      setAccount(address);
    }
  }, []);

  return (
    <header className="navbar">
      <Link to={`/`}>
        <img src="../logo.png" alt="logo" className="h-28"/>
      </Link>  
    <div>
      {(() => {
        const publicAddr = account;
        if (publicAddr && publicAddr !== "") {
          return <button className="navLink" disabled>Connected to {publicAddr}</button>;
        }
        return <button onClick={onConnectWallet} className="navLink navLink-hover"> Connect Wallet </button>;
      })()}
      {account && account !== "" &&
      (<div className='navLink dropdown inline-block '>
        <button className="bg-[#FFD1D1] p-2 font-bold text-gray-100 rounded-md peer focus:bg-[#FFD1D1]/[0.90] focus:text-gray-200 transition-all duration-200  ">
          <img src="/expand-arrow-icon.svg" className="w-[2rem]" />
        </button>
        <div className='absolute top-[4rem] z-10 right-10
        after:content-[""] after:inline-block after:absolute after:top-0 after:bg-white/40
        after:w-full after:h-full after:-z-20 after:blur-[2px] after:rounded-lg
        peer-focus:top-[4rem] peer-focus:opacity-100 peer-focus:visible 
        transition-all duration-300 invisible  opacity-0 
        '>
          <ul className='py-6 px-3 flex flex-col gap-3'>
              <Link to={`manage`} state={{account}}>
              <li className='cursor-pointer bg-[#FF9494] p-3 rounded-md hover:opacity-90 text-white'>
                Manage
                </li>            
              </Link>
              {localStorage.getItem('accessLevel') === 'write' ? (
                <Link to={`admin/files`}>
                <li className='cursor-pointer bg-[#FF9494] p-3 rounded-md hover:opacity-90 text-white'>
                  Content
                  </li>            
                </Link>
              ): <></>}
            <li onClick={ondisconnectWallet} className='cursor-pointer bg-[#FF0000] p-3 rounded-md hover:opacity-90 text-white'>
              Disconnect
            </li>
          </ul>
        </div>
      </div>)}
    </div>
  </header>
  );
};

export default Navbar;
