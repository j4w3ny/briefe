import { ethers } from 'hardhat';

async function main() {
  const action = await (await ethers.getContractFactory('Briefe')).deploy();
  console.log(`Deployed Briefe ${action.address}`);
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
