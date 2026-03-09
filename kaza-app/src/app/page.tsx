import Link from 'next/link';
import { Plane, ArrowRight, MapPin, Calendar, Compass } from 'lucide-react';

export default function Home() {
  return (
    <main className="flex flex-col items-center">
      {/* Hero Section */}
      <section className="relative w-full py-20 md:py-32 overflow-hidden bg-white">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-full">
          <div className="absolute top-10 left-10 w-64 h-64 bg-indigo-100 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob"></div>
          <div className="absolute top-0 right-10 w-72 h-72 bg-purple-100 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob animation-delay-2000"></div>
          <div className="absolute -bottom-8 left-20 w-80 h-80 bg-pink-100 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob animation-delay-4000"></div>
        </div>

        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 text-center">
          <div className="inline-flex items-center rounded-full border border-indigo-100 bg-indigo-50/50 px-3 py-1 text-sm font-medium text-indigo-700 mb-8">
            <span className="flex h-2 w-2 rounded-full bg-indigo-600 mr-2"></span>
            Introducing Kaza v1.0
          </div>
          <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight text-gray-900 mb-6">
            Your journey, <span className="text-indigo-600">reimagined.</span>
          </h1>
          <p className="mx-auto max-w-2xl text-lg md:text-xl text-gray-600 mb-10 leading-relaxed">
            Stop juggling spreadsheets and tabs. Kaza uses AI to craft personalized itineraries that match your unique travel style.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link 
              href="/search" 
              className="inline-flex items-center justify-center rounded-full bg-indigo-600 px-8 py-4 text-lg font-semibold text-white shadow-lg shadow-indigo-200 hover:bg-indigo-700 transition-all hover:scale-105 active:scale-95 group"
            >
              Start Planning
              <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
            </Link>
            <Link 
              href="/itinerary/demo" 
              className="inline-flex items-center justify-center rounded-full bg-white px-8 py-4 text-lg font-semibold text-gray-900 border border-gray-200 hover:bg-gray-50 transition-all active:scale-95"
            >
              View Demo
            </Link>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="w-full py-20 bg-gray-50">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900">Why choose Kaza?</h2>
            <p className="mt-4 text-gray-600">The modern way to plan your next adventure.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                title: 'Smart Search',
                desc: 'Find the best hotels and activities with our integrated discovery engine.',
                icon: MapPin,
                color: 'bg-blue-50 text-blue-600'
              },
              {
                title: 'Dynamic Builder',
                desc: 'Drag and drop your way to a perfect schedule with our intuitive interface.',
                icon: Calendar,
                color: 'bg-green-50 text-green-600'
              },
              {
                title: 'Local Insights',
                desc: 'Get curated recommendations from travel experts and locals alike.',
                icon: Compass,
                color: 'bg-orange-50 text-orange-600'
              }
            ].map((feature, i) => (
              <div key={i} className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
                <div className={`w-12 h-12 rounded-xl ${feature.color} flex items-center justify-center mb-6`}>
                  <feature.icon className="h-6 w-6" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">{feature.title}</h3>
                <p className="text-gray-600 leading-relaxed">{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}
