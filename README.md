# Escrowly - Solana Devnet Escrow Interface

A premium, high-performance escrow interface for Solana Devnet, built with **@solana/kit (v2)**.

![Hero Image](https://raw.githubusercontent.com/superteam-ua/solana-escrow-frontend/main/public/demo.png)

## 🚀 Features

- **Standard Wallet Support**: Seamlessly connects to any Wallet Standard compatible wallet (Phantom, Solflare, Backpack).
- **Custom UI**: 100% custom-built wallet modal and swap widget — no third-party UI libraries like RainbowKit or WalletAdapter UI.
- **Zero-Dependency Styling**: Modern, dark-themed UI inspired by Peer.xyz, built with Tailwind CSS.
- **Advanced State Management**: Real-time fetching of open escrow offers directly from the blockchain (Starred extra-credit task).
- **Solana Kit v2**: Uses the latest Anza `@solana/kit` for all transaction construction and RPC interactions.

## 🛠 Tech Stack

- **Framework**: Vite + React + TypeScript
- **Solana API**: `@solana/kit` (v2)
- **Styling**: Tailwind CSS
- **Wallet**: Solana Wallet Standard

## 📦 Setup & Installation

1. **Clone the repository**:
   ```bash
   git clone https://github.com/neor-it/Escrowly.git
   cd Escrowly
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Configure Environment**:
   Create a `.env` file based on the provided template:
   ```env
   VITE_SOLANA_RPC_URL=https://api.devnet.solana.com
   VITE_ESCROW_PROGRAM_ID=4g5EN9Sk7wEcZqfjdjDtvq7T9u5YUrBKTe23fVJoL8yy
   ```

4. **Run the development server**:
   ```bash
   npm run dev
   ```

## 🧪 Testing

### Tested Wallets
The following wallets have been confirmed to work with this implementation:
- **Phantom** (Devnet mode)
- **Solflare** (Devnet mode)
- **Backpack**

### Successful Devnet Transaction
Deployment transaction: [4e9RDL7qeV68R2wGrZN9fg3n6mUkX9pWf5CemPmoPQoep9n2fX8UgEAwF6oTy3uF8VgbNRUqtqsq54yb9ZJfD8Yj](https://explorer.solana.com/tx/4e9RDL7qeV68R2wGrZN9fg3n6mUkX9pWf5CemPmoPQoep9n2fX8UgEAwF6oTy3uF8VgbNRUqtqsq54yb9ZJfD8Yj?cluster=devnet)

## 📄 License
MIT
