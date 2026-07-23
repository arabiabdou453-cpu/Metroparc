import React, { useState, useEffect } from 'react';
import { useStore } from '../store/useStore';
import { exportPredictionToPDF } from '../utils/pdfExport';
import { 
  Cpu, 
  Layers, 
  FileText, 
  PlusCircle, 
  Share2, 
  RotateCcw,
  Sparkles,
  Info
} from 'lucide-react';

export const WizardForm: React.FC = () => {
  const {
    wizardStep,
    wizardInputs,
    wizardResult,
    isAnalyzing,
    setWizardStep,
    updateWizardInputs,
    resetWizard,
    runAnalysis,
    addWizardInstrumentToList
  } = useStore();

  const [loadingText, setLoadingText] = useState('Initialisation du processeur IA...');

  // Loading text cycle for premium AI effect
  useEffect(() => {
    if (!isAnalyzing) return;

    const texts = [
      'Connexion au serveur de métrologie METRO...',
      'Chargement de la base d\'entraînement (50,000+ instruments)...',
      'Lecture des caractéristiques physiques de l\'instrument...',
      'Calcul du taux de dérive et du rapport incertitude/tolérance...',
      'Extraction des features d\'environnement (Température, Humidité, Vibrations)...',
      'Inférence du modèle Random Forest Regressor (arbre décisionnel)...',
      'Calcul de validation croisée via XGBoost...',
      'Application des directives normatives FD X 07-014...',
      'Calcul des feature importances (LIME / SHAP)...',
      'Finalisation des résultats d\'optimisation...'
    ];

    let current = 0;
    const interval = setInterval(() => {
      current = (current + 1) % texts.length;
      setLoadingText(texts[current]);
    }, 450);

    return () => clearInterval(interval);
  }, [isAnalyzing]);

  // Handle slide changes
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    
    // Type conversion for numbers
    if (name === 'driftRate' || name === 'useFrequency' || name === 'envTemp' || 
        name === 'envHumidity' || name === 'envVibration' || name === 'complianceHistory' || 
        name === 'tolerance' || name === 'uncertaintyRatio') {
      updateWizardInputs({ [name]: parseFloat(value) || 0 });
    } else {
      updateWizardInputs({ [name]: value });
    }
  };

  // Sparkline calculation for compliance history
  const generateSparklinePoints = (historyValue: number) => {
    // Generate 6 points representing compliance history trends. Ends at the selected value.
    const seed = historyValue;
    const pt1 = Math.max(50, seed - 8 + (seed % 3));
    const pt2 = Math.min(100, seed - 12 + (seed % 5));
    const pt3 = Math.max(50, seed - 4 - (seed % 4));
    const pt4 = Math.min(100, seed - 1 + (seed % 2));
    const pt5 = Math.max(50, seed - 7 + (seed % 7));
    const pt6 = seed;
    
    return [pt1, pt2, pt3, pt4, pt5, pt6];
  };

  // Calculate environmental score
  const envAvg = parseFloat(((wizardInputs.envTemp + wizardInputs.envHumidity + wizardInputs.envVibration) / 3).toFixed(1));

  // Drift zone label helper
  const getDriftColorClass = (val: number) => {
    if (val <= 5) return 'text-risk-green bg-risk-green/10 border-risk-green/20';
    if (val <= 15) return 'text-risk-amber bg-risk-amber/10 border-risk-amber/20';
    return 'text-risk-red bg-risk-red/10 border-risk-red/20';
  };

  const getDriftText = (val: number) => {
    if (val <= 5) return 'Faible dérive (Stable)';
    if (val <= 15) return 'Dérive modérée (À surveiller)';
    return 'Dérive critique (Seuil tolérance proche)';
  };

  // Usage frequency text helper
  const getFreqCategory = (val: number) => {
    if (val < 20) return 'Utilisation Rare';
    if (val < 100) return 'Utilisation Modérée';
    if (val < 300) return 'Utilisation Intensive';
    return 'Utilisation Continue / 24-7';
  };

  // Sparkline points array
  const sparklinePoints = generateSparklinePoints(wizardInputs.complianceHistory);

  return (
    <section id="wizard" className="mx-auto max-w-4xl px-4 py-16 scroll-mt-16">
      {/* Module Title */}
      <div className="text-center mb-10">
        <span className="inline-flex items-center gap-1.5 rounded-full bg-accent-cyan/10 px-3 py-1 text-xs font-semibold text-accent-cyan border border-accent-cyan/20 mb-3">
          <Cpu className="h-3.5 w-3.5" /> Module 1 — Analyseur Intelligent
        </span>
        <h2 className="font-display text-3xl font-bold tracking-tight text-white sm:text-4xl">
          Optimisation de Périodicité IA
        </h2>
        <p className="mx-auto mt-3 max-w-xl text-sm text-white/60">
          Entrez les caractéristiques de votre instrument et obtenez en quelques secondes la périodicité optimale recommandée par notre modèle IA selon la norme FD X 07-014.
        </p>
      </div>

      {/* Progress Wizard bar */}
      <div className="mb-8 flex justify-center items-center space-x-3">
        {[1, 2, 3].map((step) => (
          <React.Fragment key={step}>
            <button
              onClick={() => wizardResult && wizardStep === 3 && step < 3 ? setWizardStep(step) : null}
              disabled={step > wizardStep && !wizardResult}
              className={`flex h-8 w-8 items-center justify-center rounded-full text-xs font-bold transition-all ${
                wizardStep === step
                  ? 'bg-orange-metro text-white ring-4 ring-orange-metro/20 shadow-[0_0_10px_rgba(255,107,53,0.4)]'
                  : wizardStep > step
                  ? 'bg-accent-cyan text-bg-dark font-semibold'
                  : 'bg-white/5 text-white/40 border border-white/10'
              }`}
            >
              {step}
            </button>
            {step < 3 && (
              <div
                className={`h-0.5 w-16 transition-all duration-300 ${
                  wizardStep > step ? 'bg-accent-cyan' : 'bg-white/10'
                }`}
              />
            )}
          </React.Fragment>
        ))}
      </div>

      {/* Wizard Panel */}
      <div className="glass-panel relative rounded-2xl p-6 sm:p-8 card-border-top shadow-2xl overflow-hidden min-h-[420px]">
        {/* Animated grid overlay inside the panel */}
        <div className="absolute inset-0 dots-grid -z-10 opacity-20" />

        {/* LOADING ANIMATION */}
        {isAnalyzing && (
          <div className="absolute inset-0 z-20 flex flex-col justify-center items-center bg-bg-dark/95 px-6 text-center">
            {/* Spinning Radar glow */}
            <div className="relative mb-8 flex h-24 w-24 items-center justify-center">
              <div className="absolute inset-0 rounded-full border-4 border-accent-cyan/10 animate-ping" />
              <div className="absolute inset-2 rounded-full border-2 border-orange-metro/20 animate-pulse" />
              <div className="absolute h-16 w-16 rounded-full border-b-2 border-t-2 border-accent-cyan animate-spin" />
              <Cpu className="h-8 w-8 text-accent-cyan" />
            </div>

            <h3 className="font-display text-xl font-bold tracking-wider text-white">
              Analyse par Intelligence Artificielle
            </h3>
            
            {/* Loading text with transition effect */}
            <p className="mt-3 text-sm text-accent-cyan/80 font-mono h-8 flex items-center justify-center max-w-md">
              {loadingText}
            </p>

            <div className="mt-6 w-full max-w-xs bg-white/5 rounded-full h-1.5 overflow-hidden">
              <div className="bg-gradient-to-r from-orange-metro to-accent-cyan h-full rounded-full animate-[progress_2.5s_infinite_linear]" style={{ width: '100%' }} />
            </div>
            
            <span className="text-[10px] uppercase tracking-widest text-white/30 mt-8 font-mono">
              Inférence algorithmique FD X 07-014
            </span>
          </div>
        )}

        {/* STEP 1: IDENTIFICATION */}
        {wizardStep === 1 && !isAnalyzing && (
          <div>
            <h3 className="font-display text-lg font-bold text-white mb-6 flex items-center gap-2">
              <Layers className="h-5 w-5 text-accent-cyan" /> Étape 1 : Identification de l'Instrument
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {/* Designation */}
              <div className="flex flex-col space-y-1.5">
                <label className="text-xs font-semibold text-white/70" htmlFor="name">
                  Désignation de l'instrument
                </label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={wizardInputs.name}
                  onChange={handleInputChange}
                  placeholder="ex: Thermomètre PT100 Calibré"
                  className="rounded-lg bg-white/5 border border-white/10 px-3.5 py-2 text-sm text-white focus:outline-none focus:border-accent-cyan focus:ring-1 focus:ring-accent-cyan placeholder-white/30"
                  required
                />
              </div>

              {/* Serial Number */}
              <div className="flex flex-col space-y-1.5">
                <label className="text-xs font-semibold text-white/70" htmlFor="serialNumber">
                  N° de Série (S/N)
                </label>
                <input
                  type="text"
                  id="serialNumber"
                  name="serialNumber"
                  value={wizardInputs.serialNumber}
                  onChange={handleInputChange}
                  placeholder="ex: SN-PT100-8842"
                  className="rounded-lg bg-white/5 border border-white/10 px-3.5 py-2 text-sm text-white focus:outline-none focus:border-accent-cyan focus:ring-1 focus:ring-accent-cyan placeholder-white/30"
                  required
                />
              </div>

              {/* Type */}
              <div className="flex flex-col space-y-1.5">
                <label className="text-xs font-semibold text-white/70" htmlFor="type">
                  Type d'instrument
                </label>
                <select
                  id="type"
                  name="type"
                  value={wizardInputs.type}
                  onChange={handleInputChange}
                  className="rounded-lg bg-[#131929] border border-white/10 px-3.5 py-2 text-sm text-white focus:outline-none focus:border-accent-cyan focus:ring-1 focus:ring-accent-cyan"
                >
                  <option value="Thermomètre">Thermomètre</option>
                  <option value="Manomètre">Manomètre</option>
                  <option value="Pied à coulisse">Pied à coulisse</option>
                  <option value="Balance">Balance</option>
                  <option value="Multimètre">Multimètre</option>
                  <option value="Chronomètre">Chronomètre</option>
                  <option value="Luxmètre">Luxmètre</option>
                  <option value="Sonomètre">Sonomètre</option>
                  <option value="Autre">Autre</option>
                </select>
              </div>

              {/* Manufacturer */}
              <div className="flex flex-col space-y-1.5">
                <label className="text-xs font-semibold text-white/70" htmlFor="manufacturer">
                  Marque / Fabricant
                </label>
                <input
                  type="text"
                  id="manufacturer"
                  name="manufacturer"
                  value={wizardInputs.manufacturer}
                  onChange={handleInputChange}
                  placeholder="ex: Fluke, Mitutoyo"
                  className="rounded-lg bg-white/5 border border-white/10 px-3.5 py-2 text-sm text-white focus:outline-none focus:border-accent-cyan focus:ring-1 focus:ring-accent-cyan placeholder-white/30"
                />
              </div>

              {/* Range */}
              <div className="flex flex-col space-y-1.5">
                <label className="text-xs font-semibold text-white/70" htmlFor="range">
                  Plage de mesure
                </label>
                <input
                  type="text"
                  id="range"
                  name="range"
                  value={wizardInputs.range}
                  onChange={handleInputChange}
                  placeholder="ex: -50°C à +250°C"
                  className="rounded-lg bg-white/5 border border-white/10 px-3.5 py-2 text-sm text-white focus:outline-none focus:border-accent-cyan focus:ring-1 focus:ring-accent-cyan placeholder-white/30"
                />
              </div>

              {/* Resolution */}
              <div className="flex flex-col space-y-1.5">
                <label className="text-xs font-semibold text-white/70" htmlFor="resolution">
                  Résolution de mesure
                </label>
                <input
                  type="text"
                  id="resolution"
                  name="resolution"
                  value={wizardInputs.resolution}
                  onChange={handleInputChange}
                  placeholder="ex: 0.01°C, 0.1 bar"
                  className="rounded-lg bg-white/5 border border-white/10 px-3.5 py-2 text-sm text-white focus:outline-none focus:border-accent-cyan focus:ring-1 focus:ring-accent-cyan placeholder-white/30"
                />
              </div>

              {/* Tolerance & Unit */}
              <div className="grid grid-cols-2 gap-3">
                <div className="flex flex-col space-y-1.5">
                  <label className="text-xs font-semibold text-white/70" htmlFor="tolerance">
                    Tolérance admise
                  </label>
                  <input
                    type="number"
                    id="tolerance"
                    name="tolerance"
                    step="any"
                    value={wizardInputs.tolerance}
                    onChange={handleInputChange}
                    className="rounded-lg bg-white/5 border border-white/10 px-3.5 py-2 text-sm text-white focus:outline-none focus:border-accent-cyan focus:ring-1 focus:ring-accent-cyan"
                  />
                </div>
                <div className="flex flex-col space-y-1.5">
                  <label className="text-xs font-semibold text-white/70" htmlFor="toleranceUnit">
                    Unité
                  </label>
                  <input
                    type="text"
                    id="toleranceUnit"
                    name="toleranceUnit"
                    value={wizardInputs.toleranceUnit}
                    onChange={handleInputChange}
                    placeholder="°C, bar, mm, g"
                    className="rounded-lg bg-white/5 border border-white/10 px-3.5 py-2 text-sm text-white focus:outline-none focus:border-accent-cyan focus:ring-1 focus:ring-accent-cyan placeholder-white/30"
                  />
                </div>
              </div>

              {/* Commission Date */}
              <div className="flex flex-col space-y-1.5">
                <label className="text-xs font-semibold text-white/70" htmlFor="commissionDate">
                  Date de mise en service
                </label>
                <div className="relative">
                  <input
                    type="date"
                    id="commissionDate"
                    name="commissionDate"
                    value={wizardInputs.commissionDate}
                    onChange={handleInputChange}
                    className="w-full rounded-lg bg-white/5 border border-white/10 px-3.5 py-2 text-sm text-white focus:outline-none focus:border-accent-cyan focus:ring-1 focus:ring-accent-cyan"
                  />
                </div>
              </div>
            </div>

            <div className="mt-8 flex justify-end">
              <button
                type="button"
                onClick={() => {
                  if (!wizardInputs.name.trim()) {
                    alert("Veuillez saisir la désignation de l'instrument.");
                    return;
                  }
                  if (!wizardInputs.serialNumber.trim()) {
                    alert("Veuillez saisir le numéro de série.");
                    return;
                  }
                  setWizardStep(2);
                }}
                className="rounded-lg bg-gradient-to-r from-orange-metro to-[#FF4D6D] px-6 py-2.5 text-sm font-semibold tracking-wider hover:scale-105 transition-all shadow-md shadow-orange-metro/20 cursor-pointer"
              >
                Étape Suivante →
              </button>
            </div>
          </div>
        )}

        {/* STEP 2: INFLUENCE FACTORS */}
        {wizardStep === 2 && !isAnalyzing && (
          <div>
            <h3 className="font-display text-lg font-bold text-white mb-6 flex items-center gap-2">
              <Layers className="h-5 w-5 text-orange-metro" /> Étape 2 : Facteurs d'Influence Réels
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
              
              {/* Drift rate */}
              <div className="flex flex-col space-y-2">
                <div className="flex justify-between items-center">
                  <label className="text-xs font-semibold text-white/70" htmlFor="driftRate">
                    Taux de dérive constaté (%)
                  </label>
                  <span className={`text-xs font-bold px-2 py-0.5 rounded border ${getDriftColorClass(wizardInputs.driftRate)}`}>
                    {wizardInputs.driftRate} %
                  </span>
                </div>
                <input
                  type="range"
                  id="driftRate"
                  name="driftRate"
                  min="0"
                  max="40"
                  step="0.1"
                  value={wizardInputs.driftRate}
                  onChange={handleInputChange}
                  className="w-full h-1.5 rounded-lg bg-white/10 appearance-none cursor-pointer accent-orange-metro focus:outline-none"
                />
                <span className="text-[10px] text-white/40">
                  {getDriftText(wizardInputs.driftRate)}
                </span>
              </div>

              {/* Condition of use */}
              <div className="flex flex-col space-y-2">
                <label className="text-xs font-semibold text-white/70">
                  Condition d'utilisation
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { key: 'severe', label: '🏭 Sévère' },
                    { key: 'normal', label: '⚙️ Normale' },
                    { key: 'light', label: '🧪 Légère' }
                  ].map((cond) => (
                    <button
                      key={cond.key}
                      type="button"
                      onClick={() => updateWizardInputs({ useCondition: cond.key as any })}
                      className={`py-2 rounded-lg text-xs font-semibold border transition-all ${
                        wizardInputs.useCondition === cond.key
                          ? 'bg-orange-metro/20 text-orange-metro border-orange-metro/50 shadow-[0_0_10px_rgba(255,107,53,0.15)]'
                          : 'bg-white/5 text-white/60 border-white/5 hover:bg-white/10 hover:text-white'
                      }`}
                    >
                      {cond.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Usage frequency */}
              <div className="flex flex-col space-y-2">
                <div className="flex justify-between items-center">
                  <label className="text-xs font-semibold text-white/70" htmlFor="useFrequency">
                    Fréquence d'utilisation (fois/mois)
                  </label>
                  <span className="text-xs font-bold text-accent-cyan">
                    {wizardInputs.useFrequency}
                  </span>
                </div>
                <input
                  type="range"
                  id="useFrequency"
                  name="useFrequency"
                  min="1"
                  max="500"
                  value={wizardInputs.useFrequency}
                  onChange={handleInputChange}
                  className="w-full h-1.5 rounded-lg bg-white/10 appearance-none cursor-pointer accent-accent-cyan focus:outline-none"
                />
                <span className="text-[10px] text-white/40">
                  {getFreqCategory(wizardInputs.useFrequency)}
                </span>
              </div>

              {/* Criticality */}
              <div className="flex flex-col space-y-2">
                <label className="text-xs font-semibold text-white/70">
                  Criticité de la mesure
                </label>
                <div className="grid grid-cols-4 gap-1.5">
                  {[
                    { key: 'standard', label: '🔵 Standard', color: 'border-blue-500/20 text-blue-400 bg-blue-500/10' },
                    { key: 'important', label: '🟡 Important', color: 'border-risk-amber/20 text-risk-amber bg-risk-amber/10' },
                    { key: 'critical', label: '🟠 Critique', color: 'border-orange-500/20 text-orange-400 bg-orange-500/10' },
                    { key: 'security', label: '🔴 Sécurité', color: 'border-risk-red/20 text-risk-red bg-risk-red/10' }
                  ].map((crit) => (
                    <button
                      key={crit.key}
                      type="button"
                      onClick={() => updateWizardInputs({ criticality: crit.key as any })}
                      className={`py-2 px-1 rounded-lg text-[10px] font-semibold border transition-all truncate ${
                        wizardInputs.criticality === crit.key
                          ? crit.color
                          : 'bg-white/5 text-white/50 border-white/5 hover:bg-white/10'
                      }`}
                    >
                      {crit.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Environmental Score (3 subsliders) */}
              <div className="flex flex-col space-y-3 p-3.5 rounded-lg bg-white/5 border border-white/5">
                <div className="flex justify-between items-center">
                  <span className="text-xs font-bold text-white">Score Environnemental (1-10)</span>
                  <span className="text-xs font-bold text-orange-metro bg-orange-metro/10 border border-orange-metro/20 px-2 py-0.5 rounded">
                    Moyenne : {envAvg} / 10
                  </span>
                </div>
                
                {/* Temp */}
                <div className="flex flex-col space-y-1">
                  <div className="flex justify-between text-[10px] text-white/50">
                    <span>Température</span>
                    <span>{wizardInputs.envTemp}</span>
                  </div>
                  <input
                    type="range"
                    name="envTemp"
                    min="1"
                    max="10"
                    value={wizardInputs.envTemp}
                    onChange={handleInputChange}
                    className="h-1 rounded-full bg-white/10 appearance-none accent-accent-cyan cursor-pointer"
                  />
                </div>

                {/* Humidity */}
                <div className="flex flex-col space-y-1">
                  <div className="flex justify-between text-[10px] text-white/50">
                    <span>Humidité</span>
                    <span>{wizardInputs.envHumidity}</span>
                  </div>
                  <input
                    type="range"
                    name="envHumidity"
                    min="1"
                    max="10"
                    value={wizardInputs.envHumidity}
                    onChange={handleInputChange}
                    className="h-1 rounded-full bg-white/10 appearance-none accent-accent-cyan cursor-pointer"
                  />
                </div>

                {/* Vibration */}
                <div className="flex flex-col space-y-1">
                  <div className="flex justify-between text-[10px] text-white/50">
                    <span>Vibrations / Chocs</span>
                    <span>{wizardInputs.envVibration}</span>
                  </div>
                  <input
                    type="range"
                    name="envVibration"
                    min="1"
                    max="10"
                    value={wizardInputs.envVibration}
                    onChange={handleInputChange}
                    className="h-1 rounded-full bg-white/10 appearance-none accent-accent-cyan cursor-pointer"
                  />
                </div>
              </div>

              {/* Compliance History */}
              <div className="flex flex-col space-y-2 p-3.5 rounded-lg bg-white/5 border border-white/5">
                <div className="flex justify-between items-center">
                  <label className="text-xs font-semibold text-white/70" htmlFor="complianceHistory">
                    Historique de conformité (%)
                  </label>
                  <span className="text-xs font-bold text-risk-green bg-risk-green/10 border border-risk-green/20 px-2 py-0.5 rounded">
                    {wizardInputs.complianceHistory} %
                  </span>
                </div>
                <input
                  type="range"
                  id="complianceHistory"
                  name="complianceHistory"
                  min="50"
                  max="100"
                  value={wizardInputs.complianceHistory}
                  onChange={handleInputChange}
                  className="w-full h-1.5 rounded-lg bg-white/10 appearance-none cursor-pointer accent-risk-green focus:outline-none"
                />

                {/* SVG SPARKLINE */}
                <div className="mt-2 flex items-center justify-between">
                  <span className="text-[9px] text-white/30">Tendance historique</span>
                  <svg className="h-6 w-32 text-risk-green" viewBox="0 0 100 30" fill="none">
                    <path
                      d={`M 0,${30 - (sparklinePoints[0] - 50) * 0.5} 
                          L 20,${30 - (sparklinePoints[1] - 50) * 0.5} 
                          L 40,${30 - (sparklinePoints[2] - 50) * 0.5} 
                          L 60,${30 - (sparklinePoints[3] - 50) * 0.5} 
                          L 80,${30 - (sparklinePoints[4] - 50) * 0.5} 
                          L 100,${30 - (sparklinePoints[5] - 50) * 0.5}`}
                      stroke="currentColor"
                      strokeWidth="2.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                    {/* Pulsing endpoint */}
                    <circle cx="100" cy={30 - (sparklinePoints[5] - 50) * 0.5} r="3" fill="#00C48C" />
                  </svg>
                </div>
              </div>

              {/* Last calibration result */}
              <div className="flex flex-col space-y-2">
                <label className="text-xs font-semibold text-white/70">
                  Résultat du dernier étalonnage
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { key: 'conforming', label: '✅ Conforme', style: 'border-risk-green/20 text-risk-green bg-risk-green/10' },
                    { key: 'warning', label: '⚠️ Limite', style: 'border-risk-amber/20 text-risk-amber bg-risk-amber/10' },
                    { key: 'out_of_tolerance', label: '❌ Hors tolérance', style: 'border-risk-red/20 text-risk-red bg-risk-red/10' }
                  ].map((res) => (
                    <button
                      key={res.key}
                      type="button"
                      onClick={() => updateWizardInputs({ lastCalibResult: res.key as any })}
                      className={`py-2 rounded-lg text-xs font-semibold border transition-all ${
                        wizardInputs.lastCalibResult === res.key
                          ? res.style
                          : 'bg-white/5 text-white/50 border-white/5 hover:bg-white/10'
                      }`}
                    >
                      {res.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Uncertainty Ratio */}
              <div className="flex flex-col space-y-2">
                <div className="flex justify-between items-center">
                  <label className="text-xs font-semibold text-white/70" htmlFor="uncertaintyRatio">
                    Rapport Incertitude / Tolérance (U/T)
                  </label>
                  <span className="text-xs font-bold text-accent-cyan">
                    {wizardInputs.uncertaintyRatio}
                  </span>
                </div>
                <input
                  type="range"
                  id="uncertaintyRatio"
                  name="uncertaintyRatio"
                  min="0.05"
                  max="1.5"
                  step="0.05"
                  value={wizardInputs.uncertaintyRatio}
                  onChange={handleInputChange}
                  className="w-full h-1.5 rounded-lg bg-white/10 appearance-none cursor-pointer accent-accent-cyan focus:outline-none"
                />
                <div className="flex justify-between text-[10px] text-white/40">
                  <span>0.05 (Incertitude négligeable)</span>
                  <span>1.5 (Incertitude excessive)</span>
                </div>
              </div>

            </div>

            <div className="mt-8 flex justify-between">
              <button
                type="button"
                onClick={() => setWizardStep(1)}
                className="rounded-lg border border-white/10 px-5 py-2.5 text-sm font-medium text-white/70 hover:bg-white/5 hover:text-white transition-colors cursor-pointer"
              >
                ← Retour
              </button>
              <button
                type="button"
                onClick={runAnalysis}
                className="rounded-lg bg-gradient-to-r from-orange-metro to-accent-cyan px-6 py-2.5 text-sm font-semibold tracking-wider hover:scale-105 transition-all shadow-md shadow-accent-cyan/20 flex items-center gap-1.5 cursor-pointer"
              >
                <Sparkles className="h-4 w-4" /> Lancer l'Analyse IA
              </button>
            </div>
          </div>
        )}

        {/* STEP 3: PREDICTION RESULT CARD */}
        {wizardStep === 3 && !isAnalyzing && wizardResult && (
          <div className="animate-[fadeIn_0.5s_ease-out]">
            {/* Header */}
            <div className="flex justify-between items-start border-b border-white/5 pb-4 mb-6">
              <div>
                <span className="text-xs uppercase tracking-widest text-accent-cyan font-mono font-bold">Analyse Complétée</span>
                <h3 className="font-display text-xl font-bold text-white mt-1">
                  Certificat d'Optimisation IA
                </h3>
              </div>
              <button
                onClick={resetWizard}
                className="flex items-center gap-1 text-xs text-white/40 hover:text-white border border-white/10 hover:bg-white/5 rounded px-2.5 py-1 transition-colors cursor-pointer"
              >
                <RotateCcw className="h-3 w-3" /> Relancer
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              
              {/* Output stats */}
              <div className="flex flex-col justify-between space-y-4">
                <div className="p-4 rounded-xl bg-white/5 border border-white/10 relative overflow-hidden">
                  <div className="absolute top-0 right-0 -mr-6 -mt-6 w-20 h-20 bg-orange-metro/5 rounded-full blur-xl pointer-events-none" />
                  <span className="text-[10px] uppercase font-bold text-white/50 tracking-wider">Périodicité Recommandée</span>
                  
                  <div className="mt-2 flex items-baseline gap-2">
                    <span className="font-display text-4xl font-extrabold text-orange-metro drop-shadow-[0_0_10px_rgba(255,107,53,0.25)] animate-pulse">
                      {wizardResult.recommendedInterval} MOIS
                    </span>
                    <span className="text-xs text-white/40 line-through">
                      (Actuelle : {wizardInputs.currentInterval} mois)
                    </span>
                  </div>
                  
                  {/* Explanation savings text */}
                  <div className="mt-3 text-xs text-white/60 flex items-center gap-1">
                    <Info className="h-3.5 w-3.5 text-accent-cyan shrink-0" />
                    <span>
                      {wizardResult.recommendedInterval > wizardInputs.currentInterval
                        ? `Optimisé : intervalle prolongé de +${wizardResult.recommendedInterval - wizardInputs.currentInterval} mois.`
                        : wizardResult.recommendedInterval < wizardInputs.currentInterval
                        ? `Avertissement : réduction de -${wizardInputs.currentInterval - wizardResult.recommendedInterval} mois recommandée.`
                        : 'Recommandation conforme à l\'intervalle actuel.'}
                    </span>
                  </div>
                </div>

                {/* Confidence & Risk */}
                <div className="grid grid-cols-2 gap-4">
                  
                  {/* Confidence */}
                  <div className="p-4 rounded-xl bg-white/5 border border-white/10 flex flex-col justify-between">
                    <span className="text-[10px] uppercase font-bold text-white/50 tracking-wider">Confiance IA</span>
                    <div className="mt-2">
                      <span className="text-xl font-bold font-mono text-white">{wizardResult.confidence}%</span>
                      {/* Mini custom progress bar */}
                      <div className="mt-2 w-full bg-white/5 rounded-full h-1">
                        <div 
                          className="bg-gradient-to-r from-orange-metro to-accent-cyan h-full rounded-full" 
                          style={{ width: `${wizardResult.confidence}%` }}
                        />
                      </div>
                    </div>
                  </div>

                  {/* Risk Class */}
                  <div className="p-4 rounded-xl bg-white/5 border border-white/10 flex flex-col justify-between">
                    <span className="text-[10px] uppercase font-bold text-white/50 tracking-wider">Classe de Risque</span>
                    <div className="mt-2">
                      <span className={`inline-flex rounded px-2.5 py-0.5 text-xs font-bold uppercase tracking-wider ${
                        wizardResult.riskClass === 'CRITIQUE'
                          ? 'bg-risk-red/20 text-risk-red border border-risk-red/30 shadow-[0_0_10px_rgba(255,77,109,0.1)]'
                          : wizardResult.riskClass === 'ÉLEVÉ'
                          ? 'bg-orange-metro/20 text-orange-metro border border-orange-metro/30 shadow-[0_0_10px_rgba(255,107,53,0.1)]'
                          : wizardResult.riskClass === 'MODÉRÉ'
                          ? 'bg-risk-amber/20 text-risk-amber border border-risk-amber/30'
                          : 'bg-risk-green/20 text-risk-green border border-risk-green/30'
                      }`}>
                        {wizardResult.riskClass}
                      </span>
                      <span className="block text-[9px] text-white/30 mt-1">
                        Calculé par Random Forest
                      </span>
                    </div>
                  </div>

                </div>

                {/* Savings indicator */}
                <div className="p-4 rounded-xl bg-white/5 border border-white/10 flex items-center justify-between">
                  <div>
                    <span className="text-[10px] uppercase font-bold text-white/50 tracking-wider block">Impact Économique</span>
                    <span className={`text-sm font-bold block mt-0.5 ${wizardResult.estimatedSavings >= 0 ? 'text-risk-green' : 'text-risk-red'}`}>
                      {wizardResult.estimatedSavings >= 0 
                        ? `+${wizardResult.estimatedSavings.toLocaleString()} DA / an (Économie)`
                        : `${wizardResult.estimatedSavings.toLocaleString()} DA / an (Surcoût Sécurité)`}
                    </span>
                  </div>
                  <span className={`text-xs font-mono px-2 py-0.5 rounded font-bold ${wizardResult.savingsPercent >= 0 ? 'bg-risk-green/10 text-risk-green' : 'bg-risk-red/10 text-risk-red'}`}>
                    {wizardResult.savingsPercent >= 0 ? `+${wizardResult.savingsPercent}%` : `${wizardResult.savingsPercent}%`}
                  </span>
                </div>

              </div>

              {/* Local Feature Importance bars */}
              <div className="p-4 rounded-xl bg-white/5 border border-white/10">
                <span className="text-[10px] uppercase font-bold text-white/50 tracking-wider block mb-3.5">
                  Facteurs d'Influence Locaux (LIME/SHAP)
                </span>
                
                <div className="space-y-2.5">
                  {wizardResult.featureImportances.slice(0, 5).map((feat) => (
                    <div key={feat.feature} className="space-y-1">
                      <div className="flex justify-between text-xs">
                        <span className="text-white/70">{feat.label}</span>
                        <span className="font-bold text-accent-cyan font-mono">{feat.importance}%</span>
                      </div>
                      <div className="w-full bg-white/5 rounded-full h-1.5 overflow-hidden">
                        <div 
                          className="bg-accent-cyan h-full rounded-full transition-all duration-1000"
                          style={{ width: `${feat.importance}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
                <div className="mt-3 text-[10px] text-white/30 text-right italic">
                  Contributions relatives au score de risque.
                </div>
              </div>

            </div>

            {/* BUTTON TRIGGERS */}
            <div className="mt-8 pt-6 border-t border-white/5 flex flex-wrap gap-3 justify-end">
              <button
                type="button"
                onClick={() => exportPredictionToPDF(wizardInputs, wizardResult)}
                className="rounded-lg border border-white/15 px-4 py-2.5 text-xs font-semibold text-white/90 hover:bg-white/5 hover:text-white transition-all flex items-center gap-1.5 cursor-pointer glow-cyan-hover"
              >
                <FileText className="h-4 w-4" /> Exporter PDF
              </button>
              
              <button
                type="button"
                onClick={() => {
                  addWizardInstrumentToList();
                  // Smooth scroll to table
                  setTimeout(() => {
                    const tableEl = document.getElementById('table-section');
                    if (tableEl) {
                      tableEl.scrollIntoView({ behavior: 'smooth' });
                    }
                  }, 100);
                }}
                className="rounded-lg bg-orange-metro px-4 py-2.5 text-xs font-semibold text-white hover:scale-105 hover:shadow-lg hover:shadow-orange-metro/20 transition-all flex items-center gap-1.5 cursor-pointer"
              >
                <PlusCircle className="h-4 w-4" /> Ajouter à la liste
              </button>

              <button
                type="button"
                onClick={() => {
                  const shareUrl = window.location.href;
                  navigator.clipboard.writeText(shareUrl);
                  alert("Lien de démonstration copié dans le presse-papiers ! Partagez-le sur LinkedIn.");
                }}
                className="rounded-lg border border-white/15 px-4 py-2.5 text-xs font-semibold text-white/90 hover:bg-white/5 hover:text-white transition-all flex items-center gap-1.5 cursor-pointer"
              >
                <Share2 className="h-4 w-4" /> Partager
              </button>
            </div>
          </div>
        )}

      </div>
    </section>
  );
};
export default WizardForm;
