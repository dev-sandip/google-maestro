
import { Button } from '@/components/ui/button';
import { Link } from '@tanstack/react-router';
import { ArrowRight, Home, Lock, ShieldAlert, Terminal } from 'lucide-react';
import { motion } from 'motion/react';

type AccessType = 'GUEST' | 'FORBIDDEN';

interface UnauthorizedAccessProps {
  type?: AccessType;
  onAction?: () => void; // Optional custom handler
}

export function UnauthorizedAccess({ type = 'GUEST', onAction }: UnauthorizedAccessProps) {

  // Configuration based on type
  const config = {
    GUEST: {
      icon: Lock,
      color: 'text-blue-500',
      bgColor: 'bg-blue-500/10',
      borderColor: 'border-blue-500/20',
      title: 'Authentication Required',
      code: 'ERROR 401: NO_CREDENTIALS',
      message: 'You are attempting to access a secure sector. Please identify yourself to proceed.',
      primaryLabel: 'Authenticate',
      primaryLink: '/auth', // Adjust to your login route
      secondaryLabel: 'Return Home'
    },
    FORBIDDEN: {
      icon: ShieldAlert,
      color: 'text-red-500',
      bgColor: 'bg-red-500/10',
      borderColor: 'border-red-500/20',
      title: 'Clearance Denied',
      code: 'ERROR 403: INSUFFICIENT_PERMISSIONS',
      message: 'Your security clearance is insufficient for this protocol. This incident has been logged.',
      primaryLabel: 'Return to Dashboard',
      primaryLink: '/dashboard',
      secondaryLabel: 'Contact Admin'
    }
  };

  const activeConfig = config[type];
  const Icon = activeConfig.icon;

  return (
    <div className="min-h-screen w-full bg-[#09090B] flex items-center justify-center relative overflow-hidden p-4">

      {/* Background Grid */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff05_1px,transparent_1px),linear-gradient(to_bottom,#ffffff05_1px,transparent_1px)] bg-[size:40px_40px] pointer-events-none" />
      <div className="absolute inset-0 bg-radial-gradient from-transparent to-[#09090B] opacity-80 pointer-events-none" />

      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.4, ease: "easeOut" }}
        className="relative z-10 max-w-md w-full"
      >
        {/* Main Card */}
        <div className="bg-[#121214] border border-white/10 rounded-xl overflow-hidden shadow-2xl">

          {/* Top Decorator Line */}
          <div className={`h-1 w-full ${type === 'FORBIDDEN' ? 'bg-red-500' : 'bg-blue-500'}`} />

          <div className="p-8 flex flex-col items-center text-center">

            {/* Icon with Pulse */}
            <div className="relative mb-6">
              <div className={`absolute inset-0 ${activeConfig.bgColor} blur-xl rounded-full animate-pulse`} />
              <div className={`relative w-16 h-16 rounded-xl border ${activeConfig.borderColor} ${activeConfig.bgColor} flex items-center justify-center`}>
                <Icon size={32} className={activeConfig.color} />
              </div>
            </div>

            {/* Error Code */}
            <div className="flex items-center gap-2 mb-2 px-3 py-1 bg-black/40 rounded border border-white/5">
              <Terminal size={12} className="text-zinc-500" />
              <span className="text-[10px] font-mono text-zinc-400 tracking-widest uppercase">
                {activeConfig.code}
              </span>
            </div>

            {/* Headings */}
            <h1 className="text-2xl md:text-3xl font-display font-medium text-white mb-3">
              {activeConfig.title}
            </h1>
            <p className="text-zinc-500 text-sm leading-relaxed mb-8">
              {activeConfig.message}
            </p>

            {/* Actions */}
            <div className="flex flex-col gap-3 w-full">
              {onAction ? (
                <Button
                  onClick={onAction}
                  className="w-full bg-white text-black hover:bg-zinc-200 font-medium h-11"
                >
                  {activeConfig.primaryLabel} <ArrowRight size={16} className="ml-2" />
                </Button>
              ) : (
                <Link to={activeConfig.primaryLink} className="w-full">
                  <Button className="w-full bg-white text-black hover:bg-zinc-200 font-medium h-11">
                    {activeConfig.primaryLabel} <ArrowRight size={16} className="ml-2" />
                  </Button>
                </Link>
              )}

              <Link to="/" className="w-full">
                <Button variant="outline" className="w-full border-white/10 text-zinc-400 hover:text-white hover:bg-white/5 h-11">
                  <Home size={16} className="mr-2" /> {activeConfig.secondaryLabel}
                </Button>
              </Link>
            </div>

          </div>

          {/* Footer Decorative Data */}
          <div className="bg-black/30 border-t border-white/5 p-3 flex justify-between items-center text-[10px] font-mono text-zinc-600">
            <span>SECURE_GATEWAY_V2</span>
            <span>ID: {Math.floor(Math.random() * 999999)}</span>
          </div>
        </div>
      </motion.div>
    </div>
  );
}