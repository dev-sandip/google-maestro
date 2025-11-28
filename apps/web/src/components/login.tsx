
import { useTheme } from '@/providers/theme-provider';
import { SignIn } from '@clerk/tanstack-react-start';
import { useForm } from '@tanstack/react-form';
import { Link } from '@tanstack/react-router';
import { Command, Moon, Sun } from 'lucide-react';
import { motion } from 'motion/react';
import z from "zod";

export default function LoginPage() {
  // const [isLoading, setIsLoading] = useState(false);
  const { theme, toggleTheme } = useTheme();
  // const navigate = useNavigate({
  //   from: "/",
  // });
  const form = useForm({
    defaultValues: {
      email: "",
      password: "",
    },
    onSubmit: async ({ value }) => {
      console.log(value)
    },
    validators: {
      onSubmit: z.object({
        email: z.email("Invalid email address"),
        password: z.string().min(8, "Password must be at least 8 characters"),
      }),
    },
  });

  return (
    <div className="min-h-screen flex flex-col lg:flex-row bg-[#F4F4F5] dark:bg-[#09090B] text-zinc-900 dark:text-white transition-colors duration-300 font-sans">

      {/* Left Panel - Visual */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden bg-zinc-100 dark:bg-[#050505] border-r border-black/5 dark:border-white/5 items-center justify-center">
        <div className={`absolute inset-0 opacity-30 ${theme === 'dark' ? 'grid-bg-dark' : 'grid-bg-light'}`} />

        <div className="relative z-10 max-w-md px-12">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <div className="w-12 h-12 bg-black dark:bg-white text-white dark:text-black rounded-md flex items-center justify-center mb-8 shadow-xl">
              <Command size={24} strokeWidth={2} />
            </div>
            <h1 className="text-4xl font-medium mb-6 font-display tracking-tight">
              Identify yourself.
            </h1>
            <p className="text-zinc-500 dark:text-[#A1A1AA] text-lg leading-relaxed mb-8">
              To maintain competitive integrity, all Maestros must be authenticated. Your search history and win-rate will be permanently recorded.
            </p>

            <div className="flex gap-4">
              <div className="px-4 py-3 bg-white dark:bg-[#121214] border border-zinc-200 dark:border-white/10 rounded text-xs font-mono text-zinc-500 dark:text-[#71717A] shadow-sm flex items-center gap-2">
                <div className="w-2 h-2 bg-green-500 rounded-full" />
                Server: Online
              </div>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Right Panel - Functional Auth */}
      <div className="w-full lg:w-1/2 flex flex-col items-center justify-center px-6 py-12 relative bg-white dark:bg-[#09090B]">
        {/* Navigation / Theme */}
        <div className="absolute top-6 md:top-8 right-6 md:right-8 flex items-center gap-4">
          <button onClick={toggleTheme} className="p-2 text-zinc-500 hover:text-black dark:hover:text-white transition-colors">
            {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
          </button>
          <Link to="/" className="text-xs font-mono text-zinc-500 hover:text-black dark:hover:text-white transition-colors">
            ← Back
          </Link>
        </div>

        {/* Logo for Mobile */}
        <div className="lg:hidden mb-12">
          <div className="w-10 h-10 bg-black dark:bg-white text-white dark:text-black rounded flex items-center justify-center">
            <Command size={20} strokeWidth={2} />
          </div>
        </div>

        <motion.div
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.4 }}
          className="w-full max-w-sm"
        >
          <div className="mb-8">
            <h2 className="text-2xl font-medium mb-2 font-display">Player Login</h2>
            <p className="text-zinc-500 dark:text-[#71717A] text-sm">Enter your credentials to enter the arena.</p>
          </div>

          {/* <form onSubmit={(e) => {
            e.preventDefault();
            e.stopPropagation();
            form.handleSubmit();
          }} className="space-y-4">

            <form.Field name="email">
              {(field) => (
                <div className="space-y-1">
                  <div className="relative-group">
                    <label htmlFor={field.name} className="text-xs font-mono uppercase text-zinc-500 dark:text-[#52525B] ml-1">Email / Gamer Tag</label>
                    <Input

                      id={field.name}
                      name={field.name}
                      type="email"
                      value={field.state.value}
                      onBlur={field.handleBlur}
                      onChange={(e) => field.handleChange(e.target.value)}
                    />
                    {field.state.meta.errors.map((error) => (
                      <p key={error?.message} className="text-red-500 text-sm">
                        {error?.message}
                      </p>
                    ))}

                  </div>
                </div>
              )}
            </form.Field>


            <div className="space-y-1">
              <form.Field name="password">
                {(field) => (
                  <div className="space-y-1">
                    <div className="relative-group">
                      <label htmlFor={field.name} className="text-xs font-mono uppercase text-zinc-500 dark:text-[#52525B] ml-1">Password</label>
                      <Input

                        id={field.name}
                        name={field.name}
                        type="password"
                        value={field.state.value}
                        onBlur={field.handleBlur}
                        onChange={(e) => field.handleChange(e.target.value)}
                      />
                      {field.state.meta.errors.map((error) => (
                        <p key={error?.message} className="text-red-500 text-sm">
                          {error?.message}
                        </p>
                      ))}

                    </div>
                  </div>
                )}
              </form.Field>
            </div>

            <form.Subscribe>
              {(state) => (

                <button
                  type="submit"
                  disabled={!state.canSubmit || state.isSubmitting}
                  className="w-full h-11 bg-black dark:bg-white text-white dark:text-black font-medium text-sm rounded-sm hover:opacity-80 transition-opacity flex items-center justify-center gap-2 mt-6 disabled:opacity-50 disabled:cursor-not-allowed shadow-md"
                >
                  {state.isSubmitting ? <span className="w-4 h-4 border-2 border-white/30 dark:border-black/30 border-t-white dark:border-t-black rounded-full animate-spin" /> : <span>Sync Profile</span>}
                </button>


              )}
            </form.Subscribe>

          </form> */}
          <SignIn afterSignOutUrl={"/"} signInUrl='/login' />

          <div className="mt-8 pt-8 border-t border-black/5 dark:border-white/5 text-center">
            <p className="text-zinc-500 dark:text-[#52525B] text-xs">
              New contender? <a href="#" className="text-black dark:text-white hover:underline">Register account</a>
            </p>
            <div className="mt-4 text-[10px] text-zinc-400 font-mono">
              Developed by dev-sandip
            </div>
          </div>
        </motion.div>
      </div>
    </div >
  );
}