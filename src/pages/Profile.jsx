import { useState } from 'react'
import { useAuth } from '../context/AuthContext'
import { supabase } from '../lib/supabaseClient'
import toast from 'react-hot-toast'
import { User, Upload } from 'lucide-react'

export default function Profile() {
  const { user, profile } = useAuth()
  const [form, setForm] = useState({ full_name: profile?.full_name || '' })
  const [avatar, setAvatar] = useState(null)
  const [saving, setSaving] = useState(false)

  async function handleSave(e) {
    e.preventDefault()
    setSaving(true)
    try {
      let avatarUrl = profile?.avatar_url
      if (avatar) {
        const ext = avatar.name.split('.').pop()
        const path = `avatars/${user.id}.${ext}`
        await supabase.storage.from('avatars').upload(path, avatar, { upsert: true })
        const { data } = supabase.storage.from('avatars').getPublicUrl(path)
        avatarUrl = data.publicUrl
      }
      await supabase.from('profiles').update({ full_name: form.full_name, avatar_url: avatarUrl }).eq('user_id', user.id)
      toast.success('Profil mis à jour !')
    } catch (err) {
      toast.error(err.message)
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="max-w-xl mx-auto px-4 py-10">
      <h1 className="text-2xl font-bold mb-8">Mon profil</h1>
      <div className="card p-6">
        <div className="flex items-center gap-4 mb-6">
          <div className="w-16 h-16 rounded-full bg-primary-100 flex items-center justify-center overflow-hidden">
            {profile?.avatar_url ? (
              <img src={profile.avatar_url} alt="" className="w-full h-full object-cover" />
            ) : (
              <User size={28} className="text-primary-600" />
            )}
          </div>
          <div>
            <p className="font-semibold text-lg">{profile?.full_name}</p>
            <p className="text-sm text-gray-500 capitalize">{profile?.role}</p>
            <p className="text-sm text-gray-400">{user?.email}</p>
          </div>
        </div>

        <form onSubmit={handleSave} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Nom complet</label>
            <input value={form.full_name} onChange={e => setForm(f => ({ ...f, full_name: e.target.value }))}
              className="input" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Photo de profil</label>
            <label className="flex items-center gap-2 cursor-pointer w-fit px-4 py-2 border border-dashed border-gray-300 rounded-lg hover:bg-gray-50 text-sm text-gray-600">
              <Upload size={16} />
              {avatar ? avatar.name : 'Changer la photo'}
              <input type="file" accept="image/*" className="hidden" onChange={e => setAvatar(e.target.files[0])} />
            </label>
          </div>
          <button type="submit" disabled={saving} className="btn-primary">
            {saving ? 'Enregistrement...' : 'Sauvegarder'}
          </button>
        </form>
      </div>
    </div>
  )
}
