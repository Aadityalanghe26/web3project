import { ethers } from "hardhat";
import * as fs from "fs";
import * as path from "path";

async function main() {
  console.log("Deploying CertiChain contract...");

  const [deployer] = await ethers.getSigners();
  console.log(`Deploying with account: ${deployer.address}`);

  const balance = await ethers.provider.getBalance(deployer.address);
  console.log(`Account balance: ${ethers.formatEther(balance)} ETH`);

  // Deploy contract
  const CertiChain = await ethers.getContractFactory("CertiChain");
  const certichain = await CertiChain.deploy();
  await certichain.waitForDeployment();

  const address = await certichain.getAddress();
  console.log(`CertiChain deployed to: ${address}`);

  // Copy ABI to artifacts-abi/
  const artifactsAbiDir = path.join(__dirname, "..", "artifacts-abi");
  if (!fs.existsSync(artifactsAbiDir)) {
    fs.mkdirSync(artifactsAbiDir, { recursive: true });
  }

  const artifactPath = path.join(
    __dirname,
    "..",
    "artifacts",
    "contracts",
    "CertiChain.sol",
    "CertiChain.json"
  );

  if (fs.existsSync(artifactPath)) {
    const artifact = JSON.parse(fs.readFileSync(artifactPath, "utf8"));
    const abiOutput = { abi: artifact.abi, address };
    
    fs.writeFileSync(
      path.join(artifactsAbiDir, "CertiChain.json"),
      JSON.stringify(abiOutput, null, 2)
    );
    console.log("ABI exported to artifacts-abi/CertiChain.json");

    // Also export to frontend/src/contracts/CertiChain.json if frontend directory exists
    const frontendAbiDir = path.join(__dirname, "..", "..", "frontend", "src", "contracts");
    if (!fs.existsSync(frontendAbiDir)) {
      fs.mkdirSync(frontendAbiDir, { recursive: true });
    }
    fs.writeFileSync(
      path.join(frontendAbiDir, "CertiChain.json"),
      JSON.stringify(abiOutput, null, 2)
    );
    console.log("ABI exported to frontend/src/contracts/CertiChain.json");
  }
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
