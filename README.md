# CipherVault

> Privacy‑preserving token platform powered by Zama FHEVM

CipherVault is a confidential ERC‑style token system that keeps balances, transfers, and allowances private. Using Fully Homomorphic Encryption (FHE) with Zama’s FHEVM, the protocol performs token accounting over encrypted data while preserving public verifiability of supply and settlement.

---

## Why CipherVault

- ❌ Public balances reveal user behavior → ✅ Encrypted balances and transfers
- ❌ Traceable allowances and approvals → ✅ Private allowances and spend limits
- ❌ Opaque privacy guarantees → ✅ On‑chain, verifiable FHEVM computations

---

## Zama FHEVM for Private Tokens

FHEVM lets smart contracts operate on ciphertexts. CipherVault updates balances, checks allowances, and settles transfers without ever decrypting user data.

```
Holder Client
  └─ FHE Encrypt (amount, recipient)
         └─ Encrypted Tx → FHEVM Contracts
                              └─ Encrypted Balance/Allowance Checks
                                       └─ Encrypted Settlement → Verifiable Event
```

Key properties
- No plaintext balances or allowances on‑chain
- Encrypted mint/burn/transfer/approve flows
- Auditable total supply and settlement proofs

---

## Getting Started

Prerequisites: Node.js 18+, MetaMask, Sepolia ETH

Setup
```bash
git clone https://github.com/logernyk/CipherVault
cd CipherVault
npm install
cp .env.example .env.local
```

Deploy
```bash
npm run deploy:sepolia
```

Run
```bash
npm run dev
```

---

## Token Flows

1) Mint: authority mints to an encrypted address balance
2) Approve: holder sets encrypted allowance for a spender
3) Transfer: encrypted transfer updates encrypted balances
4) Burn: reduce supply via encrypted burn

Privacy model
- Encrypted: balances, amounts, allowances
- Transparent: total supply, event emissions, contract code

---

## Architecture

| Layer            | Technology            | Role                                   |
|------------------|-----------------------|----------------------------------------|
| Encryption       | Zama FHE              | Client‑side encryption of token data    |
| Smart Contracts  | Solidity + FHEVM      | Encrypted accounting & settlement       |
| Blockchain       | Ethereum Sepolia      | Execution & persistence                 |
| Frontend         | React + TypeScript    | Wallet UI + local crypto                |
| Tooling          | Hardhat, Ethers       | Build/test/deploy                       |

Core contracts
- CipherVaultToken: encrypted ERC‑style accounting
- Treasury/Authority: mint/burn roles and policy hooks
- Proofs/Views: public supply and settlement views

---

## Features

- 🔐 Encrypted balances and transfers
- 🧾 Private allowances and approvals
- 🧮 Public total supply proofs
- 🧩 Policy modules (caps, roles, fees)

---

## Security & Best Practices

- Independent audits for circuits and contracts recommended
- EIP‑712 signed intents and nonce schemes
- Rotate FHE keys periodically; minimize metadata
- Monitor gas footprint of FHE computations

---

## Roadmap

- v1: Core encrypted ERC‑style token
- v1.1: Private allowances with delegated spend
- v1.2: Cross‑chain bridges (privacy‑preserving proofs)

---

## Contributing

Contributions welcome: performance, audits, policy modules, bridges, UI/UX.

---

## Resources

- Zama: https://www.zama.ai
- FHEVM Docs: https://docs.zama.ai/fhevm
- Sepolia Explorer: https://sepolia.etherscan.io

---

## License

MIT — see LICENSE.

Built with Zama FHEVM — private balances, verifiable supply, trustworthy settlement.
