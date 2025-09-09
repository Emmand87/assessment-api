const express = require('express');
const path = require('path');
const cors = require('cors');
const { v4: uuidv4 } = require('uuid');
const { scoreAll } = require('./scoring');
const { buildPdfBuffer } = require('./pdf');

const app = express();
app.use(cors());
app.use(express.json({ limit: '1mb' }));
app.use('/public', express.static(path.join(__dirname, 'public')));

// In-memory store per i report (demo)
const reports = new Map();

/**
 * Healthcheck
 */
app.get('/api/health', (_req, res) => {
  res.json({ ok: true, ts: new Date().toISOString() });
});

/**
 * Riceve le risposte, calcola i punteggi, salva un report e restituisce link al PDF
 * Body atteso:
 * {
 *   candidate: { name, email },
 *   answers: { logic: { [qid]: option }, soft: { [sid]: option } },
 *   meta: { durationSec?: number, userAgent?: string }
 * }
 */
app.post('/api/submit', async (req, res) => {
  try {
    const { candidate, answers, meta } = req.body || {};
    if (!candidate || !candidate.name) {
      return res.status(400).json({ error: 'Dati candidato mancanti.' });
    }
    if (!answers || !answers.logic || !answers.soft) {
      return res.status(400).json({ error: 'Risposte incomplete.' });
    }

    const scored = scoreAll(answers);
    const reportId = uuidv4();

    const report = {
      id: reportId,
      candidate,
      scored,
      meta: {
        ...meta,
        submittedAt: new Date().toISOString()
      }
    };

    reports.set(reportId, report);

    res.json({
      ok: true,
      reportId,
      pdfUrl: `/api/report/${reportId}.pdf`,
      summary: scored.summary
    });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'Errore interno durante il calcolo punteggi.' });
  }
});

/**
 * Genera il PDF on-demand partendo dal report salvato
 */
app.get('/api/report/:id.pdf', async (req, res) => {
  try {
    const id = req.params.id.replace('.pdf', '');
    const report = reports.get(id);
    if (!report) {
      return res.status(404).send('Report non trovato.');
    }
    const pdfBuffer = await buildPdfBuffer(report);
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `inline; filename="assessment-${id}.pdf"`);
    res.send(pdfBuffer);
  } catch (e) {
    console.error(e);
    res.status(500).send('Errore generazione PDF.');
  }
});

/**
 * Servizio SPA
 */
app.get('/', (_req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server avviato su http://localhost:${PORT}`));
