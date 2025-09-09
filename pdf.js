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

function avgMs(map) {
  const vals = Object.values(map || {});
  if (!vals.length) return 0;
  return Math.round(vals.reduce((a,b)=>a+b,0) / vals.length);
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

      doc.font('Helvetica-Bold').fontSize(18).text('Valutazione Selezione — Project Manager e-learning');
      doc.moveDown(0.5);
      doc.font('Helvetica').fontSize(10)
        .text(`ID Report: ${id}`)
        .text(`Candidato: ${candidate.name}  ${candidate.email ? `<${candidate.email}>` : ''}`)
        .text(`Data invio: ${meta?.submittedAt || ''}`)
        .text(`Durata test (sec): ${meta?.durationSec ?? 'n.d.'}`);
      doc.moveDown(1);

      addSectionTitle(doc, 'Indicatori sintetici');
      addKeyValue(doc, 'Indice Cognitivo', `${indices.cognitiveIndex}/100`);
      addKeyValue(doc, 'Indice Manageriale', `${indices.managerialIndex}/100`);
      addKeyValue(doc, 'Indice Interpersonale', `${indices.interpersonalIndex}/100`);
      addKeyValue(doc, 'Valutazione complessiva', `${indices.overall}/100`);

      addSectionTitle(doc, 'Sintesi descrittiva');
      doc.text(summary.narrative, { align: 'left' });

      addSectionTitle(doc, 'Dettaglio capacità cognitive');
      doc.list([
        `${COGNITIVE.LOGIC}: ${logic[COGNITIVE.LOGIC]}/100 — ${summary.perDimension[COGNITIVE.LOGIC]}`,
        `${COGNITIVE.NUM}: ${logic[COGNITIVE.NUM]}/100 — ${summary.perDimension[COGNITIVE.NUM]}`,
        `${COGNITIVE.PROB}: ${logic[COGNITIVE.PROB]}/100 — ${summary.perDimension[COGNITIVE.PROB]}`
      ], { bulletRadius: 2 });

      addSectionTitle(doc, 'Dettaglio competenze manageriali e interpersonali');
      const softList = Object.keys(soft)
        .filter(k => k !== 'details')
        .map(dim => `${dim}: ${soft[dim]}/100 — ${summary.perDimension[dim]}`);
      doc.list(softList, { bulletRadius: 2 });

      // Tempi per item
      addSectionTitle(doc, 'Tempi di risposta (ms)');
      const avgLogic = avgMs(meta?.times?.logic || {});
      const avgSoft  = avgMs(meta?.times?.soft || {});
      addKeyValue(doc, 'Tempo medio domande logiche', `${avgLogic} ms`);
      addKeyValue(doc, 'Tempo medio scenari soft', `${avgSoft} ms`);

      doc.moveDown(1);
      doc.fontSize(9).fillColor('#666')
        .text('Report generato automaticamente da scenari standardizzati; punteggi su scala 0–100.', { align: 'left' });
      doc.end();
    } catch (e) { reject(e); }
  });
}

module.exports = { buildPdfBuffer };

