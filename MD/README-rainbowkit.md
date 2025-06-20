# RainbowKit + SIWE Setup for Bario Entertainment System

## Overview
This project now includes RainbowKit integration with Sign-In with Ethereum (SIWE) authentication on the Base chain.

## Setup Instructions

### 1. Environment Variables
Add the following variables to your existing `.env` file:

```env
# WalletConnect Project Configuration
NEXT_PUBLIC_PROJECT_NAME=BAESAPP
NEXT_PUBLIC_PROJECT_ID=f3735fe5571500a5f9ee21acf183cdc6

# NextAuth Configuration (required for SIWE)
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your-secret-key-here

# Your existing Supabase configuration
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

**Important**: 
- Generate a secure `NEXTAUTH_SECRET` using: `openssl rand -base64 32`
- For production, update `NEXTAUTH_URL` to your domain

### 2. Features Implemented

#### SIWE Authentication
- **Sign-In with Ethereum**: Users must sign a message to authenticate
- **Base Chain Only**: Configured specifically for Base network
- **Custom Message**: "Sign in to Bario Entertainment System"
- **Session Management**: Secure JWT-based sessions

#### RainbowKit Configuration
- **Chain**: Base (Coinbase's L2)
- **Wallets**: All popular wallets supported by RainbowKit
- **Custom Styling**: Matches your app's design system
- **Project ID**: Already configured with your WalletConnect project

#### Components Added
- `components/providers.tsx` - Updated with SIWE providers
- `lib/wagmi.ts` - Wagmi and RainbowKit configuration

#### Updated Files
- `app/layout.tsx` - Added RainbowKit CSS and providers
- All pages with connect buttons now support SIWE authentication

### 3. How SIWE Works

1. **Connect Wallet**: User clicks "Connect Wallet"
2. **Choose Wallet**: RainbowKit modal opens with wallet options
3. **Connect**: User connects their wallet
4. **Sign Message**: User is prompted to sign an authentication message
5. **Authenticated**: User is now authenticated and can access protected features

### 4. Usage in Components

#### Check Authentication Status
```tsx
import { useSession } from 'next-auth/react'

function MyComponent() {
  const { data: session, status } = useSession()
  
  if (status === 'loading') return <p>Loading...</p>
  if (status === 'unauthenticated') return <p>Not signed in</p>
  
  return <p>Signed in as {session?.user?.name}</p>
}
```

#### Protected Routes
```tsx
import { useSession } from 'next-auth/react'

function ProtectedComponent() {
  const { data: session } = useSession()
  
  if (!session) {
    return <div>Please connect and sign in with your wallet</div>
  }
  
  return <div>Welcome, authenticated user!</div>
}
```

### 5. Testing the Implementation

To test the SIWE authentication:
1. Run `npm run dev` or `pnpm dev`
2. Open your browser and navigate to the app
3. Click on any "Connect Wallet" button
4. Select a wallet from the RainbowKit modal
5. Connect your wallet (ensure it's on Base network)
6. Sign the authentication message when prompted
7. You're now authenticated!

### 6. Base Chain Information
- **Chain ID**: 8453
- **RPC URL**: Automatically configured by RainbowKit
- **Block Explorer**: https://basescan.org

### 7. Next Steps

The SIWE authentication is now fully functional! You can:
1. Add protected routes and features
2. Store user data associated with wallet addresses
3. Implement role-based access control
4. Add wallet-gated gaming features
5. Create user profiles and preferences

### 8. Security Notes

- Users must sign a message to prove wallet ownership
- Sessions are managed securely with NextAuth
- No private keys are ever stored or transmitted
- Authentication is cryptographically secure

The app is now ready for secure wallet-based authentication on the Base chain! 