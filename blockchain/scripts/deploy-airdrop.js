const { ethers } = require("hardhat");

const XYV_TOKEN =
  "0x19193d0C1888849b44390dcA637513934431EADf";

async function main() {
  const [deployer] = await ethers.getSigners();

  console.log("=================================");
  console.log("       XYV AIRDROP DEPLOY");
  console.log("=================================");
  console.log("");
  console.log("Deployer:", deployer.address);

  const claimAmount = ethers.parseUnits("10000", 18);

  console.log("Claim amount: 10,000 XYV");
  console.log("Token:", XYV_TOKEN);
  console.log("");
  console.log("Deploying airdrop contract...");

  const Airdrop =
    await ethers.getContractFactory("XYVAirdrop");

  const airdrop = await Airdrop.deploy(
    XYV_TOKEN,
    claimAmount
  );

  await airdrop.waitForDeployment();

  const address =
    await airdrop.getAddress();

  console.log("");
  console.log("=================================");
  console.log("       AIRDROP DEPLOYED");
  console.log("=================================");
  console.log("");
  console.log("Airdrop:", address);
  console.log("Claim: 10,000 XYV per wallet");
  console.log("");
  console.log(
    "Explorer: https://testnet.bscscan.com/address/" +
      address
  );
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});