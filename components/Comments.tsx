"use client"

import { useState, useEffect } from 'react'
import { useAccount } from 'wagmi'
import { useSession } from 'next-auth/react'
import { ConnectButton } from '@rainbow-me/rainbowkit'
import { 
  getGameComments, 
  createComment, 
  updateComment, 
  deleteComment,
  getGameCommentCount 
} from '@/lib/supabase/comments'
import { getUserInfo } from '@/lib/utils/ens'
import { Comment } from '@/lib/supabase/types'
import { MessageCircle, Edit2, Trash2, Send, X, User } from 'lucide-react'

interface CommentsProps {
  gameId: string
}

interface CommentWithUser extends Comment {
  userInfo?: {
    displayName: string
    avatar?: string
    isENS: boolean
  }
}

export default function Comments({ gameId }: CommentsProps) {
  const { address, isConnected } = useAccount()
  const { data: session } = useSession()
  
  const [comments, setComments] = useState<CommentWithUser[]>([])
  const [commentCount, setCommentCount] = useState(0)
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [newComment, setNewComment] = useState('')
  const [editingComment, setEditingComment] = useState<string | null>(null)
  const [editContent, setEditContent] = useState('')
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null)

  // Load comments on component mount
  useEffect(() => {
    loadComments()
    loadCommentCount()
  }, [gameId])

  const loadComments = async () => {
    try {
      setLoading(true)
      const commentsData = await getGameComments(gameId)
      
      // Fetch user info for each comment
      const commentsWithUserInfo = await Promise.all(
        commentsData.map(async (comment) => {
          const userInfo = await getUserInfo(comment.wallet_address)
          return {
            ...comment,
            userInfo
          }
        })
      )
      
      setComments(commentsWithUserInfo)
    } catch (error) {
      console.error('Error loading comments:', error)
      setMessage({ type: 'error', text: 'Failed to load comments' })
    } finally {
      setLoading(false)
    }
  }

  const loadCommentCount = async () => {
    try {
      const count = await getGameCommentCount(gameId)
      setCommentCount(count)
    } catch (error) {
      console.error('Error loading comment count:', error)
    }
  }

  const handleSubmitComment = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!session?.address) {
      setMessage({ type: 'error', text: 'Please connect your wallet and sign in' })
      return
    }

    if (!newComment.trim()) {
      setMessage({ type: 'error', text: 'Please enter a comment' })
      return
    }

    try {
      setSubmitting(true)
      const result = await createComment(gameId, newComment.trim(), session.address)
      
      if (result.success) {
        setNewComment('')
        setMessage({ type: 'success', text: 'Comment posted successfully!' })
        await loadComments()
        await loadCommentCount()
      } else {
        setMessage({ type: 'error', text: result.error || 'Failed to post comment' })
      }
    } catch (error) {
      console.error('Error submitting comment:', error)
      setMessage({ type: 'error', text: 'Failed to post comment' })
    } finally {
      setSubmitting(false)
    }
  }

  const handleEditComment = async (commentId: string) => {
    if (!session?.address) return

    if (!editContent.trim()) {
      setMessage({ type: 'error', text: 'Please enter a comment' })
      return
    }

    try {
      const result = await updateComment(commentId, editContent.trim(), session.address)
      
      if (result.success) {
        setEditingComment(null)
        setEditContent('')
        setMessage({ type: 'success', text: 'Comment updated successfully!' })
        await loadComments()
      } else {
        setMessage({ type: 'error', text: result.error || 'Failed to update comment' })
      }
    } catch (error) {
      console.error('Error updating comment:', error)
      setMessage({ type: 'error', text: 'Failed to update comment' })
    }
  }

  const handleDeleteComment = async (commentId: string) => {
    if (!session?.address) return

    if (!confirm('Are you sure you want to delete this comment?')) return

    try {
      const result = await deleteComment(commentId, session.address)
      
      if (result.success) {
        setMessage({ type: 'success', text: 'Comment deleted successfully!' })
        await loadComments()
        await loadCommentCount()
      } else {
        setMessage({ type: 'error', text: result.error || 'Failed to delete comment' })
      }
    } catch (error) {
      console.error('Error deleting comment:', error)
      setMessage({ type: 'error', text: 'Failed to delete comment' })
    }
  }

  const startEditing = (comment: CommentWithUser) => {
    setEditingComment(comment.id)
    setEditContent(comment.content)
    setMessage(null)
  }

  const cancelEditing = () => {
    setEditingComment(null)
    setEditContent('')
    setMessage(null)
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const isAuthenticated = isConnected && session?.address
  const canComment = isAuthenticated

  return (
    <div className="bg-card-custom rounded-[24px] p-8">
      <div className="flex items-center gap-2 mb-6">
        <MessageCircle className="w-6 h-6 text-blue-600" />
        <h3 className="text-xl font-semibold text-gray-900">
          Comments ({commentCount})
        </h3>
      </div>

      {/* Message Display */}
      {message && (
        <div className={`p-3 rounded-[16px] mb-4 text-sm ${
          message.type === 'success' 
            ? 'bg-green-50 text-green-700 border border-green-200' 
            : 'bg-red-50 text-red-700 border border-red-200'
        }`}>
          {message.text}
        </div>
      )}

      {/* Comment Form */}
      {canComment ? (
        <form onSubmit={handleSubmitComment} className="mb-6">
          <div className="space-y-3">
            <textarea
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              placeholder="Share your thoughts about this game..."
              className="w-full p-4 bg-gray-50 border border-gray-200 rounded-[16px] text-gray-900 placeholder-gray-500 resize-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
              rows={3}
              maxLength={1000}
              disabled={submitting}
            />
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-500">
                {newComment.length}/1000 characters
              </span>
              <button
                type="submit"
                disabled={submitting || !newComment.trim()}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed text-white rounded-[12px] font-medium transition-colors"
              >
                <Send className="w-4 h-4" />
                {submitting ? 'Posting...' : 'Post Comment'}
              </button>
            </div>
          </div>
        </form>
      ) : (
        <div className="mb-6 p-4 bg-gray-50 rounded-[16px] border border-gray-200">
          <p className="text-gray-600 mb-3">Connect your wallet to join the conversation</p>
          <ConnectButton />
        </div>
      )}

      {/* Comments List */}
      <div className="space-y-4 max-h-96 overflow-y-auto">
        {loading ? (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto"></div>
            <p className="text-gray-500 mt-2">Loading comments...</p>
          </div>
        ) : comments.length === 0 ? (
          <div className="text-center py-8">
            <MessageCircle className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500">No comments yet. Be the first to share your thoughts!</p>
          </div>
        ) : (
          comments.map((comment) => (
            <div key={comment.id} className="bg-gray-50 rounded-[16px] p-4 border border-gray-200">
              {/* Comment Header */}
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-3">
                  {/* User Avatar */}
                  <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center overflow-hidden">
                    {comment.userInfo?.avatar ? (
                      <img 
                        src={comment.userInfo.avatar} 
                        alt={comment.userInfo.displayName}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <User className="w-4 h-4 text-gray-400" />
                    )}
                  </div>
                  
                  {/* User Info */}
                  <div>
                    <div className="flex items-center gap-2">
                      <span className={`font-medium ${
                        comment.userInfo?.isENS ? 'text-blue-600' : 'text-gray-700'
                      }`}>
                        {comment.userInfo?.displayName || 'Unknown User'}
                      </span>
                      {comment.is_edited && (
                        <span className="text-xs text-gray-400">(edited)</span>
                      )}
                    </div>
                    <span className="text-xs text-gray-500">
                      {formatDate(comment.created_at!)}
                    </span>
                  </div>
                </div>

                {/* Action Buttons */}
                {session?.address?.toLowerCase() === comment.wallet_address.toLowerCase() && (
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => startEditing(comment)}
                      className="p-1 text-gray-400 hover:text-blue-600 transition-colors"
                      title="Edit comment"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDeleteComment(comment.id)}
                      className="p-1 text-gray-400 hover:text-red-600 transition-colors"
                      title="Delete comment"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                )}
              </div>

              {/* Comment Content */}
              {editingComment === comment.id ? (
                <div className="space-y-3">
                  <textarea
                    value={editContent}
                    onChange={(e) => setEditContent(e.target.value)}
                    className="w-full p-3 bg-white border border-gray-200 rounded-[12px] text-gray-900 resize-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    rows={3}
                    maxLength={1000}
                  />
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-500">
                      {editContent.length}/1000 characters
                    </span>
                    <div className="flex gap-2">
                      <button
                        onClick={cancelEditing}
                        className="px-3 py-1 text-gray-500 hover:text-gray-700 transition-colors"
                      >
                        <X className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleEditComment(comment.id)}
                        disabled={!editContent.trim()}
                        className="px-3 py-1 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 text-white rounded-[8px] transition-colors"
                      >
                        Save
                      </button>
                    </div>
                  </div>
                </div>
              ) : (
                <p className="text-gray-700 whitespace-pre-wrap">{comment.content}</p>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  )
} 