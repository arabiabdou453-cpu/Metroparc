import { jsPDF } from 'jspdf';
import type { InputFactors, SimulationResult } from './mlSimulator';

export function exportPredictionToPDF(inputs: InputFactors, result: SimulationResult) {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  
  // Header Background
  doc.setFillColor(30, 58, 95); // Dark blue
  doc.rect(0, 0, pageWidth, 40, 'F');
  
  // Brand Header
  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(22);
  doc.text('METRO METROLOGY AI', 15, 20);
  
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.text("Rapport d'Optimisation de l'Intervalle d'Étalonnage (FD X 07-014)", 15, 30);
  
  // Date
  const dateStr = new Date().toLocaleDateString('fr-FR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
  doc.text(`Généré le : ${dateStr}`, pageWidth - 80, 20);

  // Decorative orange line
  doc.setFillColor(255, 107, 53); // Orange
  doc.rect(0, 40, pageWidth, 3, 'F');

  // Section 1: Instrument Info
  doc.setTextColor(30, 58, 95);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(14);
  doc.text('1. Identification de l\'Équipement', 15, 55);
  
  doc.setDrawColor(230, 230, 230);
  doc.line(15, 58, pageWidth - 15, 58);
  
  doc.setTextColor(60, 60, 60);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10);
  
  const col1X = 20;
  const col2X = 110;
  let y = 68;

  doc.text(`Désignation : ${inputs.name || 'N/A'}`, col1X, y);
  doc.text(`Type d'instrument : ${inputs.type}`, col2X, y);
  y += 8;
  doc.text(`Numéro de série : ${inputs.serialNumber || 'N/A'}`, col1X, y);
  doc.text(`Fabricant : ${inputs.manufacturer || 'N/A'}`, col2X, y);
  y += 8;
  doc.text(`Plage de mesure : ${inputs.range || 'N/A'}`, col1X, y);
  doc.text(`Tolérance admise : ± ${inputs.tolerance} ${inputs.toleranceUnit}`, col2X, y);
  y += 8;
  doc.text(`Date de mise en service : ${inputs.commissionDate}`, col1X, y);
  doc.text(`Résolution : ${inputs.resolution || 'N/A'}`, col2X, y);

  // Section 2: Influencing Factors
  y += 18;
  doc.setTextColor(30, 58, 95);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(14);
  doc.text('2. Facteurs d\'Influence Métrologiques', 15, y);
  
  y += 3;
  doc.line(15, y, pageWidth - 15, y);
  
  doc.setTextColor(60, 60, 60);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10);
  y += 10;

  doc.text(`Taux de dérive mesuré : ${inputs.driftRate} %`, col1X, y);
  doc.text(`Condition d'utilisation : ${inputs.useCondition.toUpperCase()}`, col2X, y);
  y += 8;
  doc.text(`Fréquence d'utilisation : ${inputs.useFrequency} fois / mois`, col1X, y);
  const avgEnv = ((inputs.envTemp + inputs.envHumidity + inputs.envVibration) / 3).toFixed(1);
  doc.text(`Score environnemental global : ${avgEnv} / 10`, col2X, y);
  y += 8;
  doc.text(`Criticité de la mesure : ${inputs.criticality.toUpperCase()}`, col1X, y);
  doc.text(`Historique de conformité : ${inputs.complianceHistory} %`, col2X, y);
  y += 8;
  doc.text(`Résultat dernier étalonnage : ${inputs.lastCalibResult === 'conforming' ? 'CONFORME' : inputs.lastCalibResult === 'warning' ? 'LIMITE' : 'HORS TOLÉRANCE'}`, col1X, y);
  doc.text(`Rapport Incertitude / Tolérance : ${inputs.uncertaintyRatio}`, col2X, y);

  // Section 3: AI Recommendation Card
  y += 20;
  doc.setFillColor(245, 247, 250); // Light grey card background
  doc.setDrawColor(200, 210, 220);
  doc.rect(15, y, pageWidth - 30, 48, 'FD');

  doc.setTextColor(255, 107, 53); // Orange
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(12);
  doc.text('RECOMMANDATION DU MODÈLE MACHINE LEARNING (RANDOM FOREST)', 20, y + 8);
  
  doc.setTextColor(30, 58, 95);
  doc.setFontSize(22);
  doc.text(`${result.recommendedInterval} MOIS`, 20, y + 22);
  
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(100, 100, 100);
  doc.text(`(Intervalle précédent : ${inputs.currentInterval} mois)`, 20, y + 28);
  
  // Confidence
  doc.setTextColor(30, 58, 95);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.text(`Indice de confiance : ${result.confidence}%`, col2X, y + 18);
  
  // Risk Class
  let rColor = [0, 196, 140]; // Success green
  if (result.riskClass === 'CRITIQUE') rColor = [255, 77, 109]; // Risk red
  else if (result.riskClass === 'ÉLEVÉ') rColor = [255, 107, 53]; // Orange
  else if (result.riskClass === 'MODÉRÉ') rColor = [255, 183, 0]; // Amber
  
  doc.text('Classe de risque :', col2X, y + 26);
  doc.setFillColor(rColor[0], rColor[1], rColor[2]);
  doc.rect(col2X + 35, y + 21, 30, 7, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(9);
  doc.setFont('helvetica', 'bold');
  doc.text(result.riskClass, col2X + 37, y + 26);

  // Savings
  doc.setTextColor(30, 58, 95);
  doc.setFontSize(11);
  const savingsText = result.estimatedSavings >= 0 
    ? `Économie annuelle estimée : +${result.estimatedSavings.toLocaleString()} DA / an`
    : `Surcoût de sécurité requis : ${Math.abs(result.estimatedSavings).toLocaleString()} DA / an`;
  doc.text(savingsText, 20, y + 40);

  // Section 4: SHAP Feature Importance
  y += 58;
  doc.setTextColor(30, 58, 95);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(14);
  doc.text('3. Facteurs d\'Influence Clés (Local SHAP)', 15, y);
  y += 3;
  doc.line(15, y, pageWidth - 15, y);
  y += 8;

  // Render Horizontal Bar Chart
  result.featureImportances.slice(0, 5).forEach((feat, index) => {
    doc.setTextColor(60, 60, 60);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9);
    doc.text(feat.label, 20, y + (index * 8));

    // Draw bar background
    doc.setFillColor(230, 235, 245);
    doc.rect(70, y + (index * 8) - 3.5, 90, 4, 'F');

    // Draw active bar
    doc.setFillColor(0, 212, 255); // Cyan
    doc.rect(70, y + (index * 8) - 3.5, 90 * (feat.importance / 100), 4, 'F');

    // Draw percentage text
    doc.setTextColor(30, 58, 95);
    doc.setFont('helvetica', 'bold');
    doc.text(`${feat.importance}%`, 165, y + (index * 8));
  });

  // Footer note on PDF page
  doc.setDrawColor(240, 240, 240);
  doc.line(15, pageHeight - 20, pageWidth - 15, pageHeight - 20);
  doc.setTextColor(150, 150, 150);
  doc.setFont('helvetica', 'italic');
  doc.setFontSize(8);
  doc.text("Ce document est généré par un système informatique de simulation. Conforme à la norme d'optimisation métrologique FD X 07-014.", 15, pageHeight - 12);
  doc.text("METRO AI 2026 — Plateforme d'étalonnage prédictive", pageWidth - 100, pageHeight - 12);

  // Save the PDF
  doc.save(`METRO_Rapport_${inputs.serialNumber || 'Instrument'}.pdf`);
}
