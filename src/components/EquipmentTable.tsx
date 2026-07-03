import React, { useState } from 'react';
import { useStore } from '../store/useStore';
import { exportInstrumentsToExcel } from '../utils/excelExport';
import { 
  Search, 
  ArrowUpDown, 
  Download, 
  Eye, 
  Trash2, 
  X, 
  AlertTriangle,
  Sliders,
  Calendar,
  Cpu
} from 'lucide-react';
import { 
  ResponsiveContainer, 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ReferenceLine,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar
} from 'recharts';

export const EquipmentTable: React.FC = () => {
  const { 
    instruments, 
    selectedInstrumentId, 
    filters, 
    sort, 
    setFilters, 
    resetFilters, 
    setSort, 
    setSelectedInstrumentId,
    deleteInstrument
  } = useStore();

  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // Selected instrument for the modal deep dive
  const selectedInstrument = instruments.find(i => i.id === selectedInstrumentId);

  // Handle filter changes
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFilters({ search: e.target.value });
    setCurrentPage(1);
  };

  const handleSelectChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFilters({ [name]: value });
    setCurrentPage(1);
  };

  // 1. Apply Filtering
  const filteredInstruments = instruments.filter((inst) => {
    const matchesSearch = 
      inst.name.toLowerCase().includes(filters.search.toLowerCase()) ||
      inst.serialNumber.toLowerCase().includes(filters.search.toLowerCase()) ||
      inst.id.toLowerCase().includes(filters.search.toLowerCase());
      
    const matchesType = !filters.type || inst.type === filters.type;
    const matchesRisk = !filters.riskClass || inst.prediction.riskClass === filters.riskClass;
    
    // Status Logic
    // optimized: recommendedInterval > currentInterval
    // under_review: recommendedInterval < currentInterval
    // overdue: riskClass === CRITIQUE
    let matchesStatus = true;
    if (filters.status === 'optimized') {
      matchesStatus = inst.prediction.recommendedInterval > inst.currentInterval;
    } else if (filters.status === 'under_review') {
      matchesStatus = inst.prediction.recommendedInterval < inst.currentInterval;
    } else if (filters.status === 'overdue') {
      matchesStatus = inst.prediction.riskClass === 'CRITIQUE';
    }

    return matchesSearch && matchesType && matchesRisk && matchesStatus;
  });

  // 2. Apply Sorting
  const sortedInstruments = [...filteredInstruments].sort((a, b) => {
    const field = sort.field;
    const isAsc = sort.order === 'asc';

    let valA: any;
    let valB: any;

    if (field === 'id') {
      valA = a.id;
      valB = b.id;
    } else if (field === 'name') {
      valA = a.name;
      valB = b.name;
    } else if (field === 'type') {
      valA = a.type;
      valB = b.type;
    } else if (field === 'currentInterval') {
      valA = a.currentInterval;
      valB = b.currentInterval;
    } else if (field === 'recommendedInterval') {
      valA = a.prediction.recommendedInterval;
      valB = b.prediction.recommendedInterval;
    } else if (field === 'riskClass') {
      const riskRank = { FAIBLE: 1, MODÉRÉ: 2, ÉLEVÉ: 3, CRITIQUE: 4 };
      valA = riskRank[a.prediction.riskClass];
      valB = riskRank[b.prediction.riskClass];
    } else if (field === 'gain') {
      valA = a.prediction.estimatedSavings;
      valB = b.prediction.estimatedSavings;
    } else {
      valA = a.id;
      valB = b.id;
    }

    if (valA < valB) return isAsc ? -1 : 1;
    if (valA > valB) return isAsc ? 1 : -1;
    return 0;
  });

  // 3. Apply Pagination
  const totalItems = sortedInstruments.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage);
  const paginatedInstruments = sortedInstruments.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  // Dynamic instrument drift generator (Shewhart control chart data for the selected modal item)
  const getSelectedInstrumentDriftData = () => {
    if (!selectedInstrument) return { points: [], ucl: 10, lcl: 0, mean: 5 };
    
    const serial = selectedInstrument.serialNumber;
    const maxDrift = selectedInstrument.driftRate;
    const points = [];
    const seed = serial.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
    
    // UCL is tolerance, drift rate is what we achieved
    // Let's set UCL as a multiplier of the drift or a percentage
    const ucl = parseFloat(Math.max(10, maxDrift * 1.3).toFixed(1));
    const lcl = 0;
    const mean = parseFloat((maxDrift * 0.45).toFixed(1));

    for (let i = 1; i <= 24; i++) {
      const ratio = i / 24;
      // Synthesize trend with some wavy noise
      const wave = Math.sin((i + seed) * 0.6) * (maxDrift * 0.08);
      const randOffset = ((i * seed) % 7) * 0.02 * maxDrift;
      const driftVal = parseFloat((ratio * maxDrift + wave + randOffset).toFixed(2));
      const finalDrift = Math.max(0, Math.min(25, driftVal));

      const monthNum = ((i + 3) % 12) + 1;
      const yearOffset = Math.floor((i + 3) / 12);
      
      points.push({
        pt: i,
        date: `${monthNum.toString().padStart(2, '0')}/${24 + yearOffset}`,
        drift: finalDrift,
        isAnomaly: finalDrift > ucl * 0.95
      });
    }

    return { points, ucl, lcl, mean };
  };

  const { points: modalDriftPoints, ucl: modalUcl, mean: modalMean } = getSelectedInstrumentDriftData();

  // Glass tooltip for modal
  const ModalChartTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="glass-panel p-2 rounded border border-white/10 text-[10px]">
          <p className="font-bold text-white mb-0.5">{label}</p>
          <p className="text-orange-metro">Dérive : <span className="font-mono font-bold">{payload[0].value} %</span></p>
        </div>
      );
    }
    return null;
  };

  return (
    <section id="table-section" className="mx-auto max-w-7xl px-4 py-16 scroll-mt-16">
      
      {/* Search & Filter Header Card */}
      <div className="glass-panel rounded-t-xl border-b-0 border-white/5 p-6 shadow-xl relative overflow-hidden">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h3 className="font-display text-xl font-bold text-white">Inventaire Général des Équipements</h3>
            <p className="text-xs text-white/50 mt-1">Gérez et filtrez les périodicités optimisées du parc complet.</p>
          </div>
          <div className="flex flex-wrap gap-2.5">
            {/* Reset Filters button */}
            {(filters.search || filters.type || filters.riskClass || filters.status) && (
              <button
                onClick={resetFilters}
                className="text-xs text-white/40 hover:text-white border border-white/10 hover:bg-white/5 px-3 py-2 rounded-lg transition-colors cursor-pointer"
              >
                Réinitialiser
              </button>
            )}
            
            {/* Excel Export Button */}
            <button
              onClick={() => exportInstrumentsToExcel(filteredInstruments)}
              className="inline-flex items-center gap-1.5 rounded-lg bg-risk-green/20 border border-risk-green/30 text-risk-green hover:bg-risk-green/30 px-3.5 py-2 text-xs font-semibold tracking-wider transition-all cursor-pointer glow-cyan-hover"
            >
              <Download className="h-4 w-4" />
              <span>Exporter Excel</span>
            </button>
          </div>
        </div>

        {/* Filters Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-6">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-white/40" />
            <input
              type="text"
              name="search"
              placeholder="Rechercher (Désignation, S/N...)"
              value={filters.search}
              onChange={handleSearchChange}
              className="w-full pl-9 pr-3 py-2 rounded-lg bg-white/5 border border-white/10 text-xs text-white placeholder-white/30 focus:outline-none focus:border-accent-cyan"
            />
          </div>

          {/* Type Filter */}
          <div className="relative">
            <select
              name="type"
              value={filters.type}
              onChange={handleSelectChange}
              className="w-full px-3 py-2 rounded-lg bg-[#131929] border border-white/10 text-xs text-white focus:outline-none focus:border-accent-cyan"
            >
              <option value="">Tous les types</option>
              <option value="Thermomètre">Thermomètres</option>
              <option value="Manomètre">Manomètres</option>
              <option value="Pied à coulisse">Pieds à coulisse</option>
              <option value="Balance">Balances</option>
              <option value="Multimètre">Multimètres</option>
              <option value="Chronomètre">Chronomètres</option>
              <option value="Luxmètre">Luxmètres</option>
              <option value="Sonomètre">Sonomètres</option>
            </select>
          </div>

          {/* Risk Filter */}
          <div className="relative">
            <select
              name="riskClass"
              value={filters.riskClass}
              onChange={handleSelectChange}
              className="w-full px-3 py-2 rounded-lg bg-[#131929] border border-white/10 text-xs text-white focus:outline-none focus:border-accent-cyan"
            >
              <option value="">Tous les risques</option>
              <option value="FAIBLE">Risque FAIBLE</option>
              <option value="MODÉRÉ">Risque MODÉRÉ</option>
              <option value="ÉLEVÉ">Risque ÉLEVÉ</option>
              <option value="CRITIQUE">Risque CRITIQUE</option>
            </select>
          </div>

          {/* Status Filter */}
          <div className="relative">
            <select
              name="status"
              value={filters.status}
              onChange={handleSelectChange}
              className="w-full px-3 py-2 rounded-lg bg-[#131929] border border-white/10 text-xs text-white focus:outline-none focus:border-accent-cyan"
            >
              <option value="">Tous les statuts</option>
              <option value="optimized">📈 Optimisés (Intervalle +)</option>
              <option value="under_review">📉 Surveillance (Intervalle -)</option>
              <option value="overdue">🚨 Critique (Risque Max)</option>
            </select>
          </div>
        </div>
      </div>

      {/* Main Table Grid */}
      <div className="glass-panel border-t-0 rounded-b-xl overflow-x-auto shadow-xl">
        <table className="w-full border-collapse text-left min-w-[800px]">
          <thead>
            <tr className="border-b border-white/5 bg-white/2 text-[10px] uppercase font-bold text-white/50 tracking-wider">
              <th className="py-4 px-6 cursor-pointer hover:text-white transition-colors" onClick={() => setSort('id')}>
                ID {sort.field === 'id' && <ArrowUpDown className="h-3 w-3 inline ml-1" />}
              </th>
              <th className="py-4 px-6 cursor-pointer hover:text-white transition-colors" onClick={() => setSort('name')}>
                Désignation {sort.field === 'name' && <ArrowUpDown className="h-3 w-3 inline ml-1" />}
              </th>
              <th className="py-4 px-6 cursor-pointer hover:text-white transition-colors" onClick={() => setSort('type')}>
                Type {sort.field === 'type' && <ArrowUpDown className="h-3 w-3 inline ml-1" />}
              </th>
              <th className="py-4 px-6 cursor-pointer hover:text-white transition-colors" onClick={() => setSort('currentInterval')}>
                Périodicité Actuelle {sort.field === 'currentInterval' && <ArrowUpDown className="h-3 w-3 inline ml-1" />}
              </th>
              <th className="py-4 px-6 cursor-pointer hover:text-white transition-colors" onClick={() => setSort('recommendedInterval')}>
                Périodicité IA {sort.field === 'recommendedInterval' && <ArrowUpDown className="h-3 w-3 inline ml-1" />}
              </th>
              <th className="py-4 px-6 cursor-pointer hover:text-white transition-colors" onClick={() => setSort('gain')}>
                Gain / Risque {sort.field === 'gain' && <ArrowUpDown className="h-3 w-3 inline ml-1" />}
              </th>
              <th className="py-4 px-6 cursor-pointer hover:text-white transition-colors" onClick={() => setSort('riskClass')}>
                Classe de Risque {sort.field === 'riskClass' && <ArrowUpDown className="h-3 w-3 inline ml-1" />}
              </th>
              <th className="py-4 px-6 text-center">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5 text-xs text-white/80">
            {paginatedInstruments.length > 0 ? (
              paginatedInstruments.map((inst) => {
                const gain = inst.prediction.recommendedInterval - inst.currentInterval;
                return (
                  <tr key={inst.id} className="hover:bg-white/2 transition-colors">
                    <td className="py-4 px-6 font-mono font-bold text-accent-cyan">{inst.id}</td>
                    <td className="py-4 px-6 font-medium text-white">
                      <div>{inst.name}</div>
                      <div className="text-[10px] text-white/40 mt-0.5">{inst.serialNumber}</div>
                    </td>
                    <td className="py-4 px-6">{inst.type}</td>
                    <td className="py-4 px-6 font-mono">{inst.currentInterval} mois</td>
                    <td className="py-4 px-6 font-mono text-orange-metro font-bold">
                      {inst.prediction.recommendedInterval} mois
                    </td>
                    <td className="py-4 px-6 font-mono">
                      {gain > 0 ? (
                        <span className="text-risk-green font-bold">+{gain} mois (Gain)</span>
                      ) : gain < 0 ? (
                        <span className="text-risk-red font-bold">{gain} mois (Surveillance)</span>
                      ) : (
                        <span className="text-white/40">Stable</span>
                      )}
                    </td>
                    <td className="py-4 px-6">
                      <span className={`inline-flex rounded px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider ${
                        inst.prediction.riskClass === 'CRITIQUE'
                          ? 'bg-risk-red/20 text-risk-red border border-risk-red/30'
                          : inst.prediction.riskClass === 'ÉLEVÉ'
                          ? 'bg-orange-metro/20 text-orange-metro border border-orange-metro/30'
                          : inst.prediction.riskClass === 'MODÉRÉ'
                          ? 'bg-risk-amber/20 text-risk-amber border border-risk-amber/30'
                          : 'bg-risk-green/20 text-risk-green border border-risk-green/30'
                      }`}>
                        {inst.prediction.riskClass}
                      </span>
                    </td>
                    <td className="py-4 px-6 text-center">
                      <div className="flex justify-center items-center gap-2">
                        <button
                          onClick={() => setSelectedInstrumentId(inst.id)}
                          className="p-1.5 rounded bg-white/5 border border-white/10 hover:bg-white/10 hover:border-white/20 text-white/80 hover:text-white transition-all cursor-pointer"
                          title="Voir Détails"
                        >
                          <Eye className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => {
                            if (confirm(`Confirmez-vous la suppression de l'équipement ${inst.id} ?`)) {
                              deleteInstrument(inst.id);
                            }
                          }}
                          className="p-1.5 rounded bg-risk-red/10 border border-risk-red/20 hover:bg-risk-red/20 hover:border-risk-red/30 text-risk-red/80 hover:text-risk-red transition-all cursor-pointer"
                          title="Supprimer"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })
            ) : (
              <tr>
                <td colSpan={8} className="py-8 px-6 text-center text-white/40">
                  <AlertTriangle className="h-5 w-5 mx-auto text-risk-amber mb-2" />
                  <span>Aucun équipement trouvé avec les filtres sélectionnés.</span>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination Controls */}
      {totalPages > 1 && (
        <div className="mt-4 flex justify-between items-center text-xs text-white/50 px-2">
          <span>
            Affichage de {Math.min(totalItems, (currentPage - 1) * itemsPerPage + 1)} à {Math.min(totalItems, currentPage * itemsPerPage)} sur {totalItems} équipements
          </span>
          <div className="flex gap-1.5">
            <button
              onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
              disabled={currentPage === 1}
              className="px-2.5 py-1.5 rounded border border-white/10 bg-white/2 hover:bg-white/5 disabled:opacity-30 disabled:pointer-events-none transition-colors cursor-pointer"
            >
              Précédent
            </button>
            {Array.from({ length: totalPages }, (_, idx) => idx + 1).map((pg) => (
              <button
                key={pg}
                onClick={() => setCurrentPage(pg)}
                className={`w-8 h-8 rounded border transition-colors cursor-pointer ${
                  currentPage === pg
                    ? 'bg-orange-metro text-white border-orange-metro'
                    : 'border-white/10 bg-white/2 hover:bg-white/5 text-white/70'
                }`}
              >
                {pg}
              </button>
            ))}
            <button
              onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
              disabled={currentPage === totalPages}
              className="px-2.5 py-1.5 rounded border border-white/10 bg-white/2 hover:bg-white/5 disabled:opacity-30 disabled:pointer-events-none transition-colors cursor-pointer"
            >
              Suivant
            </button>
          </div>
        </div>
      )}

      {/* 4. DETAILS DEEP DIVE MODAL */}
      {selectedInstrument && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-bg-dark/80 backdrop-blur-sm p-4 animate-[fadeIn_0.2s_ease-out]">
          <div className="glass-modal w-full max-w-4xl rounded-2xl p-6 sm:p-8 shadow-2xl relative max-h-[90vh] overflow-y-auto">
            {/* Close Button */}
            <button
              onClick={() => setSelectedInstrumentId(null)}
              className="absolute right-4 top-4 p-1 rounded-lg border border-white/10 text-white/50 hover:text-white hover:bg-white/5 transition-all cursor-pointer"
            >
              <X className="h-5 w-5" />
            </button>

            {/* Modal Header */}
            <div className="border-b border-white/5 pb-4 mb-6">
              <span className="text-xs font-mono font-bold text-accent-cyan bg-accent-cyan/10 border border-accent-cyan/20 px-2 py-0.5 rounded">
                Détail Équipement IA
              </span>
              <h3 className="font-display text-2xl font-bold text-white mt-2">
                {selectedInstrument.name}
              </h3>
              <p className="text-xs text-white/40 font-mono mt-0.5">ID: {selectedInstrument.id} | S/N: {selectedInstrument.serialNumber}</p>
            </div>

            {/* Grid Layout */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              
              {/* Left Column: Properties Card */}
              <div className="space-y-4">
                {/* Metrological Specs Card */}
                <div className="p-4 rounded-xl bg-white/3 border border-white/5 space-y-2.5">
                  <h4 className="text-xs uppercase font-bold text-white/80 flex items-center gap-1.5 mb-3">
                    <Sliders className="h-4 w-4 text-orange-metro" /> Métrologie Physique
                  </h4>
                  <div className="flex justify-between text-xs border-b border-white/3 pb-1.5">
                    <span className="text-white/50">Type</span>
                    <span className="font-medium text-white">{selectedInstrument.type}</span>
                  </div>
                  <div className="flex justify-between text-xs border-b border-white/3 pb-1.5">
                    <span className="text-white/50">Fabricant</span>
                    <span className="font-medium text-white">{selectedInstrument.manufacturer}</span>
                  </div>
                  <div className="flex justify-between text-xs border-b border-white/3 pb-1.5">
                    <span className="text-white/50">Plage de mesure</span>
                    <span className="font-medium text-white">{selectedInstrument.range}</span>
                  </div>
                  <div className="flex justify-between text-xs border-b border-white/3 pb-1.5">
                    <span className="text-white/50">Résolution</span>
                    <span className="font-medium text-white">{selectedInstrument.resolution}</span>
                  </div>
                  <div className="flex justify-between text-xs border-b border-white/3 pb-1.5">
                    <span className="text-white/50">Tolérance admise</span>
                    <span className="font-bold text-white">± {selectedInstrument.tolerance} {selectedInstrument.toleranceUnit}</span>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span className="text-white/50">Date mise en service</span>
                    <span className="font-medium text-white flex items-center gap-1">
                      <Calendar className="h-3.5 w-3.5 text-accent-cyan" /> {selectedInstrument.commissionDate}
                    </span>
                  </div>
                </div>

                {/* AI Rec Summary Card */}
                <div className="p-4 rounded-xl bg-white/3 border border-white/5 space-y-2.5">
                  <h4 className="text-xs uppercase font-bold text-white/80 flex items-center gap-1.5 mb-3">
                    <Cpu className="h-4 w-4 text-accent-cyan" /> Diagnostic IA
                  </h4>
                  <div className="flex justify-between text-xs border-b border-white/3 pb-1.5">
                    <span className="text-white/50">Intervalle Actuel</span>
                    <span className="font-mono text-white/70">{selectedInstrument.currentInterval} mois</span>
                  </div>
                  <div className="flex justify-between text-xs border-b border-white/3 pb-1.5 animate-pulse">
                    <span className="text-white/50">Intervalle Recommandé</span>
                    <span className="font-bold text-orange-metro font-mono">{selectedInstrument.prediction.recommendedInterval} mois</span>
                  </div>
                  <div className="flex justify-between text-xs border-b border-white/3 pb-1.5">
                    <span className="text-white/50">Indice de Confiance</span>
                    <span className="font-bold text-accent-cyan font-mono">{selectedInstrument.prediction.confidence}%</span>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span className="text-white/50">Classe de Risque</span>
                    <span className={`px-1.5 py-0.2 rounded text-[10px] font-bold uppercase tracking-wider ${
                      selectedInstrument.prediction.riskClass === 'CRITIQUE' ? 'bg-risk-red/20 text-risk-red' :
                      selectedInstrument.prediction.riskClass === 'ÉLEVÉ' ? 'bg-orange-metro/20 text-orange-metro' :
                      selectedInstrument.prediction.riskClass === 'MODÉRÉ' ? 'bg-risk-amber/20 text-risk-amber' :
                      'bg-risk-green/20 text-risk-green'
                    }`}>
                      {selectedInstrument.prediction.riskClass}
                    </span>
                  </div>
                </div>
              </div>

              {/* Middle and Right: Charts */}
              <div className="lg:col-span-2 space-y-6">
                {/* SHEWHART CHART FOR THIS INSTRUMENT */}
                <div className="p-4 rounded-xl bg-white/3 border border-white/5">
                  <h4 className="text-xs uppercase font-bold text-white/80 mb-3 flex justify-between items-center">
                    <span>Historique de Dérive Constatée (Style Shewhart)</span>
                    <span className="text-[10px] text-white/40">Derniers 24 mois</span>
                  </h4>
                  <div className="h-44 w-full text-xs">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={modalDriftPoints} margin={{ top: 5, right: 5, left: -25, bottom: 5 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.02)" />
                        <XAxis dataKey="date" stroke="rgba(255,255,255,0.3)" fontSize={8} tickLine={false} />
                        <YAxis stroke="rgba(255,255,255,0.3)" fontSize={8} tickLine={false} />
                        <Tooltip content={<ModalChartTooltip />} />
                        <ReferenceLine y={modalMean} stroke="rgba(255,255,255,0.15)" strokeDasharray="3 3" label={{ value: 'Moyenne', fill: 'rgba(255,255,255,0.3)', position: 'insideBottomLeft', fontSize: 7 }} />
                        <ReferenceLine y={modalUcl} stroke="#FF4D6D" strokeWidth={1} label={{ value: 'Limite Supérieure', fill: '#FF4D6D', position: 'insideTopLeft', fontSize: 7 }} />
                        <Line 
                          type="monotone" 
                          dataKey="drift" 
                          stroke="#FF6B35" 
                          strokeWidth={1.5}
                          dot={(props: any) => {
                            const { cx, cy, payload } = props;
                            if (payload.isAnomaly) {
                              return <circle cx={cx} cy={cy} r={4} fill="#FF4D6D" stroke="#0A0F1E" strokeWidth={1} key={`modal-dot-${payload.pt}`} />;
                            }
                            return <circle cx={cx} cy={cy} r={2} fill="#FF6B35" key={`modal-dot-${payload.pt}`} />;
                          }}
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                {/* LOCAL SHAP IMPORTANCE RADAR CHART FOR THIS INSTRUMENT */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  
                  {/* Local Radar */}
                  <div className="p-4 rounded-xl bg-white/3 border border-white/5 flex flex-col justify-between">
                    <h4 className="text-xs uppercase font-bold text-white/80 mb-2">Poids des Variables (SHAP)</h4>
                    <div className="h-40 w-full flex items-center justify-center">
                      <ResponsiveContainer width="100%" height="100%">
                        <RadarChart cx="50%" cy="50%" outerRadius="70%" data={selectedInstrument.prediction.featureImportances.slice(0, 5).map(f => ({
                          subject: f.label.split(' ')[0],
                          value: f.importance
                        }))}>
                          <PolarGrid stroke="rgba(255,255,255,0.05)" />
                          <PolarAngleAxis dataKey="subject" stroke="rgba(255,255,255,0.5)" fontSize={7} />
                          <PolarRadiusAxis domain={[0, 50]} tick={false} stroke="rgba(255,255,255,0.1)" />
                          <Radar name={selectedInstrument.name} dataKey="value" stroke="#00D4FF" fill="#00D4FF" fillOpacity={0.2} />
                        </RadarChart>
                      </ResponsiveContainer>
                    </div>
                  </div>

                  {/* SHAP List explanation */}
                  <div className="p-4 rounded-xl bg-white/3 border border-white/5 flex flex-col justify-between text-xs space-y-2">
                    <h4 className="text-xs uppercase font-bold text-white/80">Facteurs Déterminants</h4>
                    <div className="space-y-2 overflow-y-auto max-h-36 pr-1">
                      {selectedInstrument.prediction.featureImportances.slice(0, 3).map((feat, idx) => (
                        <div key={feat.feature} className="flex items-start gap-2">
                          <span className="w-5 h-5 rounded-full bg-accent-cyan/10 border border-accent-cyan/20 flex items-center justify-center text-[10px] font-bold text-accent-cyan shrink-0">
                            {idx + 1}
                          </span>
                          <div>
                            <div className="font-bold text-white flex justify-between gap-2">
                              <span>{feat.label}</span>
                              <span className="text-accent-cyan font-mono font-bold">{feat.importance}%</span>
                            </div>
                            <p className="text-[10px] text-white/40 leading-tight mt-0.5">
                              {feat.feature === 'driftRate' ? 'Le drift constaté est le paramètre prédominant dans l\'usure de l\'étalon.' :
                               feat.feature === 'complianceHistory' ? 'L\'historique de conformité indique une forte stabilité ou instabilité passée.' :
                               feat.feature === 'criticality' ? 'La criticité affecte directement les seuils de risque réglementaires.' :
                               feat.feature === 'useCondition' ? 'L\'environnement d\'usine sévère ou léger dégrade plus ou moins l\'étalonnage.' :
                               'Facteur ayant influencé de manière significative la recommandation finale.'}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                </div>

              </div>

            </div>

            {/* Modal Actions */}
            <div className="mt-8 pt-4 border-t border-white/5 flex justify-end gap-3">
              <button
                type="button"
                onClick={() => setSelectedInstrumentId(null)}
                className="rounded-lg bg-white/5 border border-white/10 hover:bg-white/10 px-5 py-2.5 text-xs font-semibold text-white transition-all cursor-pointer"
              >
                Fermer
              </button>
              
              <button
                type="button"
                onClick={() => {
                  setSelectedInstrumentId(null);
                  setTimeout(() => {
                    const wizardEl = document.getElementById('wizard');
                    if (wizardEl) {
                      wizardEl.scrollIntoView({ behavior: 'smooth' });
                    }
                  }, 100);
                  
                  // Load active item into wizard to allow tweaking inputs!
                  // It's a premium feature
                  const { updateWizardInputs, setWizardStep } = useStore.getState();
                  updateWizardInputs({ ...selectedInstrument });
                  setWizardStep(2);
                }}
                className="rounded-lg bg-orange-metro hover:scale-105 px-5 py-2.5 text-xs font-semibold text-white shadow-md shadow-orange-metro/20 transition-all cursor-pointer flex items-center gap-1"
              >
                <Sliders className="h-3.5 w-3.5" /> Ajuster Variables
              </button>
            </div>

          </div>
        </div>
      )}

    </section>
  );
};
export default EquipmentTable;
