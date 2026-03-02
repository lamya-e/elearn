import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabaseClient'

export function useProgress(studentId, courseId) {
  const [progress, setProgress] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!studentId || !courseId) return
    async function fetchProgress() {
      const { data } = await supabase
        .from('progress')
        .select('*')
        .eq('student_id', studentId)
        .eq('course_id', courseId)
      setProgress(data || [])
      setLoading(false)
    }
    fetchProgress()
  }, [studentId, courseId])

  async function markComplete(lessonId) {
    const existing = progress.find(p => p.lesson_id === lessonId)
    if (existing) return

    const { data } = await supabase
      .from('progress')
      .insert({ student_id: studentId, lesson_id: lessonId, course_id: courseId, completed: true })
      .select()
      .single()

    if (data) setProgress(prev => [...prev, data])
  }

  function isCompleted(lessonId) {
    return progress.some(p => p.lesson_id === lessonId && p.completed)
  }

  return { progress, loading, markComplete, isCompleted }
}

export function useEnrollment(studentId, courseId) {
  const [enrolled, setEnrolled] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!studentId || !courseId) return
    async function check() {
      const { data } = await supabase
        .from('enrollments')
        .select('id')
        .eq('student_id', studentId)
        .eq('course_id', courseId)
        .single()
      setEnrolled(!!data)
      setLoading(false)
    }
    check()
  }, [studentId, courseId])

  async function enroll() {
    await supabase.from('enrollments').insert({ student_id: studentId, course_id: courseId })
    setEnrolled(true)
  }

  return { enrolled, loading, enroll }
}
