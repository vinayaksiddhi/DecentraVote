
const { ethers } = require("hardhat");

async function main() {
    const [deployer] = await ethers.getSigners();

    console.log("Deploying with account:", deployer.address);

    // Voting duration: 24 hours
    const VotingSystem = await ethers.getContractFactory("VotingSystem");
    const voting = await VotingSystem.deploy(86400);

    await voting.waitForDeployment();

    const address = await voting.getAddress();

    console.log("VotingSystem deployed at:", address);
    console.log("Owner:", await voting.owner());
    console.log("Candidate count:", (await voting.candidateCount()).toString());
}

main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});

