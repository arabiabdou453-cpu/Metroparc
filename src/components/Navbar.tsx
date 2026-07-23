import { Cpu } from 'lucide-react';

export const Navbar: React.FC = () => {
  const scrollTo = (id: string) => {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b border-white/5 bg-bg-dark/70 backdrop-blur-md">
      <div className="mx-auto flex max-w-7xl h-16 items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Brand Logo */}
        <div className="flex items-center space-x-2 cursor-pointer" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
          <div className="relative flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-orange-metro to-accent-cyan p-0.5 shadow-[0_0_15px_rgba(255,107,53,0.3)]">
            <div className="flex h-full w-full items-center justify-center rounded-[6px] bg-bg-dark">
              <Cpu className="h-5 w-5 text-accent-cyan animate-pulse" />
            </div>
          </div>
          <span className="font-display text-xl font-bold tracking-wider">
            METRO<span className="text-orange-metro"> AI</span>
          </span>
        </div>

        {/* Links */}
        <nav className="hidden md:flex space-x-8">
          <button
            onClick={() => scrollTo('hero')}
            className="text-sm font-medium text-white/70 hover:text-white transition-colors cursor-pointer"
          >
            Accueil
          </button>
          <button
            onClick={() => scrollTo('wizard')}
            className="text-sm font-medium text-white/70 hover:text-white transition-colors cursor-pointer"
          >
            Analyser
          </button>
          <button
            onClick={() => scrollTo('dashboard')}
            className="text-sm font-medium text-white/70 hover:text-white transition-colors cursor-pointer"
          >
            Dashboard
          </button>
          <button
            onClick={() => scrollTo('table-section')}
            className="text-sm font-medium text-white/70 hover:text-white transition-colors cursor-pointer"
          >
            Parc d'instruments
          </button>
        </nav>

        {/* Actions */}
        <div className="flex items-center space-x-4">
          <button
            onClick={() => scrollTo('wizard')}
            className="relative hidden sm:inline-flex items-center justify-center rounded-lg bg-gradient-to-r from-orange-metro to-[#FF4D6D] px-4 py-2 text-xs font-semibold uppercase tracking-wider text-white shadow-lg shadow-orange-metro/20 transition-all hover:scale-105 hover:shadow-orange-metro/35 cursor-pointer"
          >
            <span>Optimiser Intervalle →</span>
          </button>
        </div>
      </div>
    </header>
  );
};
export default Navbar;
