# Galachain Connect NextJS

A Next.js-based web application designed to showcase achievements and connect users' wallets for interactions within the GalaChain ecosystem.

## Prerequisites

- Node.js (v14 or later)
- npm, yarn, or pnpm
- MetaMask or compatible Web3 wallet

## Setup and Installation

### Clone the repository

```bash
git clone https://github.com/j3robinson1/galahero.git
cd galahero
```

## Setup and Installation

### Install Dependencies

```bash
npm install
# or
yarn install
# or
pnpm install
```

## Configure the Environment
Create a `.env` file in the root directory and add the following:

```plaintext
NEXT_PUBLIC_BURN_GATEWAY_API=https://gateway-mainnet.galachain.com/api/asset/token-contract
NEXT_PUBLIC_BURN_GATEWAY_PUBLIC_KEY_API=https://gateway-mainnet.galachain.com/api/asset/public-key-contract
NEXT_PUBLIC_GALASWAP_API=https://api-galaswap.gala.com/v1
NEXT_PUBLIC_PROJECT_ID=6f46d045c938d69456032bea89973429
NEXT_PUBLIC_GATEWAY_API=https://api-galaswap.gala.com/galachain/api/asset/public-key-contract

NEXT_PUBLIC_SUPABASE_URL=<FILL WITH YOUR DB>
NEXT_PUBLIC_SUPABASE_KEY=<FILL WITH YOUR DB KEY>
JWT_SECRET=<FILL WITH YOUR JWT>
```
Replace <your project id> with your actual project ID.

## Start the Development Server

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
```

## Features

- **MetaMask Wallet Connection:** Seamlessly connect your MetaMask wallet.
- **Automatic User Registration:** Register users automatically with GalaChain if needed.
- **GALA Token Balance Display:** Check your GALA token balance, including locked amounts.
- **Token Burning Functionality:** Allows users to burn GALA tokens directly from the interface.
- **Token Transfer Functionality:** Allows users to transfer GALA tokens directly from the interface.

## Project Structure

- `pages/index.js` - The main entry point for the application.
- `components/`
  - `Balance.js` - Displays the GALA balance.
  - `BurnGala.js` - Handles the burning of GALA tokens.
  - `TransferGala.js` - Handles the transfer of GALA tokens.
  - `WalletConnect.js` - Manages wallet connections and interactions.

Environment variables are defined in `.env`. Next.js configuration is managed through `next.config.js`.

## Development

This application is built using:

- **Next.js** for server-side rendering and static generation.
- **React** for building user interfaces.
- **TailwindCSS** for styling.
- **GalaChain Connect library** for blockchain interactions.
