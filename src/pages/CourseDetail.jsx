import { useParams, Link } from 'react-router-dom'
import { useCourse } from '../hooks/useCourses'
import { useEnrollment, useProgress } from '../hooks/useProgress'
import { useAuth } from '../context/AuthContext'
import ProgressBar from '../components/ui/ProgressBar'
import { BookOpen, CheckCircle, PlayCircle, FileText, User } from 'lucide-react'
import toast from 'react-hot-toast'

export default function CourseDetail() {
  const { id } = useParams()
  const { course, lessons, loading } = useCourse(id)
  const { user, profile } = useAuth()
  const { enrolled, enroll } = useEnrollment(user?.id, id)
  const { isCompleted, progress } = useProgress(user?.id, id)

  async function handleEnroll() {
    if (!user) return toast.error('Connectez-vous pour vous inscrire')
    await enroll()
    toast.success('Inscription réussie !')
  }

  if (loading) return (
    <div className="flex justify-center py-20">
      <div className="w-8 h-8 border-4 border-primary-500 border-t-transparent rounded-full animate-spin" />
    </div>
  )

  if (!course) return <div className="text-center py-20 text-gray-500">Cours introuvable</div>

  const completedCount = lessons.filter(l => isCompleted(l.id)).length

  return (
    <div className="max-w-5xl mx-auto px-4 py-10">
      <div className="grid md:grid-cols-3 gap-8">
        {/* Main */}
        <div className="md:col-span-2">
          <div className="aspect-video rounded-xl overflow-hidden bg-gradient-to-br from-primary-100 to-primary-200 mb-6">
            {course.thumbnail_url ? (
              <img src={course.thumbnail_url} alt={course.title} className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <BookOpen size={64} className="text-primary-400" />
              </div>
            )}
          </div>

          <span className="text-xs bg-primary-100 text-primary-700 px-2 py-1 rounded-full font-medium">
            {course.category}
          </span>
          <h1 className="text-3xl font-bold mt-3 mb-3">{course.title}</h1>
          <div className="flex items-center gap-2 text-sm text-gray-500 mb-4">
            <User size={14} />
            <span>Par <strong>{course.profiles?.full_name}</strong></span>
          </div>
          <p className="text-gray-600 leading-relaxed">{course.description}</p>

          {/* Lessons list */}
          <div className="mt-8">
            <h2 className="text-xl font-semibold mb-4">Contenu du cours ({lessons.length} leçons)</h2>
            <div className="space-y-2">
              {lessons.map((lesson, i) => {
                const done = isCompleted(lesson.id)
                const canAccess = enrolled || profile?.role === 'teacher'
                return (
                  <div key={lesson.id} className={`flex items-center gap-3 p-3 rounded-lg border ${done ? 'border-green-100 bg-green-50' : 'border-gray-200 bg-white'}`}>
                    <span className="text-sm font-medium text-gray-400 w-6 text-center">{i + 1}</span>
                    {lesson.type === 'video' ? (
                      <PlayCircle size={18} className={done ? 'text-green-500' : 'text-primary-500'} />
                    ) : (
                      <FileText size={18} className={done ? 'text-green-500' : 'text-primary-500'} />
                    )}
                    <div className="flex-1">
                      <p className="font-medium text-sm">{lesson.title}</p>
                      <p className="text-xs text-gray-400 capitalize">{lesson.type}</p>
                    </div>
                    {done && <CheckCircle size={18} className="text-green-500" />}
                    {canAccess && (
                      <Link
                        to={`/courses/${id}/lessons/${lesson.id}`}
                        className="text-xs text-primary-600 hover:underline font-medium"
                      >
                        Ouvrir →
                      </Link>
                    )}
                  </div>
                )
              })}
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="md:col-span-1">
          <div className="card p-5 sticky top-24">
            {enrolled ? (
              <>
                <p className="text-green-600 font-semibold flex items-center gap-2 mb-4">
                  <CheckCircle size={18} />
                  Inscrit à ce cours
                </p>
                <ProgressBar completed={completedCount} total={lessons.length} />
                {lessons.length > 0 && (
                  <Link
                    to={`/courses/${id}/lessons/${lessons[0].id}`}
                    className="btn-primary w-full text-center mt-4 block"
                  >
                    {completedCount === 0 ? 'Commencer le cours' : 'Continuer'}
                  </Link>
                )}
              </>
            ) : (
              <>
                <div className="text-center mb-4">
                  <p className="text-3xl font-bold text-primary-600">Gratuit</p>
                  <p className="text-sm text-gray-500 mt-1">{lessons.length} leçons incluses</p>
                </div>
                <button onClick={handleEnroll} className="btn-primary w-full py-3">
                  S'inscrire maintenant
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
