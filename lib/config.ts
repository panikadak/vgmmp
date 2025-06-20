/**
 * Environment Configuration and Validation
 * This file validates all required environment variables on app startup
 */

// Required environment variables
const requiredEnvVars = [
  'NEXTAUTH_SECRET',
  'NEXT_PUBLIC_SUPABASE_URL',
  'NEXT_PUBLIC_SUPABASE_ANON_KEY',
  'SUPABASE_SERVICE_ROLE_KEY',
] as const

// Optional environment variables with defaults
const optionalEnvVars = {
  NEXTAUTH_URL: 'http://localhost:3000',
  NEXT_PUBLIC_PROJECT_NAME: 'BAESAPP',
  NEXT_PUBLIC_PROJECT_ID: 'f3735fe5571500a5f9ee21acf183cdc6',
  AUTHORIZED_ADMIN_ADDRESS: '0x702ba46435d1e55b18440100bc81eb055574875e',
  RATE_LIMIT_MAX_REQUESTS: '100',
  RATE_LIMIT_WINDOW_MS: '900000', // 15 minutes
  MAX_FILE_SIZE_MB: '50',
  ALLOWED_FILE_TYPES: 'jpg,jpeg,png,gif,webp',
} as const

/**
 * Validates that all required environment variables are present
 * Throws an error if any are missing
 */
export function validateEnvironment() {
  const missing = requiredEnvVars.filter(env => !process.env[env])
  
  if (missing.length > 0) {
    throw new Error(
      `Missing required environment variables: ${missing.join(', ')}\n` +
      'Please check your .env.local file and ensure all required variables are set.'
    )
  }
  
  // Validate Supabase URL format
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  if (supabaseUrl && !supabaseUrl.startsWith('https://')) {
    console.warn('Supabase URL should use HTTPS in production')
  }
  
  // Validate NextAuth URL format
  const nextAuthUrl = process.env.NEXTAUTH_URL
  if (nextAuthUrl && !nextAuthUrl.startsWith('http')) {
    throw new Error('NEXTAUTH_URL must be a valid URL starting with http:// or https://')
  }
  
  console.log('✅ Environment variables validated successfully')
}

/**
 * Get environment variable with fallback
 */
export function getEnvVar(key: keyof typeof optionalEnvVars): string {
  return process.env[key] || optionalEnvVars[key]
}

/**
 * Configuration object with all environment variables
 */
export const config = {
  // Authentication
  nextAuth: {
    url: getEnvVar('NEXTAUTH_URL'),
    secret: process.env.NEXTAUTH_SECRET!,
  },
  
  // Supabase
  supabase: {
    url: process.env.NEXT_PUBLIC_SUPABASE_URL!,
    anonKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    serviceRoleKey: process.env.SUPABASE_SERVICE_ROLE_KEY,
  },
  
  // Wallet/RainbowKit
  wallet: {
    projectName: getEnvVar('NEXT_PUBLIC_PROJECT_NAME'),
    projectId: getEnvVar('NEXT_PUBLIC_PROJECT_ID'),
  },
  
  // Security
  security: {
    adminAddress: getEnvVar('AUTHORIZED_ADMIN_ADDRESS'),
    rateLimit: {
      maxRequests: parseInt(getEnvVar('RATE_LIMIT_MAX_REQUESTS')),
      windowMs: parseInt(getEnvVar('RATE_LIMIT_WINDOW_MS')),
    },
  },
  
  // File uploads
  uploads: {
    maxSizeMB: parseInt(getEnvVar('MAX_FILE_SIZE_MB')),
    allowedTypes: getEnvVar('ALLOWED_FILE_TYPES').split(','),
  },
  
  // Environment
  isDevelopment: process.env.NODE_ENV === 'development',
  isProduction: process.env.NODE_ENV === 'production',
} as const

/**
 * Admin wallet addresses (supports multiple addresses)
 */
export function getAuthorizedAdmins(): string[] {
  const adminAddresses = getEnvVar('AUTHORIZED_ADMIN_ADDRESS')
  return adminAddresses.split(',').map(addr => addr.trim().toLowerCase())
}

/**
 * Check if a wallet address is authorized as admin
 */
export function isAuthorizedAdmin(address: string): boolean {
  const authorizedAddresses = getAuthorizedAdmins()
  return authorizedAddresses.includes(address.toLowerCase())
}

// Validate environment on module load (only in production)
if (typeof window === 'undefined' && process.env.NODE_ENV !== 'test') {
  validateEnvironment()
} 