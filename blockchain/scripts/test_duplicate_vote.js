const { ethers } = require("hardhat");

async function main() {
    console.log("================================================================");
    console.log("ISOLATED LOCAL TEST: DUPLICATE-VOTE PREVENTION ON HARDHAT NODE");
    console.log("================================================================");

    const signers = await ethers.getSigners();
    const deployer = signers[0];
    const testVoter1 = signers[3]; // Account #4
    const testVoter2 = signers[4]; // Account #5

    console.log("Test Environment Setup:");
    console.log(`- Deployer address:   ${deployer.address}`);
    console.log(`- Test Voter 1:       ${testVoter1.address}`);
    console.log(`- Test Voter 2:       ${testVoter2.address}`);

    // Verify existing production contract state before doing anything
    const PROD_ADDRESS = "0x5FbDB2315678afecb367f032d93F642f64180aa3";
    const VotingSystemFactory = await ethers.getContractFactory("VotingSystem");
    const prodContract = VotingSystemFactory.attach(PROD_ADDRESS);

    const prodOpenBefore = await prodContract.votingOpen();
    const prodPriyaVotesBefore = await prodContract.getCandidateVotes(2);
    console.log(`\nExisting Production Contract (${PROD_ADDRESS}):`);
    console.log(`- votingOpen:         ${prodOpenBefore}`);
    console.log(`- Priya vote count:   ${prodPriyaVotesBefore}`);

    // Deploy a separate, temporary test election instance
    console.log("\nDeploying Temporary Test Contract Instance...");
    const tempVoting = await VotingSystemFactory.deploy(86400); // 24 hour duration
    await tempVoting.waitForDeployment();
    const tempAddress = await tempVoting.getAddress();

    console.log(`- Temporary Contract: ${tempAddress}`);
    const tempOpen = await tempVoting.votingOpen();
    console.log(`- Temporary Election starts open: ${tempOpen}`);

    if (!tempOpen) {
        throw new Error("Temporary test contract failed to start in an open state.");
    }

    // ================================================================
    // TEST 1: Submit a valid vote from test wallet and wait for receipt
    // ================================================================
    console.log("\n----------------------------------------------------------------");
    console.log("TEST 1: Valid initial vote from Test Voter 1 (Candidate 1: Rahul)");
    console.log("----------------------------------------------------------------");
    const tx1 = await tempVoting.connect(testVoter1).vote(1);
    console.log(`- Tx submitted. Hash: ${tx1.hash}`);
    
    const receipt1 = await tx1.wait();
    console.log(`- Tx mined in Block #${receipt1.blockNumber}, Status: ${receipt1.status === 1 ? '1 (SUCCESS)' : 'FAILED'}`);

    const voter1HasVoted = await tempVoting.hasVoted(testVoter1.address);
    const rahulVotesAfterTx1 = await tempVoting.getCandidateVotes(1);
    console.log(`- Voter 1 hasVoted status: ${voter1HasVoted}`);
    console.log(`- Rahul votes on temp contract: ${rahulVotesAfterTx1}`);

    if (receipt1.status !== 1 || !voter1HasVoted || Number(rahulVotesAfterTx1) !== 1) {
        throw new Error("Test 1 FAILED: Initial vote was not properly recorded.");
    }
    console.log(">>> TEST 1 RESULT: PASS");

    // ================================================================
    // TEST 2: Attempt duplicate vote from same wallet (Expect Revert)
    // ================================================================
    console.log("\n----------------------------------------------------------------");
    console.log("TEST 2: Attempt duplicate vote from Test Voter 1 (Candidate 2: Priya)");
    console.log("----------------------------------------------------------------");
    let test2Passed = false;
    let actualRevertReason = "";

    try {
        // Attempt duplicate vote
        const tx2 = await tempVoting.connect(testVoter1).vote(2);
        const receipt2 = await tx2.wait();
        console.error("CRITICAL ERROR: Duplicate vote transaction did not revert! Status:", receipt2.status);
    } catch (error) {
        // Extract revert reason
        actualRevertReason = error.reason || error.shortMessage || error.message || "";
        console.log(`- Transaction rejected as expected.`);
        console.log(`- Revert reason received: "${actualRevertReason}"`);

        if (actualRevertReason.includes("You have already voted")) {
            test2Passed = true;
        } else {
            console.error(`Unexpected revert reason. Expected 'You have already voted', got: ${actualRevertReason}`);
        }
    }

    if (!test2Passed) {
        throw new Error(`Test 2 FAILED: Expected revert 'You have already voted', received '${actualRevertReason}'`);
    }
    console.log(">>> TEST 2 RESULT: PASS (Reverted with 'You have already voted')");

    // ================================================================
    // VERIFICATION: Ensure vote counts remained unchanged after rejection
    // ================================================================
    console.log("\n----------------------------------------------------------------");
    console.log("VERIFICATION: Temporary contract vote count integrity");
    console.log("----------------------------------------------------------------");
    const rahulVotes = await tempVoting.getCandidateVotes(1);
    const priyaVotes = await tempVoting.getCandidateVotes(2);
    const amanVotes = await tempVoting.getCandidateVotes(3);
    const totalTempVotes = Number(rahulVotes) + Number(priyaVotes) + Number(amanVotes);

    console.log(`- Rahul votes (Candidate 1): ${rahulVotes}`);
    console.log(`- Priya votes (Candidate 2): ${priyaVotes}`);
    console.log(`- Aman votes (Candidate 3):  ${amanVotes}`);
    console.log(`- Total votes on temp contract: ${totalTempVotes}`);

    if (Number(rahulVotes) !== 1 || Number(priyaVotes) !== 0 || totalTempVotes !== 1) {
        throw new Error("Integrity check FAILED: Vote count changed after rejected duplicate vote attempt.");
    }
    console.log(">>> VOTE COUNT INTEGRITY CHECK: PASS (Vote count remains exactly 1)");

    // ================================================================
    // TEST 3: Fresh wallet can vote while election is open
    // ================================================================
    console.log("\n----------------------------------------------------------------");
    console.log("TEST 3: Fresh wallet (Test Voter 2) casts a vote (Candidate 3: Aman)");
    console.log("----------------------------------------------------------------");
    const tx3 = await tempVoting.connect(testVoter2).vote(3);
    console.log(`- Tx submitted. Hash: ${tx3.hash}`);
    
    const receipt3 = await tx3.wait();
    console.log(`- Tx mined in Block #${receipt3.blockNumber}, Status: ${receipt3.status === 1 ? '1 (SUCCESS)' : 'FAILED'}`);

    const voter2HasVoted = await tempVoting.hasVoted(testVoter2.address);
    const amanVotesAfterTx3 = await tempVoting.getCandidateVotes(3);
    const totalTempVotesAfterTx3 = Number(await tempVoting.getCandidateVotes(1)) + 
                                  Number(await tempVoting.getCandidateVotes(2)) + 
                                  Number(await tempVoting.getCandidateVotes(3));

    console.log(`- Voter 2 hasVoted status: ${voter2HasVoted}`);
    console.log(`- Aman votes on temp contract: ${amanVotesAfterTx3}`);
    console.log(`- Total votes on temp contract: ${totalTempVotesAfterTx3}`);

    if (receipt3.status !== 1 || !voter2HasVoted || Number(amanVotesAfterTx3) !== 1 || totalTempVotesAfterTx3 !== 2) {
        throw new Error("Test 3 FAILED: Fresh wallet vote was not recorded.");
    }
    console.log(">>> TEST 3 RESULT: PASS (Fresh wallet successfully voted while open)");

    // ================================================================
    // POST-TEST VERIFICATION: Original Production Contract Preserved
    // ================================================================
    console.log("\n================================================================");
    console.log("POST-TEST VERIFICATION: PRODUCTION CONTRACT PRESERVATION");
    console.log("================================================================");
    const prodOpenAfter = await prodContract.votingOpen();
    const prodPriyaVotesAfter = await prodContract.getCandidateVotes(2);
    console.log(`Production Contract Address: ${PROD_ADDRESS}`);
    console.log(`- votingOpen before: ${prodOpenBefore} | after: ${prodOpenAfter}`);
    console.log(`- Priya votes before: ${prodPriyaVotesBefore} | after: ${prodPriyaVotesAfter}`);

    if (prodOpenBefore !== prodOpenAfter || Number(prodPriyaVotesBefore) !== Number(prodPriyaVotesAfter)) {
        throw new Error("CRITICAL SAFETY FAILURE: Production contract state was altered!");
    }
    console.log(">>> PRODUCTION STATE INTEGRITY: PASS (100% UNCHANGED AND PRESERVED)");
    console.log("================================================================");
}

main().catch((error) => {
    console.error("Test execution error:", error);
    process.exitCode = 1;
});
