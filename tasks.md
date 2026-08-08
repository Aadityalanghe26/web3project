# Implementation Plan: CertiChain

## Overview

CertiChain is implemented across 12 phases that build incrementally from the monorepo
skeleton through smart contract, tests, frontend, IPFS integration, backend, and
documentation. Each phase produces fully integrated, working code before the next phase
begins. The stack is TypeScript throughout: Solidity + Hardhat on the blockchain layer,
React + Vite + Tailwind on the frontend, and Node.js + Express + MongoDB for the
optional backend.

---

## Tasks

### Phase 1 — Monorepo Structure

- [x] 1. Scaffold monorepo skeleton and configuration files
  - [x] 1.1 Create root `package.json` with workspaces (`frontend`, `blockchain`, `backend`) and scripts: `install:all`, `build`, `test`
    - _Requirements: 1.1, 1.2_
  - [x] 1.2 Create root `.gitignore` excluding `node_modules/`, `.env`, `artifacts/`, `cache/`, `dist/`, `build/`, `coverage/`
    - _Requirements: 1.3, 22.4_
  - [x] 1.3 Create `frontend/.env.example` with variables: `VITE_CONTRACT_ADDRESS`, `VITE_RPC_URL`, `VITE_CHAIN_ID`, `VITE_W3_PRINCIPAL`, `VITE_W3_PROOF`
    - _Requirements: 1.5_
  - [x] 1.4 Create `blockchain/.env.example` with variables: `PRIVATE_KEY`, `SEPOLIA_RPC_URL`, `REPORT_GAS`
    - _Requirements: 1.6_
  - [x] 1.5 Create `backend/.env.example` with variables: `MONGODB_URI`, `PORT`, `CONTRACT_ADDRESS`
    - _Requirements: 1.7_
  - [x] 1.6 Create `blockchain/package.json` with scripts `compile`, `test`, `deploy:local`, `node` and dependencies: `hardhat`, `@nomicfoundation/hardhat-toolbox`, `@openzeppelin/contracts`, `dotenv`, `ts-node`, `typescript`
    - _Requirements: 8.5_
  - [x] 1.7 Create `frontend/package.json` with dependencies: `react`, `react-dom`, `react-router-dom`, `ethers`, `@web3-storage/w3up-client`, `lucide-react` and devDependencies: `vite`, `@vitejs/plugin-react`, `tailwindcss`, `typescript`; all with pinned versions
    - _Requirements: 10.7_
  - [x] 1.8 Create `backend/package.json` with pinned dependencies: `express`, `mongoose`, `ethers`, `cors`, `dotenv` and devDependencies: `typescript`, `ts-node`, `@types/express`, `@types/cors`
    - _Requirements: 20.7_


### Phase 2 — Hardhat Configuration & Smart Contract

- [x] 2. Write Hardhat configuration and CertiChain Solidity smart contract
  - [x] 2.1 Create `blockchain/hardhat.config.ts` with networks: `hardhat` (local), `sepolia` (RPC from env), and TypeScript + hardhat-toolbox settings
    - _Requirements: 8.1, 8.5_
  - [x] 2.2 Create `blockchain/tsconfig.json` for the blockchain package with `"module": "commonjs"`, `"target": "ES2020"`, `"strict": true`
    - _Requirements: 8.5_
  - [x] 2.3 Create `blockchain/contracts/CertiChain.sol` — Solidity ^0.8.20 contract using OpenZeppelin `AccessControl`; define `ISSUER_ROLE`; store certificates in a mapping; implement `issueCertificate()`, `revokeCertificate()`, `getCertificate()`, `verifyCertificate()`
    - _Requirements: 2.1, 2.2, 3.1, 3.2, 4.1, 4.2, 5.1, 6.1, 7.1, 8.1_
  - [x] 2.4 Create `blockchain/scripts/deploy.ts` — Hardhat deploy script that deploys `CertiChain`, grants `ISSUER_ROLE` to the deployer, and logs the contract address
    - _Requirements: 8.2, 8.3_
  - [x] 2.5 Export contract ABI as `blockchain/artifacts-abi/CertiChain.json` (post-compile stub or copy step in deploy script)
    - _Requirements: 8.4_
