import NextAuth from 'next-auth'
import { NextAuthOptions } from 'next-auth'

// Extend NextAuth types
declare module 'next-auth' {
  interface Session {
    address?: string
    supabaseAccessToken?: string
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    supabaseAccessToken?: string
  }
}
import { getCsrfToken } from 'next-auth/react'
import {
  type SiweMessage,
  parseSiweMessage,
  validateSiweMessage,
} from 'viem/siwe'
import CredentialsProvider from 'next-auth/providers/credentials'
import { createPublicClient, http } from 'viem'
import { base } from 'viem/chains'
import { supabaseAdmin } from '@/lib/supabase/secure-client'

// Create a server-side public client for EIP-1271 verification
const publicClient = createPublicClient({
  chain: base,
  transport: http(),
})

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: 'Ethereum',
      credentials: {
        message: {
          label: 'Message',
          type: 'text',
          placeholder: '0x0',
        },
        signature: {
          label: 'Signature',
          type: 'text',
          placeholder: '0x0',
        },
      },
      async authorize(credentials, req) {
        try {
          const siweMessage = parseSiweMessage(
            credentials?.message || ''
          ) as SiweMessage
          
          if (!validateSiweMessage({
            address: siweMessage?.address,
            message: siweMessage,
          })) {
            return null
          }

          const nextAuthUrl = new URL(process.env.NEXTAUTH_URL || 'http://localhost:3000')
          
          if (siweMessage.domain !== nextAuthUrl.host) {
            return null
          }

          if (siweMessage.nonce !== (await getCsrfToken({ req: { headers: req.headers } }))) {
            return null
          }

          // Use viem's verifyMessage with publicClient for EIP-1271 support
          const valid = await publicClient.verifyMessage({
            address: siweMessage?.address,
            message: credentials?.message || '',
            signature: (credentials?.signature || '') as `0x${string}`,
          })
          
          if (!valid) {
            return null
          }
          
          return {
            id: siweMessage.address,
          }
        } catch (e) {
          console.log('SIWE verification failed:', e)
          return null
        }
      },
    }),
  ],
  session: {
    strategy: 'jwt',
  },
  secret: process.env.NEXTAUTH_SECRET,
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        try {
          // Create or get Supabase user for this wallet address
          const walletAddress = user.id.toLowerCase()
          
          // Try to sign in the user first
          let { data: authData, error: signInError } = await supabaseAdmin.auth.signInWithPassword({
            email: `${walletAddress}@wallet.local`,
            password: walletAddress, // Using wallet address as password for simplicity
          })
          
          // If user doesn't exist, create them
          if (signInError && signInError.message.includes('Invalid login credentials')) {
            const { data: createData, error: createError } = await supabaseAdmin.auth.admin.createUser({
              email: `${walletAddress}@wallet.local`,
              password: walletAddress,
              email_confirm: true,
              user_metadata: {
                wallet_address: walletAddress,
                auth_method: 'siwe'
              }
            })
            
            if (createError) {
              console.error('Error creating Supabase user:', createError)
              return token
            }
            
            // After creating user, sign them in to get session
            if (createData.user) {
              const { data: signInData, error: newSignInError } = await supabaseAdmin.auth.signInWithPassword({
                email: `${walletAddress}@wallet.local`,
                password: walletAddress,
              })
              
              if (newSignInError) {
                console.error('Error signing in newly created user:', newSignInError)
                return token
              }
              
              authData = signInData
            }
          } else if (signInError) {
            console.error('Error signing in Supabase user:', signInError)
            return token
          }
          
          // Store the Supabase access token
          if (authData.session?.access_token) {
            token.supabaseAccessToken = authData.session.access_token
            token.walletAddress = walletAddress
          }
        } catch (error) {
          console.error('Error in JWT callback:', error)
        }
      }
      return token
    },
    async session({ session, token }) {
      session.address = token.sub
      session.supabaseAccessToken = token.supabaseAccessToken as string
      session.user = {
        name: token.sub,
      }
      return session
    },
  },
}

const handler = NextAuth(authOptions)

export { handler as GET, handler as POST } 