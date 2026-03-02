import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabaseClient'

export function useComments(lessonId) {
  const [comments, setComments] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!lessonId) return

    fetchComments()

    // Realtime
    const channel = supabase
      .channel(`comments-${lessonId}`)
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'comments',
        filter: `lesson_id=eq.${lessonId}`,
      }, async (payload) => {
        console.log('Realtime reçu:', payload)
        // Récupérer le commentaire complet avec le profil
        const { data } = await supabase
          .from('comments')
          .select('*')
          .eq('id', payload.new.id)
          .single()

        if (data) {
          // Récupérer le profil séparément
          const { data: profile } = await supabase
            .from('profiles')
            .select('user_id, full_name, avatar_url')
            .eq('user_id', data.user_id)
            .single()

          setComments(prev => {
            // Éviter les doublons
            if (prev.find(c => c.id === data.id)) return prev
            return [...prev, { ...data, profiles: profile || null }]
          })
        }
      })
      .subscribe((status) => {
        console.log('Realtime status:', status)
      })

    return () => supabase.removeChannel(channel)
  }, [lessonId])

  async function fetchComments() {
    setLoading(true)
    try {
      const { data: commentsData, error } = await supabase
        .from('comments')
        .select('*')
        .eq('lesson_id', lessonId)
        .order('created_at', { ascending: true })

      if (error) throw error

      // Récupérer les profils séparément
      if (commentsData && commentsData.length > 0) {
        const userIds = [...new Set(commentsData.map(c => c.user_id))]
        const { data: profilesData } = await supabase
          .from('profiles')
          .select('user_id, full_name, avatar_url')
          .in('user_id', userIds)

        const profilesMap = {}
        profilesData?.forEach(p => { profilesMap[p.user_id] = p })

        setComments(commentsData.map(c => ({
          ...c,
          profiles: profilesMap[c.user_id] || null
        })))
      } else {
        setComments(commentsData || [])
      }
    } catch (err) {
      console.error('fetchComments error:', err)
    } finally {
      setLoading(false)
    }
  }

  async function addComment(userId, content) {
    const { data, error } = await supabase
      .from('comments')
      .insert({ lesson_id: lessonId, user_id: userId, content })
      .select()
      .single()

    if (error) throw error

    // Si le Realtime ne fonctionne pas, on ajoute manuellement
    // Le Realtime va dédupliquer via le check sur l'id
    if (data) {
      const { data: profile } = await supabase
        .from('profiles')
        .select('user_id, full_name, avatar_url')
        .eq('user_id', userId)
        .single()

      setComments(prev => {
        if (prev.find(c => c.id === data.id)) return prev
        return [...prev, { ...data, profiles: profile || null }]
      })
    }

    return data
  }

  return { comments, loading, addComment }
}