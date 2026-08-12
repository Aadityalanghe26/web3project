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


### Phase 3 — Smart Contract Tests

- [x] 3. Write comprehensive smart contract test suite
  - [x] 3.1 Create `blockchain/test/CertiChain.test.ts` with Hardhat + Chai setup; deploy a fresh contract in `beforeEach`
    - _Requirements: 8.5_
  - [x] 3.2 Test deployer receives `DEFAULT_ADMIN_ROLE` and `ISSUER_ROLE` at construction
    - _Requirements: 2.2_
  - [x] 3.3 Test `grantRole` successfully assigns `ISSUER_ROLE` to a second address
    - _Requirements: 2.2_
  - [x] 3.4 Test `issueCertificate` happy path: correct fields stored, sequential ID `CERT-{YEAR}-000001`, `isValid: true`
    - _Requirements: 3.1, 3.2_
  - [x] 3.5 Test sequential ID increment: second certificate gets `CERT-{YEAR}-000002`
    - _Requirements: 3.2_
  - [x] 3.6 Test `issueCertificate` reverts with `AccessControlUnauthorizedAccount` for non-issuer caller
    - _Requirements: 2.1_
  - [x] 3.7 Test `issueCertificate` reverts when `studentName` is empty
    - _Requirements: 3.1_
  - [x] 3.8 Test `issueCertificate` reverts when `studentAddress` is zero address
    - _Requirements: 3.1_
  - [x] 3.9 Test `issueCertificate` reverts when `ipfsCid` is empty
    - _Requirements: 3.1_
  - [x] 3.10 Test `revokeCertificate` sets `isValid: false` and `verifyCertificate` returns `false`
    - _Requirements: 6.1_
  - [x] 3.11 Test `revokeCertificate` reverts for non-issuer caller
    - _Requirements: 2.1_
  - [x] 3.12 Test `revokeCertificate` reverts for non-existent certificate
    - _Requirements: 6.1_
  - [x] 3.13 Test `revokeCertificate` reverts on double-revoke
    - _Requirements: 6.1_


### Phase 4 — Frontend Scaffold & Web3 Context

- [x] 4. Set up React + Vite + Tailwind frontend with Web3 wallet context
  - [x] 4.1 Create `frontend/index.html` with dark class, Google Fonts (Plus Jakarta Sans, JetBrains Mono), and favicon reference
    - _Requirements: 10.1_
  - [x] 4.2 Create `frontend/src/main.tsx` wrapping `<App>` in `<Web3Provider>` and `<BrowserRouter>`
    - _Requirements: 10.1_
  - [x] 4.3 Create `frontend/src/App.tsx` with React Router routes: `/` → `VerificationPage`, `/issue` → `IssuerDashboard`, `/student` → `StudentDashboard`
    - _Requirements: 10.2_
  - [x] 4.4 Create `frontend/src/context/Web3Context.tsx` providing: `account`, `chainId`, `isConnecting`, `hasIssuerRole`, `contract`, `provider`, `signer`, `connectWallet()`, `disconnectWallet()`, `switchNetwork()`, `refreshIssuerRole()`
    - _Requirements: 9.1, 9.2, 9.3, 9.4_
  - [x] 4.5 Implement `connectWallet()` using `ethers.BrowserProvider`, request accounts, instantiate contract with signer, check `ISSUER_ROLE`
    - _Requirements: 9.1_
  - [x] 4.6 Implement auto-reconnect on page load via `eth_accounts` and `accountsChanged` / `chainChanged` event listeners with cleanup
    - _Requirements: 9.3_
  - [x] 4.7 Create `frontend/src/components/Navbar.tsx` with Connect/Disconnect wallet button and role badge
    - _Requirements: 10.2_
  - [x] 4.8 Create `frontend/src/components/Footer.tsx`
    - _Requirements: 10.2_
  - [x] 4.9 Create `frontend/src/index.css` with Tailwind directives and custom utilities: `glass-panel`, `glow-effect`
    - _Requirements: 10.1_
  - [x] 4.10 Create `frontend/vite.config.ts` with React plugin and `process.env: {}` shim for Node compatibility
    - _Requirements: 10.7_
  - [x] 4.11 Create `frontend/tailwind.config.js` and `frontend/postcss.config.js`
    - _Requirements: 10.1_


### Phase 5 — Verification Page

- [x] 5. Build public certificate verification page
  - [x] 5.1 Create `frontend/src/pages/VerificationPage.tsx` with a search input for certificate ID
    - _Requirements: 4.1, 4.2_
  - [x] 5.2 Call `contract.getCertificate(certId)` on search and display all fields: student name, address, course, issuer, issue date, validity status
    - _Requirements: 4.1, 4.2_
  - [x] 5.3 Display validity badge (Valid / Revoked) with color coding
    - _Requirements: 4.2, 5.1_
  - [x] 5.4 Add IPFS gateway link to view the original PDF
    - _Requirements: 4.3_
  - [x] 5.5 Implement deep-link support: read `?certId=` query param on load and auto-search
    - _Requirements: 4.4_
  - [x] 5.6 Add share URL button (clipboard copy of `?certId=` link)
    - _Requirements: 4.4_
  - [x] 5.7 Add sample certificate ID chips for quick testing
    - _Requirements: 4.5_
  - [x] 5.8 Use read-only `JsonRpcProvider` so verification works without MetaMask connected
    - _Requirements: 4.1_


### Phase 6 — Issuer Dashboard

- [x] 6. Build issuer dashboard for issuing and revoking certificates
  - [x] 6.1 Create `frontend/src/pages/IssuerDashboard.tsx` with role guard (redirect or warning if no `ISSUER_ROLE`)
    - _Requirements: 2.1, 11.1_
  - [x] 6.2 Build issue form with fields: `studentName`, `studentAddress`, `courseName`, `issuerName`, PDF file upload
    - _Requirements: 11.1, 11.2_
  - [x] 6.3 Implement multi-step status flow: idle → uploading_ipfs → signing_tx → confirming → done
    - _Requirements: 11.3_
  - [x] 6.4 On success, display issued certificate ID and transaction hash
    - _Requirements: 11.4_
  - [x] 6.5 Build certificate registry table showing all issued certificates with validity badge
    - _Requirements: 11.5_
  - [x] 6.6 Add revoke button per certificate row; call `contract.revokeCertificate(certId)`
    - _Requirements: 6.1, 11.6_
  - [x] 6.7 Add filter/search over the registry list
    - _Requirements: 11.5_
  - [x] 6.8 Add refresh button to reload registry from chain
    - _Requirements: 11.5_


### Phase 7 — Student Dashboard

- [x] 7. Build student certificate dashboard
  - [x] 7.1 Create `frontend/src/pages/StudentDashboard.tsx` showing certificates for the connected wallet address
    - _Requirements: 12.1_
  - [x] 7.2 Filter on-chain certificates by matching `studentAddress` to connected account
    - _Requirements: 12.1_
  - [x] 7.3 Display certificate cards with validity badge (Valid / Revoked)
    - _Requirements: 12.2_
  - [x] 7.4 Add view button opening full certificate detail modal
    - _Requirements: 12.3_
  - [x] 7.5 Add IPFS link to download original PDF
    - _Requirements: 12.4_


### Phase 8 — Certificate Modal Component

- [x] 8. Build reusable certificate detail modal
  - [x] 8.1 Create `frontend/src/components/CertificateModal.tsx` with full credential view
    - _Requirements: 13.1_
  - [x] 8.2 Display all certificate fields: student name, course, issuer, issue date, certificate ID, validity
    - _Requirements: 13.1_
  - [x] 8.3 Add gradient border canvas and watermark for visual authenticity
    - _Requirements: 13.2_
  - [x] 8.4 Add share link button (clipboard copy of verification URL)
    - _Requirements: 13.3_
  - [x] 8.5 Add print button
    - _Requirements: 13.4_
  - [x] 8.6 Add IPFS download link
    - _Requirements: 13.5_


### Phase 9 — IPFS Service

- [x] 9. Implement IPFS upload service with live and mock modes
  - [x] 9.1 Create `frontend/src/services/ipfsService.ts` with `uploadToIPFS(file: File)` function
    - _Requirements: 14.1_
  - [x] 9.2 Attempt live upload via `@web3-storage/w3up-client` when `VITE_W3_PRINCIPAL` and `VITE_W3_PROOF` env vars are present
    - _Requirements: 14.1, 14.2_
  - [x] 9.3 Fall back to deterministic mock CID (SHA-256 of file content, formatted as `bafybeic{hex}`) when live credentials are absent
    - _Requirements: 14.3_
  - [x] 9.4 Implement `getIPFSGatewayUrl(cid)` returning `https://w3s.link/ipfs/{cid}`
    - _Requirements: 14.4_
  - [x] 9.5 Return `{ cid, gatewayUrl, isMock }` from `uploadToIPFS` so callers can show a mock warning
    - _Requirements: 14.3_


### Phase 10 — Backend Scaffold & MongoDB

- [x] 10. Set up Node.js + Express backend with MongoDB connection
  - [x] 10.1 Create `backend/src/config/db.ts` with `connectDB()` using `MONGODB_URI` env var; non-fatal on connection failure (warn and continue)
    - _Requirements: 20.1_
  - [x] 10.2 Create `backend/src/models/Certificate.ts` — Mongoose schema with fields: `certificateId`, `studentName`, `studentAddress`, `courseName`, `issuerName`, `issueDate`, `ipfsCid`, `isValid`, `transactionHash`, `blockNumber`; indexes on `certificateId` and `studentAddress`
    - _Requirements: 20.2_
  - [x] 10.3 Create `backend/src/index.ts` — Express app with `cors`, `express.json()`, `/api/health` endpoint, certificate routes mounted at `/api`, and async `startServer()` that connects DB then starts indexer before listening
    - _Requirements: 20.3, 20.6_
  - [x] 10.4 Create `backend/tsconfig.json` with `"module": "commonjs"`, `"target": "ES2020"`, `"outDir": "dist"`, `"strict": true`
    - _Requirements: 20.7_


### Phase 11 — Blockchain Event Indexer & REST API

- [x] 11. Build event indexer and REST API controllers
  - [x] 11.1 Create `backend/src/services/indexer.ts` — subscribe to `CertificateIssued` and `CertificateRevoked` events using `ethers.JsonRpcProvider`; on `CertificateIssued` call `getCertificate()` and upsert to MongoDB + in-memory Map; on `CertificateRevoked` update `isValid: false`
    - _Requirements: 21.1, 21.2_
  - [x] 11.2 Use in-memory Map as fallback store when MongoDB is unavailable
    - _Requirements: 21.3_
  - [x] 11.3 Create `backend/src/controllers/certificateController.ts` with `getCertificates`, `getCertificateById`, `getCertificatesByStudent` — dual-path: MongoDB when connected, in-memory otherwise
    - _Requirements: 21.4_
  - [x] 11.4 Create `backend/src/routes/certificateRoutes.ts` — register `/certificates/student/:address` before `/:id` to prevent Express route shadowing
    - _Requirements: 21.5_


### Phase 12 — Documentation & Final Polish

- [x] 12. Write documentation and apply final polish
  - [x] 12.1 Write `README.md` with project overview, tech stack table, project structure, smart contract function descriptions, prerequisites, step-by-step local setup (blockchain → frontend → backend), environment variable reference, test command, and Sepolia deployment steps
    - _Requirements: 22.1, 22.2_
  - [x] 12.2 Create `frontend/public/favicon.svg` — CertiChain shield icon
    - _Requirements: 22.3_
  - [x] 12.3 Ensure no `.env` files are committed; all three `.env.example` files present with placeholder values only
    - _Requirements: 22.4_
  - [x] 12.4 Verify root `.gitignore` excludes all generated and secret files
    - _Requirements: 22.4_
