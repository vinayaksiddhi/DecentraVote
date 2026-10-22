# 🗳️ DecentraVote | Decentralized Blockchain Voting DApp

[![Vite](https://img.shields.io/badge/Vite-8.x-646CFF?logo=vite&logoColor=white)](https://vitejs.dev/)
[![React](https://img.shields.io/badge/React-19-61DAFB?logo=react&logoColor=black)](https://react.dev/)
[![ethers.js](https://img.shields.io/badge/ethers.js-v6-2535A0?logo=ethereum&logoColor=white)](https://docs.ethers.org/v6/)
[![TailwindCSS](https://img.shields.io/badge/TailwindCSS-v3.4-38B2AC?logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)
[![Hardhat](https://img.shields.io/badge/Hardhat-Local%20(31337)-yellow?logo=ethereum&logoColor=black)](https://hardhat.org/)
[![Solidity](https://img.shields.io/badge/Solidity-%5E0.8.20-363636?logo=solidity&logoColor=white)](https://soliditylang.org/)

A full-stack, decentralized voting application built with **Solidity**, **Hardhat**, **ethers.js v6**, **React 19**, and **Tailwind CSS**. 

> **📌 Network Notice:** This project is configured and tested for **Hardhat Local** (Chain ID `31337`, RPC `http://127.0.0.1:8545`) with pre-funded local test accounts. It does **not** consume real ether or deploy to a public mainnet.

---

## 🌟 Key Features

1. **Direct Blockchain Integration (Zero Mocking)**
   - All candidate information, vote counts, election status, and voter eligibility are read directly from the Solidity smart contract on-chain.
   - Real-time event listener (`VoteCast`) dynamically updates tallies without manual page refreshes.

2. **One-Vote-Per-Wallet Enforcement**
   - Double-voting is strictly prevented at the EVM level (`require(!hasVoted[msg.sender], "You have already voted")`).
   - The UI provides immediate contextual feedback:
     - **Open Election + Unvoted:** Displays active `Vote for [Candidate]` button.
     - **Open Election + Already Voted:** Displays `Vote Already Cast`.
     - **Closed Election + Already Voted:** Displays `Voting Ended · Vote Recorded`.
     - **Closed Election + Unvoted:** Displays `Voting Ended`.

3. **MetaMask & ethers.js v6 Support**
   - Connect/disconnect MetaMask wallet with automatic account and chain switching detection (`accountsChanged`, `chainChanged`).
   - Automatic one-click network addition and switching for `Hardhat Local` (`0x7a69` / `31337`).

4. **Lifecycle & Revert Tracking**
   - Interactive transaction modal tracking all states:
     - **Signature Pending:** Prompts confirmation in MetaMask.
     - **Submitted:** Displays transaction hash with a one-click copy button.
     - **Confirmed:** Verifies block receipt and confirms vote on-chain.
     - **Reverted/Failed:** Accurately decodes revert errors (e.g. user rejection, closed election, duplicate vote) without falsely claiming success.

5. **Owner-Only Admin Panel**
   - Dynamically appears only when the connected wallet matches `contract.owner()`.
   - Allows concluding the election via `closeVoting()`. Includes a clear modal warning explaining the irreversible nature of closing the election.

---

## 📁 Repository Structure

```text
├── contracts/                             # Primary project Solidity contract
│   └── VotingSystem.sol                   # Solidity ^0.8.20 VotingSystem contract
├── blockchain/                            # Hardhat local blockchain environment
│   ├── contracts/                         # Contracts compiled by Hardhat
│   │   └── VotingSystem.sol
│   ├── scripts/
│   │   ├── deploy.js                      # Local deployment script
│   │   └── test_duplicate_vote.js         # Isolated duplicate-vote prevention test
│   ├── hardhat.config.js                  # Hardhat configuration (Solidity 0.8.20, Localhost)
│   ├── .gitignore                         # Hardhat artifact exclusions
│   └── package.json                       # Hardhat & ethers dependencies
├── src/                                   # React frontend source code
│   ├── components/
│   │   ├── AdminPanel.jsx                 # Owner-only election conclusion panel
│   │   ├── CandidateCard.jsx              # Responsive candidate card & vote action
│   │   ├── CandidateList.jsx              # Responsive candidates grid
│   │   ├── ContractAddressBar.jsx         # Live contract configuration banner
│   │   ├── Navbar.jsx                     # Top bar with network & wallet controls
│   │   ├── RemixGuideModal.jsx            # Interactive deployment guide modal
│   │   ├── StatusAlerts.jsx               # Transaction lifecycle & event toasts
│   │   └── VotingHeader.jsx               # Hero metrics, deadline timer & status badge
│   ├── context/
│   │   └── Web3Context.jsx                # Ethers v6 browser provider & wallet context
│   ├── contract/
│   │   ├── contractConfig.js              # Network definitions & contract address fallback
│   │   └── VotingSystemABI.json           # Complete contract Application Binary Interface
│   ├── hooks/
│   │   └── useVotingContract.js           # Contract state hook, event listeners & voting calls
│   ├── utils/
│   │   └── formatters.js                  # Address shortening, timestamps & error parsing
│   ├── App.jsx                            # Root dashboard component
│   ├── index.css                          # Tailwind CSS & design tokens
│   └── main.jsx                           # Application entry point
├── .env.example                           # Example environment template
├── .gitignore                             # Root git ignore (node_modules, .env, dist, etc.)
├── package.json                           # Frontend dependencies & scripts
├── tailwind.config.js                     # Tailwind CSS theme configuration
└── vite.config.js                         # Vite bundler configuration
```

---

## 🛠️ Prerequisites

Ensure you have the following installed on your machine:
- **Node.js**: `v18.x` or higher (verified on `v20.x` / `v25.x`)
- **npm**: `v9.x` or higher
- **MetaMask Browser Extension**: Installed in Chrome, Brave, Edge, or Firefox

---

## 🚀 Step-by-Step Setup & Execution

### 1. Clone the Repository & Install Dependencies

```bash
# Clone the repository
git clone https://github.com/YOUR_USERNAME/decentravote-blockchain-voting.git
cd decentravote-blockchain-voting

# Install frontend dependencies
npm install

# Install Hardhat blockchain dependencies
cd blockchain
npm install
cd ..
```

---

### 2. Start the Local Hardhat Blockchain Node

Open a terminal dedicated to running the local Ethereum node:

```bash
cd blockchain
npx hardhat node
```

> **💡 What this does:** Starts a local JSON-RPC blockchain at `http://127.0.0.1:8545` with 20 pre-funded test accounts (10,000 fake ETH each) on Chain ID `31337`. Keep this terminal window running.

---

### 3. Deploy the Smart Contract Locally

In a **second terminal window**, run the deployment script:

```bash
cd blockchain
npx hardhat run scripts/deploy.js --network localhost
```

**Expected Deployment Output:**
```text
Deploying with account: 0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266
VotingSystem deployed at: 0x5FbDB2315678afecb367f032d93F642f64180aa3
Owner: 0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266
Candidate count: 3
```

---

### 4. Configure Environment Variables

In the project root directory, copy `.env.example` to create your local `.env` file:

```bash
cp .env.example .env
```

Verify that `.env` contains the deployed local contract address:

```env
VITE_CONTRACT_ADDRESS=0x5FbDB2315678afecb367f032d93F642f64180aa3
VITE_EXPECTED_CHAIN_ID=31337
VITE_NETWORK_NAME=Hardhat Local
VITE_RPC_URL=http://127.0.0.1:8545
```

---

### 5. Configure MetaMask for Hardhat Local

1. Open **MetaMask**, click the **Network Selector** in the top-left, and select **Add network** ➔ **Add a network manually**.
2. Fill in the network details:
   - **Network Name:** `Hardhat Local`
   - **New RPC URL:** `http://127.0.0.1:8545`
   - **Chain ID:** `31337`
   - **Currency Symbol:** `ETH`
3. Click **Save**.

#### Importing Local Test Accounts into MetaMask:
When you start the local node (`npx hardhat node`), Hardhat prints a list of 20 pre-funded test accounts along with their private keys. To interact as different voters or the contract owner, import one or more test accounts into MetaMask:

- **Account #0 (Deployer / Owner):**
  - Address: `0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266`
  - Private Key: Copy the `Private Key` printed for `Account #0` in your `npx hardhat node` terminal.
- **Account #1 (Test Voter 1):**
  - Address: `0x70997970C51812dc3A010C7d01b50e0d17dc79C8`
  - Private Key: Copy the `Private Key` printed for `Account #1` in your `npx hardhat node` terminal.
- **Account #2 (Test Voter 2):**
  - Address: `0x3C44CdDdB6a900fa2b585dd299e03d12FA4293BC`
  - Private Key: Copy the `Private Key` printed for `Account #2` in your `npx hardhat node` terminal.

> **⚠️ Security Best Practice:** Never expose or commit real private keys or mnemonic phrases. The keys printed by Hardhat are local development-only test keys pre-funded with fake test ETH on your local machine (`http://127.0.0.1:8545`). Never send real funds to these addresses on any public network.

---

### 6. Start the Frontend Development Server

In your terminal root directory:

```bash
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) in your browser.

---

## 🧪 Automated Testing: Duplicate-Vote & Restrictions

The project includes an isolated on-chain test script that verifies duplicate-vote prevention without altering your main contract's state:

```bash
cd blockchain
npx hardhat run scripts/test_duplicate_vote.js --network localhost
```

### What this test verifies:
1. Deploys an isolated temporary instance of `VotingSystem` on the node.
2. **Test 1:** Submits a valid vote from Test Voter 1 for Rahul and verifies the mined transaction receipt (`status: 1`).
3. **Test 2:** Attempts a second vote from Test Voter 1 for Priya and asserts that the EVM reverts with `'You have already voted'`.
4. **Integrity Check:** Verifies that candidate vote counts remain unchanged (`total: 1`) following the rejected attempt.
5. **Test 3:** Confirms that a separate fresh voter can successfully vote while the election is open (`total: 2`).
6. **Preservation:** Verifies that the primary deployment at `0x5FbDB...80aa3` was 100% untouched.

---

## ⚠️ Known Limitations & Hardhat Node Architecture

1. **Ephemeral In-Memory State:**
   - Hardhat's local node stores blockchain data in memory by default. If you stop or restart the `npx hardhat node` process, the chain resets to **Block #0**.
   - If restarted, simply re-run `npx hardhat run scripts/deploy.js --network localhost` to deploy a fresh instance of the contract.
2. **MetaMask Nonce Cache:**
   - If you restart the Hardhat node, MetaMask may retain cached transaction nonces. If you see a nonce error, go to MetaMask ➔ **Settings** ➔ **Advanced** ➔ **Clear activity tab data**.
3. **Irreversible Close Voting:**
   - The Solidity contract is purposefully designed without an `openVoting()` function for security and immutability. Once the owner closes an election, that contract instance is permanently closed.

---

## 🏗️ Production Build

To test and create the production-optimized build:

```bash
npm run build
```

---

## 📄 License

This project is open-source and available under the [MIT License](LICENSE).
