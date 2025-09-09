const PDFDocument = require('pdfkit');
const { COGNITIVE, SOFT } = require('./scoring');

function addSectionTitle(doc, text) {
  doc.moveDown(1).font('Helvetica-Bold').fontSize(14).text(text).moveDown(0.5);
  doc.font('Helvetica').fontSize(11);
}

function addKeyValue(doc, key, value) {
  doc.font('Helvetica-Bold').text(`${key}: `, { continued: true });
  doc.font('Helvetica').text(value);
}

async function buildPdfBuffer(report) {
  return new Promise((resolve, reject) => {
    try {
      const doc = new PDFDocument({ size: 'A4', margin: 40 });
      const chunks = [];
      doc.on('data', d => chunks.push(d));
      doc.on('end', () => resolve(Buffer.concat(chunks)));

      const { candidate, scored, meta, id } = report;
      const { logic, soft, indices, summary } = scored;

      // Header
      doc.font('Helvetica-Bold').fontSize(18).text('Valutazione Selezione — Project Manager e-learning', { align: 'left' });
      doc.moveDown(0.5);
      doc.font('Helvetica').fontSize(10)
        .text(`ID Report: ${id}`)
        .text(`Candidato: ${candidate.name}  ${candidate.email ? `<${candidate.email}>` : ''}`)
        .text(`Data invio: ${meta?.submittedAt || ''}`)
        .text(`Durata test (sec): ${meta?.durationSec ?? 'n.d.'}`);
      doc.moveDown(1);

      // Indici sintetici
      addSectionTitle(doc, 'Indicatori sintetici');
      doc.fontSize(12);
      addKeyValue(doc, 'Indice Cognitivo', `${indices.cognitiveIndex}/100`);
      addKeyValue(doc, 'Indice Manageriale', `${indices.managerialIndex}/100`);
      addKeyValue(doc, 'Indice Interpersonale', `${indices.interpersonalIndex}/100`);
      addKeyValue(doc, 'Valutazione complessiva', `${indices.overall}/100`);

      // Narrativa
      addSectionTitle(doc, 'Sintesi descrittiva');
      doc.fontSize(11).text(summary.narrative, { align: 'left' });

      // Dettaglio dimensioni cognitive
      addSectionTitle(doc, 'Dettaglio capacità cognitive');
      doc.list([
        `${COGNITIVE.LOGIC}: ${logic[COGNITIVE.LOGIC]}/100 — ${summary.perDimension[COGNITIVE.LOGIC]}`,
        `${COGNITIVE.NUM}: ${logic[COGNITIVE.NUM]}/100 — ${summary.perDimension[COGNITIVE.NUM]}`,
        `${COGNITIVE.PROB}: ${logic[COGNITIVE.PROB]}/100 — ${summary.perDimension[COGNITIVE.PROB]}`
      ], { bulletRadius: 2 });

      // Dettaglio soft
      addSectionTitle(doc, 'Dettaglio competenze manageriali e interpersonali');
      const softList = Object.values(SOFT).map(dim =>
        `${dim}: ${soft[dim]}/100 — ${summary.perDimension[dim]}`
      );
      doc.list(softList, { bulletRadius: 2 });

      // Footer
      doc.moveDown(1);
      doc.fontSize(9).fillColor('#666')
        .text('Questo report è generato automaticamente a partire da scenari standardizzati e punteggi normalizzati su scala 0–100.', { align: 'left' });
      doc.end();
    } catch (e) {
      reject(e);
    }
  });
}

module.exports = { buildPdfBuffer };
