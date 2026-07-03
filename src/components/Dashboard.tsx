import React from 'react';
import { useStore } from '../store/useStore';
import { 
  ResponsiveContainer, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  LineChart, 
  Line, 
  ReferenceLine, 
  ScatterChart, 
  Scatter, 
  ZAxis, 
  RadarChart, 
  PolarGrid, 
  PolarAngleAxis, 
  PolarRadiusAxis, 
  Radar, 
  AreaChart, 
  Area 
} from 'recharts';
import { 
  Activity, 
  TrendingDown, 
  ShieldAlert, 
  CheckCircle2, 
  BarChart3, 
  ArrowUpRight 
} from 'lucide-react';
import { GLOBAL_FEATURE_IMPORTANCE } from '../utils/mlSimulator';

export const Dashboard: React.FC = () => {
  const { instruments } = useStore();

  // 1. Calculate KPI Metrics
  const totalCount = instruments.length;
  
  // High risk or critical count
  const highRiskCount = instruments.filter(
    inst => inst.prediction.riskClass === 'ÉLEVÉ' || inst.prediction.riskClass === 'CRITIQUE'
  ).length;

  // Average compliance rate
  const avgCompliance = parseFloat(
    (instruments.reduce((acc, inst) => acc + inst.complianceHistory, 0) / totalCount).toFixed(1)
  );

  // Economic savings calculation
  const totalSavings = instruments.reduce((acc, inst) => acc + inst.prediction.estimatedSavings, 0);
  
  // Percentage of savings: (Total Cost change / Initial Cost) * 100
  // Initial cost is based on currentInterval
  // Current cost = sum(12 / currentInterval * BASE_COST)
  const baseCost = 8000;
  const currentCost = instruments.reduce((acc, inst) => acc + (12 / inst.currentInterval) * baseCost, 0);
  const recCost = instruments.reduce((acc, inst) => acc + (12 / inst.prediction.recommendedInterval) * baseCost, 0);
  const savingsPercent = parseFloat(((currentCost - recCost) / currentCost * 100).toFixed(1));

  // 2. Chart 1 Data: Distribution of recommended intervals
  const intervalCounts = instruments.reduce((acc, inst) => {
    const months = inst.prediction.recommendedInterval;
    acc[months] = (acc[months] || 0) + 1;
    return acc;
  }, {} as Record<number, number>);

  const chart1Data = [3, 6, 9, 12, 18, 24].map((m) => ({
    name: `${m} m`,
    count: intervalCounts[m] || 0
  }));

  // 3. Chart 2 Data: Shewhart Control Chart (24 points for WIKA digital pressure gauge SN-MAND-3109)
  // Let's create a realistic drift control chart with 3-sigma limits
  const ucl = 15.0; // Upper Control Limit
  const mean = 5.0; // Mean
  const wikaDriftPoints = [
    { pt: 1, date: '07/24', drift: 1.5, isAnomaly: false },
    { pt: 2, date: '08/24', drift: 2.1, isAnomaly: false },
    { pt: 3, date: '09/24', drift: 1.8, isAnomaly: false },
    { pt: 4, date: '10/24', drift: 3.4, isAnomaly: false },
    { pt: 5, date: '11/24', drift: 3.0, isAnomaly: false },
    { pt: 6, date: '12/24', drift: 4.8, isAnomaly: false },
    { pt: 7, date: '01/25', drift: 5.2, isAnomaly: false },
    { pt: 8, date: '02/25', drift: 4.5, isAnomaly: false },
    { pt: 9, date: '03/25', drift: 6.1, isAnomaly: false },
    { pt: 10, date: '04/25', drift: 5.9, isAnomaly: false },
    { pt: 11, date: '05/25', drift: 7.2, isAnomaly: false },
    { pt: 12, date: '06/25', drift: 8.0, isAnomaly: false },
    { pt: 13, date: '07/25', drift: 7.5, isAnomaly: false },
    { pt: 14, date: '08/25', drift: 9.1, isAnomaly: false },
    { pt: 15, date: '09/25', drift: 8.8, isAnomaly: false },
    { pt: 16, date: '10/25', drift: 10.5, isAnomaly: false },
    { pt: 17, date: '11/25', drift: 11.0, isAnomaly: false },
    { pt: 18, date: '12/25', drift: 12.8, isAnomaly: false }, // WIKA last calibration point
    { pt: 19, date: '01/26', drift: 11.9, isAnomaly: false },
    { pt: 20, date: '02/26', drift: 13.5, isAnomaly: false },
    { pt: 21, date: '03/26', drift: 14.8, isAnomaly: false },
    { pt: 22, date: '04/26', drift: 15.6, isAnomaly: true }, // Out of bounds
    { pt: 23, date: '05/26', drift: 16.2, isAnomaly: true }, // Out of bounds
    { pt: 24, date: '06/26', drift: 17.5, isAnomaly: true }  // Out of bounds
  ];

  // 4. Chart 4 Data: Risk Matrix (Scatter Plot)
  const chart4Data = instruments.map((inst) => {
    // Map criticality to size
    let size = 30;
    if (inst.criticality === 'important') size = 60;
    else if (inst.criticality === 'critical') size = 100;
    else if (inst.criticality === 'security') size = 150;

    return {
      x: inst.useFrequency,
      y: inst.driftRate,
      z: size,
      name: inst.name,
      sn: inst.serialNumber,
      risk: inst.prediction.riskClass
    };
  });

  // 5. Chart 5 Data: Model Comparison (Radar)
  // Metrics normalized 0-100 where higher = better
  const chart5Data = [
    { subject: 'Précision', rf: 94.7, xgb: 93.2 },
    { subject: 'Rappel', rf: 93.8, xgb: 92.5 },
    { subject: 'F1-Score', rf: 94.2, xgb: 92.8 },
    { subject: 'R²', rf: 91.2, xgb: 89.5 },
    { subject: 'Résilience RMSE', rf: 88.2, xgb: 87.5 }, // 100 - RMSE*10
    { subject: 'Vitesse Inférence', rf: 88.0, xgb: 96.0 } // 100 - timeMs
  ];

  // 6. Chart 6 Data: Timeline of upcoming calibrations (Mock Gantt for top 5 instruments)
  // We list 5 instruments and horizontal bars representing current interval vs recommended
  const top5Instruments = instruments.slice(0, 5);
  const chart6Data = top5Instruments.map((inst) => ({
    name: inst.name.split(' ')[0] + ' (' + inst.id + ')',
    'Intervalle Actuel': inst.currentInterval,
    'Intervalle Rec. IA': inst.prediction.recommendedInterval
  }));

  // 7. Chart 7 Data: Cumulative Savings (Area Chart over 12 months)
  const monthlyIncrement = totalSavings / 12;
  const chart7Data = Array.from({ length: 12 }, (_, i) => {
    const month = i + 1;
    const value = Math.round(month * monthlyIncrement);
    return {
      name: `Mois ${month}`,
      'Économies': value >= 0 ? value : 0,
      'Surcoût requis': value < 0 ? Math.abs(value) : 0
    };
  });

  // Custom tooltips
  const GlassTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="glass-panel p-3 rounded-lg border border-white/10 text-xs shadow-xl backdrop-blur-md">
          <p className="font-bold text-white mb-1">{label}</p>
          {payload.map((pld: any) => (
            <p key={pld.name} className="flex justify-between gap-4" style={{ color: pld.color || pld.fill }}>
              <span>{pld.name} :</span>
              <span className="font-mono font-bold">{pld.value.toLocaleString()}</span>
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  const ScatterTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="glass-panel p-3 rounded-lg border border-white/10 text-xs shadow-xl backdrop-blur-md max-w-xs">
          <p className="font-bold text-white mb-0.5">{data.name}</p>
          <p className="text-white/40 mb-1.5 font-mono">{data.sn}</p>
          <p className="text-white/80">Fréquence : <span className="font-bold text-white font-mono">{data.x} u/m</span></p>
          <p className="text-white/80">Dérive : <span className="font-bold text-white font-mono">{data.y} %</span></p>
          <p className="text-white/80 flex items-center gap-1.5 mt-1">
            Risque : 
            <span className={`px-1.5 py-0.2 rounded text-[10px] font-bold ${
              data.risk === 'CRITIQUE' ? 'bg-risk-red/20 text-risk-red' :
              data.risk === 'ÉLEVÉ' ? 'bg-orange-metro/20 text-orange-metro' :
              data.risk === 'MODÉRÉ' ? 'bg-risk-amber/20 text-risk-amber' :
              'bg-risk-green/20 text-risk-green'
            }`}>
              {data.risk}
            </span>
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <section id="dashboard" className="mx-auto max-w-7xl px-4 py-16 scroll-mt-16">
      
      {/* Module Title */}
      <div className="text-center mb-10">
        <span className="inline-flex items-center gap-1.5 rounded-full bg-orange-metro/10 px-3 py-1 text-xs font-semibold text-orange-metro border border-orange-metro/20 mb-3 animate-pulse">
          <BarChart3 className="h-3.5 w-3.5" /> Module 2 — Tableau de Bord Métrologique
        </span>
        <h2 className="font-display text-3xl font-bold tracking-tight text-white sm:text-4xl">
          Supervision et Analyse du Parc
        </h2>
        <p className="mx-auto mt-3 max-w-xl text-sm text-white/60">
          Vue d'ensemble de votre parc d'instruments — Analysé et optimisé par l'intelligence artificielle selon les exigences normatives FD X 07-014.
        </p>
      </div>

      {/* KPI Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        
        {/* KPI 1 */}
        <div className="glass-panel p-5 rounded-xl border border-white/5 flex items-center gap-4 relative overflow-hidden shadow-lg hover:border-white/10 transition-all">
          <div className="rounded-lg bg-blue-500/10 p-3 text-blue-400">
            <Activity className="h-6 w-6" />
          </div>
          <div>
            <span className="text-xs text-white/50 block font-medium">Instruments Analysés</span>
            <span className="text-2xl font-bold font-display block text-white mt-0.5">{totalCount}</span>
          </div>
        </div>

        {/* KPI 2 */}
        <div className="glass-panel p-5 rounded-xl border border-white/5 flex items-center gap-4 relative overflow-hidden shadow-lg hover:border-white/10 transition-all">
          <div className="rounded-lg bg-risk-green/10 p-3 text-risk-green">
            <TrendingDown className="h-6 w-6" />
          </div>
          <div>
            <span className="text-xs text-white/50 block font-medium">Économies sur Coût</span>
            <span className="text-2xl font-bold font-display block text-risk-green mt-0.5">
              {savingsPercent >= 0 ? `-${savingsPercent}%` : `+${Math.abs(savingsPercent)}%`}
            </span>
          </div>
        </div>

        {/* KPI 3 */}
        <div className="glass-panel p-5 rounded-xl border border-white/5 flex items-center gap-4 relative overflow-hidden shadow-lg hover:border-white/10 transition-all">
          <div className="rounded-lg bg-risk-red/10 p-3 text-risk-red">
            <ShieldAlert className="h-6 w-6" />
          </div>
          <div>
            <span className="text-xs text-white/50 block font-medium">Équipements à Risque</span>
            <span className="text-2xl font-bold font-display block text-risk-red mt-0.5">{highRiskCount}</span>
          </div>
        </div>

        {/* KPI 4 */}
        <div className="glass-panel p-5 rounded-xl border border-white/5 flex items-center gap-4 relative overflow-hidden shadow-lg hover:border-white/10 transition-all">
          <div className="rounded-lg bg-risk-amber/10 p-3 text-risk-amber">
            <CheckCircle2 className="h-6 w-6" />
          </div>
          <div>
            <span className="text-xs text-white/50 block font-medium">Conformité Moyenne</span>
            <span className="text-2xl font-bold font-display block text-white mt-0.5">{avgCompliance} %</span>
          </div>
        </div>

      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        
        {/* CHART 1: Distribution of Recommended Intervals */}
        <div className="glass-panel p-5 rounded-xl border border-white/5 shadow-lg flex flex-col justify-between min-h-[340px]">
          <div className="flex justify-between items-start mb-4">
            <h4 className="text-xs uppercase font-bold tracking-wider text-white/70">Distribution des Périodicités Recommandées</h4>
            <span className="text-[10px] bg-accent-cyan/10 text-accent-cyan px-1.5 py-0.5 rounded">IA</span>
          </div>
          <div className="h-60 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chart1Data} margin={{ top: 5, right: 5, left: -25, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.03)" />
                <XAxis dataKey="name" stroke="rgba(255,255,255,0.4)" fontSize={10} tickLine={false} />
                <YAxis stroke="rgba(255,255,255,0.4)" fontSize={10} tickLine={false} />
                <Tooltip content={<GlassTooltip />} cursor={{ fill: 'rgba(255,255,255,0.02)' }} />
                <Bar dataKey="count" name="Nombre d'instruments" fill="url(#blueGradient)" radius={[4, 4, 0, 0]}>
                  <defs>
                    <linearGradient id="blueGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#00D4FF" stopOpacity={0.8}/>
                      <stop offset="100%" stopColor="#1E3A5F" stopOpacity={0.2}/>
                    </linearGradient>
                  </defs>
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* CHART 2: Shewhart-style control chart */}
        <div className="glass-panel p-5 rounded-xl border border-white/5 shadow-lg flex flex-col justify-between min-h-[340px] lg:col-span-2">
          <div className="flex justify-between items-start mb-4">
            <div>
              <h4 className="text-xs uppercase font-bold tracking-wider text-white/70">Carte de Contrôle de Dérive (Style Shewhart)</h4>
              <span className="text-[10px] text-white/40 block mt-0.5">Suivi de dérive temporelle — Capteur de Pression (SN-MAND-3109)</span>
            </div>
            <span className="text-[10px] bg-risk-red/20 text-risk-red border border-risk-red/30 px-1.5 py-0.5 rounded font-bold animate-pulse">3 Anomalies</span>
          </div>
          <div className="h-60 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={wikaDriftPoints} margin={{ top: 5, right: 5, left: -25, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.03)" />
                <XAxis dataKey="date" stroke="rgba(255,255,255,0.4)" fontSize={10} tickLine={false} />
                <YAxis stroke="rgba(255,255,255,0.4)" fontSize={10} tickLine={false} domain={[0, 20]} />
                <Tooltip content={<GlassTooltip />} />
                <ReferenceLine y={mean} stroke="rgba(255, 255, 255, 0.2)" strokeDasharray="3 3" label={{ value: 'Moyenne (5.0%)', fill: 'rgba(255,255,255,0.4)', position: 'insideBottomLeft', fontSize: 8 }} />
                <ReferenceLine y={ucl} stroke="#FF4D6D" strokeWidth={1} label={{ value: 'LCS (15.0%)', fill: '#FF4D6D', position: 'insideTopLeft', fontSize: 8 }} />
                <Line 
                  type="monotone" 
                  dataKey="drift" 
                  name="Taux de dérive (%)" 
                  stroke="#FF6B35" 
                  strokeWidth={2}
                  dot={(props: any) => {
                    const { cx, cy, payload } = props;
                    if (payload.isAnomaly) {
                      return <circle cx={cx} cy={cy} r={5} fill="#FF4D6D" stroke="#0A0F1E" strokeWidth={1} key={`dot-${payload.pt}`} />;
                    }
                    return <circle cx={cx} cy={cy} r={3} fill="#FF6B35" key={`dot-${payload.pt}`} />;
                  }}
                  activeDot={{ r: 6 }} 
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* CHART 3: Global Feature Importance */}
        <div className="glass-panel p-5 rounded-xl border border-white/5 shadow-lg flex flex-col justify-between min-h-[340px]">
          <div className="flex justify-between items-start mb-4">
            <h4 className="text-xs uppercase font-bold tracking-wider text-white/70">Importance Globale des Variables</h4>
            <span className="text-[10px] text-white/40">RF & XGBoost</span>
          </div>
          <div className="h-60 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart 
                data={GLOBAL_FEATURE_IMPORTANCE.slice(0, 6)} 
                layout="vertical"
                margin={{ top: 5, right: 5, left: -10, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.03)" />
                <XAxis type="number" stroke="rgba(255,255,255,0.4)" fontSize={9} tickLine={false} />
                <YAxis dataKey="label" type="category" stroke="rgba(255,255,255,0.4)" fontSize={9} width={85} tickLine={false} />
                <Tooltip content={<GlassTooltip />} />
                <Bar dataKey="importance" name="Importance globale (%)" fill="url(#orangeGradient)" radius={[0, 4, 4, 0]}>
                  <defs>
                    <linearGradient id="orangeGradient" x1="0" y1="0" x2="1" y2="0">
                      <stop offset="0%" stopColor="#1E3A5F" stopOpacity={0.2}/>
                      <stop offset="100%" stopColor="#FF6B35" stopOpacity={0.8}/>
                    </linearGradient>
                  </defs>
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* CHART 4: Risk Matrix Scatter Plot */}
        <div className="glass-panel p-5 rounded-xl border border-white/5 shadow-lg flex flex-col justify-between min-h-[340px]">
          <div className="flex justify-between items-start mb-4">
            <h4 className="text-xs uppercase font-bold tracking-wider text-white/70">Matrice Fréquence vs Dérive</h4>
            <span className="text-[10px] text-white/40">Couleurs par Risque</span>
          </div>
          <div className="h-60 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <ScatterChart margin={{ top: 10, right: 10, left: -25, bottom: 5 }}>
                <CartesianGrid stroke="rgba(255,255,255,0.03)" />
                <XAxis type="number" dataKey="x" name="Fréquence" unit=" u/m" stroke="rgba(255,255,255,0.4)" fontSize={9} />
                <YAxis type="number" dataKey="y" name="Dérive" unit="%" stroke="rgba(255,255,255,0.4)" fontSize={9} />
                <ZAxis type="number" dataKey="z" range={[40, 180]} />
                <Tooltip content={<ScatterTooltip />} cursor={{ strokeDasharray: '3 3' }} />
                
                {/* Low Risk */}
                <Scatter 
                  name="Risque Faible/Modéré" 
                  data={chart4Data.filter(d => d.risk === 'FAIBLE' || d.risk === 'MODÉRÉ')} 
                  fill="#00C48C" 
                />
                {/* High/Critical Risk */}
                <Scatter 
                  name="Risque Élevé/Critique" 
                  data={chart4Data.filter(d => d.risk === 'ÉLEVÉ' || d.risk === 'CRITIQUE')} 
                  fill="#FF4D6D" 
                />
              </ScatterChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* CHART 5: Model Comparison Radar */}
        <div className="glass-panel p-5 rounded-xl border border-white/5 shadow-lg flex flex-col justify-between min-h-[340px]">
          <div className="flex justify-between items-start mb-4">
            <h4 className="text-xs uppercase font-bold tracking-wider text-white/70">Comparaison Random Forest vs XGBoost</h4>
            <span className="text-[10px] text-white/40">Radar normalisé</span>
          </div>
          <div className="h-60 w-full flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart cx="50%" cy="50%" outerRadius="70%" data={chart5Data}>
                <PolarGrid stroke="rgba(255,255,255,0.05)" />
                <PolarAngleAxis dataKey="subject" stroke="rgba(255,255,255,0.5)" fontSize={8} />
                <PolarRadiusAxis angle={30} domain={[0, 100]} stroke="rgba(255,255,255,0.1)" tick={false} />
                <Radar name="Random Forest" dataKey="rf" stroke="#00D4FF" fill="#00D4FF" fillOpacity={0.15} />
                <Radar name="XGBoost" dataKey="xgb" stroke="#FF6B35" fill="#FF6B35" fillOpacity={0.15} />
                <Tooltip content={<GlassTooltip />} />
                <Legend iconSize={8} wrapperStyle={{ fontSize: 9, paddingTop: 10 }} />
              </RadarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* CHART 6: Calibration Timeline */}
        <div className="glass-panel p-5 rounded-xl border border-white/5 shadow-lg flex flex-col justify-between min-h-[340px]">
          <div className="flex justify-between items-start mb-4">
            <h4 className="text-xs uppercase font-bold tracking-wider text-white/70">Périodicité : Actuelle vs Rec. IA</h4>
            <span className="text-[10px] text-white/40">Échantillon Top 5</span>
          </div>
          <div className="h-60 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart 
                data={chart6Data} 
                layout="vertical"
                margin={{ top: 5, right: 5, left: -5, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.03)" />
                <XAxis type="number" stroke="rgba(255,255,255,0.4)" fontSize={9} tickLine={false} />
                <YAxis dataKey="name" type="category" stroke="rgba(255,255,255,0.4)" fontSize={9} width={90} tickLine={false} />
                <Tooltip content={<GlassTooltip />} />
                <Bar dataKey="Intervalle Actuel" fill="rgba(255,255,255,0.15)" radius={[0, 4, 4, 0]} />
                <Bar dataKey="Intervalle Rec. IA" fill="#00D4FF" radius={[0, 4, 4, 0]} />
                <Legend iconSize={8} wrapperStyle={{ fontSize: 9 }} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* CHART 7: Cumulative Savings (Area Chart) */}
        <div className="glass-panel p-5 rounded-xl border border-white/5 shadow-lg flex flex-col justify-between min-h-[340px] md:col-span-2 lg:col-span-3">
          <div className="flex justify-between items-start mb-4">
            <div>
              <h4 className="text-xs uppercase font-bold tracking-wider text-white/70">Simulation des Économies Cumulées sur 12 Mois</h4>
              <span className="text-[10px] text-white/40 block mt-0.5">Calculé sur la base de la réduction de fréquence d'étalonnage globale</span>
            </div>
            <span className="text-xs font-mono font-bold text-risk-green flex items-center gap-1">
              Gain Total : +{totalSavings.toLocaleString()} DA / an <ArrowUpRight className="h-4 w-4" />
            </span>
          </div>
          <div className="h-60 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chart7Data} margin={{ top: 5, right: 5, left: -10, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.03)" />
                <XAxis dataKey="name" stroke="rgba(255,255,255,0.4)" fontSize={10} tickLine={false} />
                <YAxis stroke="rgba(255,255,255,0.4)" fontSize={10} tickLine={false} />
                <Tooltip content={<GlassTooltip />} />
                <Area 
                  type="monotone" 
                  dataKey="Économies" 
                  stroke="#00D4FF" 
                  fill="url(#cyanAreaGradient)" 
                  strokeWidth={2}
                >
                  <defs>
                    <linearGradient id="cyanAreaGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#00D4FF" stopOpacity={0.35}/>
                      <stop offset="100%" stopColor="#00D4FF" stopOpacity={0.0}/>
                    </linearGradient>
                  </defs>
                </Area>
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

      </div>
    </section>
  );
};
export default Dashboard;
