'use client';

import * as React from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { WagmiProvider } from 'wagmi';
import { RainbowKitProvider, Theme } from '@rainbow-me/rainbowkit';
import { RainbowKitSiweNextAuthProvider, GetSiweMessageOptions } from '@rainbow-me/rainbowkit-siwe-next-auth';
import { SessionProvider } from 'next-auth/react';

import { config } from '@/lib/wagmi';

// Memoize QueryClient to prevent re-initialization
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 60 * 1000,
    },
  },
});

// Memoize getSiweMessageOptions
const getSiweMessageOptions: GetSiweMessageOptions = () => ({
  statement: 'Sign in to Bario Entertainment System',
});

// Custom theme to match site's modal backdrop
const customTheme: Theme = {
  blurs: {
    modalOverlay: 'blur(12px)', // backdrop-blur-md equivalent
  },
  colors: {
    accentColor: '#3b82f6', // blue-500
    accentColorForeground: '#ffffff',
    actionButtonBorder: 'rgba(0, 0, 0, 0.04)',
    actionButtonBorderMobile: 'rgba(0, 0, 0, 0.06)',
    actionButtonSecondaryBackground: '#f3f4f6', // gray-100
    closeButton: '#9ca3af', // gray-400
    closeButtonBackground: '#ffffff',
    connectButtonBackground: '#ffffff',
    connectButtonBackgroundError: '#ef4444', // red-500
    connectButtonInnerBackground: '#f9fafb', // gray-50
    connectButtonText: '#111827', // gray-900
    connectButtonTextError: '#ffffff',
    connectionIndicator: '#10b981', // green-500
    downloadBottomCardBackground: 'linear-gradient(126deg, rgba(255, 255, 255, 0) 9.49%, rgba(171, 171, 171, 0.04) 71.04%), #ffffff',
    downloadTopCardBackground: 'linear-gradient(126deg, rgba(171, 171, 171, 0.2) 9.49%, rgba(255, 255, 255, 0) 71.04%), #ffffff',
    error: '#ef4444', // red-500
    generalBorder: '#e5e7eb', // gray-200
    generalBorderDim: '#f3f4f6', // gray-100
    menuItemBackground: '#f9fafb', // gray-50
    modalBackdrop: 'rgba(156, 163, 175, 0.8)', // bg-gray-400/80 to match site modals
    modalBackground: '#ffffff',
    modalBorder: '#e5e7eb', // gray-200
    modalText: '#111827', // gray-900
    modalTextDim: '#6b7280', // gray-500
    modalTextSecondary: '#374151', // gray-700
    profileAction: '#f3f4f6', // gray-100
    profileActionHover: '#e5e7eb', // gray-200
    profileForeground: '#ffffff',
    selectedOptionBorder: '#3b82f6', // blue-500
    standby: '#fbbf24', // yellow-400
  },
  fonts: {
    body: 'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
  },
  radii: {
    actionButton: '16px', // rounded-2xl to match site
    connectButton: '16px', // rounded-2xl to match site
    menuButton: '16px', // rounded-2xl to match site
    modal: '24px', // rounded-3xl to match site
    modalMobile: '24px', // rounded-3xl to match site
  },
  shadows: {
    connectButton: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
    dialog: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
    profileDetailsAction: '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)',
    selectedOption: '0 0 0 3px rgba(59, 130, 246, 0.1)',
    selectedWallet: '0 0 0 3px rgba(59, 130, 246, 0.1)',
    walletLogo: '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)',
  },
};

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <WagmiProvider config={config}>
      <SessionProvider refetchInterval={0}>
        <QueryClientProvider client={queryClient}>
          <RainbowKitSiweNextAuthProvider
            getSiweMessageOptions={getSiweMessageOptions}
          >
            <RainbowKitProvider theme={customTheme}>
              {children}
            </RainbowKitProvider>
          </RainbowKitSiweNextAuthProvider>
        </QueryClientProvider>
      </SessionProvider>
    </WagmiProvider>
  );
} 