import { useParams, Link } from 'react-router-dom'
import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabaseClient'
import { useProgress } from '../hooks/useProgress'
import { useAuth } from '../context/AuthContext'
import CommentSection from '../components/comment/CommentSection'
import { CheckCircle, ChevronLeft, ChevronRight, FileText, PlayCircle } from 'lucide-react'
import ReactPlayer from 'react-player'
import toast from 'react-hot-toast'

export default function LessonViewer() {
  const { courseId, lessonId } = useParams()
  const { user } = useAuth()
  const { isCompleted, markComplete } = useProgress(user?.id, courseId)
  const [lesson, setLesson] = useState(null)
  const [allLessons, setAllLessons] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetch() {
      const [{ data: l }, { data: all }] = await Promise.all([
        supabase.from('lessons').select('*').eq('id', lessonId).single(),
        supabase.from('lessons').select('id, title, order').eq('course_id', courseId).order('order'),
      ])
      setLesson(l)
      setAllLessons(all || [])
      setLoading(false)
    }
    fetch()
  }, [lessonId, courseId])

  async function handleMarkComplete() {
    await markComplete(lessonId)
    toast.success('Leçon marquée comme terminée !')
  }

  if (loading) return (
    <div className="flex justify-center py-20">
      <div className="w-8 h-8 border-4 border-primary-500 border-t-transparent rounded-full animate-spin" />
    </div>
  )

  if (!lesson) return <div className="text-center py-20 text-gray-500">Leçon introuvable</div>

  const currentIndex = allLessons.findIndex(l => l.id === lessonId)
  const prev = currentIndex > 0 ? allLessons[currentIndex - 1] : null
  const next = currentIndex < allLessons.length - 1 ? allLessons[currentIndex + 1] : null
  const done = isCompleted(lessonId)

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <Link to={`/courses/${courseId}`} className="text-sm text-primary-600 hover:underline mb-4 inline-block">
        ← Retour au cours
      </Link>

      <div className="grid lg:grid-cols-3 gap-8">
        {/* Viewer */}
        <div className="lg:col-span-2">
          <div className="card overflow-hidden mb-6">
            {lesson.type === 'video' ? (
              <div className="aspect-video bg-black">
                <ReactPlayer
                  url={lesson.file_url}
                  width="100%"
                  height="100%"
                  controls
                  config={{ file: { attributes: { controlsList: 'nodownload' } } }}
                />
              </div>
            ) : (
              <div className="h-[600px]">
                <iframe
                  src={lesson.file_url}
                  className="w-full h-full border-0"
                  title={lesson.title}
                />
              </div>
            )}
            <div className="p-5">
              <div className="flex items-center gap-2 text-sm text-gray-500 mb-2">
                {lesson.type === 'video' ? <PlayCircle size={16} className="text-primary-500" /> : <FileText size={16} className="text-primary-500" />}
                <span className="capitalize">{lesson.type}</span>
              </div>
              <h1 className="text-2xl font-bold">{lesson.title}</h1>
              {lesson.description && <p className="text-gray-600 mt-2">{lesson.description}</p>}

              <div className="flex items-center justify-between mt-5 pt-5 border-t">
                <div className="flex gap-3">
                  {prev && (
                    <Link to={`/courses/${courseId}/lessons/${prev.id}`} className="btn-secondary flex items-center gap-1 text-sm">
                      <ChevronLeft size={16} /> Préc.
                    </Link>
                  )}
                  {next && (
                    <Link to={`/courses/${courseId}/lessons/${next.id}`} className="btn-primary flex items-center gap-1 text-sm">
                      Suiv. <ChevronRight size={16} />
                    </Link>
                  )}
                </div>
                <button
                  onClick={handleMarkComplete}
                  disabled={done}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    done
                      ? 'bg-green-100 text-green-700 cursor-default'
                      : 'bg-gray-100 text-gray-700 hover:bg-green-100 hover:text-green-700'
                  }`}
                >
                  <CheckCircle size={16} />
                  {done ? 'Terminée' : 'Marquer comme terminée'}
                </button>
              </div>
            </div>
          </div>

          <CommentSection lessonId={lessonId} />
        </div>

        {/* Sidebar — all lessons */}
        <div className="lg:col-span-1">
          <div className="card p-4 sticky top-24">
            <h3 className="font-semibold mb-3 text-sm text-gray-500 uppercase tracking-wide">Leçons du cours</h3>
            <div className="space-y-1">
              {allLessons.map((l, i) => {
                const isActive = l.id === lessonId
                const isDone = isCompleted(l.id)
                return (
                  <Link
                    key={l.id}
                    to={`/courses/${courseId}/lessons/${l.id}`}
                    className={`flex items-center gap-3 p-2.5 rounded-lg text-sm transition-colors ${
                      isActive ? 'bg-primary-50 text-primary-700 font-medium' : 'hover:bg-gray-50 text-gray-700'
                    }`}
                  >
                    <span className="text-xs text-gray-400 w-5 text-center">{i + 1}</span>
                    <span className="flex-1 line-clamp-1">{l.title}</span>
                    {isDone && <CheckCircle size={14} className="text-green-500 shrink-0" />}
                  </Link>
                )
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
