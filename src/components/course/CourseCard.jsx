import { Link } from 'react-router-dom'
import { BookOpen, User } from 'lucide-react'

export default function CourseCard({ course }) {
  return (
    <Link to={`/courses/${course.id}`} className="card hover:shadow-md transition-shadow group">
      <div className="aspect-video bg-gradient-to-br from-primary-100 to-primary-200 relative overflow-hidden">
        {course.thumbnail_url ? (
          <img src={course.thumbnail_url} alt={course.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <BookOpen size={48} className="text-primary-400" />
          </div>
        )}
        {course.category && (
          <span className="absolute top-2 left-2 bg-primary-600 text-white text-xs px-2 py-1 rounded-full">
            {course.category}
          </span>
        )}
      </div>
      <div className="p-4">
        <h3 className="font-semibold text-gray-900 line-clamp-2 group-hover:text-primary-600 transition-colors">
          {course.title}
        </h3>
        <p className="text-sm text-gray-500 mt-1 line-clamp-2">{course.description}</p>
        <div className="flex items-center gap-2 mt-3 text-xs text-gray-400">
          <User size={13} />
          <span>{course.profiles?.full_name}</span>
        </div>
      </div>
    </Link>
  )
}
