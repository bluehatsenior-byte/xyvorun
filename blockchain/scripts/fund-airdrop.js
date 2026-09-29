const { ethers } = require("hardhat");

const XYV_TOKEN =
  "0x19193d0C1888849b44390dcA637513934431EADf";

const AIRDROP =
  "0xa8C16346AcE0512AD56f4ECEe2f548ebb121eEAf";

async function main() {
  const [deployer] = await ethers.getSigners();

  console.log("=================================");
  console.log("       FUND XYV AIRDROP");
  console.log("=================================");
  console.log("");
  console.log("From:", deployer.address);
  console.log("Airdrop:", AIRDROP);
  console.log("Amount: 100,000 XYV");
  console.log("");

  const token = await ethers.getContractAt(
    [
      "function transfer(address to, uint256 amount) returns (bool)",
      "function balanceOf(address account) view returns (uint256)"
    ],
    XYV_TOKEN,
    deployer
  );

  const amount = ethers.parseUnits("100000", 18);

  const balance = await token.balanceOf(
    deployer.address
  );

  console.log(
    "Deployer XYV:",
    ethers.formatUnits(balance, 18)
  );

  if (balance < amount) {
    throw new Error(
      "Deployer does not have enough XYV"
    );
  }

  console.log("Sending 100,000 XYV...");

  const tx = await token.transfer(
    AIRDROP,
    amount
  );

  console.log("Transaction:", tx.hash);

  await tx.wait();

  const airdropBalance =
    await token.balanceOf(AIRDROP);

  console.log("");
  console.log(
    "Airdrop XYV balance:",
    ethers.formatUnits(
      airdropBalance,
      18
    )
  );

  console.log("");
  console.log("Airdrop funded successfully!");
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});