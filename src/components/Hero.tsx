import React from 'react';
import { Sparkles, ArrowRight, ShieldCheck, Database, BarChart } from 'lucide-react';

export const Hero: React.FC = () => {
  const scrollToWizard = () => {
    const el = document.getElementById('wizard');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <section id="hero" className="relative mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8 flex flex-col items-center justify-center text-center overflow-hidden min-h-[85vh]">
      {/* Decorative Blur Background Glows */}
      <div className="absolute top-1/4 left-1/4 -z-10 h-72 w-72 rounded-full bg-accent-cyan/10 blur-3xl animate-pulse-glow" />
      <div className="absolute top-1/3 right-1/4 -z-10 h-80 w-80 rounded-full bg-orange-metro/5 blur-3xl animate-pulse-glow" />

      {/* Hero Badge */}
      <div className="inline-flex items-center gap-1.5 rounded-full bg-white/5 border border-white/10 px-3.5 py-1.5 text-xs font-semibold text-white/90 shadow-md backdrop-blur-md mb-6 animate-[fadeInDown_0.6s_ease-out]">
        <Database className="h-3.5 w-3.5 text-accent-cyan" />
        <span>Modèle entraîné sur 50,000+ instruments industriels</span>
      </div>

      {/* Hero Title */}
      <h1 className="font-display text-4xl font-extrabold tracking-tight text-white sm:text-6xl max-w-4xl leading-tight animate-[fadeInUp_0.8s_ease-out]">
        Optimisez l'Intervalle de <br />
        <span className="text-gradient-dual">Confirmation Métrologique</span> par l'IA
      </h1>

      {/* Hero Subtitle */}
      <p className="mx-auto mt-6 max-w-2xl text-base sm:text-lg leading-relaxed text-white/60 animate-[fadeInUp_1s_ease-out]">
        Arrêtez les périodicités forfaitaires arbitraires. Adoptez une optimisation prédictive basée sur les données d'influence réelles, conforme aux normes <strong>ISO 17025</strong> et <strong>FD X 07-014</strong>.
      </p>

      {/* Action Buttons */}
      <div className="mt-10 flex flex-wrap justify-center gap-4 animate-[fadeInUp_1.2s_ease-out]">
        <button
          onClick={scrollToWizard}
          className="inline-flex items-center justify-center gap-2 rounded-lg bg-gradient-to-r from-orange-metro to-[#FF4D6D] px-6 py-3.5 text-sm font-semibold uppercase tracking-wider text-white shadow-xl shadow-orange-metro/20 hover:scale-105 hover:shadow-orange-metro/35 transition-all cursor-pointer"
        >
          <span>Analyser un équipement</span>
          <ArrowRight className="h-4 w-4" />
        </button>
        
        <button
          onClick={() => document.getElementById('dashboard')?.scrollIntoView({ behavior: 'smooth' })}
          className="inline-flex items-center justify-center gap-2 rounded-lg border border-white/15 bg-white/5 backdrop-blur-md px-6 py-3.5 text-sm font-semibold uppercase tracking-wider text-white hover:bg-white/10 hover:border-white/25 transition-all cursor-pointer"
        >
          <span>Voir le Dashboard</span>
        </button>
      </div>

      {/* Floating Performance Cards */}
      <div className="mt-20 w-full max-w-4xl grid grid-cols-1 sm:grid-cols-3 gap-6 animate-[fadeInUp_1.4s_ease-out]">
        {/* Card 1 */}
        <div className="glass-panel-glow p-5 rounded-xl border border-white/10 flex flex-col items-center justify-center relative shadow-2xl">
          <div className="absolute top-0 right-0 mr-4 mt-4 text-[9px] font-mono text-accent-cyan font-bold uppercase tracking-widest">RF Regressor</div>
          <span className="text-3xl font-extrabold font-display text-white">94.7 %</span>
          <span className="text-xs text-white/50 mt-1 flex items-center gap-1">
            <ShieldCheck className="h-3.5 w-3.5 text-risk-green" /> Précision Globale (R²)
          </span>
        </div>

        {/* Card 2 */}
        <div className="glass-panel-glow p-5 rounded-xl border border-white/10 flex flex-col items-center justify-center relative shadow-2xl">
          <div className="absolute top-0 right-0 mr-4 mt-4 text-[9px] font-mono text-orange-metro font-bold uppercase tracking-widest">Cross-Val</div>
          <span className="text-3xl font-extrabold font-display text-white">0.91</span>
          <span className="text-xs text-white/50 mt-1 flex items-center gap-1">
            <BarChart className="h-3.5 w-3.5 text-accent-cyan" /> Coefficient R² Moyen
          </span>
        </div>

        {/* Card 3 */}
        <div className="glass-panel-glow p-5 rounded-xl border border-white/10 flex flex-col items-center justify-center relative shadow-2xl">
          <div className="absolute top-0 right-0 mr-4 mt-4 text-[9px] font-mono text-white/30 font-bold uppercase tracking-widest">Optimisation</div>
          <span className="text-3xl font-extrabold font-display text-white">1.2 mois</span>
          <span className="text-xs text-white/50 mt-1 flex items-center gap-1">
            <Sparkles className="h-3.5 w-3.5 text-orange-metro" /> Erreur RMSE Modèle
          </span>
        </div>
      </div>
    </section>
  );
};
export default Hero;
