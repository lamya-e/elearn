import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import { AuthProvider } from './context/AuthContext'
import Layout from './components/layout/Layout'
import ProtectedRoute from './components/ui/ProtectedRoute'

// Pages
import Landing from './pages/Landing'
import Login from './pages/Login'
import Register from './pages/Register'
import Courses from './pages/Courses'
import CourseDetail from './pages/CourseDetail'
import LessonViewer from './pages/LessonViewer'
import Profile from './pages/Profile'
import TeacherDashboard from './pages/teacher/TeacherDashboard'
import CourseForm from './pages/teacher/CourseForm'

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Toaster position="top-right" />
        <Routes>
          {/* Public auth pages (no layout) */}
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          {/* All other pages with layout */}
          <Route path="/" element={<Layout><Landing /></Layout>} />
          <Route path="/courses" element={<Layout><Courses /></Layout>} />
          <Route path="/courses/:id" element={<Layout><CourseDetail /></Layout>} />
          <Route path="/courses/:courseId/lessons/:lessonId" element={
            <Layout>
              <ProtectedRoute>
                <LessonViewer />
              </ProtectedRoute>
            </Layout>
          } />
          <Route path="/profile" element={
            <Layout>
              <ProtectedRoute>
                <Profile />
              </ProtectedRoute>
            </Layout>
          } />

          {/* Teacher routes */}
          <Route path="/dashboard" element={
            <Layout>
              <ProtectedRoute role="teacher">
                <TeacherDashboard />
              </ProtectedRoute>
            </Layout>
          } />
          <Route path="/teacher/courses/new" element={
            <Layout>
              <ProtectedRoute role="teacher">
                <CourseForm />
              </ProtectedRoute>
            </Layout>
          } />
          <Route path="/teacher/courses/:id/edit" element={
            <Layout>
              <ProtectedRoute role="teacher">
                <CourseForm />
              </ProtectedRoute>
            </Layout>
          } />

          {/* 404 */}
          <Route path="*" element={
            <Layout>
              <div className="text-center py-20">
                <h1 className="text-4xl font-bold text-gray-300">404</h1>
                <p className="text-gray-500 mt-2">Page introuvable</p>
              </div>
            </Layout>
          } />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  )
}
