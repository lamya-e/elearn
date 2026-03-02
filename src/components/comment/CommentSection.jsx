import { useState } from 'react'
import { useComments } from '../../hooks/useComments'
import { useAuth } from '../../context/AuthContext'
import { Send, User } from 'lucide-react'
import toast from 'react-hot-toast'

export default function CommentSection({ lessonId }) {
  const { comments, loading, addComment } = useComments(lessonId)
  const { user, profile } = useAuth()
  const [text, setText] = useState('')
  const [submitting, setSubmitting] = useState(false)

  async function handleSubmit(e) {
    e.preventDefault()
    if (!text.trim() || !user) return
    setSubmitting(true)
    try {
      await addComment(user.id, text.trim())
      setText('')
    } catch {
      toast.error('Erreur lors de l\'envoi du commentaire')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="mt-8">
      <h3 className="text-lg font-semibold mb-4">Commentaires ({comments.length})</h3>

      {user && (
        <form onSubmit={handleSubmit} className="flex gap-3 mb-6">
          <div className="w-9 h-9 rounded-full bg-primary-100 flex items-center justify-center shrink-0">
            <User size={16} className="text-primary-600" />
          </div>
          <div className="flex-1 flex gap-2">
            <input
              value={text}
              onChange={e => setText(e.target.value)}
              placeholder="Ajouter un commentaire..."
              className="input text-sm"
            />
            <button type="submit" disabled={submitting || !text.trim()} className="btn-primary px-3">
              <Send size={16} />
            </button>
          </div>
        </form>
      )}

      {loading ? (
        <p className="text-gray-400 text-sm">Chargement...</p>
      ) : comments.length === 0 ? (
        <p className="text-gray-400 text-sm">Aucun commentaire. Soyez le premier !</p>
      ) : (
        <div className="space-y-4">
          {comments.map(comment => (
            <div key={comment.id} className="flex gap-3">
              <div className="w-9 h-9 rounded-full bg-gray-100 flex items-center justify-center shrink-0">
                {comment.profiles?.avatar_url ? (
                  <img src={comment.profiles.avatar_url} alt="" className="w-full h-full rounded-full object-cover" />
                ) : (
                  <User size={16} className="text-gray-400" />
                )}
              </div>
              <div className="flex-1 bg-gray-50 rounded-lg px-4 py-3">
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-medium text-sm">{comment.profiles?.full_name || 'Utilisateur'}</span>
                  <span className="text-xs text-gray-400">
                    {new Date(comment.created_at).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', year: 'numeric' })}
                  </span>
                </div>
                <p className="text-sm text-gray-700">{comment.content}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
