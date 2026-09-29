const { ethers } = require("hardhat");

async function main() {
  const token = await ethers.getContractAt(
    [
      "function name() view returns (string)",
      "function symbol() view returns (string)",
      "function decimals() view returns (uint8)",
      "function totalSupply() view returns (uint256)"
    ],
    "0x19193d0C1888849b44390dcA637513934431EADf"
  );

  console.log("");
  console.log("=================================");
  console.log("       XYV TOKEN CHECK");
  console.log("=================================");
  console.log("");
  console.log("Name:", await token.name());
  console.log("Symbol:", await token.symbol());
  console.log("Decimals:", await token.decimals());
  console.log(
    "Total Supply:",
    ethers.formatUnits(await token.totalSupply(), 18),
    "XYV"
  );
  console.log("");
  console.log("Contract:");
  console.log("0x19193d0C1888849b44390dcA637513934431EADf");
  console.log("");
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
