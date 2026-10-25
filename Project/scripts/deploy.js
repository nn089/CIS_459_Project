const hre = require("hardhat");

async function main() {
  const Ticketing = await hre.ethers.getContractFactory(
    "Ticketmaster"
  );

  const ticketing = await Ticketing.deploy();
  await ticketing.waitForDeployment();

  console.log("Contract deployed to:", await ticketing.getAddress());
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
