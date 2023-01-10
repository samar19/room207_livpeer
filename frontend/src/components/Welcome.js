import { useEffect, useState } from "react";


const Welcome = (props) => {
  const { show, onCtaClick } = props;
  const [description, setDescription] = useState("");
  const [cta, setCta] = useState("");
  const [ctaInactive, setCtaInactive] = useState("");

  useEffect(() => {
    if (show === 'connect-wallet') {
      setDescription("Connect your wallet now to check out what new content Taylor is putting up!");
      setCta("Connect Wallet");
      setCtaInactive("");
    } else if (show === 'mint') {
      setDescription("Experience exclusive content and support her by minting her utility NFT");
      setCta("Mint Quick NFT");
      setCtaInactive("Mint Long NFT");
    } else if (show === 'empty') {
      setDescription("Taylor has not published any content yet. Maybe support her now?");
      setCtaInactive("");
      setCta("Donate");
    } else {
      console.error('Invalid show string', show);
    }
  }, [show, onCtaClick]);

  return (
    <div className="container max-w-lg px-4 py-32 mx-auto text-left md:max-w-none md:text-center mt-[8rem]">
      <h1 className="text-5xl font-extrabold leading-10 tracking-tight text-left text-gray-900 md:text-center sm:leading-none md:text-6xl lg:text-[8rem]">
        {/* <span className="inline md:block">Room 207</span> */}
        <span className="relative h-[10rem] mt-2 text-transparent bg-clip-text bg-gradient-to-br from-[#FF0000] to-[#FF0000] md:inline-block">A new Vision for a Creator-Driven Economy</span>
      </h1>
      <div className="mx-auto mt-5 text-gray-500 md:mt-12 md:max-w-lg md:text-center lg:text-lg font-bold">
        {description}
      </div>
      <div className="flex flex-col items-center mt-12 text-center">
        <button onClick={onCtaClick} className="navLink navLink-hover my-[1rem]"> {cta} </button>
        {ctaInactive && ctaInactive.length > 0 && (<button onClick={() => {alert("We can do this too but let's skip for the sake of the hackathon?")}} className="navLink navLink-hover my-[1rem]"> {ctaInactive} </button>)}
        <a href="https://github.com/samar19/room207_livpeer" className="mt-3 text-sm text-indigo-500">Learn More</a>
      </div>
    </div>
  );
}

export default Welcome;