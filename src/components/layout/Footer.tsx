import Link from 'next/link';
import { Plane, Instagram, Twitter, Github } from 'lucide-react';

export function Footer() {
  return (
    <footer className="border-t border-gray-100 bg-white">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="xl:grid xl:grid-cols-3 xl:gap-8">
          <div className="space-y-8 xl:col-span-1">
            <Link href="/" className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-600 text-white">
                <Plane className="h-4 w-4 rotate-45" />
              </div>
              <span className="text-xl font-bold tracking-tight text-gray-900">Kaza</span>
            </Link>
            <p className="text-sm leading-6 text-gray-600 max-w-xs">
              Crafting perfect journeys with AI-powered itinerary building and curated travel experiences.
            </p>
            <div className="flex space-x-6">
              <Link href="#" className="text-gray-400 hover:text-indigo-600 transition-colors">
                <Instagram className="h-5 w-5" />
              </Link>
              <Link href="#" className="text-gray-400 hover:text-indigo-600 transition-colors">
                <Twitter className="h-5 w-5" />
              </Link>
              <Link href="#" className="text-gray-400 hover:text-indigo-600 transition-colors">
                <Github className="h-5 w-5" />
              </Link>
            </div>
          </div>
          <div className="mt-16 grid grid-cols-2 gap-8 xl:col-span-2 xl:mt-0">
            <div className="md:grid md:grid-cols-2 md:gap-8">
              <div>
                <h3 className="text-sm font-semibold leading-6 text-gray-900 uppercase tracking-wider">Product</h3>
                <ul role="list" className="mt-6 space-y-4">
                  <li><Link href="/search" className="text-sm leading-6 text-gray-600 hover:text-indigo-600">Search</Link></li>
                  <li><Link href="#" className="text-sm leading-6 text-gray-600 hover:text-indigo-600">Planner</Link></li>
                  <li><Link href="#" className="text-sm leading-6 text-gray-600 hover:text-indigo-600">Pricing</Link></li>
                </ul>
              </div>
              <div className="mt-10 md:mt-0">
                <h3 className="text-sm font-semibold leading-6 text-gray-900 uppercase tracking-wider">Support</h3>
                <ul role="list" className="mt-6 space-y-4">
                  <li><Link href="#" className="text-sm leading-6 text-gray-600 hover:text-indigo-600">Help Center</Link></li>
                  <li><Link href="#" className="text-sm leading-6 text-gray-600 hover:text-indigo-600">Contact</Link></li>
                  <li><Link href="#" className="text-sm leading-6 text-gray-600 hover:text-indigo-600">Privacy</Link></li>
                </ul>
              </div>
            </div>
          </div>
        </div>
        <div className="mt-16 border-t border-gray-100 pt-8 sm:mt-20 lg:mt-24">
          <p className="text-xs leading-5 text-gray-400">
            &copy; {new Date().getFullYear()} Kaza Travel Technologies. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
