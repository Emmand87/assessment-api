require('dotenv').config();
const express = require('express');
const path = require('path');
const cors = require('cors');
const { v4: uuidv4 } = require('uuid');
const { scoreAll } = require('./scoring');
const { buildPdfBuffer } = require('./pdf');
const { connect } = require('./db');
const { Token, Submission } = require('./models');

const app = express();
app.use(cors());
app.use(express.json({ limit: '1mb' }));
app.use('/public', express.static(path.join(__dirname, 'public')));

// memoria come fallback in assenza DB
const reportsMem = new Map();
let dbReady = false;

(async () => {
  try {
    const conn = await connect();
    dbReady = !!conn;
  } catch (e) {
    console.warn('[DB] Connessione fallita. Si prosegue in memoria.', e.message);
  }
})();

app.get('/api/health', (_req, res) => {
  res.json({ ok: true, ts: new Date().toISOString(), db: dbReady ? 'connected' : 'memory' });
});

/**
 * Admin: crea token inviti
 * Body: { invites: [{ email, name?, daysValid? , allowMultiple? }]}
 * Ritorna: [{ email, token, url }]
 */
app.post('/api/invite', async (req, res) => {
  try {
    const baseUrl = req.headers['x-base-url'] || req.protocol + '://' + req.get('host');
    const invites = Array.isArray(req.body?.invites) ? req.body.invites : [];
    if (!invites.length) return res.status(400).json({ error: 'Nessun invito fornito.' });

    const out = [];
    for (const inv of invites) {
      const t = uuidv4().replace(/-/g,'');
      const expiresAt = inv.daysValid ? new Date(Date.now() + inv.daysValid*24*3600*1000) : undefined;

      if (dbReady) {
        await Token.create({
          token: t,
          email: inv.email,
          name: inv.name,
          expiresAt,
          allowMultiple: !!inv.allowMultiple
        });
      }
      out.push({ email: inv.email, token: t, url: `${baseUrl}/?t=${t}` });
    }
    res.json({ ok: true, invites: out });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'Errore creazione inviti' });
  }
});

/**
 * Validazione token (per il front-end)
 */
app.get('/api/token/:token', async (req, res) => {
  const t = req.params.token;
  if (!t) return res.status(400).json({ ok:false, reason:'Token mancante' });

  if (!dbReady) {
    // DEV MODE: qualunque token non vuoto è valido
    return res.json({ ok:true, devMode:true });
  }

  const tok = await Token.findOne({ token: t }).lean();
  if (!tok) return res.status(404).json({ ok:false, reason:'Token non valido' });
  if (tok.expiresAt && tok.expiresAt < new Date()) return res.status(410).json({ ok:false, reason:'Token scaduto' });
  if (tok.usedAt && !tok.allowMultiple) return res.status(409).json({ ok:false, reason:'Token già usato' });

  res.json({ ok:true, email: tok.email, name: tok.name, allowMultiple: tok.allowMultiple });
});

/**
 * Submit risposte + scoring + salvataggio + link PDF
 * Header: Authorization: Bearer <token>  (oppure body.token)
 */
app.post('/api/submit', async (req, res) => {
  try {
    const bearer = (req.headers.authorization || '').split(' ')[1];
    const token = req.body?.token || bearer;
    const { candidate, answers, meta } = req.body || {};

    if (!candidate?.name) return res.status(400).json({ error: 'Dati candidato mancanti.' });
    if (!answers?.logic || !answers?.soft) return res.status(400).json({ error: 'Risposte incomplete.' });
    if (!token) return res.status(401).json({ error: 'Token mancante.' });

    if (dbReady) {
      const tok = await Token.findOne({ token }).exec();
      if (!tok) return res.status(401).json({ error: 'Token non valido.' });
      if (tok.expiresAt && tok.expiresAt < new Date()) return res.status(401).json({ error: 'Token scaduto.' });
      if (tok.usedAt && !tok.allowMultiple) return res.status(401).json({ error: 'Token già usato.' });
    }

    const scored = scoreAll(answers);
    const reportId = uuidv4();

    const report = {
      reportId,
      candidate,
      token,
      meta: {
        ...(meta || {}),
        submittedAt: new Date()
      },
      scored
    };

    if (dbReady) {
      await Submission.create(report);
      // marca token usato se non multiplo
      const tok = await Token.findOne({ token }).exec();
      if (tok && !tok.allowMultiple && !tok.usedAt) {
        tok.usedAt = new Date();
        await tok.save();
      }
    } else {
      // fallback in memoria
      reportsMem.set(reportId, report);
    }

    res.json({
      ok: true,
      reportId,
      pdfUrl: `/api/report/${reportId}.pdf`,
      summary: scored.summary
    });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'Errore interno durante il calcolo o salvataggio.' });
  }
});

/**
 * Generazione PDF by reportId (DB o memoria)
 */
app.get('/api/report/:id.pdf', async (req, res) => {
  try {
    const id = req.params.id.replace('.pdf', '');
    let report = null;

    if (dbReady) {
      report = await Submission.findOne({ reportId: id }).lean();
    } else {
      report = reportsMem.get(id);
    }

    if (!report) return res.status(404).send('Report non trovato.');
    const pdfBuffer = await buildPdfBuffer({
      id,
      ...report
    });

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `inline; filename="assessment-${id}.pdf"`);
    res.send(pdfBuffer);
  } catch (e) {
    console.error(e);
    res.status(500).send('Errore generazione PDF.');
  }
});

/** SPA */
app.get('/', (_req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server su http://localhost:${PORT}`));

