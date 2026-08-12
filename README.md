# CertiChain 🎓

A decentralized certificate issuance and verification platform built on Ethereum-compatible blockchain networks with IPFS-backed document storage.

## Overview

CertiChain allows authorized institutions to issue tamper-proof digital certificates stored on-chain. Certificate PDF documents are pinned to IPFS via web3.storage Storacha. Anyone can publicly verify a certificate's authenticity without logging in.

## Tech Stack

| Layer | Technology |
|---|---|
| Smart Contract | Solidity ^0.8.20, OpenZeppelin AccessControl, Hardhat |
| Frontend | React 18, Vite, TypeScript, Tailwind CSS, ethers.js v6 |
| IPFS Storage | web3.storage Storacha (W3UP client) |
| Backend (optional) | Node.js, Express, MongoDB, ethers.js v6 |

## Project Structure

```
certichain/
├── blockchain/          # Solidity contract, Hardhat config, deploy scripts
│   ├── contracts/
│   │   └── CertiChain.sol
│   ├── scripts/
│   │   └── deploy.ts
│   └── hardhat.config.ts
├── frontend/            # React + Vite + Tailwind frontend
├── backend/             # Optional Node.js + Express + MongoDB backend
└── package.json         # npm workspaces root
```

## Smart Contract

`CertiChain.sol` implements:

- **`issueCertificate()`** — Issues a certificate with a unique ID (`CERT-{YEAR}-{000001}`), stores student info, course name, issuer name, and IPFS CID on-chain
- **`revokeCertificate()`** — Revokes an existing certificate (ISSUER_ROLE only)
- **`getCertificate()`** — Returns full certificate data
- **`verifyCertificate()`** — Returns true if a certificate exists and has not been revoked

Access control is managed via OpenZeppelin's `AccessControl` with an `ISSUER_ROLE`.

## Getting Started

### Prerequisites

- Node.js v18+
- MetaMask browser extension
- A web3.storage account

### Install dependencies

```bash
cd blockchain
npm install --legacy-peer-deps
```

### Compile the contract

```bash
npx hardhat compile
```

### Start local blockchain

```bash
npx hardhat node
```

### Deploy to local network

```bash
npx hardhat run scripts/deploy.ts --network localhost
```

### Environment variables

Copy `.env.example` files in each package and fill in your values:

```bash
cp blockchain/.env.example blockchain/.env
cp frontend/.env.example frontend/.env
cp backend/.env.example backend/.env
```

## License

MIT
