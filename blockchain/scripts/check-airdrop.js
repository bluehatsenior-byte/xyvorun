const { ethers } = require("hardhat");

async function main() {
  const token = await ethers.getContractAt(
    [
      "function balanceOf(address) view returns (uint256)"
    ],
    "0x19193d0C1888849b44390dcA637513934431EADf"
  );

  const airdrop = await ethers.getContractAt(
    [
      "function claimAmount() view returns (uint256)",
      "function hasClaimed(address) view returns (bool)"
    ],
    "0xa8C16346AcE0512AD56f4ECEe2f548ebb121eEAf"
  );

  const balance = await token.balanceOf(
    "0xa8C16346AcE0512AD56f4ECEe2f548ebb121eEAf"
  );

  const claimAmount = await airdrop.claimAmount();

  console.log("");
  console.log("=================================");
  console.log("       XYV AIRDROP CHECK");
  console.log("=================================");
  console.log("");
  console.log(
    "Airdrop Contract:",
    "0xa8C16346AcE0512AD56f4ECEe2f548ebb121eEAf"
  );
  console.log(
    "Claim Amount:",
    ethers.formatUnits(claimAmount, 18),
    "XYV"
  );
  console.log(
    "Airdrop Balance:",
    ethers.formatUnits(balance, 18),
    "XYV"
  );
  console.log(
    "Claims Currently Funded:",
    (balance / claimAmount).toString()
  );
  console.log("");
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
