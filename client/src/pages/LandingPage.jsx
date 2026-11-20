import React from 'react';
import { Link } from 'react-router-dom';
import {
  Users,
  MapPin,
  Sparkles,
  ShieldCheck,
  Award,
  MessageSquare,
  Globe,
  ArrowRight,
  CheckCircle,
  HelpCircle,
  Compass,
  Star,
} from 'lucide-react';

const LandingPage = () => {
  const stats = [
    { label: 'Connected Cities', value: '15+' },
    { label: 'Active Circle Members', value: '12,500+' },
    { label: 'Assistance Completed', value: '4,800+' },
    { label: 'Verified Community Trust', value: '98.4%' },
  ];

  const features = [
    {
      icon: MapPin,
      title: 'Location-Based Discovery',
      description:
        'Find friends and verified helpers within your exact city or search by neighborhood radius. Filter friends easily whenever you travel.',
    },
    {
      icon: Users,
      title: 'Trusted Friendship Network',
      description:
        'Build a real network of college friends, colleagues, and travel buddies. Organize friends by home city, current location, and skills.',
    },
    {
      icon: Sparkles,
      title: 'Smart Helper Matching',
      description:
        'Proprietary algorithm weighs skills, language compatibility, distance, trust scores, and real-time availability to match the best helper.',
    },
    {
      icon: MessageSquare,
      title: 'Real-Time Messaging',
      description:
        'Instant 1-on-1 chat, presence status, typing indicators, and coordinated assistance channels with full privacy protection.',
    },
    {
      icon: Award,
      title: 'Rewards & Leaderboards',
      description:
        'Earn reputation points and achievement badges for helping fellow members. Level up from New Member to Community Champion.',
    },
    {
      icon: Globe,
      title: 'City-Based Communities',
      description:
        'Join dedicated circles for Delhi NCR, Jaipur, Mumbai, Bangalore, and specialized interest groups for students and travelers.',
    },
  ];

  const steps = [
    {
      step: '01',
      title: 'Create Your Profile',
      desc: 'Set your home city, current city, skills, languages, and the help categories you can provide.',
    },
    {
      step: '02',
      title: 'Connect With People',
      desc: 'Discover college alumni, colleagues, and verified locals across cities and build your trusted circle.',
    },
    {
      step: '03',
      title: 'Filter Friends Anywhere',
      desc: 'Visiting Jaipur or moving to Bangalore? Filter your accepted friends instantly by city to meet up or get advice.',
    },
    {
      step: '04',
      title: 'Ask for Help & Assist Others',
      desc: 'Post help requests for vehicle troubleshooting, local guidance, or accommodation advice and earn rewards.',
    },
  ];

  const testimonials = [
    {
      quote:
        'When my car battery gave up near Connaught Place at 9 PM, Aman from ApnaCircle was there within 15 minutes with jump cables. Incredible community spirit!',
      name: 'Rahul Sharma',
      city: 'Delhi',
      role: 'Software Engineer',
      avatar:
        'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&w=150&q=80',
    },
    {
      quote:
        'Moved from Pune to Jaipur for an architecture project. Found 6 college alumni through ApnaCircle and got verified advice on safe PG accommodations.',
      name: 'Priya Verma',
      city: 'Jaipur',
      role: 'Heritage Architect',
      avatar:
        'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=150&q=80',
    },
    {
      quote:
        'Helping fellow tech founders set up cloud infrastructure has earned me Community Champion status. The smart matching engine is remarkably accurate.',
      name: 'Ananya Das',
      city: 'Bangalore',
      role: 'Cloud Architect',
      avatar:
        'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80',
    },
  ];

  return (
    <div className="space-y-24 pb-20">
      {/* 1. HERO SECTION */}
      <section className="relative pt-12 pb-20 overflow-hidden">
        {/* Subtle background glow */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-96 bg-gradient-to-b from-indigo-100/60 via-blue-50/40 to-transparent blur-3xl -z-10 pointer-events-none" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            {/* Left Hero Copy */}
            <div className="lg:col-span-7 space-y-6 text-center lg:text-left">
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-indigo-50 border border-indigo-200/80 text-indigo-700 text-xs font-bold tracking-wide shadow-sm">
                <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
                <span>Next-Gen Community & Location Network</span>
              </div>

              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-slate-900 tracking-tight leading-[1.12]">
                Your People.{' '}
                <span className="bg-gradient-to-r from-indigo-600 to-blue-600 bg-clip-text text-transparent">
                  Your Cities.
                </span>{' '}
                Your Circle.
              </h1>

              <p className="text-base sm:text-lg text-slate-600 max-w-2xl mx-auto lg:mx-0 leading-relaxed font-normal">
                Build meaningful friendships, discover trusted local people, and find help
                wherever life takes you. Filter your friends by city when you travel and earn
                rewards by helping others.
              </p>

              {/* Core Philosophy Banner */}
              <div className="p-3.5 rounded-2xl bg-indigo-950 text-indigo-200 border border-indigo-800/80 text-xs sm:text-sm font-semibold tracking-wide text-center lg:text-left shadow-lg shadow-indigo-950/10">
                <span className="text-amber-400 font-bold uppercase tracking-wider text-[11px] block sm:inline sm:mr-2">
                  Core Philosophy:
                </span>
                "DON'T JUST SEARCH A PLACE. FIND A PERSON WHO CAN HELP."
              </div>

              {/* CTAs */}
              <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4 pt-2">
                <Link
                  to="/register"
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2.5 px-6 py-3.5 rounded-2xl text-sm font-bold text-white bg-indigo-600 hover:bg-indigo-700 shadow-lg shadow-indigo-600/25 transition-all hover:scale-[1.02]"
                >
                  Join ApnaCircle
                  <ArrowRight className="w-4 h-4" />
                </Link>

                <Link
                  to="/discover"
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-2xl text-sm font-bold text-slate-700 bg-white hover:bg-slate-50 border border-slate-200 shadow-sm transition-all"
                >
                  <Compass className="w-4 h-4 text-indigo-600" />
                  Explore Communities
                </Link>
              </div>

              {/* Trust Indicators */}
              <div className="flex items-center justify-center lg:justify-start gap-6 text-xs text-slate-500 pt-3">
                <span className="flex items-center gap-1.5 font-medium">
                  <CheckCircle className="w-4 h-4 text-emerald-500" />
                  Verified OTP Accounts
                </span>
                <span className="flex items-center gap-1.5 font-medium">
                  <CheckCircle className="w-4 h-4 text-emerald-500" />
                  Privacy-Safe Location
                </span>
                <span className="flex items-center gap-1.5 font-medium">
                  <CheckCircle className="w-4 h-4 text-emerald-500" />
                  No Spam or Fake Reviews
                </span>
              </div>
            </div>

            {/* Right Hero Visual Card */}
            <div className="lg:col-span-5 relative">
              <div className="relative mx-auto max-w-md bg-white rounded-3xl p-6 border border-slate-200/90 shadow-floating">
                {/* Visual Header */}
                <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-4">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-xl bg-indigo-600 flex items-center justify-center text-white">
                      <Users className="w-4 h-4" />
                    </div>
                    <div>
                      <p className="text-xs font-bold text-slate-900">Live Network Preview</p>
                      <p className="text-[10px] text-slate-500">Connected across 15+ Cities</p>
                    </div>
                  </div>
                  <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                    <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-ping" />
                    Live Active
                  </span>
                </div>

                {/* Sample Connected Profile Cards Preview */}
                <div className="space-y-3">
                  <div className="p-3 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-between gap-3">
                    <div className="flex items-center gap-2.5">
                      <img
                        src="https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&w=100&q=80"
                        alt="Rahul"
                        className="w-10 h-10 rounded-xl object-cover border border-slate-200"
                      />
                      <div>
                        <p className="text-xs font-bold text-slate-900">Rahul Sharma</p>
                        <p className="text-[10px] text-slate-500 flex items-center gap-1">
                          <MapPin className="w-3 h-3 text-indigo-500" />
                          Delhi • DTU Alumni
                        </p>
                      </div>
                    </div>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-indigo-100 text-indigo-700">
                      Vehicle Help
                    </span>
                  </div>

                  <div className="p-3 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-between gap-3">
                    <div className="flex items-center gap-2.5">
                      <img
                        src="https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=100&q=80"
                        alt="Priya"
                        className="w-10 h-10 rounded-xl object-cover border border-slate-200"
                      />
                      <div>
                        <p className="text-xs font-bold text-slate-900">Priya Verma</p>
                        <p className="text-[10px] text-slate-500 flex items-center gap-1">
                          <MapPin className="w-3 h-3 text-indigo-500" />
                          Jaipur • MNIT Alumni
                        </p>
                      </div>
                    </div>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800">
                      Travel & Heritage
                    </span>
                  </div>

                  <div className="p-3 rounded-2xl bg-indigo-50/70 border border-indigo-200 flex items-center justify-between gap-3">
                    <div className="flex items-center gap-2.5">
                      <img
                        src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=100&q=80"
                        alt="Ananya"
                        className="w-10 h-10 rounded-xl object-cover border border-slate-200"
                      />
                      <div>
                        <p className="text-xs font-bold text-slate-900">Ananya Das</p>
                        <p className="text-[10px] text-slate-500 flex items-center gap-1">
                          <MapPin className="w-3 h-3 text-indigo-500" />
                          Bangalore • IISc Alumni
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">
                        94% Match
                      </span>
                    </div>
                  </div>
                </div>

                {/* Floating Micro Badge */}
                <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
                  <span className="font-semibold text-indigo-700">Filter Friends by City:</span>
                  <div className="flex gap-1">
                    <span className="px-2 py-0.5 rounded bg-slate-100 text-[10px] font-medium">
                      Delhi (34)
                    </span>
                    <span className="px-2 py-0.5 rounded bg-slate-100 text-[10px] font-medium">
                      Jaipur (18)
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 2. STATS SECTION */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-3xl border border-slate-200/80 shadow-subtle p-8 sm:p-10">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center divide-y md:divide-y-0 md:divide-x divide-slate-100">
            {stats.map((stat, i) => (
              <div key={i} className={i !== 0 ? 'pt-4 md:pt-0' : ''}>
                <p className="text-3xl sm:text-4xl font-extrabold text-indigo-600 tracking-tight">
                  {stat.value}
                </p>
                <p className="text-xs sm:text-sm font-semibold text-slate-500 mt-1">
                  {stat.label}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 3. HOW IT WORKS */}
      <section id="how-it-works" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-14 space-y-3">
          <span className="text-xs font-bold text-indigo-600 uppercase tracking-wider">
            Simple & Transparent
          </span>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
            How ApnaCircle Works
          </h2>
          <p className="text-sm text-slate-600">
            Never lose contact with college friends or helpful acquaintances when moving or
            traveling between cities.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {steps.map((st, i) => (
            <div
              key={i}
              className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-subtle hover:shadow-card transition-all relative group"
            >
              <div className="text-3xl font-extrabold text-indigo-100 group-hover:text-indigo-200 transition-colors mb-3">
                {st.step}
              </div>
              <h3 className="text-base font-bold text-slate-900 mb-2">{st.title}</h3>
              <p className="text-xs text-slate-600 leading-relaxed">{st.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* 4. MAIN FEATURES GRID */}
      <section id="features" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-14 space-y-3">
          <span className="text-xs font-bold text-indigo-600 uppercase tracking-wider">
            Ecosystem Capabilities
          </span>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
            Designed for Real People & Real Cities
          </h2>
          <p className="text-sm text-slate-600">
            Everything you need to discover trusted friends, request help, and earn rewards.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feat, i) => {
            const Icon = feat.icon;
            return (
              <div
                key={i}
                className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-subtle hover:shadow-card transition-all flex flex-col justify-between"
              >
                <div>
                  <div className="w-12 h-12 rounded-2xl bg-indigo-50 border border-indigo-100 text-indigo-600 flex items-center justify-center mb-4">
                    <Icon className="w-6 h-6" />
                  </div>
                  <h3 className="text-base font-bold text-slate-900 mb-2">{feat.title}</h3>
                  <p className="text-xs text-slate-600 leading-relaxed font-normal">
                    {feat.description}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* 5. TESTIMONIALS */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-14 space-y-3">
          <span className="text-xs font-bold text-indigo-600 uppercase tracking-wider">
            Verified Community Stories
          </span>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
            What Our Members Say
          </h2>
          <p className="text-xs text-slate-500 uppercase tracking-wider font-semibold">
            (Sample community testimonials)
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {testimonials.map((t, idx) => (
            <div
              key={idx}
              className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-subtle flex flex-col justify-between"
            >
              <div className="space-y-4">
                <div className="flex text-amber-400 gap-1">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-4 h-4 fill-amber-400" />
                  ))}
                </div>
                <p className="text-xs text-slate-600 italic leading-relaxed">
                  "{t.quote}"
                </p>
              </div>

              <div className="flex items-center gap-3 pt-4 border-t border-slate-100 mt-6">
                <img
                  src={t.avatar}
                  alt={t.name}
                  className="w-10 h-10 rounded-full object-cover border border-slate-200"
                />
                <div>
                  <p className="text-xs font-bold text-slate-900">{t.name}</p>
                  <p className="text-[11px] text-slate-500">
                    {t.role} • {t.city}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 6. CALL TO ACTION SECTION */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="rounded-3xl bg-gradient-to-tr from-indigo-900 via-indigo-800 to-blue-900 text-white p-10 sm:p-14 text-center relative overflow-hidden shadow-2xl">
          <div className="max-w-2xl mx-auto space-y-5 relative z-10">
            <span className="inline-block px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-white/10 text-indigo-200 backdrop-blur-md">
              Start Building Today
            </span>
            <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight">
              Ready to Discover Your Circle in Any City?
            </h2>
            <p className="text-xs sm:text-sm text-indigo-200 leading-relaxed font-normal">
              Join thousands of students, professionals, and travelers discovering trusted
              friends and reliable help across India.
            </p>
            <div className="pt-3">
              <Link
                to="/register"
                className="inline-flex items-center gap-2 px-8 py-4 rounded-2xl text-sm font-bold text-indigo-950 bg-white hover:bg-slate-100 shadow-xl transition-all hover:scale-105"
              >
                Create Your Free Account
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default LandingPage;
