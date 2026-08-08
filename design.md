# Design Document — CertiChain

## Overview

CertiChain is a decentralized certificate issuance and verification platform built as a
monorepo with three sub-packages: `blockchain/` (Solidity + Hardhat), `frontend/`
(React + Vite + TypeScript + Tailwind CSS), and `backend/` (optional Node.js + Express +
MongoDB). Certificates are stored immutably on an EVM-compatible network; their PDF
documents are content-addressed on IPFS via web3.storage Storacha.

This document covers the architecture, component design, data models, interfaces, error
handling strategy, and the formal correctness properties derived from the requirements.

---

## 1. System Architecture

```
┌──────────────────────────────────────────────────────────────────────┐
│                          Browser (React App)                         │
│                                                                      │
│  ┌───────────┐  ┌──────────────┐  ┌─────────────┐  ┌────────────┐  │
│  │  Pages /  │  │  Web3Context │  │ ipfsService  │  │  Backend   │  │
│  │  Router   │◄─│  (ethers v6) │  │ (W3UP client)│  │  REST API  │  │
│  └───────────┘  └──────┬───────┘  └──────┬───────┘  └─────┬──────┘  │
└──────────────────────────────────────────────────────────────────────┘
                          │                  │                │
                   MetaMask /          web3.storage      MongoDB
                   JSON-RPC            Storacha IPFS      (optional)
                          │
              ┌───────────▼──────────────┐
              │   CertiChain.sol         │
              │   (Hardhat / Sepolia)    │
              └──────────────────────────┘
```

### Sub-package boundaries

| Package        | Responsibility                                                    |
|----------------|-------------------------------------------------------------------|
| `blockchain/`  | Solidity contract, Hardhat config, deploy scripts, tests          |
| `frontend/`    | React UI, Web3 context, IPFS service, contract interaction        |
| `backend/`     | Event indexer, REST endpoints, MongoDB models (optional)          |
| `docs/`        | Architecture diagrams, project report                             |

