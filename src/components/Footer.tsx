import React from 'react';
import { Shield, Info, BookOpen } from 'lucide-react';

export const Footer: React.FC = () => {
  const shareUrl = encodeURIComponent(window.location.href);
  const shareTitle = encodeURIComponent("Optimisation de Périodicité d'Étalonnage par Machine Learning (FD X 07-014)");
  const linkedinShareLink = `https://www.linkedin.com/shareArticle?mini=true&url=${shareUrl}&title=${shareTitle}`;

  return (
    <footer className="w-full border-t border-white/5 bg-[#070b14] py-12 text-white/50">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
          {/* Col 1: Brand & Concept */}
          <div className="flex flex-col space-y-3">
            <span className="font-display text-lg font-bold text-white tracking-wider">
              METRO<span className="text-orange-metro">PARC</span>
            </span>
            <p className="text-sm leading-relaxed max-w-xs">
              Démonstrateur d'IA appliquée à la métrologie industrielle. Optimisation intelligente des intervalles de confirmation métrologique.
            </p>
          </div>

          {/* Col 2: Norms and references */}
          <div className="flex flex-col space-y-3">
            <h4 className="text-sm font-semibold uppercase tracking-wider text-white flex items-center gap-1.5">
              <Shield className="h-4 w-4 text-accent-cyan" /> Références Normatives
            </h4>
            <ul className="text-xs space-y-2">
              <li className="flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-accent-cyan" />
                <span><strong>ISO/IEC 17025:2017</strong> — Exigences générales de compétence des laboratoires d'étalonnage.</span>
              </li>
              <li className="flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-accent-cyan" />
                <span><strong>FD X 07-014</strong> — Optimisation des intervalles de confirmation métrologique.</span>
              </li>
              <li className="flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-accent-cyan" />
                <span><strong>GUM & VIM</strong> — Incertitudes de mesure & Vocabulaire International de Métrologie.</span>
              </li>
            </ul>
          </div>

          {/* Col 3: LinkedIn Action */}
          <div className="flex flex-col space-y-3">
            <h4 className="text-sm font-semibold uppercase tracking-wider text-white flex items-center gap-1.5">
              <BookOpen className="h-4 w-4 text-orange-metro" /> Partage & Innovation
            </h4>
            <p className="text-xs max-w-xs">
              Partagez cette démonstration technologique sur LinkedIn pour faire avancer le débat sur l'intégration du ML dans la métrologie 4.0.
            </p>
            <div className="pt-2">
              <a
                href={linkedinShareLink}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 rounded bg-[#0077b5] px-4 py-2 text-xs font-semibold text-white transition-transform hover:scale-105"
              >
                <svg className="h-4 w-4 fill-white" viewBox="0 0 24 24">
                  <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.779-1.75-1.75s.784-1.75 1.75-1.75 1.75.779 1.75 1.75-.784 1.75-1.75 1.75zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z"/>
                </svg>
                <span>Partager sur LinkedIn</span>
              </a>
            </div>
          </div>
        </div>

        <div className="border-t border-white/5 pt-6 flex flex-col sm:flex-row justify-between items-center text-xs gap-4">
          <p>© {new Date().getFullYear()} METRO. Conçu pour l'industrie 4.0.</p>
          <div className="flex items-center gap-1.5">
            <Info className="h-4 w-4 text-accent-cyan" />
            <span>Concept théorique basé sur des modèles simulés côté client.</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
export default Footer;
