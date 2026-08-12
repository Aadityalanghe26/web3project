# CertiChain

A decentralized certificate issuance and verification platform built on Ethereum-compatible blockchain networks with IPFS-backed document storage.

Authorized institutions can issue tamper-proof digital certificates stored on-chain. Certificate PDF documents are pinned to IPFS via web3.storage. Anyone can publicly verify a certificate's authenticity using a unique certificate ID — no login required.

---

## Tech Stack

| Layer | Technology |
|---|---|
| Smart Contract | Solidity ^0.8.20, OpenZeppelin AccessControl, Hardhat |
| Frontend | React 18, Vite, TypeScript, Tailwind CSS, ethers.js v6 |
| IPFS Storage | web3.storage W3UP client (with mock fallback for development) |
| Backend | Node.js, Express, MongoDB, ethers.js v6 |

---

## Project Structure

```
web3project/
├── blockchain/                  # Solidity contract, Hardhat, deploy scripts, tests
│   ├── contracts/
│   │   └── CertiChain.sol       # Main smart contract
│   ├── scripts/
│   │   └── deploy.ts            # Deploy script (copies ABI to frontend automatically)
│   ├── test/
│   │   └── CertiChain.test.ts   # Contract test suite (10 tests)
│   ├── typechain-types/         # Auto-generated TypeScript bindings
│   └── hardhat.config.ts
├── frontend/                    # React + Vite + Tailwind frontend
│   ├── src/
│   │   ├── context/
│   │   │   └── Web3Context.tsx  # Wallet connection, contract instance, role checks
│   │   ├── pages/
│   │   │   ├── VerificationPage.tsx   # Public certificate verification
│   │   │   ├── IssuerDashboard.tsx    # Issue and revoke certificates
│   │   │   └── StudentDashboard.tsx   # View your own certificates
│   │   ├── components/
│   │   │   ├── CertificateModal.tsx   # Full certificate detail view
│   │   │   ├── Navbar.tsx
│   │   │   └── Footer.tsx
│   │   └── services/
│   │       └── ipfsService.ts         # IPFS upload (live or mock fallback)
│   └── index.html
├── backend/                     # Node.js + Express + MongoDB event indexer + REST API
│   └── src/
│       ├── index.ts             # Express server entry point
│       ├── config/db.ts         # MongoDB connection
│       ├── models/Certificate.ts
│       ├── controllers/certificateController.ts
│       ├── routes/certificateRoutes.ts
│       └── services/indexer.ts  # Blockchain event listener
└── package.json                 # npm workspaces root
```

---

## Smart Contract

`CertiChain.sol` implements:

- **`issueCertificate()`** — Issues a certificate with a sequential ID (`CERT-{YEAR}-{000001}`), stores student name, student address, course name, issuer name, and IPFS CID on-chain. Restricted to `ISSUER_ROLE`.
- **`revokeCertificate()`** — Marks a certificate as invalid. Restricted to `ISSUER_ROLE`.
- **`getCertificate()`** — Returns the full certificate struct for a given ID.
- **`verifyCertificate()`** — Returns `true` if a certificate exists and has not been revoked. Public, no wallet required.

Access control uses OpenZeppelin `AccessControl`. The deployer is granted both `DEFAULT_ADMIN_ROLE` and `ISSUER_ROLE` at construction.

---

## Getting Started

### Prerequisites

- Node.js v18+
- MetaMask browser extension
- MongoDB (optional — backend falls back to in-memory store without it)

### 1. Clone the repository

```bash
git clone https://github.com/Aadityalanghe26/web3project.git
cd web3project
```

### 2. Set up environment variables

Copy the example env files and fill in your values:

```bash
cp blockchain/.env.example blockchain/.env
cp frontend/.env.example frontend/.env
cp backend/.env.example backend/.env
```

Key variables:

| File | Variable | Description |
|---|---|---|
| `blockchain/.env` | `PRIVATE_KEY` | Deployer wallet private key (for Sepolia) |
| `blockchain/.env` | `SEPOLIA_RPC_URL` | Infura/Alchemy RPC endpoint |
| `frontend/.env` | `VITE_CONTRACT_ADDRESS` | Deployed contract address |
| `frontend/.env` | `VITE_W3_PRINCIPAL` | web3.storage principal (optional, enables live IPFS) |
| `backend/.env` | `MONGODB_URI` | MongoDB connection string |
| `backend/.env` | `CONTRACT_ADDRESS` | Deployed contract address |

---

## Running Locally

### Step 1 — Install dependencies

```bash
# Blockchain
cd blockchain
npm install --legacy-peer-deps

# Frontend
cd ../frontend
npm install

# Backend
cd ../backend
npm install
```

### Step 2 — Start a local blockchain

```bash
cd blockchain
npx hardhat node
```

Leave this terminal running. It starts a local Hardhat network at `http://127.0.0.1:8545`.

### Step 3 — Compile and deploy the contract

Open a new terminal:

```bash
cd blockchain
npx hardhat compile
npx hardhat run scripts/deploy.ts --network localhost
```

The deploy script automatically copies the ABI and contract address to `frontend/src/contracts/CertiChain.json`.

### Step 4 — Start the frontend

```bash
cd frontend
npm run dev
```

Frontend runs at: `http://localhost:3000`

### Step 5 — Start the backend (optional)

```bash
cd backend
npm run dev
```

Backend runs at: `http://localhost:5000`

REST API endpoints:
- `GET /api/health` — health check
- `GET /api/certificates` — list all indexed certificates
- `GET /api/certificates/:id` — get certificate by ID
- `GET /api/certificates/student/:address` — get certificates by student wallet address

---

## Running Tests

```bash
cd blockchain
npx hardhat test
```

The test suite covers:
- Deployer role assignment (DEFAULT_ADMIN_ROLE + ISSUER_ROLE)
- Granting ISSUER_ROLE to another address
- Issuing a certificate (happy path + field validation)
- Sequential certificate ID generation
- Access control revert for unauthorized issuance
- Revoking a certificate (happy path)
- Access control revert for unauthorized revocation
- Revoking a non-existent certificate
- Double-revoke revert

---

## Deploying to Sepolia Testnet

1. Get Sepolia ETH from a faucet: https://sepoliafaucet.com
2. Set `PRIVATE_KEY` and `SEPOLIA_RPC_URL` in `blockchain/.env`
3. Deploy:

```bash
cd blockchain
npx hardhat run scripts/deploy.ts --network sepolia
```

4. Copy the deployed contract address into `frontend/.env` as `VITE_CONTRACT_ADDRESS` and `backend/.env` as `CONTRACT_ADDRESS`.

---

## How It Works

1. An institution connects MetaMask and uses the **Issuer Dashboard** to fill in student details and upload a PDF certificate.
2. The PDF is uploaded to IPFS via web3.storage. The returned CID is stored on-chain.
3. The `issueCertificate()` transaction is signed and submitted. A unique `CERT-{YEAR}-{NNNNNN}` ID is generated on-chain.
4. Anyone can go to the **Verification Page**, enter a certificate ID, and see the full certificate details pulled directly from the blockchain — no backend needed.
5. The **Student Dashboard** shows all certificates issued to the connected wallet address.
6. The optional backend indexes blockchain events into MongoDB and exposes a REST API for off-chain queries.

---

## License

MIT
