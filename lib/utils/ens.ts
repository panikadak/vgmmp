// ENS utilities for resolving names and avatars

// Simple cache for ENS data to avoid repeated API calls
const ensCache = new Map<string, { name?: string; avatar?: string; timestamp: number }>()
const CACHE_DURATION = 5 * 60 * 1000 // 5 minutes

// Format wallet address for display
export function formatWalletAddress(address: string): string {
  if (!address) return ''
  return `${address.slice(0, 6)}...${address.slice(-4)}`
}

// Check if address has cached ENS data
function getCachedENSData(address: string) {
  const cached = ensCache.get(address.toLowerCase())
  if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
    return cached
  }
  return null
}

// Cache ENS data
function setCachedENSData(address: string, data: { name?: string; avatar?: string }) {
  ensCache.set(address.toLowerCase(), {
    ...data,
    timestamp: Date.now()
  })
}

// Get ENS data (name and avatar) for an address using ensdata.net
export async function getENSData(address: string): Promise<{ name?: string; avatar?: string }> {
  try {
    // Check cache first
    const cached = getCachedENSData(address)
    if (cached) {
      return { name: cached.name, avatar: cached.avatar }
    }

    // Use ensdata.net free API
    const response = await fetch(`https://ensdata.net/${address}`)
    
    if (!response.ok) {
      setCachedENSData(address, {})
      return {}
    }

    const data = await response.json()
    
    // Extract ENS name and avatar from response
    const ensName = data.ens || data.name || null
    const avatar = data.avatar || null
    
    const result = { name: ensName, avatar }
    setCachedENSData(address, result)
    return result
  } catch (error) {
    console.error('Error fetching ENS data:', error)
    setCachedENSData(address, {})
    return {}
  }
}

// Resolve ENS name for an address
export async function resolveENSName(address: string): Promise<string | null> {
  const data = await getENSData(address)
  return data.name || null
}

// Get ENS avatar for an address
export async function getENSAvatar(address: string): Promise<string | null> {
  const data = await getENSData(address)
  return data.avatar || null
}

// Get display name (ENS name or formatted address)
export async function getDisplayName(address: string): Promise<string> {
  const ensName = await resolveENSName(address)
  return ensName || formatWalletAddress(address)
}

// Get user info (name and avatar) - optimized to make single API call
export async function getUserInfo(address: string): Promise<{
  displayName: string
  avatar?: string
  isENS: boolean
}> {
  try {
    const { name, avatar } = await getENSData(address)

    return {
      displayName: name || formatWalletAddress(address),
      avatar: avatar || undefined,
      isENS: !!name
    }
  } catch (error) {
    console.error('Error getting user info:', error)
    return {
      displayName: formatWalletAddress(address),
      isENS: false
    }
  }
} 