import { create } from 'zustand';
import { INITIAL_INSTRUMENTS } from '../utils/initialData';
import type { MetrologyInstrument } from '../utils/initialData';
import { runMLSimulation } from '../utils/mlSimulator';
import type { InputFactors, SimulationResult } from '../utils/mlSimulator';

export interface FilterState {
  search: string;
  type: string;
  riskClass: string;
  status: string; // 'all' | 'optimized' | 'under_review' | 'overdue'
}

export interface SortState {
  field: string;
  order: 'asc' | 'desc';
}

interface MetrologyStore {
  instruments: (MetrologyInstrument & { prediction: SimulationResult })[];
  selectedInstrumentId: string | null;
  filters: FilterState;
  sort: SortState;
  
  // Wizard State
  wizardStep: number;
  wizardInputs: InputFactors;
  wizardResult: SimulationResult | null;
  isAnalyzing: boolean;
  
  // Actions
  setFilters: (filters: Partial<FilterState>) => void;
  resetFilters: () => void;
  setSort: (field: string) => void;
  setSelectedInstrumentId: (id: string | null) => void;
  
  // Wizard Actions
  setWizardStep: (step: number) => void;
  updateWizardInputs: (inputs: Partial<InputFactors>) => void;
  resetWizard: () => void;
  runAnalysis: () => Promise<void>;
  addWizardInstrumentToList: () => void;
  deleteInstrument: (id: string) => void;
}

const initialWizardInputs: InputFactors = {
  name: '',
  serialNumber: '',
  type: 'Thermomètre',
  manufacturer: '',
  range: '',
  resolution: '',
  tolerance: 0.1,
  toleranceUnit: '°C',
  commissionDate: new Date().toISOString().split('T')[0],
  driftRate: 1.5,
  useCondition: 'normal',
  useFrequency: 50,
  envTemp: 3,
  envHumidity: 3,
  envVibration: 2,
  criticality: 'standard',
  complianceHistory: 95,
  lastCalibResult: 'conforming',
  uncertaintyRatio: 0.25,
  currentInterval: 12
};

export const useStore = create<MetrologyStore>((set, get) => {
  // Enrich initial instruments with predictions
  const enrichedInstruments = INITIAL_INSTRUMENTS.map(inst => ({
    ...inst,
    prediction: runMLSimulation(inst)
  }));

  return {
    instruments: enrichedInstruments,
    selectedInstrumentId: null,
    filters: {
      search: '',
      type: '',
      riskClass: '',
      status: ''
    },
    sort: {
      field: 'id',
      order: 'asc'
    },
    
    // Wizard initial state
    wizardStep: 1,
    wizardInputs: initialWizardInputs,
    wizardResult: null,
    isAnalyzing: false,
    
    // Actions
    setFilters: (newFilters) => set((state) => ({
      filters: { ...state.filters, ...newFilters }
    })),
    
    resetFilters: () => set({
      filters: { search: '', type: '', riskClass: '', status: '' }
    }),
    
    setSort: (field) => set((state) => {
      const order = state.sort.field === field && state.sort.order === 'asc' ? 'desc' : 'asc';
      return { sort: { field, order } };
    }),
    
    setSelectedInstrumentId: (id) => set({ selectedInstrumentId: id }),
    
    setWizardStep: (step) => set({ wizardStep: step }),
    
    updateWizardInputs: (inputs) => set((state) => ({
      wizardInputs: { ...state.wizardInputs, ...inputs }
    })),
    
    resetWizard: () => set({
      wizardStep: 1,
      wizardInputs: {
        ...initialWizardInputs,
        commissionDate: new Date().toISOString().split('T')[0],
        serialNumber: `SN-${Math.floor(1000 + Math.random() * 9000)}`
      },
      wizardResult: null,
      isAnalyzing: false
    }),
    
    runAnalysis: async () => {
      set({ isAnalyzing: true });
      
      // Artificial delay (2.5 seconds) to show neural network inference activity
      await new Promise((resolve) => setTimeout(resolve, 2500));
      
      const inputs = get().wizardInputs;
      const result = runMLSimulation(inputs);
      
      set({
        wizardResult: result,
        isAnalyzing: false,
        wizardStep: 3 // auto-advance to step 3 on finish
      });
    },
    
    addWizardInstrumentToList: () => {
      const inputs = get().wizardInputs;
      const result = get().wizardResult;
      
      if (!result) return;
      
      const newInst: MetrologyInstrument & { prediction: SimulationResult } = {
        id: `INST-${Math.floor(100 + Math.random() * 900)}`,
        ...inputs,
        prediction: result
      };
      
      set((state) => ({
        instruments: [newInst, ...state.instruments],
        // Reset wizard for the next run
        wizardStep: 1,
        wizardInputs: {
          ...initialWizardInputs,
          commissionDate: new Date().toISOString().split('T')[0],
          serialNumber: `SN-${Math.floor(1000 + Math.random() * 9000)}`
        },
        wizardResult: null
      }));
    },

    deleteInstrument: (id) => set((state) => ({
      instruments: state.instruments.filter(inst => inst.id !== id)
    }))
  };
});
