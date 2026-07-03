import React from 'react';
import { Database, BadgeCheck, Coins, Sliders } from 'lucide-react';

export const StatsGrid: React.FC = () => {
  return (
    <section className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8 border-y border-white/5 bg-[#090e19]/40 backdrop-blur-sm relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute inset-0 dots-grid -z-10 opacity-10" />

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        
        {/* Card 1 */}
        <div className="glass-panel p-6 rounded-xl border border-white/5 shadow-xl flex items-start gap-4 hover:border-white/10 hover:bg-white/5 transition-all">
          <div className="rounded-lg bg-orange-metro/10 p-3 text-orange-metro">
            <Database className="h-6 w-6" />
          </div>
          <div>
            <h4 className="text-2xl font-bold font-display text-white">50,000 +</h4>
            <p className="text-xs text-white/50 mt-1 font-medium">Instruments en base d'entraînement</p>
          </div>
        </div>

        {/* Card 2 */}
        <div className="glass-panel p-6 rounded-xl border border-white/5 shadow-xl flex items-start gap-4 hover:border-white/10 hover:bg-white/5 transition-all">
          <div className="rounded-lg bg-accent-cyan/10 p-3 text-accent-cyan">
            <BadgeCheck className="h-6 w-6" />
          </div>
          <div>
            <h4 className="text-2xl font-bold font-display text-white">94.7 %</h4>
            <p className="text-xs text-white/50 mt-1 font-medium">Précision vérifiée du modèle IA</p>
          </div>
        </div>

        {/* Card 3 */}
        <div className="glass-panel p-6 rounded-xl border border-white/5 shadow-xl flex items-start gap-4 hover:border-white/10 hover:bg-white/5 transition-all">
          <div className="rounded-lg bg-risk-green/10 p-3 text-risk-green">
            <Coins className="h-6 w-6" />
          </div>
          <div>
            <h4 className="text-2xl font-bold font-display text-white">-35 %</h4>
            <p className="text-xs text-white/50 mt-1 font-medium">Réduction moyenne des coûts</p>
          </div>
        </div>

        {/* Card 4 */}
        <div className="glass-panel p-6 rounded-xl border border-white/5 shadow-xl flex items-start gap-4 hover:border-white/10 hover:bg-white/5 transition-all">
          <div className="rounded-lg bg-blue-500/10 p-3 text-blue-400">
            <Sliders className="h-6 w-6" />
          </div>
          <div>
            <h4 className="text-2xl font-bold font-display text-white">10</h4>
            <p className="text-xs text-white/50 mt-1 font-medium">Facteurs d'influence analysés</p>
          </div>
        </div>

      </div>
    </section>
  );
};
export default StatsGrid;
