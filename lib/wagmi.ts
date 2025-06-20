import { getDefaultConfig } from '@rainbow-me/rainbowkit';
import { base } from 'wagmi/chains';

// Singleton pattern to prevent multiple initialization
let wagmiConfig: ReturnType<typeof getDefaultConfig> | null = null;

export const config = (() => {
  if (wagmiConfig) {
    return wagmiConfig;
  }
  
  wagmiConfig = getDefaultConfig({
    appName: process.env.NEXT_PUBLIC_PROJECT_NAME || 'BAESAPP',
    projectId: process.env.NEXT_PUBLIC_PROJECT_ID || 'f3735fe5571500a5f9ee21acf183cdc6',
    chains: [base],
    ssr: true, // If your dApp uses server side rendering (SSR)
  });
  
  return wagmiConfig;
})(); 