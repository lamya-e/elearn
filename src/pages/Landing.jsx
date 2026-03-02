import { Link } from 'react-router-dom'
import { BookOpen, Users, Video, Award } from 'lucide-react'
import { useCourses } from '../hooks/useCourses'
import CourseCard from '../components/course/CourseCard'

export default function Landing() {
  const { courses } = useCourses()

  return (
    <div>
      {/* Hero */}
      <section className="bg-gradient-to-br from-primary-600 to-primary-700 text-white py-24 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-6">
            Apprenez à votre rythme,<br />où que vous soyez
          </h1>
          <p className="text-xl text-primary-100 mb-10 max-w-2xl mx-auto">
            Accédez à des centaines de cours en ligne créés par des professeurs passionnés. Vidéos, PDF, exercices pratiques.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/courses" className="bg-white text-primary-700 font-semibold px-8 py-3 rounded-xl hover:bg-primary-50 transition-colors">
              Explorer les cours
            </Link>
            <Link to="/register" className="border-2 border-white text-white font-semibold px-8 py-3 rounded-xl hover:bg-white/10 transition-colors">
              Devenir professeur
            </Link>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-16 px-4 bg-white">
        <div className="max-w-5xl mx-auto grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-8 text-center">
          {[
            { icon: <BookOpen className="text-primary-600" size={32} />, title: 'Cours structurés', desc: 'Contenu organisé en leçons progressives' },
            { icon: <Video className="text-primary-600" size={32} />, title: 'Vidéos & PDFs', desc: 'Supports variés adaptés à chaque sujet' },
            { icon: <Users className="text-primary-600" size={32} />, title: 'Communauté', desc: 'Commentaires et interactions avec les profs' },
            { icon: <Award className="text-primary-600" size={32} />, title: 'Progression', desc: 'Suivez votre avancement en temps réel' },
          ].map((f, i) => (
            <div key={i} className="flex flex-col items-center gap-3">
              <div className="w-14 h-14 bg-primary-50 rounded-2xl flex items-center justify-center">{f.icon}</div>
              <h3 className="font-semibold">{f.title}</h3>
              <p className="text-sm text-gray-500">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Latest courses */}
      {courses.length > 0 && (
        <section className="py-16 px-4 bg-gray-50">
          <div className="max-w-6xl mx-auto">
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-2xl font-bold">Cours récents</h2>
              <Link to="/courses" className="text-primary-600 hover:underline text-sm font-medium">Voir tous →</Link>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {courses.slice(0, 4).map(course => (
                <CourseCard key={course.id} course={course} />
              ))}
            </div>
          </div>
        </section>
      )}
    </div>
  )
}
