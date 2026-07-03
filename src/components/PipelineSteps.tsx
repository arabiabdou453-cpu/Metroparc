import React from 'react';
import { Database, Sliders, Cpu, Award } from 'lucide-react';

export const PipelineSteps: React.FC = () => {
  const steps = [
    {
      num: '01',
      title: 'Collecte Données Équipement',
      desc: 'Saisie des caractéristiques de l\'instrument, historique de dérive et résultats d\'étalonnage passés.',
      icon: <Database className="h-6 w-6 text-accent-cyan" />
    },
    {
      num: '02',
      title: 'Extraction des Features',
      desc: 'Calcul automatique des scores environnementaux, ratios d\'incertitude et pondérations de criticité.',
      icon: <Sliders className="h-6 w-6 text-orange-metro" />
    },
    {
      num: '03',
      title: 'Inférence du Modèle',
      desc: 'Évaluation croisée via Random Forest et XGBoost entraînés sur plus de 50,000 étalons industriels.',
      icon: <Cpu className="h-6 w-6 text-accent-cyan" />
    },
    {
      num: '04',
      title: 'Optimisation FD X 07-014',
      desc: 'Calcul de la périodicité recommandée en mois, de l\'indice de confiance et de la classe de risque.',
      icon: <Award className="h-6 w-6 text-orange-metro" />
    }
  ];

  return (
    <section className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8 bg-gradient-to-b from-transparent to-[#080d19]/30 relative overflow-hidden">
      
      {/* Title */}
      <div className="text-center mb-16">
        <h2 className="font-display text-3xl font-bold tracking-tight text-white sm:text-4xl">
          Comment Fonctionne l'Algorithme ?
        </h2>
        <p className="mx-auto mt-4 max-w-xl text-sm text-white/60">
          Un pipeline d'apprentissage automatique de bout en bout qui transforme les relevés métrologiques bruts en intervalles d'étalonnage scientifiquement optimisés.
        </p>
      </div>

      {/* Steps layout */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 relative">
        {/* Connection line overlay for desktop */}
        <div className="hidden lg:block absolute top-[52px] left-[15%] right-[15%] h-[2px] bg-gradient-to-r from-accent-cyan via-orange-metro to-accent-cyan -z-10 opacity-20" />

        {steps.map((step, idx) => (
          <div 
            key={step.num}
            className="glass-panel p-6 rounded-2xl border border-white/5 relative flex flex-col justify-between hover:border-white/10 transition-all shadow-xl group hover:-translate-y-1"
          >
            <div className="absolute -top-3 -right-3 text-4xl font-extrabold font-display text-white/5 pointer-events-none group-hover:text-white/10 transition-all select-none">
              {step.num}
            </div>

            <div className="flex flex-col space-y-4">
              <div className="rounded-xl bg-white/5 w-12 h-12 flex items-center justify-center border border-white/10 relative shadow-inner group-hover:shadow-[0_0_15px_rgba(0,212,255,0.15)] transition-all">
                {step.icon}
              </div>
              
              <div>
                <h3 className="font-display text-base font-bold text-white tracking-wide">
                  {step.title}
                </h3>
                <p className="text-xs leading-relaxed text-white/50 mt-2">
                  {step.desc}
                </p>
              </div>
            </div>

            <div className="h-1 w-full bg-white/5 rounded-full overflow-hidden mt-6">
              <div 
                className={`h-full rounded-full bg-gradient-to-r ${
                  idx % 2 === 0 ? 'from-accent-cyan to-blue-primary' : 'from-orange-metro to-[#FF4D6D]'
                }`}
                style={{ width: '100%' }}
              />
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};
export default PipelineSteps;
