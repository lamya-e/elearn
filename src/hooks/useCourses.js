import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabaseClient'

export function useCourses(teacherId = null) {
  const [courses, setCourses] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    fetchCourses()
  }, [teacherId])

  async function fetchCourses() {
    setLoading(true)
    setError(null)
    try {
      let query = supabase
        .from('courses')
        .select('*')
        .order('created_at', { ascending: false })

      if (teacherId) query = query.eq('teacher_id', teacherId)

      const { data: coursesData, error: coursesError } = await query
      if (coursesError) throw coursesError

      // Récupérer les profils séparément
      if (coursesData && coursesData.length > 0) {
        const teacherIds = [...new Set(coursesData.map(c => c.teacher_id))]
        const { data: profilesData } = await supabase
          .from('profiles')
          .select('user_id, full_name, avatar_url')
          .in('user_id', teacherIds)

        const profilesMap = {}
        profilesData?.forEach(p => { profilesMap[p.user_id] = p })

        const enriched = coursesData.map(c => ({
          ...c,
          profiles: profilesMap[c.teacher_id] || null
        }))
        setCourses(enriched)
      } else {
        setCourses(coursesData || [])
      }
    } catch (err) {
      console.error('useCourses error:', err)
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return { courses, loading, error, refetch: fetchCourses }
}

export function useCourse(courseId) {
  const [course, setCourse] = useState(null)
  const [lessons, setLessons] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!courseId) return
    async function fetchCourse() {
      try {
        const [{ data: courseData, error: courseError }, { data: lessonsData }] = await Promise.all([
          supabase.from('courses').select('*').eq('id', courseId).single(),
          supabase.from('lessons').select('*').eq('course_id', courseId).order('order', { ascending: true }),
        ])

        if (courseError) throw courseError

        // Récupérer le profil du prof séparément
        if (courseData) {
          const { data: profileData } = await supabase
            .from('profiles')
            .select('user_id, full_name, avatar_url')
            .eq('user_id', courseData.teacher_id)
            .single()

          setCourse({ ...courseData, profiles: profileData || null })
        }

        setLessons(lessonsData || [])
      } catch (err) {
        console.error('useCourse error:', err)
      } finally {
        setLoading(false)
      }
    }
    fetchCourse()
  }, [courseId])

  return { course, lessons, loading }
}