'use client';

import { ConnectButton } from '@rainbow-me/rainbowkit';
import { Button } from '@/components/ui/button-custom';

interface CustomConnectButtonProps {
  variant?: 'primary' | 'secondary';
  className?: string;
  fullWidth?: boolean;
  compact?: boolean;
}

export const CustomConnectButton = ({ 
  variant = 'primary', 
  className = '',
  fullWidth = false,
  compact = false
}: CustomConnectButtonProps) => {
  return (
    <ConnectButton.Custom>
      {({
        account,
        chain,
        openAccountModal,
        openChainModal,
        openConnectModal,
        authenticationStatus,
        mounted,
      }) => {
        // Note: If your app doesn't use authentication, you
        // can remove all 'authenticationStatus' checks
        const ready = mounted && authenticationStatus !== 'loading';
        const connected =
          ready &&
          account &&
          chain &&
          (!authenticationStatus ||
            authenticationStatus === 'authenticated');

        return (
          <div
            {...(!ready && {
              'aria-hidden': true,
              'style': {
                opacity: 0,
                pointerEvents: 'none',
                userSelect: 'none',
              },
            })}
          >
            {(() => {
              if (!connected) {
                return (
                  <Button
                    onClick={openConnectModal}
                    variant={variant}
                    fullWidth={fullWidth}
                    className={`${compact ? 'py-2.5 px-4 text-sm' : ''} ${className}`}
                  >
                    Connect Wallet
                  </Button>
                );
              }

              if (chain.unsupported) {
                return (
                  <Button
                    onClick={openChainModal}
                    variant="secondary"
                    fullWidth={fullWidth}
                    className={`${compact ? 'py-2.5 px-4 text-sm' : ''} ${className}`}
                  >
                    Wrong network
                  </Button>
                );
              }

              // Connected state - only show account button (no chain selector)
              return (
                <Button
                  onClick={openAccountModal}
                  variant={variant}
                  fullWidth={fullWidth}
                  className={`${compact ? 'py-2.5 px-4 text-sm' : ''} ${className}`}
                >
                  {account.displayName}
                  {account.displayBalance
                    ? ` (${account.displayBalance})`
                    : ''}
                </Button>
              );
            })()}
          </div>
        );
      }}
    </ConnectButton.Custom>
  );
}; 