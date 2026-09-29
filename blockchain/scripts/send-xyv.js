const { ethers } = require("hardhat");

const TOKEN = "0x19193d0C1888849b44390dcA637513934431EADf";

async function main() {
  const recipient = process.env.TRUST_WALLET_ADDRESS;

  if (!recipient || !ethers.isAddress(recipient)) {
    throw new Error("Invalid TRUST_WALLET_ADDRESS");
  }

  const [deployer] = await ethers.getSigners();

  console.log("From:", deployer.address);
  console.log("To:", recipient);

  const token = await ethers.getContractAt(
    [
      "function transfer(address to, uint256 amount) returns (bool)",
      "function balanceOf(address account) view returns (uint256)",
      "function decimals() view returns (uint8)"
    ],
    TOKEN,
    deployer
  );

  const decimals = await token.decimals();
  const amount = ethers.parseUnits("10000", decimals);

  const before = await token.balanceOf(deployer.address);
  console.log("Deployer XYV before:", ethers.formatUnits(before, decimals));

  console.log("Sending 10,000 XYV...");

  const tx = await token.transfer(recipient, amount);

  console.log("Transaction:", tx.hash);

  await tx.wait();

  const after = await token.balanceOf(deployer.address);

  console.log("Deployer XYV after:", ethers.formatUnits(after, decimals));
  console.log("Transfer successful!");
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
