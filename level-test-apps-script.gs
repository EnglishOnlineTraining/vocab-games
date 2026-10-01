/**
 * EnglishOnline.training — Level Test results handler
 * Bound to its own "Level Test Results" Google Sheet — NOT the shared
 * apps-script.gs. level-test.html posts here only when a student asks for
 * extra feedback by email.
 *
 * Install: open the sheet → Extensions → Apps Script → paste → Deploy →
 * New deployment → Web app (Execute as: Me, Who has access: Anyone).
 * Put the /exec URL into SHEET_URL in level-test.html.
 * To update later: Deploy → Manage deployments → edit → New version.
 */

// Abuse limits: anyone can POST to a web app, so cap how much mail it sends.
var MAX_PER_DAY     = 80;  // all addresses together (stays under MailApp's quota)
var MAX_PER_ADDRESS = 3;   // per address per day

function doPost(e) {
  try {
    var raw = (e.parameter && e.parameter.payload)
      ? e.parameter.payload
      : (e.postData ? e.postData.contents : '');
    var data = JSON.parse(raw);
    if (data.unit !== 'level-test') return text('Ignored');
    handleLevelTest(data);
    return text('OK');
  } catch (err) {
    return text('Error: ' + err.message);
  }
}

function text(s) {
  return ContentService.createTextOutput(s).setMimeType(ContentService.MimeType.TEXT);
}

function handleLevelTest(data) {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = ss.getSheetByName('Results');
  if (!sheet) {
    sheet = ss.insertSheet('Results');
    sheet.appendRow(['Timestamp', 'Email', 'Level', 'Score', 'Breakdown', 'Sent']);
  }

  var email = String(data.email || '').trim().toLowerCase();
  var result = scoreAnswers(data);
  var status;
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || email.length > 254) {
    status = 'no — invalid email';
  } else if (!result) {
    status = 'no — malformed answers';
  } else {
    status = allowSend(email);
    if (status === 'yes') sendFeedback(email, result);
  }
  sheet.appendRow([new Date(), cap(email, 254),
    result ? result.level.code : '', result ? result.score : '', result ? result.breakdown : '', status]);
}

// Daily counters in script properties, keyed by date; old days are cleared.
function allowSend(email) {
  var lock = LockService.getScriptLock();
  lock.waitLock(10000);
  try {
    var props = PropertiesService.getScriptProperties();
    var today = Utilities.formatDate(new Date(), 'Europe/Berlin', 'yyyy-MM-dd');
    var counts = JSON.parse(props.getProperty('counts') || '{}');
    if (counts.day !== today) counts = { day: today, total: 0, by: {} };
    if (counts.total >= MAX_PER_DAY) return 'no — daily limit reached';
    if ((counts.by[email] || 0) >= MAX_PER_ADDRESS) return 'no — address limit reached';
    counts.total++;
    counts.by[email] = (counts.by[email] || 0) + 1;
    props.setProperty('counts', JSON.stringify(counts));
    return 'yes';
  } finally {
    lock.releaseLock();
  }
}

function cap(v, n) { return String(v || '').substring(0, n); }

// ─── Question pool and level advice ───────────────────────────────
// Copied verbatim from level-test.html. The page sends only question ids and
// the options chosen; every word of the email comes from here, so the public
// endpoint can't be made to mail text a caller wrote. Keep in sync with the
// page — tests/placement-quiz.spec.js fails if the two copies differ.
var POOL = {
  A1: [
    { id:'a1_01', stem:'She ___ to school by bus every day.', options:['go','goes','went'], correct:'goes', topic:'present-simple', why:'Third person singular in the present simple takes -s: she goes.' },
    { id:'a1_02', stem:'There ___ three books on the table.', options:['is','am','are'], correct:'are', topic:'there-is-are', why:'"There are" for plurals; "there is" is only for singular or uncountable nouns.' },
    { id:'a1_03', stem:'My birthday is ___ July.', options:['on','in','at'], correct:'in', topic:'prepositions-time', why:'Months take "in": in July. "On" is for days, "at" for clock times.' },
    { id:'a1_04', stem:'___ you like coffee?', options:['Does','Are','Do'], correct:'Do', topic:'do-does', why:'Questions in the present simple use do/does; "you" takes "do".' },
    { id:'a1_05', stem:'I have two ___.', options:['children','childs','child'], correct:'children', topic:'irregular-plurals', why:'"Child" has the irregular plural "children" — never "childs".' },
    { id:'a1_06', stem:'He ___ a student at this school.', options:['am','is','are'], correct:'is', topic:'to-be', why:'"He" is third person singular, so use "is".' },
    { id:'a1_07', stem:'We always ___ breakfast at 7 o\'clock.', options:['has','have','having'], correct:'have', topic:'have-has', why:'"We" takes "have"; "has" is only for he/she/it.' },
    { id:'a1_08', stem:'Please give ___ the book.', options:['I','me','my'], correct:'me', topic:'object-pronouns', why:'After a verb we need the object pronoun: give me (not "give I").' },
    { id:'a1_09', stem:'That is ___ umbrella.', options:['a','an','the'], correct:'an', topic:'articles', why:'"Umbrella" starts with a vowel sound, so use "an".' },
    { id:'a1_10', stem:'My sister ___ not like spiders.', options:['do','does','is'], correct:'does', topic:'present-simple-neg', why:'Third person singular negative: does not like.' },
    { id:'a1_11', stem:'___ cat is black and white.', options:['They','Their','There'], correct:'Their', topic:'possessive-adj', why:'"Their" shows possession — the cat belonging to them.' },
    { id:'a1_12', stem:'We ___ from Germany.', options:['is','am','are'], correct:'are', topic:'to-be', why:'"We" is plural, so use "are".' },
    { id:'a1_13', stem:'I can ___ English and German.', options:['to speak','speak','speaking'], correct:'speak', topic:'can-modal', why:'After "can" use the base form: can speak (no "to").' },
    { id:'a1_14', stem:'The shops ___ at 9 o\'clock every morning.', options:['opens','open','opening'], correct:'open', topic:'present-simple', why:'"The shops" is plural, so no -s: they open.' },
    { id:'a1_15', stem:'She ___ a dog and two cats.', options:['have','has','is'], correct:'has', topic:'have-has', why:'Third person singular: she has (not "she have").' }
  ],
  A2: [
    { id:'a2_01', stem:'I ___ my keys yesterday.', options:['losed','lost','lose'], correct:'lost', topic:'past-simple-irreg', why:'"Lose" is irregular: the past form is "lost", never "losed".' },
    { id:'a2_02', stem:'My brother is ___ than me.', options:['more tall','tallest','taller'], correct:'taller', topic:'comparatives', why:'Short adjectives form the comparative with -er: tall → taller.' },
    { id:'a2_03', stem:'We ___ visit our grandparents next weekend.', options:['are going to','going to','will to'], correct:'are going to', topic:'going-to', why:'"Going to" needs the verb "be": we are going to visit.' },
    { id:'a2_04', stem:'There isn\'t ___ milk in the fridge.', options:['some','a','any'], correct:'any', topic:'some-any', why:'Negatives take "any", not "some": there isn\'t any milk.' },
    { id:'a2_05', stem:'Look! It ___.', options:['rains','is raining','rained'], correct:'is raining', topic:'present-cont', why:'"Look!" signals right now, so use the present continuous: is raining.' },
    { id:'a2_06', stem:'She ___ to Paris last summer.', options:['goed','went','has gone'], correct:'went', topic:'past-simple-irreg', why:'"Go" is irregular: the past form is "went". "Last summer" signals past simple.' },
    { id:'a2_07', stem:'This is the ___ building in the city.', options:['taller','most tall','tallest'], correct:'tallest', topic:'superlatives', why:'Short adjectives form the superlative with -est: tall → tallest.' },
    { id:'a2_08', stem:'You ___ eat so much sugar. It\'s bad for you.', options:['shouldn\'t','don\'t should','mustn\'t to'], correct:'shouldn\'t', topic:'modal-advice', why:'"Should" forms its negative as "shouldn\'t" — no "do" or "to".' },
    { id:'a2_09', stem:'I ___ TV when the phone rang.', options:['watched','was watching','am watching'], correct:'was watching', topic:'past-cont', why:'An ongoing action interrupted by another uses past continuous: was watching.' },
    { id:'a2_10', stem:'He runs ___ than his brother.', options:['more fast','faster','more faster'], correct:'faster', topic:'comparatives', why:'Short adjectives: fast → faster. Never "more faster" (double comparative).' },
    { id:'a2_11', stem:'___ you ever been to London?', options:['Did','Have','Are'], correct:'Have', topic:'present-perf', why:'"Ever" with life experience takes the present perfect: have you ever been.' },
    { id:'a2_12', stem:'She ___ to play the piano when she was young.', options:['use','used','was used'], correct:'used', topic:'used-to', why:'"Used to" describes a past habit: she used to play.' },
    { id:'a2_13', stem:'If it rains, I ___ stay at home.', options:['would','will','am'], correct:'will', topic:'first-conditional', why:'First conditional: if + present → will + base form.' },
    { id:'a2_14', stem:'Tom is tall ___ to reach the shelf.', options:['too','enough','very'], correct:'enough', topic:'enough-too', why:'"Enough" comes after the adjective: tall enough.' },
    { id:'a2_15', stem:'I don\'t have ___ friends in this city.', options:['much','many','a lot'], correct:'many', topic:'much-many', why:'"Friends" is countable, so use "many" (not "much").' }
  ],
  B1: [
    { id:'b1_01', stem:'I have never ___ to Japan.', options:['be','was','been'], correct:'been', topic:'present-perfect', why:'The present perfect is have + past participle; the participle of "be" is "been".' },
    { id:'b1_02', stem:'If I ___ rich, I would travel the world.', options:['were','am','would be'], correct:'were', topic:'second-conditional', why:'Second conditional: if + past simple, and "were" for all persons after "if".' },
    { id:'b1_03', stem:'This house ___ in 1920.', options:['built','was built','has built'], correct:'was built', topic:'passive', why:'Past simple passive: was/were + past participle — was built.' },
    { id:'b1_04', stem:'I enjoy ___ books.', options:['to read','reading','read'], correct:'reading', topic:'gerund', why:'"Enjoy" is always followed by the gerund (-ing), never the infinitive.' },
    { id:'b1_05', stem:'She ___ here since 2019.', options:['has lived','lives','is living'], correct:'has lived', topic:'present-perf-since', why:'"Since" with a start point takes the present perfect: has lived.' },
    { id:'b1_06', stem:'He might ___ at the office right now.', options:['be','is','being'], correct:'be', topic:'modal-deduction', why:'After a modal verb use the base form: might be.' },
    { id:'b1_07', stem:'I want ___ a new language.', options:['learning','to learn','learn'], correct:'to learn', topic:'infinitive', why:'"Want" is followed by the to-infinitive: want to learn.' },
    { id:'b1_08', stem:'___ you mind opening the window?', options:['Do','Would','Are'], correct:'Would', topic:'polite-request', why:'"Would you mind" is the standard polite request form.' },
    { id:'b1_09', stem:'The film was ___ boring ___ I fell asleep.', options:['so … that','such … that','too … that'], correct:'so … that', topic:'so-such', why:'"So" + adjective + "that": so boring that I fell asleep.' },
    { id:'b1_10', stem:'I ___ this book for three hours. I\'m on page 200.', options:['read','have been reading','am reading'], correct:'have been reading', topic:'present-perf-cont', why:'An action that started in the past and is still going: have been reading.' },
    { id:'b1_11', stem:'You ___ be tired — you\'ve been working all day.', options:['can','must','should'], correct:'must', topic:'modal-deduction', why:'"Must" for strong deduction based on evidence: you must be tired.' },
    { id:'b1_12', stem:'The dog ___ by its owner every morning.', options:['walks','is walked','walked'], correct:'is walked', topic:'passive-present', why:'Present simple passive: the dog is walked (by someone).' },
    { id:'b1_13', stem:'He stopped ___ when his daughter was born.', options:['to smoke','smoking','smoke'], correct:'smoking', topic:'gerund-infinitive', why:'"Stop doing" = quit the habit. "Stop to do" = pause in order to do something else.' },
    { id:'b1_14', stem:'She asked me ___ I wanted to join them.', options:['that','if','do'], correct:'if', topic:'reported-questions', why:'Reported yes/no questions use "if" or "whether": she asked me if.' },
    { id:'b1_15', stem:'I\'ll call you ___ I arrive.', options:['until','as soon as','by the time'], correct:'as soon as', topic:'time-clauses', why:'"As soon as" means immediately when — I\'ll call the moment I arrive.' }
  ],
  B2: [
    { id:'b2_01', stem:'When I arrived, the film ___ already ___.', options:['has … started','had … started','did … start'], correct:'had … started', topic:'past-perfect', why:'The earlier of two past actions takes the past perfect: had started.' },
    { id:'b2_02', stem:'If you had studied, you ___ the exam.', options:['would pass','had passed','would have passed'], correct:'would have passed', topic:'third-conditional', why:'Third conditional: if + past perfect, would have + past participle.' },
    { id:'b2_03', stem:'He said he ___ the next day.', options:['will come','would come','comes'], correct:'would come', topic:'reported-speech', why:'Reported speech shifts "will" back to "would".' },
    { id:'b2_04', stem:'That\'s the man ___ dog bit me.', options:['who','which','whose'], correct:'whose', topic:'relative-clauses', why:'Possession in a relative clause needs "whose" — the man\'s dog.' },
    { id:'b2_05', stem:'I wish I ___ harder when I was at school.', options:['studied','had studied','would study'], correct:'had studied', topic:'wish-past', why:'Wishes about the past take the past perfect: I wish I had studied.' },
    { id:'b2_06', stem:'By this time next year, I ___ my degree.', options:['will finish','will have finished','am finishing'], correct:'will have finished', topic:'future-perfect', why:'An action completed before a future point: will have finished.' },
    { id:'b2_07', stem:'She denied ___ the money.', options:['to take','taking','take'], correct:'taking', topic:'gerund-after-deny', why:'"Deny" is followed by the gerund: denied taking.' },
    { id:'b2_08', stem:'Had I known about the problem, I ___ you.', options:['would tell','had told','would have told'], correct:'would have told', topic:'inverted-conditional', why:'Inverted third conditional: Had I known … I would have told.' },
    { id:'b2_09', stem:'The report, ___ was due on Friday, is still unfinished.', options:['that','which','what'], correct:'which', topic:'non-defining-rel', why:'Non-defining relative clauses (with commas) take "which", not "that".' },
    { id:'b2_10', stem:'He ___ have left already — his car is gone.', options:['can','must','should'], correct:'must', topic:'modal-past-deduction', why:'"Must have" for a confident deduction about the past.' },
    { id:'b2_11', stem:'I regret ___ you that the position has been filled.', options:['to inform','informing','inform'], correct:'to inform', topic:'regret-to-do', why:'"Regret to do" = sorry to say now; "regret doing" = sorry about a past action.' },
    { id:'b2_12', stem:'I\'d rather you ___ that again.', options:['don\'t do','didn\'t do','won\'t do'], correct:'didn\'t do', topic:'would-rather', why:'"Would rather + subject" takes past simple: I\'d rather you didn\'t do.' },
    { id:'b2_13', stem:'It\'s high time we ___ about the future.', options:['think','thought','will think'], correct:'thought', topic:'its-time', why:'"It\'s (high) time" + past simple: it\'s time we thought.' },
    { id:'b2_14', stem:'The project is expected ___ by December.', options:['finishing','to be finished','being finished'], correct:'to be finished', topic:'passive-infinitive', why:'Passive infinitive after "expected": expected to be finished.' },
    { id:'b2_15', stem:'___ what happens, I\'ll support you.', options:['However','No matter','Despite'], correct:'No matter', topic:'no-matter', why:'"No matter what" = regardless of what; "however" needs an adjective/adverb after it.' }
  ],
  C1: [
    { id:'c1_01', stem:'Rarely ___ such a talented singer.', options:['I have heard','I heard','have I heard'], correct:'have I heard', topic:'inversion', why:'After negative adverbs like "rarely", subject and auxiliary invert: rarely have I heard.' },
    { id:'c1_02', stem:'___ the report, she sent it to her manager.', options:['Having finished','Being finished','To finish'], correct:'Having finished', topic:'participle-clause', why:'A perfect participle clause shows the first action was complete: having finished.' },
    { id:'c1_03', stem:'The teacher suggested that he ___ the essay again.', options:['writes','write','to write'], correct:'write', topic:'subjunctive', why:'After "suggest that", use the base subjunctive — "write", no -s.' },
    { id:'c1_04', stem:'___ it not for your help, I would have failed.', options:['If it was','Had','Were'], correct:'Were', topic:'formal-inversion', why:'Formal inversion replaces "if it were not for": were it not for.' },
    { id:'c1_05', stem:'Scarcely had I arrived ___ the phone rang.', options:['than','when','then'], correct:'when', topic:'correlatives', why:'The pair is "scarcely … when"; "than" belongs with "no sooner".' },
    { id:'c1_06', stem:'No sooner had I sat down ___ someone knocked on the door.', options:['when','than','that'], correct:'than', topic:'correlatives', why:'The pair is "no sooner … than"; "when" belongs with "scarcely/hardly".' },
    { id:'c1_07', stem:'Only after reading the report ___ the seriousness of the situation.', options:['I understood','did I understand','I did understand'], correct:'did I understand', topic:'inversion', why:'After "only after …" the main clause inverts: did I understand.' },
    { id:'c1_08', stem:'She had her car ___ at the garage.', options:['repair','repaired','repairing'], correct:'repaired', topic:'causative', why:'Causative "have something done": had her car repaired (by someone).' },
    { id:'c1_09', stem:'It ___ that the company will close next year.', options:['is said','says','is saying'], correct:'is said', topic:'impersonal-passive', why:'Impersonal passive for reporting: "it is said that …".' },
    { id:'c1_10', stem:'He ___ have taken the earlier train — he arrived too late.', options:['should','must','could'], correct:'should', topic:'modal-criticism', why:'"Should have done" expresses criticism of a past action: he should have taken it.' },
    { id:'c1_11', stem:'Little ___ he know what was about to happen.', options:['does','did','was'], correct:'did', topic:'inversion', why:'Inverted narrative: "little did he know" — past tense, inversion after "little".' },
    { id:'c1_12', stem:'The more you practise, ___ you become.', options:['better','the better','more better'], correct:'the better', topic:'double-comparative', why:'The correlative comparative: "the more … the better" — both need "the".' },
    { id:'c1_13', stem:'I\'d sooner you ___ mention this to anyone.', options:['don\'t','didn\'t','won\'t'], correct:'didn\'t', topic:'sooner', why:'"I\'d sooner + subject" takes past simple, like "I\'d rather": didn\'t mention.' },
    { id:'c1_14', stem:'It is essential that every employee ___ the training.', options:['attends','attend','will attend'], correct:'attend', topic:'subjunctive', why:'After "it is essential that", use the base subjunctive: attend, no -s.' },
    { id:'c1_15', stem:'Nowhere ___ such beautiful scenery as in Scotland.', options:['you will find','will you find','you find'], correct:'will you find', topic:'inversion', why:'Negative adverb fronting: "Nowhere will you find" — subject-auxiliary inversion.' }
  ]
};
var LEVEL_ORDER = ['A1','A2','B1','B2','C1'];

var LEVELS = [
  { code:'C1', name:'Advanced',
    text:'You handle complex grammar like inversion and participle clauses. Keep pushing with the hardest material on the site.',
    links:[
      ['quiz-grammar-hardest.html','Grammar Quiz — Hardest'],
      ['abitur-activities.html','Abitur exam practice'],
      ['uni-activities.html','University & academic English']
    ]},
  { code:'B2', name:'Upper intermediate',
    text:'Your grammar is solid, including past perfect and third conditional. Time to polish the advanced structures.',
    links:[
      ['quiz-grammar-hard.html','Grammar Quiz — Hard'],
      ['themen/if-saetze.html','Conditionals — explanation & exercises'],
      ['themen/passiv.html','Passive — explanation & exercises']
    ]},
  { code:'B1', name:'Intermediate',
    text:'You have a good base: present perfect, passive and second conditional are on their way. Strengthen them now.',
    links:[
      ['quiz-grammar-medium.html','Grammar Quiz — Medium'],
      ['themen/present-perfect.html','Present perfect — explanation & exercises'],
      ['themen/gerund-infinitiv.html','Gerund or infinitive — explanation & exercises']
    ]},
  { code:'A2', name:'Elementary',
    text:'The basics are there. Focus on past tenses, comparatives and articles — they carry you to the next level.',
    links:[
      ['themen/simple-past.html','Simple past — explanation & exercises'],
      ['quiz-grammar-easy.html','Grammar Quiz — Easy'],
      ['themen/present-tenses.html','Present tenses — explanation & exercises']
    ]},
  { code:'A1', name:'Beginner',
    text:'Start with the foundations: present tenses, to be and basic word order. Small daily practice beats long rare sessions.',
    links:[
      ['themen/present-tenses.html','Present tenses — explanation & exercises'],
      ['quiz-grammar-easy.html','Grammar Quiz — Easy'],
      ['themen/index.html','All grammar topics']
    ]}
];

var QUESTIONS = {};   // id → { q, level }
LEVEL_ORDER.forEach(function(l) {
  POOL[l].forEach(function(q) { QUESTIONS[q.id] = { q: q, level: l }; });
});

// Validates the page's { level, answers: [[id, selected], ...] } against the
// pool. Returns null for anything the page itself would never send.
function scoreAnswers(data) {
  var level = null;
  LEVELS.forEach(function(lv) { if (lv.code === data.level) level = lv; });
  var answers = data.answers;
  if (!level || !Array.isArray(answers) || answers.length < 1 || answers.length > 20) return null;

  var seen = {}, items = [], correct = 0, per = {};
  LEVEL_ORDER.forEach(function(l) { per[l] = { correct: 0, total: 0 }; });
  for (var i = 0; i < answers.length; i++) {
    var a = answers[i];
    var entry = Array.isArray(a) && QUESTIONS.hasOwnProperty(a[0]) ? QUESTIONS[a[0]] : null;
    if (!entry || seen[a[0]] || entry.q.options.indexOf(a[1]) === -1) return null;
    seen[a[0]] = true;
    var ok = a[1] === entry.q.correct;
    if (ok) correct++;
    per[entry.level].total++;
    if (ok) per[entry.level].correct++;
    items.push({ q: entry.q, level: entry.level, selected: a[1], correct: ok });
  }
  var breakdown = LEVEL_ORDER.filter(function(l) { return per[l].total > 0; })
    .map(function(l) { return l + ': ' + per[l].correct + '/' + per[l].total; }).join(', ');
  return { level: level, items: items, score: correct + ' / ' + items.length, breakdown: breakdown };
}

// Same as fillGaps() in level-test.html: two-gap answers are "had … started".
function fillGaps(stem, answer) {
  var parts = answer.split(' … ');
  var i = 0;
  return stem.replace(/___/g, function() { return parts[i++] || ''; });
}

function sendFeedback(email, r) {
  var mistakes = r.items.filter(function(it) { return !it.correct; }).map(function(it) {
    return '[' + it.level + '] ' + fillGaps(it.q.stem, it.q.correct)
      + '\n   You chose: ' + it.selected + '\n   ' + it.q.why;
  }).join('\n\n');
  var links = r.level.links.map(function(l) {
    return l[1] + ': https://activities.englishonline.training/' + l[0];
  }).join('\n');
  var body = 'Your English level test result\n\n'
    + 'Estimated level: ' + r.level.code + ' — ' + r.level.name + '\n'
    + 'Score: ' + r.score + '\n'
    + 'By level: ' + r.breakdown + '\n\n'
    + r.level.text + '\n\n'
    + (mistakes ? 'Questions you missed:\n\n' + mistakes + '\n\n' : 'You made no mistakes — well done!\n\n')
    + 'Exercises to work on next:\n' + links + '\n\n'
    + 'This is a grammar-based estimate, not a full exam — speaking, listening and writing also count towards your real CEFR level.\n\n'
    + 'EnglishOnline.training — https://activities.englishonline.training/level-test.html';
  MailApp.sendEmail({ to: email, subject: 'Your English level test feedback', body: body, name: 'EnglishOnline.training' });
}
