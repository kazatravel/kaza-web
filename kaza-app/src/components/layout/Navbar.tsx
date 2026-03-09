'use client';

import Link from 'next/link';
import { Plane, Search, Calendar, User, Menu, X } from 'lucide-react';
import { useState } from 'react';

export function Navbar() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <nav className="sticky top-0 z-50 w-full border-b border-gray-100 bg-white/80 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <div className="flex items-center gap-2">
          <Link href="/" className="flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-indigo-600 text-white shadow-lg shadow-indigo-200">
              <Plane className="h-5 w-5 rotate-45" />
            </div>
            <span className="text-xl font-bold tracking-tight text-gray-900">Kaza</span>
          </Link>
        </div>

        {/* Desktop Navigation */}
        <div className="hidden md:flex md:items-center md:gap-8">
          <Link href="/search" className="text-sm font-medium text-gray-600 hover:text-indigo-600 transition-colors flex items-center gap-2">
            <Search className="h-4 w-4" />
            Explore
          </Link>
          <Link href="/itinerary/mock-id" className="text-sm font-medium text-gray-600 hover:text-indigo-600 transition-colors flex items-center gap-2">
            <Calendar className="h-4 w-4" />
            Itineraries
          </Link>
          <div className="h-6 w-px bg-gray-200"></div>
          <Link href="/login" className="flex items-center gap-2 rounded-full bg-gray-900 px-5 py-2 text-sm font-medium text-white hover:bg-gray-800 transition-all shadow-md active:scale-95">
            <User className="h-4 w-4" />
            Sign In
          </Link>
        </div>

        {/* Mobile menu button */}
        <div className="md:hidden">
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="inline-flex items-center justify-center rounded-lg p-2 text-gray-400 hover:bg-gray-100 hover:text-gray-500 focus:outline-none"
          >
            {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Navigation */}
      {isOpen && (
        <div className="md:hidden bg-white border-b border-gray-100 animate-in slide-in-from-top-4 duration-200">
          <div className="space-y-1 px-4 pb-6 pt-2">
            <Link 
              href="/search" 
              className="block rounded-lg px-3 py-3 text-base font-medium text-gray-600 hover:bg-gray-50 hover:text-indigo-600"
              onClick={() => setIsOpen(false)}
            >
              Explore
            </Link>
            <Link 
              href="/itinerary/mock-id" 
              className="block rounded-lg px-3 py-3 text-base font-medium text-gray-600 hover:bg-gray-50 hover:text-indigo-600"
              onClick={() => setIsOpen(false)}
            >
              Itineraries
            </Link>
            <Link 
              href="/login" 
              className="mt-4 block rounded-xl bg-gray-900 px-3 py-3 text-center text-base font-medium text-white shadow-lg"
              onClick={() => setIsOpen(false)}
            >
              Sign In
            </Link>
          </div>
        </div>
      )}
    </nav>
  );
}
