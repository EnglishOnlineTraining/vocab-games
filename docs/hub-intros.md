# Hub intros and noindex change — for Claude Code

Repo: `EnglishOnlineTraining/vocab-games`

## 1. noindex three pages

Add these to `pages` in `data/noindex.json`, then run the build.
`build-head.js` adds the meta tag and `build-topic-pages.js` drops them from `sitemap.xml`.
The pages stay live and linked.

```json
{ "file": "7a-what-was-it-like.html", "indexedInstead": null, "group": "class-page" },
{ "file": "klasse7-mini.html", "indexedInstead": null, "group": "class-page" },
{ "file": "eurofiber-online.html", "indexedInstead": null, "group": "client-page" }
```

## 2. Hub intros

**Where:** in each hub, directly before `<!-- HUBCARDS:START`. Place it after the
`COUNT:END` marker and after any CTA button. Do not edit inside the generated markers.

**Language:** school hubs in German with "du", the same as `msa-activities.html`
(indexed). These pages use `<html lang="en">`, so each German section carries
`lang="de"`. The University hub is in English.

**Not included:** `business-activities.html` already has an intro.
`msa-activities.html` and `it-activities.html` are indexed.

Grammar names link to the matching `/themen/` page.

---

### 7g-activities.html

```html
  <section class="prose" lang="de">
    <h3 class="group-heading">Was du hier übst</h3>
    <p>Die Übungen für Klasse 7 am Gymnasium führen dich durch Großbritannien: London und seine Sehenswürdigkeiten, britisches Essen und britischer Sport, Tiere in Großbritannien und England zur Zeit der Tudors. Jede Übung verbindet ein Thema mit Wortschatz, Grammatik, Lesen oder Schreiben.</p>
    <p>Diese Grammatik kommt vor:</p>
    <ul>
      <li><a href="themen/present-perfect.html">Present Perfect</a>: <em>been</em> oder <em>gone</em>, <em>just</em>, <em>already</em>, <em>yet</em>, <em>ever</em> und <em>never</em></li>
      <li><a href="themen/past-perfect.html">Past Perfect</a> im Vergleich zum <a href="themen/simple-past.html">Simple Past</a></li>
      <li><a href="themen/if-saetze.html">If-Sätze Typ 3</a>: Was wäre passiert, wenn …?</li>
      <li><a href="themen/praepositionen.html">Präpositionen des Ortes</a></li>
    </ul>
    <p><strong>Typischer Fehler:</strong> Mit einer Zeitangabe wie <em>yesterday</em> steht kein Present Perfect. Richtig: <em>I saw the Tower yesterday.</em> Falsch: <em>I have seen the Tower yesterday.</em></p>

    <h3 class="group-heading">Wie die Übungen funktionieren</h3>
    <p>Jede Übung hat mehrere Schritte. Nach jedem Schritt siehst du sofort, was richtig ist und wo noch Fehler sind. Am Ende bekommst du eine Note von 1 bis 5. Du brauchst keine Anmeldung. Mit „Nur üben — ohne Abgabe“ geht es auch ohne Namenseingabe.</p>

    <h3 class="group-heading">So übst du am besten</h3>
    <p>Fang mit dem Thema an, das ihr gerade im Unterricht habt. Vor einer Klassenarbeit hilft die <a href="7g-review.html">gemischte Wiederholung</a>. Sie mischt Fragen aus mehreren Übungen.</p>
  </section>
```

### 7c-activities.html

```html
  <section class="prose" lang="de">
    <h3 class="group-heading">Was du hier übst</h3>
    <p>Die Übungen für Klasse 7 an der Oberschule drehen sich um Großbritannien: ein Schultag in einer britischen Schule, Ferien und Unterkünfte, England früher und heute, Schottland und seine Erfindungen und Robert the Bruce. Du übst vor allem Wortschatz, Schreiben und kurze Lesetexte.</p>
    <p>Dazu kommen diese Fertigkeiten:</p>
    <ul>
      <li><a href="themen/if-saetze.html">If-Sätze Typ 1</a>: Was passiert, wenn …?</li>
      <li>Den Weg beschreiben</li>
      <li>Mit dem Wörterbuch arbeiten</li>
      <li>Über die eigene Schule und den eigenen Wohnort schreiben</li>
    </ul>
    <p><strong>Typischer Fehler:</strong> Im <em>if</em>-Teil steht kein <em>will</em>. Richtig: <em>If it rains, we will stay at home.</em> Falsch: <em>If it will rain, we will stay at home.</em></p>

    <h3 class="group-heading">Wie die Übungen funktionieren</h3>
    <p>Jede Übung hat mehrere Schritte. Nach jedem Schritt siehst du sofort, was richtig ist und wo noch Fehler sind. Am Ende bekommst du eine Note von 1 bis 5. Du brauchst keine Anmeldung. Mit „Nur üben — ohne Abgabe“ geht es auch ohne Namenseingabe.</p>

    <h3 class="group-heading">So übst du am besten</h3>
    <p>Fang mit dem Thema an, das ihr gerade im Unterricht habt. Vor einer Klassenarbeit hilft die <a href="7c-review.html">gemischte Wiederholung</a>. Sie mischt Fragen aus mehreren Übungen.</p>
  </section>
```

### 8g-activities.html

```html
  <section class="prose" lang="de">
    <h3 class="group-heading">Was du hier übst</h3>
    <p>In Klasse 8 am Gymnasium geht es um die USA: New York, der Pacific Northwest, Familienleben in Ohio, Thanksgiving, amerikanische Erfindungen und das Leben an einer High School. Du liest Texte, lernst Wortschatz und schreibst eigene Texte wie eine Werbung, eine Online-Bewertung oder einen Reiseblog.</p>
    <p>Diese Grammatik kommt vor:</p>
    <ul>
      <li><a href="themen/adjektive-adverbien.html">Adjektiv oder Adverb</a> und Partizipien als Adjektive</li>
      <li><a href="themen/if-saetze.html">If-Sätze Typ 1 und 2</a></li>
      <li><a href="themen/gerund-infinitiv.html">Gerund und Infinitiv</a></li>
      <li><a href="themen/relativsaetze.html">Relativsätze</a></li>
      <li><a href="themen/question-tags.html">Question Tags</a></li>
      <li><a href="themen/modalverben.html">Modalverben</a> für Regeln</li>
    </ul>
    <p>Außerdem: Unterschiede zwischen amerikanischem und britischem Englisch und der Wechsel von informeller zu formeller Sprache.</p>
    <p><strong>Typischer Fehler:</strong> Ein Verb beschreibst du mit einem Adverb. Richtig: <em>She speaks English well.</em> Falsch: <em>She speaks English good.</em></p>

    <h3 class="group-heading">Wie die Übungen funktionieren</h3>
    <p>Jede Übung hat mehrere Schritte. Nach jedem Schritt siehst du sofort, was richtig ist und wo noch Fehler sind. Am Ende bekommst du eine Note von 1 bis 5. Du brauchst keine Anmeldung. Mit „Nur üben — ohne Abgabe“ geht es auch ohne Namenseingabe.</p>

    <h3 class="group-heading">So übst du am besten</h3>
    <p>Fang mit dem Thema an, das ihr gerade im Unterricht habt. Vor einer Klassenarbeit hilft die <a href="8g-review.html">gemischte Wiederholung</a>. Sie mischt Fragen aus mehreren Übungen.</p>
  </section>
```

### 8c-activities.html

```html
  <section class="prose" lang="de">
    <h3 class="group-heading">Was du hier übst</h3>
    <p>In Klasse 8 an der Oberschule reist du durch die USA: New York, der Mittlere Westen, der Süden, der Südwesten und Alaska. Du lernst Jugendliche aus den USA kennen, liest über Feste und Schulleben und schreibst über dich selbst und deine Erfahrungen.</p>
    <p>Diese Grammatik kommt vor:</p>
    <ul>
      <li><a href="themen/present-tenses.html">Simple Present und Present Progressive</a>, auch mit <em>he</em>, <em>she</em>, <em>it</em></li>
      <li><a href="themen/simple-past.html">Simple Past</a> mit unregelmäßigen Verben</li>
      <li><a href="themen/present-perfect.html">Present Perfect</a> mit <em>since</em> und <em>for</em></li>
      <li><a href="themen/adjektive-adverbien.html">Steigerung von Adjektiven</a> und die Stellung von Adverbien</li>
      <li><a href="themen/gerund-infinitiv.html">Gerund</a>: die <em>-ing</em>-Form als Nomen</li>
      <li><a href="themen/passiv.html">Passiv</a> im Simple Present</li>
      <li><a href="themen/relativsaetze.html">Relativsätze</a></li>
    </ul>
    <p><strong>Typischer Fehler:</strong> Bei <em>he</em>, <em>she</em> und <em>it</em> bekommt das Verb ein <em>-s</em>. Richtig: <em>Jake gets up at seven.</em> Falsch: <em>Jake get up at seven.</em></p>

    <h3 class="group-heading">Wie die Übungen funktionieren</h3>
    <p>Jede Übung hat mehrere Schritte. Nach jedem Schritt siehst du sofort, was richtig ist und wo noch Fehler sind. Am Ende bekommst du eine Note von 1 bis 5. Du brauchst keine Anmeldung. Mit „Nur üben — ohne Abgabe“ geht es auch ohne Namenseingabe.</p>

    <h3 class="group-heading">So übst du am besten</h3>
    <p>Fang mit dem Thema an, das ihr gerade im Unterricht habt. Vor einer Klassenarbeit hilft die <a href="8c-review.html">gemischte Wiederholung</a>. Sie mischt Fragen aus mehreren Übungen.</p>
  </section>
```

### 9g-activities.html

```html
  <section class="prose" lang="de">
    <h3 class="group-heading">Was du hier übst</h3>
    <p>In Klasse 9 am Gymnasium geht es um englischsprachige Länder: Australien, Kanada, Kalifornien, Indien, Irland und Neuseeland. Du liest Texte über Natur, Geschichte, Migration und Identität, lernst den Wortschatz dazu und schreibst eigene Texte. Dazu kommen Übungen zu Medien, Berufspraktikum und Leseverstehen.</p>
    <p>Diese Grammatik kommt vor:</p>
    <ul>
      <li><a href="themen/passiv.html">Passiv</a>, auch Passive Progressive und Passiv mit Infinitiv</li>
      <li><em>let</em>, <em>allow</em>, <em>make</em> und <em>have</em></li>
      <li><a href="themen/reported-speech.html">Reported Speech</a> und indirekte Fragen</li>
      <li><a href="themen/if-saetze.html">If-Sätze Typ 1 und 2</a></li>
      <li><a href="themen/gerund-infinitiv.html">Gerund und Infinitiv</a></li>
      <li><a href="themen/relativsaetze.html">Relativsätze</a> und Partizipien mit <em>-ing</em> und <em>-ed</em></li>
      <li><a href="themen/phrasal-verbs.html">Phrasal Verbs</a></li>
      <li><a href="themen/past-perfect.html">Past Perfect</a> beim Erzählen</li>
      <li><a href="themen/artikel.html">Artikel</a> und <a href="themen/question-tags.html">Question Tags</a></li>
    </ul>
    <p><strong>Typischer Fehler:</strong> In der indirekten Rede geht die Zeit meist einen Schritt zurück. Richtig: <em>He said that he was tired.</em> Falsch: <em>He said that he is tired.</em></p>

    <h3 class="group-heading">Wie die Übungen funktionieren</h3>
    <p>Jede Übung hat mehrere Schritte. Nach jedem Schritt siehst du sofort, was richtig ist und wo noch Fehler sind. Am Ende bekommst du eine Note von 1 bis 5. Du brauchst keine Anmeldung. Mit „Nur üben — ohne Abgabe“ geht es auch ohne Namenseingabe.</p>

    <h3 class="group-heading">So übst du am besten</h3>
    <p>Fang mit dem Thema an, das ihr gerade im Unterricht habt. Vor einer Klassenarbeit hilft die <a href="9g-review.html">gemischte Wiederholung</a>. Sie mischt Fragen aus mehreren Übungen.</p>
  </section>
```

### 9c-activities.html

```html
  <section class="prose" lang="de">
    <h3 class="group-heading">Was du hier übst</h3>
    <p>In Klasse 9 an der Oberschule geht es um Australien, Kanada und Südafrika und um Themen aus deinem Alltag: Handyzeit, soziale Medien, Gesundheit, Plastik im Meer, freiwillige Arbeit im Ausland und deine Pläne nach Klasse 10. Du übst auch, eine Stellenanzeige zu lesen und eine Bewerbung zu schreiben.</p>
    <p>Diese Grammatik kommt vor:</p>
    <ul>
      <li><a href="themen/passiv.html">Passiv</a> im Simple Present und Simple Past</li>
      <li><a href="themen/future-tenses.html">Zukunft</a>: <em>will</em>, <em>going to</em> oder Present Progressive</li>
      <li><a href="themen/if-saetze.html">If-Sätze Typ 1 und 2</a></li>
      <li><em>used to</em> und <a href="themen/simple-past.html">Simple Past</a></li>
      <li><a href="themen/present-perfect.html">Present Perfect oder Simple Past</a></li>
      <li><a href="themen/relativsaetze.html">Relativsätze</a> und <a href="themen/reported-speech.html">Reported Speech</a></li>
      <li><a href="themen/modalverben.html">Modalverben</a>: <em>must</em>, <em>have to</em>, <em>mustn't</em>, <em>should</em></li>
      <li><a href="themen/gerund-infinitiv.html">Gerund und Infinitiv</a> und <a href="themen/question-tags.html">Question Tags</a></li>
    </ul>
    <p><strong>Typischer Fehler:</strong> Nach <em>when</em> steht kein <em>will</em>, auch wenn es um die Zukunft geht. Richtig: <em>When I finish school, I will look for a job.</em> Falsch: <em>When I will finish school, …</em></p>

    <h3 class="group-heading">Wie die Übungen funktionieren</h3>
    <p>Jede Übung hat mehrere Schritte. Nach jedem Schritt siehst du sofort, was richtig ist und wo noch Fehler sind. Am Ende bekommst du eine Note von 1 bis 5. Du brauchst keine Anmeldung. Mit „Nur üben — ohne Abgabe“ geht es auch ohne Namenseingabe.</p>

    <h3 class="group-heading">So übst du am besten</h3>
    <p>Fang mit dem Thema an, das ihr gerade im Unterricht habt. Vor einer Klassenarbeit hilft die <a href="9c-review.html">gemischte Wiederholung</a>. Sie mischt Fragen aus mehreren Übungen.</p>
  </section>
```

### 10g-activities.html

```html
  <section class="prose" lang="de">
    <h3 class="group-heading">Was du hier übst</h3>
    <p>In Klasse 10 am Gymnasium geht es um Schottland, um die Geschichte der Schwarzen in den USA und um Jugendkultur: Musik, soziale Medien, Videospiele, politische Beteiligung und Identität. Fast jede Übung endet mit einer Schreibaufgabe, zum Beispiel einem Blogbeitrag, einer Rede oder einem Kommentar. Dazu kommen Kurzgeschichten mit Erzählperspektive und Symbolik sowie Mediation.</p>
    <p>Diese Grammatik kommt vor:</p>
    <ul>
      <li><a href="themen/linking-words.html">Linking Words</a> für Kontrast und Argumentation</li>
      <li><a href="themen/passiv.html">Passiv</a> in historischen Texten</li>
      <li><a href="themen/reported-speech.html">Reported Speech</a> mit Redeeinleitungsverben</li>
      <li><a href="themen/gerund-infinitiv.html">Gerund</a> und Infinitivkonstruktionen</li>
      <li>Partizipialsätze</li>
      <li><a href="themen/future-tenses.html">Future Perfect und Future Progressive</a></li>
      <li><a href="themen/modalverben.html">Modalverben</a> für Vermutungen</li>
      <li><a href="themen/if-saetze.html">If-Sätze</a> und <a href="themen/past-perfect.html">Past Perfect</a> beim Erzählen</li>
    </ul>
    <p><strong>Typischer Fehler:</strong> Nach einer Präposition steht das Gerund, nicht der Infinitiv. Richtig: <em>I'm interested in learning more.</em> Falsch: <em>I'm interested in to learn more.</em></p>

    <h3 class="group-heading">Wie die Übungen funktionieren</h3>
    <p>Jede Übung hat mehrere Schritte. Nach jedem Schritt siehst du sofort, was richtig ist und wo noch Fehler sind. Am Ende bekommst du eine Note von 1 bis 5. Du brauchst keine Anmeldung. Mit „Nur üben — ohne Abgabe“ geht es auch ohne Namenseingabe.</p>

    <h3 class="group-heading">So übst du am besten</h3>
    <p>Fang mit dem Thema an, das ihr gerade im Unterricht habt. Vor einer Klassenarbeit hilft die <a href="10g-review.html">gemischte Wiederholung</a>. Sie mischt Fragen aus mehreren Übungen.</p>
  </section>
```

### 10c-activities.html

```html
  <section class="prose" lang="de">
    <h3 class="group-heading">Was du hier übst</h3>
    <p>In Klasse 10 an der Oberschule geht es um Kanada, Indien, Neuseeland und den Commonwealth, um die Regierungssysteme von Großbritannien und den USA, um die EU und um Martin Luther King. Weitere Themen sind faire Löhne, Vorurteile und wie sich Sprache verändert. Fast jede Übung endet mit einer Schreibaufgabe.</p>
    <p>Diese Grammatik kommt vor:</p>
    <ul>
      <li><a href="themen/passiv.html">Passiv</a> im Präsens und in der Vergangenheit</li>
      <li><a href="themen/present-perfect.html">Present Perfect oder Simple Past</a></li>
      <li><a href="themen/if-saetze.html">If-Sätze Typ 1, 2 und 3</a></li>
      <li><a href="themen/past-progressive.html">Past Progressive</a> und <a href="themen/past-perfect.html">Past Perfect</a></li>
      <li><a href="themen/present-tenses.html">Present Tenses</a></li>
      <li><a href="themen/modalverben.html">Modalverben</a>: <em>must</em>, <em>have to</em>, <em>should</em></li>
      <li><a href="themen/linking-words.html">Linking Words</a></li>
    </ul>
    <p><strong>Typischer Fehler:</strong> Im Passiv brauchst du die dritte Verbform. Richtig: <em>The house was built in 1900.</em> Falsch: <em>The house was build in 1900.</em></p>

    <h3 class="group-heading">Wie die Übungen funktionieren</h3>
    <p>Jede Übung hat mehrere Schritte. Nach jedem Schritt siehst du sofort, was richtig ist und wo noch Fehler sind. Am Ende bekommst du eine Note von 1 bis 5. Du brauchst keine Anmeldung. Mit „Nur üben — ohne Abgabe“ geht es auch ohne Namenseingabe.</p>

    <h3 class="group-heading">So übst du am besten</h3>
    <p>Fang mit dem Thema an, das ihr gerade im Unterricht habt. Vor einer Klassenarbeit hilft die <a href="10c-review.html">gemischte Wiederholung</a>. Sie mischt Fragen aus mehreren Übungen. Für die Abschlussprüfung findest du die <a href="msa-activities.html">MSA-Übungen</a>.</p>
  </section>
```

### abitur-activities.html

```html
  <section class="prose" lang="de">
    <h3 class="group-heading">Die vier Schreibaufgaben im Abitur</h3>
    <p>Im Englisch-Abitur in Berlin und Brandenburg kommen vier Aufgabentypen vor. Zu jedem gibt es hier Übungen:</p>
    <ul>
      <li><strong>Text Analysis.</strong> Du untersuchst, wie ein Text seine Wirkung erzielt: Aufbau, Sprache und Stilmittel.</li>
      <li><strong>Argumentative Writing.</strong> Du schreibst einen Kommentar mit klarer Meinung, Argumenten und Gegenargumenten.</li>
      <li><strong>Writing Summaries.</strong> Du fasst die wichtigsten Aussagen eines Textes kurz und sachlich zusammen.</li>
      <li><strong>Mediation.</strong> Du gibst Informationen aus einem deutschen Text auf Englisch für einen bestimmten Leser wieder.</li>
    </ul>
    <p>Die Übungen behandeln die vier Themen des Zentralabiturs: Aims and Ambitions, Nations Between Tradition and Change, Science and Technology und The Impact of the Media on Society.</p>
    <p><strong>Typischer Fehler:</strong> In einem Summary steht deine eigene Meinung nicht. Du schreibst im Simple Present und mit eigenen Worten.</p>

    <h3 class="group-heading">Wie die Übungen funktionieren</h3>
    <p>Jede Übung hat fünf Schritte. Nach jedem Schritt siehst du sofort, was richtig ist. Am Ende prüfst du deinen eigenen Text mit einem Bewertungsbogen.</p>

    <h3 class="group-heading">So übst du am besten</h3>
    <p>Wähle zuerst den Aufgabentyp, der dir am schwersten fällt. Mach dann die Übung zum Thema, das ihr gerade im Kurs behandelt.</p>
  </section>
```

### uni-activities.html

```html
  <section class="prose">
    <h3 class="group-heading">What you practise here</h3>
    <p>These exercises are for university students who study or work in English. They cover two areas: academic writing and professional communication.</p>
    <ul>
      <li><strong>Academic writing.</strong> Hedging, cause and effect, paraphrasing and summarising, describing data and trends, and evaluating sources.</li>
      <li><strong>Professional communication.</strong> Building business relationships, multi-word verbs, a hotel case study, project management vocabulary and presentation skills.</li>
    </ul>
    <p><strong>Tip for German speakers:</strong> In academic English, strong claims need evidence. Write <em>This suggests that…</em>, not <em>This proves that…</em>, unless the data really proves it.</p>

    <h3 class="group-heading">How the exercises work</h3>
    <p>Each exercise has several steps. After each step, you see what is correct and where you made mistakes. You do not need to sign up. Use "Just practise" to work without entering your name.</p>

    <h3 class="group-heading">How to use them</h3>
    <p>Start with the skill you need for your next assignment. Before an exam, use the <a href="uni-review.html">mixed revision</a>. It takes questions from several exercises.</p>
  </section>
```

---

## 3. Check after build

- `node scripts/watchdog.js` passes. It checks noindex and sitemap agree.
- The sitemap no longer lists the three pages from section 1.
- Every `themen/` link above resolves. All 18 target files exist today.
