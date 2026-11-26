import React from 'react'
import { Link } from 'react-router-dom'
import {
  HiOutlineClipboardList,
  HiOutlineDocumentDownload,
  HiOutlineStatusOnline,
  HiOutlineTranslate,
  HiOutlineDesktopComputer,
  HiOutlineArchive,
  HiOutlineCheckCircle,
  HiOutlineArrowRight,
  HiOutlineSparkles,
  HiOutlineShoppingBag,
  HiOutlineUsers,
  HiOutlineTruck,
} from 'react-icons/hi'
import Navbar from '../../components/layout/Navbar'
import Button from '../../components/ui/Button'

export const LandingPage = () => {
  return (
    <div className="min-h-screen bg-white text-gray-900 flex flex-col">
      <Navbar />

      {/* 1. Hero Section */}
      <section className="relative overflow-hidden pt-12 pb-20 lg:pt-20 lg:pb-32 bg-gradient-to-b from-emerald-50/60 via-white to-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
          <div className="max-w-3xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-100/80 text-emerald-800 text-xs sm:text-sm font-semibold mb-6">
              <HiOutlineSparkles className="w-4 h-4 text-emerald-600" />
              <span>Smart B2B Catering Grocery Solution</span>
            </div>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-gray-900 tracking-tight leading-tight">
              Your Catering Grocery List,{' '}
              <span className="text-emerald-600 underline decoration-emerald-300 decoration-wavy decoration-2">
                Digitally Connected
              </span>
            </h1>
            <p className="mt-6 text-lg sm:text-xl text-gray-600 leading-relaxed max-w-2xl mx-auto">
              Eliminate handwritten notes, messy WhatsApp messages, and missed items. Build standardized grocery orders in Gujarati & English, transmit directly to local grocery stores, and track preparation live.
            </p>
            <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link to="/register" className="w-full sm:w-auto">
                <Button variant="primary" size="lg" className="w-full sm:w-auto shadow-lg shadow-emerald-600/20">
                  <span>Get Started Free</span>
                  <HiOutlineArrowRight className="w-5 h-5 ml-1" />
                </Button>
              </Link>
              <Link to="/login" className="w-full sm:w-auto">
                <Button variant="outline" size="lg" className="w-full sm:w-auto">
                  Log in to Account
                </Button>
              </Link>
            </div>
            {/* Trust badge */}
            <div className="mt-10 flex items-center justify-center gap-6 text-xs text-gray-500">
              <span className="flex items-center gap-1.5">
                <HiOutlineCheckCircle className="w-4 h-4 text-emerald-600" /> Instant PDF Generation
              </span>
              <span className="flex items-center gap-1.5">
                <HiOutlineCheckCircle className="w-4 h-4 text-emerald-600" /> Gujarati Native Catalog
              </span>
              <span className="flex items-center gap-1.5">
                <HiOutlineCheckCircle className="w-4 h-4 text-emerald-600" /> Zero Order Loss
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* 2. How It Works Section */}
      <section id="how-it-works" className="py-20 bg-gray-50/60 border-y border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <h2 className="text-xs uppercase font-bold tracking-widest text-emerald-600">Simple 3-Step Process</h2>
            <p className="mt-2 text-3xl font-bold text-gray-900">How CaterConnect Works</p>
            <p className="mt-3 text-base text-gray-600">
              From planning your catering event to taking delivery of clean, packed grocery packages.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative">
            {/* Step 1 */}
            <div className="bg-white p-8 rounded-2xl border border-gray-200/80 shadow-sm relative group hover:shadow-md transition-shadow">
              <div className="w-12 h-12 rounded-xl bg-emerald-600 text-white font-extrabold text-lg flex items-center justify-center mb-6 shadow-md shadow-emerald-200">
                1
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">Create Grocery List</h3>
              <p className="text-gray-600 text-sm leading-relaxed">
                Specify your event details (date, guest count, venue), select ingredients from our standardized Gujarati item catalog, and input exact quantities.
              </p>
            </div>

            {/* Step 2 */}
            <div className="bg-white p-8 rounded-2xl border border-gray-200/80 shadow-sm relative group hover:shadow-md transition-shadow">
              <div className="w-12 h-12 rounded-xl bg-emerald-600 text-white font-extrabold text-lg flex items-center justify-center mb-6 shadow-md shadow-emerald-200">
                2
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">Submit to Store Partner</h3>
              <p className="text-gray-600 text-sm leading-relaxed">
                Choose your trusted grocery store partner. They immediately receive the full organized requisition categorized by spices, grains, and dry goods.
              </p>
            </div>

            {/* Step 3 */}
            <div className="bg-white p-8 rounded-2xl border border-gray-200/80 shadow-sm relative group hover:shadow-md transition-shadow">
              <div className="w-12 h-12 rounded-xl bg-emerald-600 text-white font-extrabold text-lg flex items-center justify-center mb-6 shadow-md shadow-emerald-200">
                3
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">Store Prepares & Delivers</h3>
              <p className="text-gray-600 text-sm leading-relaxed">
                The store owner verifies stock, checks off items in real time, and marks the order ready for pickup or dispatch with digital PDF slips.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 3. Features Section */}
      <section id="features" className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <h2 className="text-xs uppercase font-bold tracking-widest text-emerald-600">Tailored For The Catering Industry</h2>
            <p className="mt-2 text-3xl font-bold text-gray-900">Features Built for Smooth Execution</p>
            <p className="mt-3 text-base text-gray-600">
              Designed specifically around how Gujarati caterers and wholesale provision merchants operate every day.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {/* Feature 1 */}
            <div className="p-6 rounded-2xl border border-gray-100 bg-gray-50/50 hover:bg-emerald-50/30 hover:border-emerald-200 transition-colors">
              <div className="w-10 h-10 rounded-lg bg-emerald-100 text-emerald-600 flex items-center justify-center mb-4">
                <HiOutlineClipboardList className="w-5 h-5" />
              </div>
              <h4 className="text-lg font-bold text-gray-900 mb-2">Digital Grocery Lists</h4>
              <p className="text-sm text-gray-600 leading-relaxed">
                Build categorized grocery lists with unit selectors (kg, gm, liter, tin, packet) avoiding messy handwriting.
              </p>
            </div>

            {/* Feature 2 */}
            <div className="p-6 rounded-2xl border border-gray-100 bg-gray-50/50 hover:bg-emerald-50/30 hover:border-emerald-200 transition-colors">
              <div className="w-10 h-10 rounded-lg bg-emerald-100 text-emerald-600 flex items-center justify-center mb-4">
                <HiOutlineDocumentDownload className="w-5 h-5" />
              </div>
              <h4 className="text-lg font-bold text-gray-900 mb-2">PDF Download & Print</h4>
              <p className="text-sm text-gray-600 leading-relaxed">
                Generate clean, formatted, print-ready PDF slips for kitchen staff, packing crews, and ledger filing.
              </p>
            </div>

            {/* Feature 3 */}
            <div className="p-6 rounded-2xl border border-gray-100 bg-gray-50/50 hover:bg-emerald-50/30 hover:border-emerald-200 transition-colors">
              <div className="w-10 h-10 rounded-lg bg-emerald-100 text-emerald-600 flex items-center justify-center mb-4">
                <HiOutlineStatusOnline className="w-5 h-5" />
              </div>
              <h4 className="text-lg font-bold text-gray-900 mb-2">Real-time Order Tracking</h4>
              <p className="text-sm text-gray-600 leading-relaxed">
                Watch status move seamlessly from Pending to Accepted, Preparing, and Ready for pickup in real-time.
              </p>
            </div>

            {/* Feature 4 */}
            <div className="p-6 rounded-2xl border border-gray-100 bg-gray-50/50 hover:bg-emerald-50/30 hover:border-emerald-200 transition-colors">
              <div className="w-10 h-10 rounded-lg bg-emerald-100 text-emerald-600 flex items-center justify-center mb-4">
                <HiOutlineTranslate className="w-5 h-5" />
              </div>
              <h4 className="text-lg font-bold text-gray-900 mb-2">Gujarati Item Names</h4>
              <p className="text-sm text-gray-600 leading-relaxed">
                Standardized bilingual catalog displaying authentic names (જીરું, હળદર, રાય) alongside English equivalents.
              </p>
            </div>

            {/* Feature 5 */}
            <div className="p-6 rounded-2xl border border-gray-100 bg-gray-50/50 hover:bg-emerald-50/30 hover:border-emerald-200 transition-colors">
              <div className="w-10 h-10 rounded-lg bg-emerald-100 text-emerald-600 flex items-center justify-center mb-4">
                <HiOutlineDesktopComputer className="w-5 h-5" />
              </div>
              <h4 className="text-lg font-bold text-gray-900 mb-2">Store Partner Portal</h4>
              <p className="text-sm text-gray-600 leading-relaxed">
                Dedicated interface for grocery merchant teams to check off stock, suggest substitutes, and update statuses.
              </p>
            </div>

            {/* Feature 6 */}
            <div className="p-6 rounded-2xl border border-gray-100 bg-gray-50/50 hover:bg-emerald-50/30 hover:border-emerald-200 transition-colors">
              <div className="w-10 h-10 rounded-lg bg-emerald-100 text-emerald-600 flex items-center justify-center mb-4">
                <HiOutlineArchive className="w-5 h-5" />
              </div>
              <h4 className="text-lg font-bold text-gray-900 mb-2">Order History & Duplication</h4>
              <p className="text-sm text-gray-600 leading-relaxed">
                Clone repeat event menus and standard grocery lists with a single click, saving hours of manual re-entry.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 4 & 5. Benefits Section */}
      <section id="benefits" className="py-20 bg-gray-50/70 border-t border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <h2 className="text-xs uppercase font-bold tracking-widest text-emerald-600">Dual-Sided Efficiency</h2>
            <p className="mt-2 text-3xl font-bold text-gray-900">Empowering Caterers & Merchants</p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
            {/* Catering Pros Benefits */}
            <div className="bg-white p-8 rounded-2xl border border-emerald-100 shadow-sm">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center">
                  <HiOutlineUsers className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-gray-900">For Catering Professionals</h3>
                  <p className="text-xs text-gray-500">Fast, accurate orders for any wedding or reception size</p>
                </div>
              </div>

              <ul className="space-y-4">
                <li className="flex items-start gap-3">
                  <HiOutlineCheckCircle className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                  <span className="text-sm text-gray-700">
                    <strong>Zero Misunderstandings:</strong> Clear standardized item names and exact unit quantities eliminate missing wedding items.
                  </span>
                </li>
                <li className="flex items-start gap-3">
                  <HiOutlineCheckCircle className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                  <span className="text-sm text-gray-700">
                    <strong>1-Click Repeat Orders:</strong> Instantly duplicate past wedding grocery lists for new bookings of similar guest counts.
                  </span>
                </li>
                <li className="flex items-start gap-3">
                  <HiOutlineCheckCircle className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                  <span className="text-sm text-gray-700">
                    <strong>Event-Centric Organization:</strong> Manage multiple ongoing catering functions with dedicated delivery deadlines.
                  </span>
                </li>
                <li className="flex items-start gap-3">
                  <HiOutlineCheckCircle className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                  <span className="text-sm text-gray-700">
                    <strong>Printable PDF Records:</strong> Hand crisp printed copies to kitchen head cooks (maharajs) and logistics drivers.
                  </span>
                </li>
              </ul>
            </div>

            {/* Grocery Stores Benefits */}
            <div className="bg-white p-8 rounded-2xl border border-emerald-100 shadow-sm">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center">
                  <HiOutlineShoppingBag className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-gray-900">For Grocery Store Partners</h3>
                  <p className="text-xs text-gray-500">Streamline packing, fulfillment, and customer communication</p>
                </div>
              </div>

              <ul className="space-y-4">
                <li className="flex items-start gap-3">
                  <HiOutlineCheckCircle className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                  <span className="text-sm text-gray-700">
                    <strong>Structured Packing Slips:</strong> Items grouped by aisle category make physical store warehouse picking 3x faster.
                  </span>
                </li>
                <li className="flex items-start gap-3">
                  <HiOutlineCheckCircle className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                  <span className="text-sm text-gray-700">
                    <strong>Fewer Phone Interruptions:</strong> Update order progress digitally without answering 15 status calls on busy days.
                  </span>
                </li>
                <li className="flex items-start gap-3">
                  <HiOutlineCheckCircle className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                  <span className="text-sm text-gray-700">
                    <strong>Instant Substitution Handling:</strong> Mark unavailable items and recommend brand or packaging alternatives directly.
                  </span>
                </li>
                <li className="flex items-start gap-3">
                  <HiOutlineCheckCircle className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                  <span className="text-sm text-gray-700">
                    <strong>Stronger Caterer Loyalty:</strong> Provide professional, reliable digital service that keeps caterers coming back.
                  </span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* 6. CTA Section */}
      <section className="py-20 bg-emerald-700 text-white relative overflow-hidden">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
          <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight">
            Ready to simplify your catering grocery workflows?
          </h2>
          <p className="mt-4 text-emerald-100 text-lg max-w-2xl mx-auto">
            Join professional caterers and provision stores modernizing food event logistics today.
          </p>
          <div className="mt-8 flex justify-center gap-4">
            <Link to="/register">
              <Button
                variant="secondary"
                size="lg"
                className="bg-white text-emerald-800 hover:bg-emerald-50 font-bold shadow-xl"
              >
                Create Free Account
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* 7. Footer */}
      <footer className="bg-gray-900 text-gray-400 py-12 border-t border-gray-800 mt-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-emerald-600 flex items-center justify-center text-white">
                <HiOutlineSparkles className="w-4 h-4" />
              </div>
              <span className="text-lg font-bold text-white">CaterConnect</span>
              <span className="text-xs text-gray-400 ml-2">| Your Catering Grocery List, Digitally Connected</span>
            </div>
            <div className="flex items-center gap-6 text-sm">
              <Link to="/login" className="hover:text-emerald-400 transition-colors">
                Sign in
              </Link>
              <Link to="/register" className="hover:text-emerald-400 transition-colors">
                Register
              </Link>
              <a href="#how-it-works" className="hover:text-emerald-400 transition-colors">
                How It Works
              </a>
              <a href="#features" className="hover:text-emerald-400 transition-colors">
                Features
              </a>
            </div>
          </div>
          <div className="mt-8 pt-8 border-t border-gray-800 text-center text-xs text-gray-500">
            &copy; {new Date().getFullYear()} CaterConnect. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  )
}

export default LandingPage
