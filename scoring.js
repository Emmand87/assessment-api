const COGNITIVE = {
  LOGIC: 'Capacità Logica',
  NUM: 'Calcolo Numerico',
  PROB: 'Problem Solving'
};

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

const logicKeys = {
  q1: { correct: '32', weight: 1, dim: COGNITIVE.LOGIC },
  q2: { correct: '21', weight: 1, dim: COGNITIVE.LOGIC },
  q3: { correct: 'D',  weight: 1, dim: COGNITIVE.LOGIC },
  q4: { correct: '27', weight: 1, dim: COGNITIVE.NUM   },
  q5: { correct: '12', weight: 1, dim: COGNITIVE.NUM   },
  q6: { correct: '2',  weight: 1, dim: COGNITIVE.PROB  }, // 6*7=42h, 3pers*7h=21h/g → 2 giorni
  q7: { correct: '18', weight: 1, dim: COGNITIVE.PROB  },
  q8: { correct: 'Vero', weight: 1, dim: COGNITIVE.LOGIC }
};

const softKeys = {
  s1: { A:{ 'Gestione del Tempo':3, 'Pianificazione & Organizzazione':2 }, B:{ 'Gestione del Tempo':2 }, C:{ 'Gestione del Tempo':1 }, D:{ 'Gestione del Tempo':0 } },
  s2: { A:{ 'Gestione del Conflitto':3, 'Comunicazione':2 }, B:{ 'Gestione del Conflitto':2 }, C:{ 'Gestione del Conflitto':1 }, D:{ 'Gestione del Conflitto':0 } },
  s3: { A:{ 'Obiettivi & Scadenze':3, 'Pianificazione & Organizzazione':2 }, B:{ 'Obiettivi & Scadenze':2 }, C:{ 'Obiettivi & Scadenze':1 }, D:{ 'Obiettivi & Scadenze':0 } },
  s4: { A:{ 'Comunicazione':3, 'Gestione Stakeholder':2 }, B:{ 'Comunicazione':2 }, C:{ 'Comunicazione':1 }, D:{ 'Comunicazione':0 } },
  s5: { A:{ 'Leadership':3, 'Adattabilità':1 }, B:{ 'Leadership':2 }, C:{ 'Leadership':1 }, D:{ 'Leadership':0 } },
  s6: { A:{ 'Pianificazione & Organizzazione':3, 'Gestione del Tempo':1 }, B:{ 'Pianificazione & Organizzazione':2 }, C:{ 'Pianificazione & Organizzazione':1 }, D:{ 'Pianificazione & Organizzazione':0 } },
  s7: { A:{ 'Adattabilità':3, 'Obiettivi & Scadenze':1 }, B:{ 'Adattabilità':2 }, C:{ 'Adattabilità':1 }, D:{ 'Adattabilità':0 } },
  s8: { A:{ 'Gestione Stakeholder':3, 'Comunicazione':1 }, B:{ 'Gestione Stakeholder':2 }, C:{ 'Gestione Stakeholder':1 }, D:{ 'Gestione Stakeholder':0 } }
};

const descriptors = {
  [COGNITIVE.LOGIC]: [
    [0,39,'Base: riconosce pattern semplici; necessita di guida su regole multi-step.'],
    [40,59,'In sviluppo: individua regole comuni con velocità discreta.'],
    [60,79,'Solida: deduce regole complesse con buona accuratezza.'],
    [80,100,'Avanzata: eccellente astrazione e velocità inferenziale.']
  ],
  [COGNITIVE.NUM]: [
    [0,39,'Base: calcolo accurato solo con tempi ampi.'],
    [40,59,'In sviluppo: buono su operazioni standard, talvolta imprecisioni sotto pressione.'],
    [60,79,'Solida: affidabile su stime e calcoli multi-step.'],
    [80,100,'Avanzata: rapidità e precisione anche in scenari complessi.']
  ],
  [COGNITIVE.PROB]: [
    [0,39,'Base: fatica a modellare vincoli e trade-off.'],
    [40,59,'In sviluppo: risolve problemi con guida e schemi chiari.'],
    [60,79,'Solida: scompone problemi e trova soluzioni pratiche.'],
    [80,100,'Avanzata: ottimizza con approccio sistemico e creatività.']
  ],
  'Gestione del Tempo': [
    [0,39,'Prioritizzazione poco strutturata; rischi di slittamento.'],
    [40,59,'Pianifica con check periodici; margini di miglioramento sul timeboxing.'],
    [60,79,'Gestione tempi efficace con buffer e milestone.'],
    [80,100,'Mastery: pianifica, protegge tempo, comunica dipendenze.']
  ],
  'Gestione del Conflitto': [
    [0,39,'Evita/ritarda; conflitti si cronicizzano.'],
    [40,59,'Interviene ma senza metodo costante.'],
    [60,79,'Media con ascolto attivo e neutralità.'],
    [80,100,'Previene, media e consolida accordi sostenibili.']
  ],
  'Obiettivi & Scadenze': [
    [0,39,'Obiettivi vaghi; tracking limitato.'],
    [40,59,'Usa obiettivi SMART ma con follow-up irregolare.'],
    [60,79,'Definisce KPI, scadenze e controlli cadenzati.'],
    [80,100,'Allinea roadmap e value delivery, governa rischi.']
  ],
  'Comunicazione': [
    [0,39,'Messaggi lunghi/ambigui; poco adattamento audience.'],
    [40,59,'Chiarezza discreta; migliorabile su sintesi e aspettative.'],
    [60,79,'Comunicazione chiara, bidirezionale, documentata.'],
    [80,100,'Storytelling mirato, gestione aspettative esemplare.']
  ],
  'Leadership': [
    [0,39,'Direttività o laissez-faire; poca ownership.'],
    [40,59,'Leadership situazionale in crescita.'],
    [60,79,'Coinvolge, delega, rimuove impedimenti.'],
    [80,100,'Ispira, sviluppa talenti, orienta ai risultati.']
  ],
  'Pianificazione & Organizzazione': [
    [0,39,'Pianificazione reattiva; scarsa gestione dipendenze.'],
    [40,59,'Roadmap presente ma poco aggiornata.'],
    [60,79,'WBS, rischi, buffer e baseline curati.'],
    [80,100,'Eccellenza su pianificazione e controllo esecuzione.']
  ],
  'Adattabilità': [
    [0,39,'Resistenza al cambiamento.'],
    [40,59,'Si adatta con tempi medio-lunghi.'],
    [60,79,'Ricalibra rapidamente con apprendimento continuo.'],
    [80,100,'Anticipa cambi e capitalizza le novità.']
  ],
  'Gestione Stakeholder': [
    [0,39,'Coinvolgimento stakeholder sporadico.'],
    [40,59,'Mappa interessi ma con follow-up irregolari.'],
    [60,79,'Gestione aspettative e reporting regolare.'],
    [80,100,'Governance relazionale strategica e proattiva.']
  ]
};

function describe(dim, score) {
  const bands = descriptors[dim];
  for (const [min, max, text] of bands) if (score >= min && score <= max) return text;
  return '';
}

function scoreLogic(logicAnswers) {
  const tally = { [COGNITIVE.LOGIC]:0, [COGNITIVE.NUM]:0, [COGNITIVE.PROB]:0 };
  const max   = { [COGNITIVE.LOGIC]:0, [COGNITIVE.NUM]:0, [COGNITIVE.PROB]:0 };

  for (const qid of Object.keys(logicKeys)) {
    const k = logicKeys[qid];
    const w = k.weight || 1;
    max[k.dim] += w;
    const ans = (logicAnswers[qid] ?? '').toString();
    if (ans === k.correct) tally[k.dim] += w;
  }

  const toPct = (num, den) => Math.round((num / (den || 1)) * 100);

  return {
    [COGNITIVE.LOGIC]: toPct(tally[COGNITIVE.LOGIC], max[COGNITIVE.LOGIC]),
    [COGNITIVE.NUM]:   toPct(tally[COGNITIVE.NUM],   max[COGNITIVE.NUM]),
    [COGNITIVE.PROB]:  toPct(tally[COGNITIVE.PROB],  max[COGNITIVE.PROB]),
    details: { tally, max }
  };
}

function scoreSoft(softAnswers) {
  const tally = {};
  const cap = {};

  for (const sid of Object.keys(softKeys)) {
    const opt = (softAnswers[sid] || '').toUpperCase();
    const map = softKeys[sid][opt] || {};
    const allDims = new Set([
      ...Object.keys(softKeys[sid]['A']||{}),
      ...Object.keys(softKeys[sid]['B']||{}),
      ...Object.keys(softKeys[sid]['C']||{}),
      ...Object.keys(softKeys[sid]['D']||{})
    ]);
    for (const d of allDims) cap[d] = (cap[d] || 0) + 3;
    for (const d of Object.keys(map)) tally[d] = (tally[d] || 0) + map[d];
  }

  const dims = Object.keys(cap);
  const out = {};
  for (const d of dims) out[d] = Math.round(((tally[d] || 0) / (cap[d] || 1)) * 100);
  return { ...out, details: { tally, cap } };
}

function aggregateIndices(logic, soft) {
  const avg = arr => Math.round(arr.reduce((a,b)=>a+b,0) / (arr.length||1));
  const cognitiveIndex    = avg([logic[COGNITIVE.LOGIC], logic[COGNITIVE.NUM], logic[COGNITIVE.PROB]]);
  const managerialIndex   = avg([soft['Leadership'], soft['Pianificazione & Organizzazione'], soft['Gestione Stakeholder'], soft['Obiettivi & Scadenze']]);
  const interpersonalIndex= avg([soft['Comunicazione'], soft['Gestione del Conflitto'], soft['Adattabilità'], soft['Gestione del Tempo']]);

  const overall = Math.round(cognitiveIndex*0.45 + managerialIndex*0.35 + interpersonalIndex*0.20);
  return { cognitiveIndex, managerialIndex, interpersonalIndex, overall };
}

function overallNarrative(indices) {
  const { cognitiveIndex, managerialIndex, interpersonalIndex, overall } = indices;
  const band = s => (s>=80?'eccellente':s>=60?'solido':s>=40?'in sviluppo':'base');
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

function dimensionDescriptions(scores) {
  const dims = { ...scores.logicDims, ...scores.softDims };
  const out = {};
  for (const [dim, score] of Object.entries(dims)) out[dim] = describe(dim, score);
  return out;
}

function scoreAll(answers) {
  const logic = scoreLogic(answers.logic || {});
  const soft  = scoreSoft(answers.soft || {});
  const indices = aggregateIndices(logic, soft);

  const summary = {
    indices,
    narrative: overallNarrative(indices),
    perDimension: dimensionDescriptions({
      logicDims: {
        [COGNITIVE.LOGIC]: logic[COGNITIVE.LOGIC],
        [COGNITIVE.NUM]: logic[COGNITIVE.NUM],
        [COGNITIVE.PROB]: logic[COGNITIVE.PROB]
      },
      softDims: Object.fromEntries(Object.keys(soft).map(d => [d, soft[d]]))
    })
  };

  return { logic, soft, indices, summary };
}

module.exports = { scoreAll, COGNITIVE, SOFT };

