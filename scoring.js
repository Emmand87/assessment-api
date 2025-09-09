/**
 * Banca domande & chiavi di scoring
 * Nota: nel prototipo le domande sono renderizzate in front-end con stessi ID.
 * Qui definiamo le chiavi di valutazione per calcolare gli indicatori.
 */

/** Indicatori cognitivi */
const COGNITIVE = {
  LOGIC: 'Capacità Logica',
  NUM: 'Calcolo Numerico',
  PROB: 'Problem Solving'
};

/** Indicatori manageriali/interpersonali */
const SOFT = {
  TIME: 'Gestione del Tempo',
  CONFLICT: 'Gestione del Conflitto',
  GOALS: 'Obiettivi & Scadenze',
  COMM: 'Comunicazione',
  LEAD: 'Leadership',
  PLAN: 'Pianificazione & Organizzazione',
  ADAPT: 'Adattabilità',
  STAKE: 'Gestione Stakeholder'
};

/** Punteggio massimo target per normalizzazione */
const MAX_PER_LOGIC = 8; // 8 domande logiche totali nel prototipo
const MAX_SOFT_SCORE = 100; // soft già in scala 0-100

/**
 * Chiavi corrette per logica: { qid: { correct: 'option', weight?: number, dim: 'LOGIC|NUM|PROB' } }
 */
const logicKeys = {
  // Sequenze / Logica
  q1: { correct: '32', weight: 1, dim: COGNITIVE.LOGIC },
  q2: { correct: '13', weight: 1, dim: COGNITIVE.LOGIC },
  q3: { correct: 'D', weight: 1, dim: COGNITIVE.LOGIC }, // puzzle visivo astratto
  // Calcolo rapido
  q4: { correct: '27', weight: 1, dim: COGNITIVE.NUM },
  q5: { correct: '12', weight: 1, dim: COGNITIVE.NUM },
  // Problem solving numerico
  q6: { correct: '42', weight: 1, dim: COGNITIVE.PROB },
  q7: { correct: '18', weight: 1, dim: COGNITIVE.PROB },
  // Logica condizionale
  q8: { correct: 'Vero', weight: 1, dim: COGNITIVE.LOGIC }
};

/**
 * Mapping soft skill: ogni scenario (sid) assegna pesi (0..3) alle dimensioni SOFT.
 * Le opzioni sono 'A','B','C','D' coerenti con il front-end.
 * Il punteggio finale per dimensione viene normalizzato in 0-100.
 */
const softKeys = {
  // TIME
  s1: {
    // Prioritizzazione task simultanei
    A: { [SOFT.TIME]: 3, [SOFT.PLAN]: 2 }, // Matrice Eisenhower + timeboxing
    B: { [SOFT.TIME]: 2 },
    C: { [SOFT.TIME]: 1 },
    D: { [SOFT.TIME]: 0 }
  },
  // CONFLICT
  s2: {
    A: { [SOFT.CONFLICT]: 3, [SOFT.COMM]: 2 }, // mediazione strutturata
    B: { [SOFT.CONFLICT]: 2 },
    C: { [SOFT.CONFLICT]: 1 },
    D: { [SOFT.CONFLICT]: 0 }
  },
  // GOALS & DEADLINES
  s3: {
    A: { [SOFT.GOALS]: 3, [SOFT.PLAN]: 2 },
    B: { [SOFT.GOALS]: 2 },
    C: { [SOFT.GOALS]: 1 },
    D: { [SOFT.GOALS]: 0 }
  },
  // COMM
  s4: {
    A: { [SOFT.COMM]: 3, [SOFT.STAKE]: 2 },
    B: { [SOFT.COMM]: 2 },
    C: { [SOFT.COMM]: 1 },
    D: { [SOFT.COMM]: 0 }
  },
  // LEAD
  s5: {
    A: { [SOFT.LEAD]: 3, [SOFT.ADAPT]: 1 },
    B: { [SOFT.LEAD]: 2 },
    C: { [SOFT.LEAD]: 1 },
    D: { [SOFT.LEAD]: 0 }
  },
  // PLAN
  s6: {
    A: { [SOFT.PLAN]: 3, [SOFT.TIME]: 1 },
    B: { [SOFT.PLAN]: 2 },
    C: { [SOFT.PLAN]: 1 },
    D: { [SOFT.PLAN]: 0 }
  },
  // ADAPT
  s7: {
    A: { [SOFT.ADAPT]: 3, [SOFT.GOALS]: 1 },
    B: { [SOFT.ADAPT]: 2 },
    C: { [SOFT.ADAPT]: 1 },
    D: { [SOFT.ADAPT]: 0 }
  },
  // STAKE
  s8: {
    A: { [SOFT.STAKE]: 3, [SOFT.COMM]: 1 },
    B: { [SOFT.STAKE]: 2 },
    C: { [SOFT.STAKE]: 1 },
    D: { [SOFT.STAKE]: 0 }
  }
};

/**
 * Descrittori testuali per bande di punteggio (0-39; 40-59; 60-79; 80-100)
 */
const descriptors = {
  [COGNITIVE.LOGIC]: [
    [0, 39, 'Base: riconosce pattern semplici; necessita di guida su regole multi-step.'],
    [40, 59, 'In sviluppo: individua regole comuni con velocità discreta.'],
    [60, 79, 'Solida: deduce regole complesse con buona accuratezza.'],
    [80, 100, 'Avanzata: eccellente astrazione e velocità inferenziale.']
  ],
  [COGNITIVE.NUM]: [
    [0, 39, 'Base: calcolo accurato solo con tempi ampi.'],
    [40, 59, 'In sviluppo: buono su operazioni standard, talvolta imprecisioni sotto pressione.'],
    [60, 79, 'Solida: affidabile su stime e calcoli multi-step.'],
    [80, 100, 'Avanzata: rapidità e precisione anche in scenari complessi.']
  ],
  [COGNITIVE.PROB]: [
    [0, 39, 'Base: fatica a modellare vincoli e trade-off.'],
    [40, 59, 'In sviluppo: risolve problemi con guida e schemi chiari.'],
    [60, 79, 'Solida: scompone problemi e trova soluzioni pratiche.'],
    [80, 100, 'Avanzata: ottimizza con approccio sistemico e creatività.']
  ],
  [SOFT.TIME]: [
    [0, 39, 'Prioritizzazione poco strutturata; rischi di slittamento.'],
    [40, 59, 'Pianifica con check periodici; margini di miglioramento sul timeboxing.'],
    [60, 79, 'Gestione tempi efficace con buffer e milestone.'],
    [80, 100, 'Mastery: pianifica, protegge tempo, comunica dipendenze.']
  ],
  [SOFT.CONFLICT]: [
    [0, 39, 'Evita/ritarda; conflitti si cronicizzano.'],
    [40, 59, 'Interviene ma senza metodo costante.'],
    [60, 79, 'Media con ascolto attivo e neutralità.'],
    [80, 100, 'Previene, media e consolida accordi sostenibili.']
  ],
  [SOFT.GOALS]: [
    [0, 39, 'Obiettivi vaghi; tracking limitato.'],
    [40, 59, 'Usa obiettivi SMART ma con follow-up irregolare.'],
    [60, 79, 'Definisce KPI, scadenze e controlli cadenzati.'],
    [80, 100, 'Allinea roadmap e value delivery, governa rischi.']
  ],
  [SOFT.COMM]: [
    [0, 39, 'Messaggi lunghi/ambigui; poco adattamento audience.'],
    [40, 59, 'Chiarezza discreta; migliorabile su sintesi e aspettative.'],
    [60, 79, 'Comunicazione chiara, bidirezionale, documentata.'],
    [80, 100, 'Storytelling mirato, gestione aspettative esemplare.']
  ],
  [SOFT.LEAD]: [
    [0, 39, 'Direttività o laissez-faire; poca ownership.'],
    [40, 59, 'Leadership situazionale in crescita.'],
    [60, 79, 'Coinvolge, delega, rimuove impedimenti.'],
    [80, 100, 'Ispira, sviluppa talenti, orienta ai risultati.']
  ],
  [SOFT.PLAN]: [
    [0, 39, 'Pianificazione reattiva; scarsa gestione dipendenze.'],
    [40, 59, 'Roadmap presente ma poco aggiornata.'],
    [60, 79, 'WBS, rischi, buffer e baseline curati.'],
    [80, 100, 'Eccellenza su pianificazione e controllo esecuzione.']
  ],
  [SOFT.ADAPT]: [
    [0, 39, 'Resistenza al cambiamento.'],
    [40, 59, 'Si adatta con tempi medio-lunghi.'],
    [60, 79, 'Ricalibra rapidamente con apprendimento continuo.'],
    [80, 100, 'Anticipa cambi e capitalizza le novità.']
  ],
  [SOFT.STAKE]: [
    [0, 39, 'Coinvolgimento stakeholder sporadico.'],
    [40, 59, 'Mappa interessi ma con follow-up irregolari.'],
    [60, 79, 'Gestione aspettative e reporting regolare.'],
    [80, 100, 'Governance relazionale strategica e proattiva.']
  ]
};

/** Bande e profilo sintetico finale */
function describe(dim, score) {
  const bands = descriptors[dim];
  for (const [min, max, text] of bands) {
    if (score >= min && score <= max) return text;
  }
  return '';
}

/** Calcolo logica: restituisce punteggi per LOGIC/NUM/PROB in scala 0-100 */
function scoreLogic(logicAnswers) {
  let tally = { [COGNITIVE.LOGIC]: 0, [COGNITIVE.NUM]: 0, [COGNITIVE.PROB]: 0 };
  let max = { [COGNITIVE.LOGIC]: 0, [COGNITIVE.NUM]: 0, [COGNITIVE.PROB]: 0 };

  for (const qid of Object.keys(logicKeys)) {
    const key = logicKeys[qid];
    const weight = key.weight || 1;
    max[key.dim] += weight;
    const answer = (logicAnswers[qid] ?? '').toString();
    if (answer === key.correct) {
      tally[key.dim] += weight;
    }
  }

  const logicScore = Math.round((tally[COGNITIVE.LOGIC] / (max[COGNITIVE.LOGIC] || 1)) * 100);
  const numScore   = Math.round((tally[COGNITIVE.NUM]   / (max[COGNITIVE.NUM]   || 1)) * 100);
  const probScore  = Math.round((tally[COGNITIVE.PROB]  / (max[COGNITIVE.PROB]  || 1)) * 100);

  return {
    [COGNITIVE.LOGIC]: logicScore,
    [COGNITIVE.NUM]: numScore,
    [COGNITIVE.PROB]: probScore,
    details: { tally, max }
  };
}

/** Calcolo soft: normalizza su 0-100 per dimensione */
function scoreSoft(softAnswers) {
  // Max teorico per dimensione = numero di volte in cui la dimensione appare * 3
  const tally = {};
  const cap = {};

  for (const sid of Object.keys(softKeys)) {
    const opt = (softAnswers[sid] || '').toUpperCase();
    const map = softKeys[sid][opt] || {};
    // incrementa caps (massimi) per tutte le dimensioni che appaiono nello scenario
    for (const d of new Set([
      ...Object.keys(softKeys[sid]['A'] || {}),
      ...Object.keys(softKeys[sid]['B'] || {}),
      ...Object.keys(softKeys[sid]['C'] || {}),
      ...Object.keys(softKeys[sid]['D'] || {})
    ])) {
      cap[d] = (cap[d] || 0) + 3;
    }
    // incrementa tally per le dimensioni toccate dalla scelta
    for (const d of Object.keys(map)) {
      tally[d] = (tally[d] || 0) + map[d];
    }
  }

  const dims = Object.values(SOFT);
  const result = {};
  for (const d of dims) {
    const num = tally[d] || 0;
    const den = cap[d] || 1;
    result[d] = Math.round((num / den) * 100);
  }

  return { ...result, details: { tally, cap } };
}

/** Indici aggregati + valutazione complessiva */
function aggregateIndices(logic, soft) {
  const avg = arr => Math.round(arr.reduce((a, b) => a + b, 0) / (arr.length || 1));

  const cognitiveIndex = avg([logic[COGNITIVE.LOGIC], logic[COGNITIVE.NUM], logic[COGNITIVE.PROB]]);
  const managerialIndex = avg([soft[SOFT.LEAD], soft[SOFT.PLAN], soft[SOFT.STAKE], soft[SOFT.GOALS]]);
  const interpersonalIndex = avg([soft[SOFT.COMM], soft[SOFT.CONFLICT], soft[SOFT.ADAPT], soft[SOFT.TIME]]);

  // Pesi esempio (puoi regolarli): 45% cognitivo, 35% manageriale, 20% interpersonale
  const overall = Math.round(
    cognitiveIndex * 0.45 + managerialIndex * 0.35 + interpersonalIndex * 0.20
  );

  return { cognitiveIndex, managerialIndex, interpersonalIndex, overall };
}

/** Profilo testuale sintetico (personalità/approccio manageriale in chiave professionale) */
function overallNarrative(indices) {
  const { cognitiveIndex, managerialIndex, interpersonalIndex, overall } = indices;

  const band = s => (s >= 80 ? 'eccellente' : s >= 60 ? 'solido' : s >= 40 ? 'in sviluppo' : 'base');

  return (
    `Valutazione complessiva: ${overall}/100. ` +
    `Cognitivo ${cognitiveIndex}/100 (${band(cognitiveIndex)}), ` +
    `Manageriale ${managerialIndex}/100 (${band(managerialIndex)}), ` +
    `Interpersonale ${interpersonalIndex}/100 (${band(interpersonalIndex)}). ` +
    `Il profilo suggerisce un approccio ${overall >= 70 ? 'orientato alla performance e alla struttura' : overall >= 50 ? 'equilibrato ma con aree di crescita' : 'da sviluppare in più dimensioni'}, ` +
    `con ${managerialIndex >= 70 ? 'buona capacità di pianificazione e leadership' : 'spazi di miglioramento su pianificazione e guida del team'} ` +
    `e ${interpersonalIndex >= 70 ? 'comunicazione e gestione dei conflitti efficaci' : 'bisogno di rafforzare comunicazione e mediazione'}.`
  );
}

/** Descrizioni per ogni dimensione */
function dimensionDescriptions(scores) {
  const dims = {
    ...scores.logicDims,
    ...scores.softDims
  };
  const out = {};
  for (const [dim, score] of Object.entries(dims)) {
    out[dim] = describe(dim, score);
  }
  return out;
}

function scoreAll(answers) {
  const logic = scoreLogic(answers.logic || {});
  const soft = scoreSoft(answers.soft || {});
  const indices = aggregateIndices(logic, soft);

  const perDim = {
    ...logic,
    ...soft
  };

  const summary = {
    indices,
    narrative: overallNarrative(indices),
    perDimension: dimensionDescriptions({
      logicDims: {
        [COGNITIVE.LOGIC]: logic[COGNITIVE.LOGIC],
        [COGNITIVE.NUM]: logic[COGNITIVE.NUM],
        [COGNITIVE.PROB]: logic[COGNITIVE.PROB]
      },
      softDims: Object.fromEntries(
        Object.values(SOFT).map(d => [d, soft[d]])
      )
    })
  };

  return {
    logic,
    soft,
    indices,
    summary
  };
}

module.exports = {
  scoreAll,
  COGNITIVE,
  SOFT
};
