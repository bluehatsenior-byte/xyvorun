const hre = require("hardhat");

async function main() {
  const [deployer] = await hre.ethers.getSigners();

  console.log("");
  console.log("=================================");
  console.log("      XYVORUN TOKEN DEPLOY");
  console.log("=================================");
  console.log("");

  console.log("Deployer:", deployer.address);

  const balance = await hre.ethers.provider.getBalance(
    deployer.address
  );

  console.log(
    "tBNB balance:",
    hre.ethers.formatEther(balance)
  );

  if (balance === 0n) {
    throw new Error(
      "Deployer has no tBNB. Fund this testnet wallet before deploying."
    );
  }

  console.log("");
  console.log("Deploying Xyvorun Token...");

  const XyvorunToken =
    await hre.ethers.getContractFactory("XyvorunToken");

  const token = await XyvorunToken.deploy();

  await token.waitForDeployment();

  const address = await token.getAddress();

  console.log("");
  console.log("=================================");
  console.log("       XYV DEPLOYED");
  console.log("=================================");
  console.log("");

  console.log("Contract:", address);

  console.log(
    "Total supply:",
    hre.ethers.formatUnits(
      await token.totalSupply(),
      18
    ),
    "XYV"
  );

  console.log("");
  console.log(
    "Explorer:",
    `https://testnet.bscscan.com/address/${address}`
  );
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});