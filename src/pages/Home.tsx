import { Link } from 'react-router-dom';
import { Shield, Users, Briefcase, Award, MessageSquare, Calendar, Star, ArrowRight, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';

import { NeuralNetworkBackground } from '@/components/ui/NeuralNetworkBackground';

const Home = () => {
  return (
    <div className="min-h-screen bg-white">
      {/* Navigation */}
      <nav className="border-b bg-white/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-2">
              <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center overflow-hidden border border-gray-100">
                <img src="/logo.svg" alt="Paranet Logo" className="w-full h-full object-contain p-1" />
              </div>
              <span className="text-xl font-bold text-gray-900">Paranet</span>
            </div>
            <div className="flex items-center gap-4">
              <Link to="/login">
                <Button variant="ghost">Sign In</Button>
              </Link>
              <Link to="/login">
                <Button className="bg-indigo-600 hover:bg-indigo-700">Get Started</Button>
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 py-20 sm:py-32">
        {/* Background Effect */}
        <NeuralNetworkBackground />

        {/* Overlay for better text readability */}
        <div className="absolute inset-0 bg-white/40 pointer-events-none" />
        <div className="absolute inset-0 bg-gradient-to-t from-white/80 to-transparent pointer-events-none" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-100/80 backdrop-blur-sm text-indigo-700 rounded-full text-sm font-medium mb-8 border border-indigo-200">
              <Shield className="h-4 w-4" />
              Built by First Responders, for First Responders
            </div>
            <h1 className="text-4xl sm:text-6xl font-bold text-gray-900 mb-6 drop-shadow-sm">
              Connect. Learn. Grow.
              <br />
              <span className="text-indigo-600">Together.</span>
            </h1>
            <p className="text-xl text-gray-700 mb-8 max-w-3xl mx-auto font-medium">
              The professional network designed exclusively for law enforcement, fire service, EMS, and dispatch professionals. Share experiences, find opportunities, and build your career.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/login">
                <Button size="lg" className="bg-indigo-600 hover:bg-indigo-700 text-lg px-8 py-6 shadow-lg shadow-indigo-200">
                  Join Paranet <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
              <a href="#features">
                <Button size="lg" variant="outline" className="text-lg px-8 py-6 bg-white/50 backdrop-blur-sm hover:bg-white/80">
                  Learn More
                </Button>
              </a>
            </div>
            <p className="text-sm text-gray-500 mt-6 font-medium">
              Free to join • Verified first responders only
            </p>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
              Everything You Need to Succeed
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Paranet provides the tools and community to help you advance your career and connect with fellow first responders.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {/* Feature 1 */}
            <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl p-8 hover:shadow-lg transition-shadow">
              <div className="w-12 h-12 bg-indigo-600 rounded-xl flex items-center justify-center mb-4">
                <Users className="h-6 w-6 text-white" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Professional Networking</h3>
              <p className="text-gray-600">
                Connect with verified first responders across the country. Build your professional network and share experiences.
              </p>
            </div>

            {/* Feature 2 */}
            <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-2xl p-8 hover:shadow-lg transition-shadow">
              <div className="w-12 h-12 bg-purple-600 rounded-xl flex items-center justify-center mb-4">
                <Briefcase className="h-6 w-6 text-white" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Job Opportunities</h3>
              <p className="text-gray-600">
                Discover career opportunities at agencies nationwide. Apply directly and track your applications.
              </p>
            </div>

            {/* Feature 3 */}
            <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-2xl p-8 hover:shadow-lg transition-shadow">
              <div className="w-12 h-12 bg-green-600 rounded-xl flex items-center justify-center mb-4">
                <Award className="h-6 w-6 text-white" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Credentials & Training</h3>
              <p className="text-gray-600">
                Showcase your certifications, track expiring credentials, and discover training opportunities.
              </p>
            </div>

            {/* Feature 4 */}
            <div className="bg-gradient-to-br from-orange-50 to-red-50 rounded-2xl p-8 hover:shadow-lg transition-shadow">
              <div className="w-12 h-12 bg-orange-600 rounded-xl flex items-center justify-center mb-4">
                <MessageSquare className="h-6 w-6 text-white" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Community Feed</h3>
              <p className="text-gray-600">
                Share stories, ask questions, and learn from the collective experience of thousands of first responders.
              </p>
            </div>

            {/* Feature 5 */}
            <div className="bg-gradient-to-br from-cyan-50 to-blue-50 rounded-2xl p-8 hover:shadow-lg transition-shadow">
              <div className="w-12 h-12 bg-cyan-600 rounded-xl flex items-center justify-center mb-4">
                <Calendar className="h-6 w-6 text-white" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Events & Training</h3>
              <p className="text-gray-600">
                Stay updated on conferences, training sessions, and networking events in your area.
              </p>
            </div>

            {/* Feature 6 */}
            <div className="bg-gradient-to-br from-yellow-50 to-orange-50 rounded-2xl p-8 hover:shadow-lg transition-shadow">
              <div className="w-12 h-12 bg-yellow-600 rounded-xl flex items-center justify-center mb-4">
                <Star className="h-6 w-6 text-white" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Gear & Agency Reviews</h3>
              <p className="text-gray-600">
                Read honest reviews of equipment and agencies from fellow first responders who've been there.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-20 bg-gradient-to-br from-gray-50 to-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
              How Paranet Works
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Join thousands of first responders in just a few simple steps
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-indigo-600 text-white rounded-full flex items-center justify-center text-2xl font-bold mx-auto mb-4">
                1
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Create Your Profile</h3>
              <p className="text-gray-600">
                Sign up with your email or Google account. Verify your first responder status and build your professional profile.
              </p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-purple-600 text-white rounded-full flex items-center justify-center text-2xl font-bold mx-auto mb-4">
                2
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Connect & Engage</h3>
              <p className="text-gray-600">
                Follow colleagues, join groups, share your experiences, and learn from the community.
              </p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-green-600 text-white rounded-full flex items-center justify-center text-2xl font-bold mx-auto mb-4">
                3
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Grow Your Career</h3>
              <p className="text-gray-600">
                Discover job opportunities, showcase your credentials, and advance your career in public safety.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Who It's For */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
              Built for All First Responders
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Whether you're on the front lines or behind the scenes, Paranet is your professional home
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-blue-50 rounded-xl p-6 text-center">
              <div className="text-4xl mb-3">👮</div>
              <h3 className="font-semibold text-gray-900 mb-2">Law Enforcement</h3>
              <p className="text-sm text-gray-600">Officers, deputies, troopers, and investigators</p>
            </div>

            <div className="bg-red-50 rounded-xl p-6 text-center">
              <div className="text-4xl mb-3">🚒</div>
              <h3 className="font-semibold text-gray-900 mb-2">Fire Service</h3>
              <p className="text-sm text-gray-600">Firefighters, engineers, and fire chiefs</p>
            </div>

            <div className="bg-green-50 rounded-xl p-6 text-center">
              <div className="text-4xl mb-3">🚑</div>
              <h3 className="font-semibold text-gray-900 mb-2">EMS</h3>
              <p className="text-sm text-gray-600">Paramedics, EMTs, and emergency medical professionals</p>
            </div>

            <div className="bg-purple-50 rounded-xl p-6 text-center">
              <div className="text-4xl mb-3">📞</div>
              <h3 className="font-semibold text-gray-900 mb-2">Dispatch</h3>
              <p className="text-sm text-gray-600">911 operators and communications specialists</p>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-20 bg-gradient-to-br from-indigo-50 to-purple-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
              Trusted by First Responders
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              See what your fellow first responders are saying about Paranet
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-white rounded-2xl p-8 shadow-lg">
              <div className="flex gap-1 mb-4">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="h-5 w-5 fill-yellow-400 text-yellow-400" />
                ))}
              </div>
              <p className="text-gray-700 mb-4">
                "Paranet has been invaluable for networking with other officers across the country. I've learned so much from the community and even found my current position through the job board."
              </p>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-indigo-100 rounded-full flex items-center justify-center">
                  <span className="text-indigo-600 font-semibold">JD</span>
                </div>
                <div>
                  <p className="font-semibold text-gray-900">Officer Johnson</p>
                  <p className="text-sm text-gray-600">Law Enforcement</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-2xl p-8 shadow-lg">
              <div className="flex gap-1 mb-4">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="h-5 w-5 fill-yellow-400 text-yellow-400" />
                ))}
              </div>
              <p className="text-gray-700 mb-4">
                "As a paramedic, staying current with certifications is crucial. Paranet's credential tracking feature has saved me from letting important certs expire. Game changer!"
              </p>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                  <span className="text-green-600 font-semibold">SM</span>
                </div>
                <div>
                  <p className="font-semibold text-gray-900">Sarah Martinez</p>
                  <p className="text-sm text-gray-600">Paramedic</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-2xl p-8 shadow-lg">
              <div className="flex gap-1 mb-4">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="h-5 w-5 fill-yellow-400 text-yellow-400" />
                ))}
              </div>
              <p className="text-gray-700 mb-4">
                "Finally, a platform that understands the unique needs of first responders. The community is supportive, professional, and genuinely helpful."
              </p>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
                  <span className="text-red-600 font-semibold">MT</span>
                </div>
                <div>
                  <p className="font-semibold text-gray-900">Captain Mike Thompson</p>
                  <p className="text-sm text-gray-600">Fire Service</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-br from-indigo-600 to-purple-600 text-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl sm:text-5xl font-bold mb-6">
            Ready to Join the Community?
          </h2>
          <p className="text-xl mb-8 text-indigo-100">
            Connect with thousands of first responders and take your career to the next level.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/login">
              <Button size="lg" className="bg-white text-indigo-600 hover:bg-gray-100 text-lg px-8 py-6">
                Get Started Free <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
          </div>
          <div className="mt-8 flex flex-wrap justify-center gap-6 text-sm text-indigo-100">
            <div className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5" />
              Free to join
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5" />
              Verified professionals only
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5" />
              No credit card required
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-300 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-4 gap-8 mb-8">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <div className="w-8 h-8 rounded-lg bg-white flex items-center justify-center overflow-hidden">
                  <img src="/logo.svg" alt="Paranet Logo" className="w-full h-full object-contain p-0.5" />
                </div>
                <span className="text-xl font-bold text-white">Paranet</span>
              </div>
              <p className="text-sm text-gray-400">
                The professional network for first responders.
              </p>
            </div>

            <div>
              <h3 className="font-semibold text-white mb-4">Product</h3>
              <ul className="space-y-2 text-sm">
                <li><a href="#features" className="hover:text-white">Features</a></li>
                <li><Link to="/login" className="hover:text-white">Sign Up</Link></li>
                <li><Link to="/login" className="hover:text-white">Sign In</Link></li>
              </ul>
            </div>

            <div>
              <h3 className="font-semibold text-white mb-4">Company</h3>
              <ul className="space-y-2 text-sm">
                <li><a href="mailto:support@paranet.tech" className="hover:text-white">Contact</a></li>
                <li><a href="mailto:support@paranet.tech" className="hover:text-white">Support</a></li>
              </ul>
            </div>

            <div>
              <h3 className="font-semibold text-white mb-4">Legal</h3>
              <ul className="space-y-2 text-sm">
                <li><Link to="/privacy" className="hover:text-white">Privacy Policy</Link></li>
                <li><Link to="/terms" className="hover:text-white">Terms of Service</Link></li>
              </ul>
            </div>
          </div>

          <div className="border-t border-gray-800 pt-8 flex flex-col sm:flex-row justify-between items-center gap-4">
            <p className="text-sm text-gray-400">
              © 2026 Paranet. All rights reserved.
            </p>
            <div className="flex gap-6">
              <Link to="/privacy" className="text-sm hover:text-white">Privacy Policy</Link>
              <Link to="/terms" className="text-sm hover:text-white">Terms of Service</Link>
              <a href="mailto:support@paranet.tech" className="text-sm hover:text-white">Contact</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Home;
