import * as XLSX from 'xlsx';
import type { MetrologyInstrument } from './initialData';
import type { SimulationResult } from './mlSimulator';

export function exportInstrumentsToExcel(
  instruments: (MetrologyInstrument & { prediction: SimulationResult })[]
) {
  // Format the data for Excel sheet
  const formattedData = instruments.map((inst) => ({
    'ID Équipement': inst.id,
    'Désignation': inst.name,
    'Numéro de Série': inst.serialNumber,
    'Type d\'Instrument': inst.type,
    'Fabricant': inst.manufacturer,
    'Plage de Mesure': inst.range,
    'Résolution': inst.resolution,
    'Tolérance Admissible': `${inst.tolerance} ${inst.toleranceUnit}`,
    'Date de Mise en Service': inst.commissionDate,
    'Taux de Dérive constaté (%)': inst.driftRate,
    'Condition d\'Utilisation': inst.useCondition === 'severe' ? 'Sévère' : inst.useCondition === 'normal' ? 'Normale' : 'Légère',
    'Fréquence d\'Utilisation (fois/mois)': inst.useFrequency,
    'Criticité de la Mesure': inst.criticality.toUpperCase(),
    'Historique de Conformité (%)': inst.complianceHistory,
    'Dernier Étalonnage': inst.lastCalibResult === 'conforming' ? 'Conforme' : inst.lastCalibResult === 'warning' ? 'Limite' : 'Hors tolérance',
    'Incertitude / Tolérance': inst.uncertaintyRatio,
    'Périodicité Actuelle (mois)': inst.currentInterval,
    'Périodicité Rec. IA (mois)': inst.prediction.recommendedInterval,
    'Indice de Confiance (%)': inst.prediction.confidence,
    'Classe de Risque IA': inst.prediction.riskClass,
    'Gain Financier Estimé (DA/an)': inst.prediction.estimatedSavings
  }));

  // Create worksheet
  const worksheet = XLSX.utils.json_to_sheet(formattedData);
  
  // Create workbook
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Parc d\'instruments');

  // Set columns width automatically
  const maxLen = formattedData.reduce((acc, row) => {
    Object.keys(row).forEach((key, colIndex) => {
      const val = row[key as keyof typeof row];
      const len = val ? val.toString().length : 10;
      acc[colIndex] = Math.max(acc[colIndex] || 10, len, key.length);
    });
    return acc;
  }, [] as number[]);

  worksheet['!cols'] = maxLen.map((w) => ({ wch: w + 2 }));

  // Generate Excel file and trigger download
  XLSX.writeFile(workbook, `METROPARC_Inventaire_Optimise_${new Date().toISOString().split('T')[0]}.xlsx`);
}
export default exportInstrumentsToExcel;
