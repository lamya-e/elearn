import { Link } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { useCourses } from '../../hooks/useCourses'
import { supabase } from '../../lib/supabaseClient'
import { Plus, BookOpen, Pencil, Trash2 } from 'lucide-react'
import toast from 'react-hot-toast'

export default function TeacherDashboard() {
  const { profile } = useAuth()
  const { courses, loading, refetch } = useCourses(profile?.user_id)

  async function handleDelete(courseId, courseTitle) {
    const confirmed = window.confirm(`Supprimer "${courseTitle}" ? Cette action est irréversible.`)
    if (!confirmed) return

    try {
      // Supprimer les leçons, enrollments, progress, comments liés
      await supabase.from('progress').delete().eq('course_id', courseId)
      await supabase.from('enrollments').delete().eq('course_id', courseId)
      const { data: lessons } = await supabase.from('lessons').select('id').eq('course_id', courseId)
      if (lessons?.length) {
        const lessonIds = lessons.map(l => l.id)
        await supabase.from('comments').delete().in('lesson_id', lessonIds)
      }
      await supabase.from('lessons').delete().eq('course_id', courseId)
      await supabase.from('courses').delete().eq('id', courseId)

      toast.success('Cours supprimé !')
      refetch()
    } catch (err) {
      toast.error('Erreur lors de la suppression : ' + err.message)
    }
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-10">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold">Tableau de bord</h1>
          <p className="text-gray-500 mt-1">Bonjour, {profile?.full_name} 👋</p>
        </div>
        <Link to="/teacher/courses/new" className="btn-primary flex items-center gap-2">
          <Plus size={18} />
          Nouveau cours
        </Link>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-10">
        <div className="card p-5 flex items-center gap-4">
          <div className="w-12 h-12 bg-primary-100 rounded-xl flex items-center justify-center">
            <BookOpen className="text-primary-600" size={24} />
          </div>
          <div>
            <p className="text-2xl font-bold">{courses.length}</p>
            <p className="text-sm text-gray-500">Cours publiés</p>
          </div>
        </div>
      </div>

      <h2 className="text-xl font-semibold mb-4">Mes cours</h2>

      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="card animate-pulse">
              <div className="aspect-video bg-gray-200" />
              <div className="p-4 space-y-2"><div className="h-4 bg-gray-200 rounded w-3/4" /></div>
            </div>
          ))}
        </div>
      ) : courses.length === 0 ? (
        <div className="text-center py-16 border-2 border-dashed border-gray-300 rounded-xl">
          <BookOpen size={40} className="mx-auto mb-3 text-gray-300" />
          <p className="text-gray-500 mb-4">Vous n'avez pas encore de cours</p>
          <Link to="/teacher/courses/new" className="btn-primary">Créer mon premier cours</Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
          {courses.map(course => (
            <div key={course.id} className="card group overflow-hidden">
              {/* Thumbnail */}
              <div className="aspect-video bg-gradient-to-br from-primary-100 to-primary-200 relative overflow-hidden">
                {course.thumbnail_url ? (
                  <img src={course.thumbnail_url} alt={course.title} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <BookOpen size={40} className="text-primary-400" />
                  </div>
                )}
                {course.category && (
                  <span className="absolute top-2 left-2 bg-primary-600 text-white text-xs px-2 py-1 rounded-full">
                    {course.category}
                  </span>
                )}
              </div>

              {/* Content */}
              <div className="p-4">
                <h3 className="font-semibold text-gray-900 line-clamp-2 mb-1">{course.title}</h3>
                <p className="text-sm text-gray-500 line-clamp-2 mb-4">{course.description}</p>

                {/* Actions */}
                <div className="flex gap-2">
                  <Link
                    to={`/teacher/courses/${course.id}/edit`}
                    className="flex-1 flex items-center justify-center gap-2 py-2 px-3 rounded-lg border border-gray-200 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
                  >
                    <Pencil size={14} />
                    Modifier
                  </Link>
                  <button
                    onClick={() => handleDelete(course.id, course.title)}
                    className="flex items-center justify-center gap-2 py-2 px-3 rounded-lg border border-red-200 text-sm font-medium text-red-600 hover:bg-red-50 transition-colors"
                  >
                    <Trash2 size={14} />
                    Supprimer
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}