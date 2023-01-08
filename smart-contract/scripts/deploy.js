const hre = require("hardhat");

async function main() {
  const Minter2 = await hre.ethers.getContractFactory("Minter2");
  console.log(Minter2);
  const minter2 = await Minter2.deploy();
  await minter2.deployed();
  console.log("Minter2 deployed to:", minter2.address);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
