# Sub-query maps — pilot topics (Tier 10.4)

_Drafted 2026-10-07 by CC. **The four draft sections were approved and added to
`data/topics.json` on 2026-10-08.** The four replacement opening sentences and the extra FAQ
entries (see "After approval") are not done yet._

AI search breaks one question into several smaller ones (query fan-out) and answers each
from whichever page section fits best. A topic page gets cited for a sub-query only if it
has a section that answers that sub-query on its own. This file lists the likely sub-queries
for the two pilot topics and checks each one against the live page (`data/topics.json` as of
this commit).

**Not measured.** There is no search-volume data behind the sub-query lists (Ahrefs calls
fail, see Tier 11.1). They come from the pages' own `aliases`, the FAQ questions, and the
structures German learners in Years 8–10 are tested on. Check them against the AI-answer log
from 2026-11-06 (Tier 10.7) before acting on the low-confidence rows.

Key: **✓** a section answers it on its own · **◐** mentioned but only in a rule, list item or
FAQ, with no section of its own · **✗** not covered.

## Passiv (`themen/passiv.html`)

| Sub-query | Section on the page | Status |
|---|---|---|
| How is the passive formed? (*Passiv bilden Englisch*) | Intro + "Passiv: die wichtigsten Regeln" | ✓ |
| Passive in every tense (*englisch passiv alle zeiten*) | "Das Passiv in allen Zeiten" | ✓ |
| Turning active into passive (*aktiv passiv englisch*) | "Aktiv oder Passiv — was ändert sich im Satz?" | ✓ |
| Passive with modal verbs | "Passiv mit Modalverben" | ✓ |
| When do you use *by*? | "Der by-Agent im Passiv …" | ✓ |
| Verbs with two objects (*She was given …*) | "Passiv bei Verben mit zwei Objekten" | ✓ |
| *get*-passive | "Das get-Passiv" | ✓ |
| When do you use the passive? | "Wann benutzt man das Passiv?" | ✓ |
| Common mistakes German learners make | "Typische Fehler beim Passiv" | ✓ |
| German *man* sentences in English | rule + FAQ only | ◐ |
| **Questions and negatives in the passive** (*Was it built? It wasn't built.*) | — | ✗ |
| **Passive with *say / believe / think*** (*It is said that … / He is said to be …*) | one error-list item only | ◐ |
| Passive infinitive and gerund (*to be done, being done*) | — | ✗ (lower priority) |
| Passive with phrasal / prepositional verbs (*The baby was looked after.*) | — | ✗ (lower priority) |
| *have something done* | — | ✗ out of scope: a separate structure, closer to its own topic |
| Practice (*Passiv Englisch Übungen*) | four practice sets + "alle Übungen" list | ✓ |

**Opening sentences.** Two existing sections don't open with a direct answer, so a chunk
lifted out of the page starts with filler:
- "Typische Fehler beim Passiv" opens "Diese fünf Fehler kosten in Klassenarbeiten die meisten
  Punkte." Suggested: "Die häufigsten Passiv-Fehler deutscher Lernender sind ein fehlendes
  *be*, die falsche Verbform und *from* statt *by*."
- "Das Passiv in allen Zeiten" opens "Nur das be ändert sich." Suggested: "In jeder Zeitform
  wird das Passiv mit einer Form von *be* + 3. Verbform gebildet; nur das *be* ändert sich."

## Gerundium & Infinitiv (`themen/gerund-infinitiv.html`)

| Sub-query | Section on the page | Status |
|---|---|---|
| When gerund, when infinitive? (*gerund or infinitive*) | Intro + "Gerundium & Infinitiv: die wichtigsten Regeln" | ✓ |
| Which verbs take *-ing*? (list) | "Verben mit Gerundium (-ing)" | ✓ |
| Which verbs take *to*? (list) | "Verben mit Infinitiv (to + Verb)" | ✓ |
| Verb + object + infinitive (*I want you to …*) | "Verb + Objekt + Infinitiv" | ✓ |
| After prepositions (*look forward to seeing*) | "Nach Präpositionen steht immer das Gerundium" | ✓ |
| Both forms, same meaning (*like, start*) | "Gerundium oder Infinitiv — beide möglich, gleiche Bedeutung" | ✓ |
| Both forms, different meaning (*remember, stop, try*) | "Gerundium oder Infinitiv — beide möglich, aber andere Bedeutung" | ✓ |
| Infinitive without *to* (*let, make*, modals) | "Infinitiv ohne to" | ✓ |
| Common mistakes | "Typische Fehler bei Gerundium und Infinitiv" | ✓ |
| Gerund as the subject (*Swimming is fun.*) | one rule + one error item | ◐ |
| **Adjective + infinitive** (*It's easy to learn. I'm happy to help.*) | — | ✗ |
| **Infinitive of purpose** (*I went out to buy milk*, not *for to buy / for buying*) | — | ✗ |
| Question word + infinitive (*I don't know what to do. how to …*) | — | ✗ (lower priority) |
| Gerund vs present participle | — | ✗ (lower priority, more a teacher query than a student one) |
| *used to / be used to / get used to* | one list item under prepositions | ◐ — probably its own topic |
| Practice (*gerund infinitive Übungen*) | four practice sets + "alle Übungen" list | ✓ |

**Opening sentences.**
- "Gerundium oder Infinitiv — beide möglich, aber andere Bedeutung" opens "Diese Gruppe
  entscheidet oft über die Note." Suggested: "Bei remember, forget, stop und try ändert die
  Wahl zwischen -ing und to die Bedeutung des Satzes."
- "Typische Fehler bei Gerundium und Infinitiv" opens "Diese vier Fehler tauchen in
  Klassenarbeiten immer wieder auf." Suggested: "Die häufigsten Fehler sind *to* nach
  *look forward to*, ein *that*-Satz nach *want* und *to* nach *enjoy*."

## Draft sections for approval

Each draft opens with a one-sentence answer and doesn't depend on the rest of the page (no
"siehe oben"). The heading names the topic, so `check-topic-headings.js` passes. Format is
the `sections[]` shape in `data/topics.json`.

### Passiv — questions and negatives

```json
{
  "h2": "Fragen und Verneinung im Passiv",
  "body": "Im Passiv bildet man Fragen und Verneinungen mit der Form von <em>be</em> — ohne <em>do</em> oder <em>did</em>. Für Fragen rückt <em>be</em> vor das Subjekt, für die Verneinung steht <em>not</em> direkt nach <em>be</em>.",
  "list": [
    "Frage: „<em>Was</em> the bridge <em>built</em> in 1890?“ — nicht: ✗ „Did the bridge built …?“",
    "Verneinung: „The bridge <em>wasn't built</em> in 1890.“",
    "Mit Fragewort: „When <em>was</em> the bridge <em>built</em>?“",
    "Present Perfect: „<em>Has</em> the letter <em>been sent</em>?“ — „It <em>hasn't been sent</em> yet.“",
    "Mit Modalverb: „<em>Can</em> it <em>be repaired</em>?“ — „It <em>can't be repaired</em>.“"
  ]
}
```

### Passiv — *It is said that …*

```json
{
  "h2": "Passiv mit say, believe und think: „It is said that …“",
  "body": "Deutsche Sätze wie „Man sagt, dass …“ werden im Englischen zum Passiv: entweder mit <em>It is said that …</em> oder mit der Person als Subjekt und <em>to</em> + Infinitiv. So funktionieren auch <em>believe, think, know, expect</em> und <em>report</em>.",
  "list": [
    "„Man sagt, dass er reich ist.“ → „<em>It is said that</em> he is rich.“",
    "Dasselbe mit der Person als Subjekt: „He <em>is said to be</em> rich.“",
    "„Man glaubt, dass das Bild gestohlen wurde.“ → „The painting <em>is believed to have been stolen</em>.“",
    "✗ „Man says that …“ — <em>man</em> gibt es im Englischen nicht."
  ]
}
```

### Gerundium & Infinitiv — adjective + infinitive

```json
{
  "h2": "Infinitiv nach Adjektiven: „It's easy to learn“",
  "body": "Nach den meisten Adjektiven steht der Infinitiv mit <em>to</em>: „It's easy <em>to learn</em>“, „I'm happy <em>to help</em>.“ Folgt auf das Adjektiv aber eine Präposition, steht wie immer das Gerundium: „I'm good <em>at learning</em>.“",
  "list": [
    "It + Adjektiv + to: „It's important <em>to sleep</em> well.“ · „It was hard <em>to find</em> the house.“",
    "Person + Adjektiv + to: „I'm glad <em>to hear</em> that.“ · „She was surprised <em>to see</em> him.“",
    "Adjektiv + Präposition + -ing: „afraid <em>of flying</em>“, „interested <em>in learning</em>“, „tired <em>of waiting</em>“",
    "✗ „I'm happy helping you.“ → ✓ „I'm happy <em>to help</em> you.“"
  ]
}
```

### Gerundium & Infinitiv — infinitive of purpose

```json
{
  "h2": "Infinitiv der Absicht: „to buy“, nicht „for to buy“",
  "body": "Um auszudrücken, wozu man etwas tut („um … zu“), steht im Englischen einfach der Infinitiv mit <em>to</em>: „I went to the shop <em>to buy</em> milk.“ Formeller geht auch <em>in order to</em>. <em>for</em> + -ing oder <em>for to</em> sind hier falsch.",
  "list": [
    "„Ich bin zum Laden gegangen, um Milch zu kaufen.“ → „I went to the shop <em>to buy</em> milk.“",
    "Formell: „We left early <em>in order to</em> catch the train.“",
    "Verneint: „We left early <em>so as not to</em> miss the train.“ / „<em>in order not to</em> miss …“",
    "✗ „I came here for to learn English.“ / ✗ „… for learning English.“ → ✓ „I came here <em>to learn</em> English.“",
    "<em>for</em> + Nomen ist richtig: „I went to the shop <em>for milk</em>.“"
  ]
}
```

## After approval

1. Add the approved sections to `data/topics.json` (passiv: after "Wann benutzt man das
   Passiv?"; gerund-infinitiv: after "Infinitiv ohne to"), and change the four opening sentences.
2. Consider an FAQ entry for each new section, so the `FAQPage` JSON-LD covers it too.
3. `node scripts/build.js`. The two pages re-date, which is correct.
4. Log the pages in the AI-answer tracking from 2026-11-06 (Tier 10.7).
