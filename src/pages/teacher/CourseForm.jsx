import { useState, useEffect, useRef } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { supabase } from '../../lib/supabaseClient'
import { useAuth } from '../../context/AuthContext'
import toast from 'react-hot-toast'
import { Upload, Trash2, GripVertical, Plus, Video, FileText } from 'lucide-react'

const CATEGORIES = ['Développement', 'Design', 'Marketing', 'Langues', 'Sciences', 'Art', 'Business']

export default function CourseForm() {
  const { id } = useParams()
  const isEditing = !!id
  const navigate = useNavigate()
  const { profile } = useAuth()

  const [form, setForm] = useState({ title: '', description: '', category: '' })
  const [thumbnail, setThumbnail] = useState(null)
  const [thumbnailUrl, setThumbnailUrl] = useState('')
  const [lessons, setLessons] = useState([])
  const [lessonTitle, setLessonTitle] = useState('')
  const [lessonDescription, setLessonDescription] = useState('')
  const [lessonType, setLessonType] = useState('video')
  const [lessonFile, setLessonFile] = useState(null)
  const [saving, setSaving] = useState(false)
  const [uploadingLesson, setUploadingLesson] = useState(false)
  const fileInputRef = useRef(null)

  useEffect(() => {
    if (!isEditing) return
    async function load() {
      const [{ data: course }, { data: lsns }] = await Promise.all([
        supabase.from('courses').select('*').eq('id', id).single(),
        supabase.from('lessons').select('*').eq('course_id', id).order('order'),
      ])
      if (course) {
        setForm({ title: course.title, description: course.description || '', category: course.category || '' })
        setThumbnailUrl(course.thumbnail_url || '')
      }
      if (lsns) setLessons(lsns)
    }
    load()
  }, [id, isEditing])

  async function handleSaveCourse(e) {
    e.preventDefault()
    setSaving(true)
    try {
      let tUrl = thumbnailUrl
      if (thumbnail) {
        const ext = thumbnail.name.split('.').pop()
        const path = `thumbnails/${Date.now()}.${ext}`
        const { error: upErr } = await supabase.storage.from('course-thumbnails').upload(path, thumbnail)
        if (upErr) throw upErr
        const { data } = supabase.storage.from('course-thumbnails').getPublicUrl(path)
        tUrl = data.publicUrl
      }
      if (isEditing) {
        await supabase.from('courses').update({ ...form, thumbnail_url: tUrl }).eq('id', id)
        toast.success('Cours mis à jour !')
      } else {
        const { data } = await supabase.from('courses').insert({
          ...form,
          thumbnail_url: tUrl,
          teacher_id: profile.user_id,
        }).select().single()
        toast.success('Cours créé ! Ajoutez maintenant des leçons.')
        navigate(`/teacher/courses/${data.id}/edit`)
      }
    } catch (err) {
      toast.error(err.message)
    } finally {
      setSaving(false)
    }
  }

  async function handleAddLesson() {
    if (!lessonTitle.trim()) { toast.error('Le titre est requis'); return }
    if (!lessonFile) { toast.error('Veuillez sélectionner un fichier'); return }

    setUploadingLesson(true)
    try {
      const ext = lessonFile.name.split('.').pop()
      const path = `lessons/${id}/${Date.now()}.${ext}`
      const { error: uploadError } = await supabase.storage.from('lesson-files').upload(path, lessonFile)
      if (uploadError) throw uploadError

      const { data: urlData } = supabase.storage.from('lesson-files').getPublicUrl(path)

      const { data: lesson, error: insertError } = await supabase.from('lessons').insert({
        course_id: id,
        title: lessonTitle.trim(),
        description: lessonDescription.trim(),
        type: lessonType,
        file_url: urlData.publicUrl,
        order: lessons.length + 1,
      }).select().single()

      if (insertError) throw insertError

      setLessons(prev => [...prev, lesson])
      setLessonTitle('')
      setLessonDescription('')
      setLessonType('video')
      setLessonFile(null)
      if (fileInputRef.current) fileInputRef.current.value = ''
      toast.success('Leçon ajoutée !')
    } catch (err) {
      console.error('Erreur ajout leçon:', err)
      toast.error(err.message)
    } finally {
      setUploadingLesson(false)
    }
  }

  async function deleteLesson(lessonId) {
    await supabase.from('lessons').delete().eq('id', lessonId)
    setLessons(prev => prev.filter(l => l.id !== lessonId))
    toast.success('Leçon supprimée')
  }

  return (
    <div className="max-w-3xl mx-auto px-4 py-10">
      <h1 className="text-2xl font-bold mb-8">{isEditing ? 'Modifier le cours' : 'Créer un cours'}</h1>

      <div className="card p-6 mb-8">
        <h2 className="text-lg font-semibold mb-4">Informations générales</h2>
        <form onSubmit={handleSaveCourse} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Titre du cours *</label>
            <input value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
              required className="input" placeholder="Ex: Introduction à React" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
            <textarea rows={3} value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
              className="input resize-none" placeholder="Décrivez votre cours..." />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Catégorie</label>
            <select value={form.category} onChange={e => setForm(f => ({ ...f, category: e.target.value }))} className="input">
              <option value="">Sélectionner...</option>
              {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Image de couverture</label>
            {thumbnailUrl && <img src={thumbnailUrl} alt="" className="w-32 h-20 object-cover rounded-lg mb-2" />}
            <label className="flex items-center gap-2 cursor-pointer w-fit px-4 py-2 border border-dashed border-gray-300 rounded-lg hover:bg-gray-50 text-sm text-gray-600">
              <Upload size={16} />
              {thumbnail ? thumbnail.name : 'Choisir une image'}
              <input type="file" accept="image/*" className="hidden" onChange={e => setThumbnail(e.target.files[0])} />
            </label>
          </div>
          <button type="submit" disabled={saving} className="btn-primary">
            {saving ? 'Enregistrement...' : isEditing ? 'Mettre à jour' : 'Créer le cours'}
          </button>
        </form>
      </div>

      {/* Leçons — EN DEHORS du <form> */}
      {isEditing && (
        <div className="card p-6">
          <h2 className="text-lg font-semibold mb-4">Leçons ({lessons.length})</h2>

          {lessons.length > 0 && (
            <div className="space-y-2 mb-6">
              {lessons.map((lesson, i) => (
                <div key={lesson.id} className="flex items-center gap-3 p-3 border border-gray-200 rounded-lg bg-gray-50">
                  <GripVertical size={16} className="text-gray-300" />
                  <span className="text-sm text-gray-400 w-5">{i + 1}</span>
                  {lesson.type === 'video' ? <Video size={16} className="text-primary-500" /> : <FileText size={16} className="text-primary-500" />}
                  <div className="flex-1">
                    <p className="text-sm font-medium">{lesson.title}</p>
                    <p className="text-xs text-gray-400 capitalize">{lesson.type}</p>
                  </div>
                  <button onClick={() => deleteLesson(lesson.id)} className="text-red-400 hover:text-red-600">
                    <Trash2 size={16} />
                  </button>
                </div>
              ))}
            </div>
          )}

          <div className="border-t pt-5 space-y-3">
            <h3 className="font-medium text-sm text-gray-700">Ajouter une leçon</h3>
            <div className="grid grid-cols-2 gap-3">
              <input value={lessonTitle} onChange={e => setLessonTitle(e.target.value)}
                placeholder="Titre de la leçon *" className="input text-sm" />
              <select value={lessonType} onChange={e => { setLessonType(e.target.value); setLessonFile(null); if (fileInputRef.current) fileInputRef.current.value = '' }} className="input text-sm">
                <option value="video">Vidéo</option>
                <option value="pdf">PDF</option>
              </select>
            </div>
            <input value={lessonDescription} onChange={e => setLessonDescription(e.target.value)}
              placeholder="Description (optionnel)" className="input text-sm" />
            <div>
              <label className="flex items-center gap-2 cursor-pointer w-fit px-4 py-2 border border-dashed border-gray-300 rounded-lg hover:bg-gray-50 text-sm text-gray-600">
                <Upload size={16} />
                {lessonFile ? lessonFile.name : `Choisir un fichier ${lessonType === 'video' ? 'vidéo' : 'PDF'} *`}
                <input
                  ref={fileInputRef}
                  type="file"
                  accept={lessonType === 'video' ? 'video/*' : 'application/pdf'}
                  className="hidden"
                  onChange={e => { const f = e.target.files?.[0]; if (f) setLessonFile(f) }}
                />
              </label>
              {lessonFile && (
                <p className="text-xs text-green-600 mt-1">
                  ✓ {lessonFile.name} ({(lessonFile.size / 1024 / 1024).toFixed(1)} MB)
                </p>
              )}
            </div>
            <button type="button" onClick={handleAddLesson} disabled={uploadingLesson} className="btn-primary flex items-center gap-2 text-sm">
              <Plus size={16} />
              {uploadingLesson ? 'Upload en cours...' : 'Ajouter la leçon'}
            </button>
          </div>
        </div>
      )}
    </div>
  )
}