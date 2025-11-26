
import { useTheme } from '@/providers/theme-provider';
import { useUser } from '@clerk/tanstack-react-start';
import { Link } from '@tanstack/react-router';
import {
  ArrowRightIcon,
  ChevronRight,
  Command,
  Cpu,
  Fingerprint,
  Globe,
  Moon,
  Search,
  Sun,
  Terminal,
  Timer,
  Trophy,
  Users,
  Zap
} from 'lucide-react';
import { motion, type Variants } from 'motion/react';

// Animations
const fadeInUp = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] as const } }
};

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.1 } }
};
const tickerVariants: Variants = {
  animate: {
    x: [0, -1000],
    transition: {
      x: {
        repeat: Infinity,
        repeatType: "loop",
        duration: 20,
        ease: "linear",
      },
    },
  },
};
export default function LandingPage() {
  const { theme, toggleTheme } = useTheme();
  const clubName = "ACES";
  const clubMotto = "Empowering the digital future.";
  const clubMembers = [
    { role: "Event Lead", name: "Sandip Sapkota" },
    { role: "Tech Lead", name: "Sandip Sapkota" },
    { role: "Operations", name: "Sandip Sapkota" },
    { role: "Logistics", name: "Sandip Sapkota" },
  ];
  const user = useUser();

  return (
    <div className="min-h-screen flex flex-col relative overflow-hidden bg-[#F4F4F5] dark:bg-[#09090B] text-zinc-900 dark:text-[#EDEDED] transition-colors duration-300 font-sans">

      {/* Background Ambience */}
      <div className={`absolute inset-0 pointer-events-none ${theme === 'dark' ? 'grid-bg-dark opacity-30' : 'grid-bg-light opacity-60'}`} />
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[500px] bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-blue-500/20 via-transparent to-transparent blur-3xl pointer-events-none" />

      {/* --- HEADER --- */}
      <nav className="w-full max-w-7xl mx-auto px-4 md:px-6 py-6 flex justify-between items-center relative z-10">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 bg-black dark:bg-white text-white dark:text-black flex items-center justify-center rounded-md shadow-lg border border-white/10">
            <Command size={18} strokeWidth={3} />
          </div>
          <div className="flex flex-col">
            <span className="font-bold text-lg leading-none tracking-tight font-display">MAESTRO</span>
            <span className="text-[10px] uppercase font-mono text-zinc-500 tracking-widest mt-0.5">By {clubName}</span>
          </div>
        </div>

        <div className="flex items-center gap-3 md:gap-6 text-sm">
          <Link to="/" className="hidden md:block text-zinc-500 hover:text-black dark:hover:text-white transition-colors font-medium">
            Leaderboard
          </Link>

          <div className="w-px h-4 bg-zinc-300 dark:bg-zinc-800 hidden md:block" />

          <button
            onClick={toggleTheme}
            className="p-2 rounded-full text-zinc-500 hover:text-black dark:hover:text-white hover:bg-black/5 dark:hover:bg-white/10 transition-colors"
          >
            {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
          </button>
          {user.isSignedIn ? (

            <Link
              to="/dashboard"
              className="group px-5 py-2.5 bg-black text-white dark:bg-white dark:text-black font-semibold text-xs tracking-wide uppercase hover:opacity-90 transition-all rounded-sm shadow-md flex items-center gap-2"
            >
              <span>Dashboard</span>
              <ArrowRightIcon className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
            </Link>
          ) : (

            <Link
              to="/login"
              className="group px-5 py-2.5 bg-black text-white dark:bg-white dark:text-black font-semibold text-xs tracking-wide uppercase hover:opacity-90 transition-all rounded-sm shadow-md flex items-center gap-2"
            >
              <span>Login to Play</span>
              <ArrowRightIcon className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
            </Link>
          )}
        </div>
      </nav>

      {/* --- HERO --- */}
      <main className="flex-grow flex flex-col items-center justify-center relative z-10 px-4 md:px-6 pt-12 pb-16">
        <motion.div
          initial="hidden"
          animate="visible"
          variants={staggerContainer}
          className="text-center max-w-4xl mx-auto"
        >
          <motion.div variants={fadeInUp} className="flex justify-center mb-8">
            <span className="px-3 py-1 rounded-full border border-black/10 dark:border-white/10 bg-white/50 dark:bg-white/5 text-blue-600 dark:text-[#2E90FF] text-xs font-mono uppercase tracking-wider backdrop-blur-sm flex items-center gap-2 shadow-sm">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-500"></span>
              </span>
              Round #402 Active
            </span>
          </motion.div>

          <motion.h1
            variants={fadeInUp}
            className="text-5xl sm:text-6xl md:text-8xl font-semibold leading-[0.9] tracking-tight mb-8 font-display text-zinc-900 dark:text-white"
          >
            The Fastest <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-br from-blue-600 to-indigo-500 dark:from-[#2E90FF] dark:to-white">
              Searcher Wins.
            </span>
          </motion.h1>

          <motion.p
            variants={fadeInUp}
            className="text-zinc-600 dark:text-[#A1A1AA] text-base md:text-xl max-w-xl mx-auto mb-10 font-light leading-relaxed"
          >
            A competitive search arena. Receive a cryptic query. Scour the web. Extract the answer.
            <span className="text-black dark:text-white font-medium"> Speed is the only metric that matters.</span>
          </motion.p>

          <motion.div variants={fadeInUp} className="flex flex-col sm:flex-row gap-4 justify-center items-center w-full sm:w-auto">
            <Link to="/" className="w-full sm:w-auto">
              <button className="w-full group relative h-12 px-8 bg-[#FF4F00] text-white font-medium flex items-center justify-center gap-2 hover:bg-[#E64600] transition-all rounded-sm shadow-lg shadow-orange-500/20">
                <span>Enter Arena</span>
                <ChevronRight size={16} className="group-hover:translate-x-1 transition-transform" />
              </button>
            </Link>
            <div className="flex items-center gap-2 text-xs font-mono text-zinc-500 dark:text-[#52525B]">
              <Fingerprint size={14} />
              <span>Login Required for Stats</span>
            </div>
          </motion.div>
        </motion.div>

        {/* --- FEATURES GRID --- */}
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          variants={staggerContainer}
          className="mt-24 grid grid-cols-1 md:grid-cols-12 gap-4 w-full max-w-6xl mx-auto"
        >
          {/* Card 1: Gameplay Loop */}
          <motion.div variants={fadeInUp} className="col-span-1 md:col-span-7 p-6 md:p-8 rounded-xl bg-white dark:bg-[#121214] border border-zinc-200 dark:border-white/5 shadow-sm dark:shadow-none relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-32 bg-blue-500/5 dark:bg-blue-500/10 blur-[80px] rounded-full pointer-events-none transition-all" />
            <div className="relative z-10">
              <div className="w-10 h-10 bg-blue-100 dark:bg-blue-500/20 rounded-lg flex items-center justify-center mb-4 text-blue-600 dark:text-blue-400">
                <Search size={20} />
              </div>
              <h3 className="text-xl font-medium mb-2 font-display">The Search-Off</h3>
              <p className="text-zinc-500 dark:text-[#A1A1AA] text-sm leading-relaxed max-w-md">
                You get a complex query. You have 60 seconds. <br />
                <span className="text-black dark:text-white font-mono bg-zinc-100 dark:bg-white/10 px-1 rounded text-xs">Query:</span> "What is the hex code of the shirt..."
              </p>
            </div>
          </motion.div>

          {/* Card 2: Speed Ranking */}
          <motion.div variants={fadeInUp} className="col-span-1 md:col-span-5 p-6 md:p-8 rounded-xl bg-white dark:bg-[#121214] border border-zinc-200 dark:border-white/5 shadow-sm dark:shadow-none relative overflow-hidden">
            <div className="w-10 h-10 bg-yellow-100 dark:bg-yellow-500/10 rounded-lg flex items-center justify-center mb-4 text-yellow-600 dark:text-yellow-500">
              <Trophy size={20} />
            </div>
            <h3 className="text-xl font-medium mb-2 font-display">Global Rankings</h3>
            <p className="text-zinc-500 dark:text-[#A1A1AA] text-sm leading-relaxed">
              Track your WPM (Wins Per Match). Climb from Script Kiddie to Grandmaster.
            </p>
          </motion.div>

          {/* Card 3: Tech */}
          <motion.div variants={fadeInUp} className="col-span-1 md:col-span-4 p-6 md:p-8 rounded-xl bg-white dark:bg-[#121214] border border-zinc-200 dark:border-white/5 shadow-sm dark:shadow-none">
            <div className="flex gap-4 mb-4 text-zinc-400 dark:text-[#A1A1AA]">
              <Zap size={20} />
              <Globe size={20} />
            </div>
            <h3 className="text-xl font-medium mb-2 font-display">Sudden Death</h3>
            <p className="text-zinc-500 dark:text-[#A1A1AA] text-sm">
              The round ends immediately when <span className="text-black dark:text-white font-mono">3 users</span> answer correctly.
            </p>
          </motion.div>

          {/* Card 4: Timer */}
          <motion.div variants={fadeInUp} className="col-span-1 md:col-span-8 p-6 md:p-8 rounded-xl bg-white dark:bg-[#121214] border border-zinc-200 dark:border-white/5 shadow-sm dark:shadow-none flex flex-col md:flex-row items-center gap-8">
            <div className="flex-1 w-full">
              <div className="w-10 h-10 bg-orange-100 dark:bg-orange-500/10 rounded-lg flex items-center justify-center mb-4 text-orange-600 dark:text-orange-500">
                <Timer size={20} />
              </div>
              <h3 className="text-xl font-medium mb-2 font-display">Time Pressure</h3>
              <p className="text-zinc-500 dark:text-[#A1A1AA] text-sm">
                Seconds matter. Server-side validation with sub-50ms latency.
              </p>
            </div>
            {/* Abstract Timer Visual */}
            <div className="w-full md:w-48 h-16 border border-zinc-200 dark:border-white/10 bg-zinc-50 dark:bg-black/20 rounded relative overflow-hidden flex items-center justify-center group">
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-red-500/10 to-transparent w-full animate-[shimmer_1s_infinite]" />
              <span className="font-mono text-3xl text-red-600 dark:text-red-500 tabular-nums tracking-widest font-bold group-hover:scale-105 transition-transform">00:09:42</span>
            </div>
          </motion.div>
        </motion.div>

        {/* --- NEW SECTION: CLUB / ORGANIZATION --- */}
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          variants={staggerContainer}
          className="mt-24 w-full max-w-6xl mx-auto"
        >
          {/* Section Divider with Label */}
          <div className="flex items-center gap-4 mb-8">
            <div className="h-px bg-zinc-300 dark:bg-zinc-800 flex-1" />
            <span className="text-xs font-mono uppercase text-zinc-400 dark:text-zinc-600 tracking-widest">
              Organized By
            </span>
            <div className="h-px bg-zinc-300 dark:bg-zinc-800 flex-1" />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Left: Club Identity */}
            <motion.div variants={fadeInUp} className="p-8 rounded-xl bg-zinc-100 dark:bg-[#121214] border border-zinc-200 dark:border-white/5 flex flex-col justify-between h-full">
              <div>
                <div className="flex items-center gap-3 mb-4">
                  <Terminal className="text-black dark:text-white" size={24} />
                  <h2 className="text-2xl font-bold font-display uppercase tracking-tight">{clubName}</h2>
                </div>
                <p className="text-zinc-500 dark:text-[#A1A1AA] text-sm leading-relaxed mb-6 font-mono">
                  "{clubMotto}" <br />
                  We are a community of student developers, hackers, and researchers pushing the boundaries of what's possible on the web.
                </p>
              </div>
              <div className="flex gap-2">
                <button className="px-4 py-2 bg-white dark:bg-white/5 border border-zinc-200 dark:border-white/10 rounded text-xs font-mono uppercase hover:border-black dark:hover:border-white transition-colors">
                  Join Community
                </button>
                <button className="px-4 py-2 bg-white dark:bg-white/5 border border-zinc-200 dark:border-white/10 rounded text-xs font-mono uppercase hover:border-black dark:hover:border-white transition-colors">
                  View Events
                </button>
              </div>
            </motion.div>

            {/* Right: Roster / Credits */}
            <motion.div variants={fadeInUp} className="p-8 rounded-xl bg-white dark:bg-[#0A0A0C] border border-zinc-200 dark:border-white/5 relative overflow-hidden">
              {/* Background deco */}
              <Cpu className="absolute -bottom-4 -right-4 text-black/5 dark:text-white/5 w-48 h-48" />

              <h3 className="text-sm font-mono uppercase text-zinc-400 mb-6">System Operators</h3>
              <div className="space-y-4 relative z-10">
                {clubMembers.map((member, i) => (
                  <div key={i} className="flex items-center justify-between group cursor-default">
                    <div className="flex items-center gap-3">
                      <div className="w-1.5 h-1.5 bg-zinc-300 dark:bg-zinc-700 rounded-full group-hover:bg-[#FF4F00] transition-colors" />
                      <span className="text-sm font-medium text-zinc-800 dark:text-zinc-200">{member.name}</span>
                    </div>
                    <span className="text-xs font-mono text-zinc-400 dark:text-zinc-600 uppercase tracking-wider">{member.role}</span>
                  </div>
                ))}
              </div>
            </motion.div>
          </div>
        </motion.div>

      </main>

      {/* --- MARQUEE --- */}
      <div className="w-full border-t border-b border-black/5 dark:border-white/5 bg-zinc-50 dark:bg-[#050505] overflow-hidden py-3">
        <motion.div
          className="flex whitespace-nowrap gap-16"
          variants={tickerVariants}
          animate="animate"
        >
          {[...Array(10)].map((_, i) => (
            <div key={i} className="flex items-center gap-4 text-xs font-mono text-zinc-400 dark:text-zinc-600 uppercase tracking-widest">
              <span>Organized by {clubName}</span>
              <span className="w-1 h-1 bg-current rounded-full" />
              <span>Google Maestro v2.0</span>
              <span className="w-1 h-1 bg-current rounded-full" />
            </div>
          ))}
        </motion.div>
      </div>

      {/* --- FOOTER --- */}
      <footer className="w-full py-8 bg-white/50 dark:bg-black/20 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-4 md:px-6 flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="flex items-center gap-2">
            <Users size={14} className="text-zinc-400" />
            <p className="text-zinc-500 dark:text-[#52525B] text-xs font-mono uppercase tracking-wider">
              © 2024 {clubName}
            </p>
          </div>

          {/* Developer Credit */}
          <div className="flex items-center gap-2 bg-zinc-100 dark:bg-white/5 px-3 py-1.5 rounded-full border border-zinc-200 dark:border-white/5">
            <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse"></span>
            <p className="text-zinc-600 dark:text-[#A1A1AA] text-[10px] md:text-xs font-mono">
              Developed by <span className="text-black dark:text-white font-semibold">dev-sandip</span>
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}

