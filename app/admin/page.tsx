"use client"

import { useState, useEffect } from "react"
import { useAccount } from 'wagmi'
import { useSession } from 'next-auth/react'
import { ConnectButton } from '@rainbow-me/rainbowkit'
import { getAllGamesForAdmin, createGame, updateGame, deleteGame } from "@/lib/supabase/games"
import { uploadMultipleGameImages, uploadGameImage } from "@/lib/supabase/storage"
import { GAME_CATEGORIES } from "@/lib/constants"
import { Game, GameInsert, GameUpdate } from '@/lib/supabase/types'
import { useEditor, EditorContent } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import Bold from '@tiptap/extension-bold'
import Italic from '@tiptap/extension-italic'
import { Bold as BoldIcon, Italic as ItalicIcon, List, Shield, AlertTriangle } from 'lucide-react'

type ViewMode = 'list' | 'create' | 'edit'

import { isAuthorizedAdmin } from '@/lib/config'

// Admin access is now managed through environment variables

// Custom button styles for admin panel
const adminButtonStyles = {
  primary: "bg-blue-600 hover:bg-blue-700 text-white border-blue-600",
  secondary: "bg-gray-700 hover:bg-gray-600 text-white border-gray-700",
  outline: "bg-transparent hover:bg-gray-700 text-gray-300 border-gray-600 hover:text-white",
  success: "bg-green-600 hover:bg-green-700 text-white border-green-600",
  warning: "bg-yellow-600 hover:bg-yellow-700 text-white border-yellow-600",
  danger: "bg-red-600 hover:bg-red-700 text-white border-red-600"
}

// Wallet Connection Guard Component
function WalletGuard({ children }: { children: React.ReactNode }) {
  const { address, isConnected } = useAccount()
  const { data: session, status } = useSession()

  // Show loading state while checking authentication
  if (status === 'loading') {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="bg-gray-800 p-8 rounded-3xl shadow-2xl max-w-md w-full mx-4">
          <div className="text-center">
            <Shield className="w-16 h-16 text-blue-500 mx-auto mb-4 animate-pulse" />
            <h1 className="text-2xl font-bold text-white mb-4">Loading...</h1>
            <p className="text-gray-300">Checking authentication status</p>
          </div>
        </div>
      </div>
    )
  }

  // Check if wallet is connected
  if (!isConnected) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="bg-gray-800 p-8 rounded-3xl shadow-2xl max-w-md w-full mx-4">
          <div className="text-center">
            <Shield className="w-16 h-16 text-blue-500 mx-auto mb-4" />
            <h1 className="text-2xl font-bold text-white mb-4">Admin Panel Access</h1>
            <p className="text-gray-300 mb-6">
              Connect your wallet to access the admin panel
            </p>
            <div className="flex justify-center">
              <ConnectButton />
            </div>
          </div>
        </div>
      </div>
    )
  }

  // Check if user is authenticated with SIWE (session exists and has address)
  if (!session || !session.address) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="bg-gray-800 p-8 rounded-3xl shadow-2xl max-w-md w-full mx-4">
          <div className="text-center">
            <Shield className="w-16 h-16 text-yellow-500 mx-auto mb-4" />
            <h1 className="text-2xl font-bold text-white mb-4">Authentication Required</h1>
            <p className="text-gray-300 mb-6">
              Please sign the message to authenticate your wallet
            </p>
            <div className="flex justify-center">
              <ConnectButton />
            </div>
          </div>
        </div>
      </div>
    )
  }

  // Check if the authenticated address is authorized
  const sessionAddress = session.address?.toLowerCase()
  
  if (!sessionAddress || !isAuthorizedAdmin(sessionAddress)) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="bg-gray-800 p-8 rounded-3xl shadow-2xl max-w-md w-full mx-4">
          <div className="text-center">
            <AlertTriangle className="w-16 h-16 text-red-500 mx-auto mb-4" />
            <h1 className="text-2xl font-bold text-white mb-4">Access Denied</h1>
            <p className="text-gray-300 mb-4">
              This wallet address is not authorized to access the admin panel.
            </p>
            <p className="text-sm text-gray-400 mb-6 font-mono break-all">
              Connected: {sessionAddress}
            </p>
          </div>
        </div>
      </div>
    )
  }

  // If all checks pass, render the admin panel
  return <>{children}</>
}

// Main Admin Panel Component
function AdminPanel() {
  const { data: session } = useSession()
  const [viewMode, setViewMode] = useState<ViewMode>('list')
  const [games, setGames] = useState<Game[]>([])
  const [activeGames, setActiveGames] = useState<Game[]>([])
  const [passiveGames, setPassiveGames] = useState<Game[]>([])
  const [loading, setLoading] = useState(true)
  const [editingGame, setEditingGame] = useState<Game | null>(null)
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null)
  
  const [formData, setFormData] = useState({
    title: "",
    slug: "",
    description: "",
    source: "",
    category: "action",
    contract_address: "",
    opensea_url: "",
    storage_path: "",
    cartridge: "",
    images: [] as string[]
  })
  
  const [selectedFiles, setSelectedFiles] = useState<FileList | null>(null)
  const [selectedCartridgeFile, setSelectedCartridgeFile] = useState<File | null>(null)
  const [uploading, setUploading] = useState(false)

  // Tiptap editor
  const editor = useEditor({
    extensions: [
      StarterKit,
      Bold,
      Italic,
    ],
    content: formData.description,
    onUpdate: ({ editor }) => {
      setFormData(prev => ({
        ...prev,
        description: editor.getHTML()
      }))
    },
    editorProps: {
      attributes: {
        class: 'prose prose-sm max-w-none focus:outline-none min-h-[120px] p-4 text-white bg-gray-800 [&_strong]:text-white [&_em]:text-white [&_b]:text-white [&_i]:text-white',
      },
    },
  })

  // Update editor content when formData.description changes
  useEffect(() => {
    if (editor && editor.getHTML() !== formData.description) {
      editor.commands.setContent(formData.description)
    }
  }, [formData.description, editor])

  // Load games on component mount
  useEffect(() => {
    loadGames()
  }, [])

  useEffect(() => {
    // Separate active and passive games
    const active = games.filter(game => game.is_active)
    const passive = games.filter(game => !game.is_active)
    setActiveGames(active)
    setPassiveGames(passive)
  }, [games])

  const loadGames = async () => {
    try {
      setLoading(true)
      const data = await getAllGamesForAdmin()
      setGames(data)
    } catch (error: any) {
      console.error('Error loading games:', {
        message: error?.message || 'Unknown error',
        details: error?.details,
        hint: error?.hint,
        code: error?.code,
        stack: error?.stack,
        error: error
      })
      const errorMessage = error?.message || error?.details || 'Failed to load games'
      setMessage({ type: 'error', text: `Error: ${errorMessage}` })
    } finally {
      setLoading(false)
    }
  }

  const resetForm = () => {
    setFormData({
      title: "",
      slug: "",
      description: "",
      source: "",
      category: "action",
      contract_address: "",
      opensea_url: "",
      storage_path: "",
      cartridge: "",
      images: []
    })
    setSelectedFiles(null)
    setSelectedCartridgeFile(null)
    setMessage(null)
    setEditingGame(null)
    
    // Clear editor content
    if (editor) {
      editor.commands.setContent('')
    }
    
    // Reset file input
    const fileInput = document.getElementById('image-files') as HTMLInputElement
    if (fileInput) fileInput.value = ''
    
    const cartridgeInput = document.getElementById('cartridge-file') as HTMLInputElement
    if (cartridgeInput) cartridgeInput.value = ''
  }

  const handleEdit = (game: Game) => {
    setEditingGame(game)
    
    setFormData({
      title: game.title,
      slug: game.slug,
      description: game.description || "",
      source: game.source || "",
      category: game.category,
      contract_address: game.contract_address || "",
      opensea_url: game.opensea_url || "",
      storage_path: game.storage_path || "",
      cartridge: game.cartridge || "",
      images: game.images || []
    })
    
    // Set editor content
    if (editor) {
      editor.commands.setContent(game.description || '')
    }
    
    setViewMode('edit')
  }

  const handleDeactivate = async (gameId: string) => {
    if (!confirm('Are you sure you want to deactivate this game?')) return

    try {
      const walletAddress = session?.address
      if (!walletAddress) {
        setMessage({ type: 'error', text: 'Wallet address not found in session' })
        return
      }

      const updateData: GameUpdate = { is_active: false }
      await updateGame(gameId, updateData, walletAddress, session?.supabaseAccessToken)
      setMessage({ type: 'success', text: 'Game deactivated successfully!' })
      await loadGames()
    } catch (error: any) {
      console.error('Error deactivating game:', {
        message: error?.message || 'Unknown error',
        details: error?.details,
        hint: error?.hint,
        code: error?.code,
        stack: error?.stack,
        error: error
      })
      const errorMessage = error?.message || error?.details || 'Failed to deactivate game'
      setMessage({ type: 'error', text: `Error: ${errorMessage}` })
    }
  }

  const handleActivate = async (gameId: string) => {
    if (!confirm('Are you sure you want to activate this game?')) return

    try {
      const walletAddress = session?.address
      if (!walletAddress) {
        setMessage({ type: 'error', text: 'Wallet address not found in session' })
        return
      }

      const updateData: GameUpdate = { is_active: true }
      await updateGame(gameId, updateData, walletAddress, session?.supabaseAccessToken)
      setMessage({ type: 'success', text: 'Game activated successfully!' })
      await loadGames()
    } catch (error: any) {
      console.error('Error activating game:', {
        message: error?.message || 'Unknown error',
        details: error?.details,
        hint: error?.hint,
        code: error?.code,
        stack: error?.stack,
        error: error
      })
      const errorMessage = error?.message || error?.details || 'Failed to activate game'
      setMessage({ type: 'error', text: `Error: ${errorMessage}` })
    }
  }

  const handleDelete = async (gameId: string) => {
    if (!confirm('Are you sure you want to permanently delete this game? This action cannot be undone.')) return

    try {
      const walletAddress = session?.address
      if (!walletAddress) {
        setMessage({ type: 'error', text: 'Wallet address not found in session' })
        return
      }

      await deleteGame(gameId, walletAddress, session?.supabaseAccessToken)
      setMessage({ type: 'success', text: 'Game deleted successfully!' })
      await loadGames()
    } catch (error: any) {
      console.error('Error deleting game:', {
        message: error?.message || 'Unknown error',
        details: error?.details,
        hint: error?.hint,
        code: error?.code,
        stack: error?.stack,
        error: error
      })
      const errorMessage = error?.message || error?.details || 'Failed to delete game'
      setMessage({ type: 'error', text: `Error: ${errorMessage}` })
    }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handleImageChange = (index: number, value: string) => {
    const newImages = [...formData.images]
    newImages[index] = value
    setFormData(prev => ({
      ...prev,
      images: newImages
    }))
  }

  const addImageField = () => {
    setFormData(prev => ({
      ...prev,
      images: [...prev.images, ""]
    }))
  }

  const removeImageField = (index: number) => {
    const newImages = formData.images.filter((_, i) => i !== index)
    setFormData(prev => ({
      ...prev,
      images: newImages
    }))
  }

  const generateSlug = (title: string) => {
    return title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '')
  }

  const validateSlug = (slug: string) => {
    // Check if slug is valid format (lowercase, alphanumeric, hyphens only)
    const slugRegex = /^[a-z0-9]+(?:-[a-z0-9]+)*$/
    return slugRegex.test(slug) && slug.length > 0
  }

  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const title = e.target.value
    setFormData(prev => ({
      ...prev,
      title,
      slug: generateSlug(title)
    }))
  }

  const handleSlugChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const slug = e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, '')
    setFormData(prev => ({
      ...prev,
      slug
    }))
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSelectedFiles(e.target.files)
  }

  const handleCartridgeFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null
    setSelectedCartridgeFile(file)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    // Check if description has actual content (not just empty HTML tags)
    const descriptionText = formData.description.replace(/<[^>]*>/g, '').trim()
    
    // Check if at least one image is provided (either uploaded or URL)
    const hasImages = (selectedFiles && selectedFiles.length > 0) || formData.images.some(img => img.trim() !== '')
    
    if (!formData.title || !formData.slug || !formData.category || !formData.storage_path || !formData.source || !descriptionText || !formData.contract_address || !formData.opensea_url || !hasImages) {
      setMessage({ type: 'error', text: 'Please fill in all required fields including at least one image' })
      return
    }

    if (!validateSlug(formData.slug)) {
      setMessage({ 
        type: 'error', 
        text: 'Slug must contain only lowercase letters, numbers, and hyphens. It cannot start or end with a hyphen.' 
      })
      return
    }

    try {
      setUploading(true)
      
      let uploadResults: string[] = []
      
      // Upload files if selected
      if (selectedFiles && selectedFiles.length > 0) {
        const filesArray = Array.from(selectedFiles)
        const results = await uploadMultipleGameImages(filesArray, formData.slug)
        
        // Extract successful URLs
        uploadResults = results
          .filter(result => result.success && result.url)
          .map(result => result.url!)
      }
      
      // Upload cartridge file if selected
      let cartridgeUrl = formData.cartridge // Keep existing URL if no new file
      if (selectedCartridgeFile) {
        const cartridgeResult = await uploadGameImage(selectedCartridgeFile, formData.slug)
        if (cartridgeResult.success && cartridgeResult.url) {
          cartridgeUrl = cartridgeResult.url
        } else {
          setMessage({ type: 'error', text: `Failed to upload cartridge image: ${cartridgeResult.error}` })
          return
        }
      }
      
      // Combine uploaded images with manually entered URLs
      const allImages = [...uploadResults, ...formData.images.filter(img => img.trim() !== '')]
      
      const gameData = {
        title: formData.title,
        slug: formData.slug,
        description: formData.description,
        source: formData.source,
        category: formData.category,
        contract_address: formData.contract_address,
        opensea_url: formData.opensea_url,
        storage_path: formData.storage_path,
        cartridge: cartridgeUrl,
        images: allImages,
        is_active: true
      }

      // Get wallet address from session
      const walletAddress = session?.address

      if (!walletAddress) {
        setMessage({ type: 'error', text: 'Wallet address not found in session' })
        return
      }

      if (viewMode === 'edit' && editingGame) {
        // Update existing game
        await updateGame(editingGame.id, gameData, walletAddress, session?.supabaseAccessToken)
        setMessage({ type: 'success', text: 'Game updated successfully!' })
      } else {
        // Create new game
        const insertData: GameInsert = gameData
        await createGame(insertData, walletAddress, session?.supabaseAccessToken)
        setMessage({ type: 'success', text: 'Game created successfully!' })
      }

      resetForm()
      setViewMode('list')
      await loadGames()
    } catch (error: any) {
      // More robust error logging
      console.error('Error saving game - caught error:', error)
      console.error('Error type:', typeof error)
      console.error('Error constructor:', error?.constructor?.name)
      if (error instanceof Error) {
        console.error('Error message:', error.message)
        console.error('Error stack:', error.stack)
      }
      try {
        console.error('Error JSON:', JSON.stringify(error, null, 2))
      } catch (e) {
        console.error('Could not stringify error:', e)
      }
      
      // Check for duplicate slug error
      if (error?.message?.includes('duplicate key value violates unique constraint') && 
          error?.message?.includes('games_slug_key')) {
        setMessage({ 
          type: 'error', 
          text: `Slug "${formData.slug}" already exists! Please choose a different title or manually edit the slug.` 
        })
      } else if (error?.message?.includes('duplicate') && error?.message?.includes('slug')) {
        setMessage({ 
          type: 'error', 
          text: `Slug "${formData.slug}" already exists! Please choose a different title or manually edit the slug.` 
        })
      } else {
        // Show more detailed error message
        const errorMessage = error?.message || error?.details || 'Failed to save game. Please try again.'
        setMessage({ 
          type: 'error', 
          text: `Error: ${errorMessage}` 
        })
      }
    } finally {
      setUploading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Navigation */}
        <div className="flex space-x-4 mb-8">
          <button
            onClick={() => setViewMode('list')}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              viewMode === 'list' 
                ? adminButtonStyles.primary 
                : adminButtonStyles.outline
            }`}
          >
            Games List
          </button>
          <button
            onClick={() => {
              resetForm()
              setViewMode('create')
            }}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              viewMode === 'create' 
                ? adminButtonStyles.primary 
                : adminButtonStyles.outline
            }`}
          >
            Create Game
          </button>
        </div>

        {/* Message Display */}
        {message && (
          <div className={`p-4 rounded-lg mb-6 ${
            message.type === 'success' ? 'bg-green-900 text-green-100' : 'bg-red-900 text-red-100'
          }`}>
            {message.text}
          </div>
        )}

        {/* Content based on view mode */}
        {viewMode === 'list' && (
          <div>
            <h2 className="text-xl font-semibold mb-6">Games Management</h2>
            
            {loading ? (
              <div className="text-center py-8">Loading games...</div>
            ) : (
              <div className="space-y-8">
                {/* Active Games */}
                <div>
                  <h3 className="text-lg font-medium mb-4 text-green-400">Active Games ({activeGames.length})</h3>
                  <div className="grid gap-4">
                    {activeGames.map((game) => (
                      <div key={game.id} className="bg-gray-800 p-6 rounded-lg border border-gray-700">
                        <div className="flex justify-between items-start">
                          <div className="flex-1">
                            <h4 className="text-lg font-medium">{game.title}</h4>
                            <p className="text-gray-400 text-sm">Slug: {game.slug}</p>
                            <p className="text-gray-400 text-sm">Category: {GAME_CATEGORIES.find(cat => cat.slug === game.category)?.name || game.category}</p>
                            {game.contract_address && (
                              <p className="text-gray-400 text-sm font-mono">Contract: {game.contract_address}</p>
                            )}
                          </div>
                          <div className="flex space-x-2">
                            <button
                              onClick={() => handleEdit(game)}
                              className={`px-3 py-1 rounded text-sm font-medium transition-colors ${adminButtonStyles.secondary}`}
                            >
                              Edit
                            </button>
                            <button
                              onClick={() => handleDeactivate(game.id)}
                              className={`px-3 py-1 rounded text-sm font-medium transition-colors ${adminButtonStyles.warning}`}
                            >
                              Deactivate
                            </button>
                            <button
                              onClick={() => handleDelete(game.id)}
                              className={`px-3 py-1 rounded text-sm font-medium transition-colors ${adminButtonStyles.danger}`}
                            >
                              Delete
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Passive Games */}
                <div>
                  <h3 className="text-lg font-medium mb-4 text-gray-400">Inactive Games ({passiveGames.length})</h3>
                  <div className="grid gap-4">
                    {passiveGames.map((game) => (
                      <div key={game.id} className="bg-gray-800 p-6 rounded-lg border border-gray-700 opacity-60">
                        <div className="flex justify-between items-start">
                          <div className="flex-1">
                            <h4 className="text-lg font-medium">{game.title}</h4>
                            <p className="text-gray-400 text-sm">Slug: {game.slug}</p>
                            <p className="text-gray-400 text-sm">Category: {GAME_CATEGORIES.find(cat => cat.slug === game.category)?.name || game.category}</p>
                            {game.contract_address && (
                              <p className="text-gray-400 text-sm font-mono">Contract: {game.contract_address}</p>
                            )}
                          </div>
                          <div className="flex space-x-2">
                            <button
                              onClick={() => handleEdit(game)}
                              className={`px-3 py-1 rounded text-sm font-medium transition-colors ${adminButtonStyles.secondary}`}
                            >
                              Edit
                            </button>
                            <button
                              onClick={() => handleActivate(game.id)}
                              className={`px-3 py-1 rounded text-sm font-medium transition-colors ${adminButtonStyles.success}`}
                            >
                              Activate
                            </button>
                            <button
                              onClick={() => handleDelete(game.id)}
                              className={`px-3 py-1 rounded text-sm font-medium transition-colors ${adminButtonStyles.danger}`}
                            >
                              Delete
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {(viewMode === 'create' || viewMode === 'edit') && (
          <div>
            <h2 className="text-xl font-semibold mb-6">
              {viewMode === 'edit' ? 'Edit Game' : 'Create New Game'}
            </h2>
            
            <form onSubmit={handleSubmit} className="space-y-8">
              {/* Basic Information Section */}
              <div className="bg-gray-800 p-6 rounded-lg border border-gray-700">
                <h3 className="text-lg font-semibold text-blue-400 mb-4 flex items-center">
                  <span className="w-2 h-2 bg-blue-400 rounded-full mr-3"></span>
                  Basic Information
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium mb-2">Title *</label>
                    <input
                      type="text"
                      name="title"
                      value={formData.title}
                      onChange={handleTitleChange}
                      className="w-full p-3 bg-gray-900 border border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-white"
                      required
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium mb-2">Slug *</label>
                    <input
                      type="text"
                      name="slug"
                      value={formData.slug}
                      onChange={handleSlugChange}
                      className={`w-full p-3 bg-gray-900 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-white ${
                        formData.slug && !validateSlug(formData.slug) 
                          ? 'border-red-500' 
                          : 'border-gray-600'
                      }`}
                      required
                    />
                    <p className="text-xs text-gray-400 mt-1">
                      URL-friendly version of the title. Only lowercase letters, numbers, and hyphens allowed.
                    </p>
                    {formData.slug && !validateSlug(formData.slug) && (
                      <p className="text-xs text-red-400 mt-1">
                        Invalid slug format. Use only lowercase letters, numbers, and hyphens.
                      </p>
                    )}
                    {formData.slug && validateSlug(formData.slug) && (
                      <p className="text-xs text-green-400 mt-1">
                        ✓ Valid slug format
                      </p>
                    )}
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium mb-2">Category *</label>
                    <select
                      name="category"
                      value={formData.category}
                      onChange={handleInputChange}
                      className="w-full p-3 bg-gray-900 border border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-white"
                      required
                    >
                      {GAME_CATEGORIES.map((category) => (
                        <option key={category.slug} value={category.slug}>
                          {category.name}
                        </option>
                      ))}
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium mb-2">Short Description *</label>
                    <input
                      type="text"
                      name="source"
                      value={formData.source}
                      onChange={handleInputChange}
                      placeholder="Brief description or subtitle for the game"
                      className="w-full p-3 bg-gray-900 border border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-white"
                      required
                    />
                    <p className="text-xs text-gray-400 mt-1">
                      A short subtitle or tagline that appears under the game title
                    </p>
                  </div>
                </div>
                
                <div className="mt-6">
                  <label className="block text-sm font-medium mb-2">Description *</label>
                  <div className="bg-gray-900 border border-gray-600 rounded-lg">
                    <div className="flex items-center space-x-2 p-2 border-b border-gray-600">
                      <button
                        type="button"
                        onClick={() => editor?.chain().focus().toggleBold().run()}
                        className={`p-2 rounded transition-colors ${
                          editor?.isActive('bold') 
                            ? 'bg-blue-600 text-white' 
                            : 'hover:bg-gray-700 text-gray-300'
                        }`}
                      >
                        <BoldIcon className="w-4 h-4" />
                      </button>
                      <button
                        type="button"
                        onClick={() => editor?.chain().focus().toggleItalic().run()}
                        className={`p-2 rounded transition-colors ${
                          editor?.isActive('italic') 
                            ? 'bg-blue-600 text-white' 
                            : 'hover:bg-gray-700 text-gray-300'
                        }`}
                      >
                        <ItalicIcon className="w-4 h-4" />
                      </button>
                      <button
                        type="button"
                        onClick={() => editor?.chain().focus().toggleBulletList().run()}
                        className={`p-2 rounded transition-colors ${
                          editor?.isActive('bulletList') 
                            ? 'bg-blue-600 text-white' 
                            : 'hover:bg-gray-700 text-gray-300'
                        }`}
                      >
                        <List className="w-4 h-4" />
                      </button>
                    </div>
                    <EditorContent editor={editor} />
                  </div>
                </div>
              </div>

              {/* Blockchain & URLs Section */}
              <div className="bg-gray-800 p-6 rounded-lg border border-gray-700">
                <h3 className="text-lg font-semibold text-purple-400 mb-4 flex items-center">
                  <span className="w-2 h-2 bg-purple-400 rounded-full mr-3"></span>
                  Blockchain & URLs
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium mb-2">Contract Address *</label>
                    <input
                      type="text"
                      name="contract_address"
                      value={formData.contract_address}
                      onChange={handleInputChange}
                      placeholder="0x..."
                      className="w-full p-3 bg-gray-900 border border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-white"
                      required
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium mb-2">OpenSea URL *</label>
                    <input
                      type="url"
                      name="opensea_url"
                      value={formData.opensea_url}
                      onChange={handleInputChange}
                      placeholder="https://opensea.io/collection/..."
                      className="w-full p-3 bg-gray-900 border border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-white"
                      required
                    />
                  </div>
                  
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium mb-2">Game URL *</label>
                    <input
                      type="url"
                      name="storage_path"
                      value={formData.storage_path}
                      onChange={handleInputChange}
                      placeholder="https://example.com/game"
                      className="w-full p-3 bg-gray-900 border border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-white"
                      required
                    />
                    <p className="text-xs text-gray-400 mt-1">
                      The URL where the game can be played (opens when "Play Game" is clicked)
                    </p>
                  </div>
                </div>
              </div>

              {/* Cartridge Image Section */}
              <div className="bg-gray-800 p-6 rounded-lg border border-gray-700">
                <h3 className="text-lg font-semibold text-green-400 mb-4 flex items-center">
                  <span className="w-2 h-2 bg-green-400 rounded-full mr-3"></span>
                  Cartridge Image
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium mb-2">Cartridge Image URL</label>
                    <input
                      type="url"
                      name="cartridge"
                      value={formData.cartridge}
                      onChange={handleInputChange}
                      placeholder="https://example.com/cartridge.png"
                      className="w-full p-3 bg-gray-900 border border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-white"
                    />
                    <p className="text-xs text-gray-400 mt-1">
                      URL for the game cartridge image (transparent PNG recommended)
                    </p>
                    
                    {/* Preview cartridge URL */}
                    {formData.cartridge && (
                      <div className="mt-3">
                        <p className="text-xs text-gray-400 mb-2">URL Preview:</p>
                        <img
                          src={formData.cartridge}
                          alt="Cartridge preview"
                          className="w-20 h-28 object-contain bg-gray-700 rounded-lg border border-gray-600"
                          onError={(e) => {
                            e.currentTarget.style.display = 'none'
                          }}
                        />
                      </div>
                    )}
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium mb-2">Upload Cartridge Image</label>
                    <input
                      type="file"
                      id="cartridge-file"
                      accept="image/*"
                      onChange={handleCartridgeFileChange}
                      className="w-full p-3 bg-gray-900 border border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-white file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-green-600 file:text-white hover:file:bg-green-700"
                    />
                    <p className="text-xs text-gray-400 mt-1">
                      Upload a cartridge image file (will override URL above if provided)
                    </p>
                    {selectedCartridgeFile && (
                      <p className="text-xs text-green-400 mt-1">
                        ✓ Selected: {selectedCartridgeFile.name}
                      </p>
                    )}
                    
                    {/* Preview uploaded cartridge file */}
                    {selectedCartridgeFile && (
                      <div className="mt-3">
                        <p className="text-xs text-gray-400 mb-2">File Preview:</p>
                        <img
                          src={URL.createObjectURL(selectedCartridgeFile)}
                          alt="Cartridge file preview"
                          className="w-20 h-28 object-contain bg-gray-700 rounded-lg border border-gray-600"
                        />
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Game Images Section */}
              <div className="bg-gray-800 p-6 rounded-lg border border-gray-700">
                <h3 className="text-lg font-semibold text-orange-400 mb-4 flex items-center">
                  <span className="w-2 h-2 bg-orange-400 rounded-full mr-3"></span>
                  Game Images
                </h3>
                
                <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-medium mb-2">Upload Images *</label>
                    <input
                      type="file"
                      id="image-files"
                      multiple
                      accept="image/*"
                      onChange={handleFileChange}
                      className="w-full p-3 bg-gray-900 border border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-white file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-orange-600 file:text-white hover:file:bg-orange-700"
                    />
                    <p className="text-xs text-gray-400 mt-1">
                      Upload at least one image or provide image URLs below
                    </p>
                    
                    {/* Preview uploaded files */}
                    {selectedFiles && selectedFiles.length > 0 && (
                      <div className="mt-4">
                        <p className="text-sm font-medium text-gray-300 mb-3">Selected Files Preview:</p>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                          {Array.from(selectedFiles).map((file, index) => (
                            <div key={index} className="relative">
                              <img
                                src={URL.createObjectURL(file)}
                                alt={`Preview ${index + 1}`}
                                className="w-full h-24 object-cover rounded-lg border border-gray-600"
                              />
                              <p className="text-xs text-gray-400 mt-1 truncate">{file.name}</p>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                  
                  <div>
                    <div className="flex justify-between items-center mb-3">
                      <label className="block text-sm font-medium">Image URLs *</label>
                      <button 
                        type="button" 
                        onClick={addImageField} 
                        className={`px-3 py-1 rounded text-sm font-medium transition-colors ${adminButtonStyles.secondary}`}
                      >
                        Add Image URL
                      </button>
                    </div>
                    <p className="text-xs text-gray-400 mb-3">
                      Provide at least one image URL if no files are uploaded above
                    </p>
                    {formData.images.map((image, index) => (
                      <div key={index} className="space-y-2 mb-4 p-3 bg-gray-900 rounded-lg border border-gray-600">
                        <div className="flex space-x-2">
                          <input
                            type="url"
                            value={image}
                            onChange={(e) => handleImageChange(index, e.target.value)}
                            placeholder="Image URL"
                            className="flex-1 p-3 bg-gray-800 border border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-white"
                          />
                          <button
                            type="button"
                            onClick={() => removeImageField(index)}
                            className={`px-3 py-1 rounded text-sm font-medium transition-colors ${adminButtonStyles.danger}`}
                          >
                            Remove
                          </button>
                        </div>
                        
                        {/* Preview URL image */}
                        {image && (
                          <div className="ml-2">
                            <p className="text-xs text-gray-400 mb-1">Preview:</p>
                            <img
                              src={image}
                              alt={`URL Preview ${index + 1}`}
                              className="w-32 h-20 object-cover rounded-lg border border-gray-600 bg-gray-700"
                              onError={(e) => {
                                e.currentTarget.style.display = 'none'
                              }}
                            />
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
              
              {/* Action Buttons */}
              <div className="flex space-x-4 pt-4">
                <button
                  type="submit"
                  disabled={uploading}
                  className={`px-6 py-3 rounded-lg font-medium transition-colors ${
                    uploading 
                      ? 'bg-gray-600 text-gray-300 cursor-not-allowed' 
                      : adminButtonStyles.primary
                  }`}
                >
                  {uploading ? 'Saving...' : (viewMode === 'edit' ? 'Update Game' : 'Create Game')}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    resetForm()
                    setViewMode('list')
                  }}
                  className={`px-6 py-3 rounded-lg font-medium transition-colors ${adminButtonStyles.outline}`}
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        )}
      </div>
    </div>
  )
}

// Main exported component with wallet guard
export default function AdminPage() {
  return (
    <WalletGuard>
      <AdminPanel />
    </WalletGuard>
  )
} 