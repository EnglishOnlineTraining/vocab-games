/**
 * page-faq.js — the FAQ content for the hub pages whose job is to answer
 * exactly these questions.
 *
 * One source, two consumers: scripts/build-head.js renders it as a visible
 * <section> inside an FAQ:START/FAQ:END block on the page **and** as the
 * `FAQPage` JSON-LD in the same page's HEAD block. Keeping both from one file is
 * the point — structured data that answers a question the page itself does not
 * answer is markup spam, and would drift the moment either half was edited alone.
 *
 * Answers are plain text (they are re-used verbatim inside JSON), so no markup
 * here. Most entries are German, because those pages target German search
 * queries; business-activities.html and it-activities.html are English,
 * matching those two pages' own language (see faqSection() in build-head.js,
 * which picks the heading text and lang attribute from the page's own
 * <html lang> rather than assuming German).
 */

module.exports = {
  'msa-activities.html': [
    {
      q: 'Was ist der MSA?',
      a: 'Der Mittlere Schulabschluss (MSA) ist der Schulabschluss am Ende der 10. Klasse in Berlin '
        + 'und Brandenburg. Die schriftliche Englischprüfung besteht aus drei Teilen: Hörverstehen, '
        + 'Leseverstehen und Schreiben.',
    },
    {
      q: 'Aus welchen Teilen besteht die MSA-Englischprüfung?',
      a: 'Aus drei Teilen: Hörverstehen mit zwei Hörtexten, Leseverstehen mit einem oder mehreren '
        + 'Texten und Aufgaben dazu, und Schreiben — ein zusammenhängender Text wie eine E-Mail, ein '
        + 'Blogbeitrag oder ein Kommentar. Jede Übungseinheit auf dieser Seite ist genauso aufgebaut.',
    },
    {
      q: 'Wie oft darf ich einen Hörtext hören?',
      a: 'Zweimal, genau wie in der echten Prüfung. Die Übungen auf dieser Seite setzen dieses Limit '
        + 'automatisch durch: Nach dem zweiten Abspielen lässt sich der Text nicht mehr starten.',
    },
    {
      q: 'Wie wird die MSA-Prüfung bewertet?',
      a: 'Nach der offiziellen Bewertungstabelle für den MSA in Berlin und Brandenburg (Stand 2018). '
        + 'Die erreichten Punkte werden auf die 75-Punkte-Skala der Prüfung umgerechnet: ab 70 Punkten '
        + 'Note 1, ab 63 Note 2, ab 55 Note 3, ab 45 Note 4 und ab 23 Note 5. Die Übungen auf dieser '
        + 'Seite rechnen genau nach dieser Tabelle.',
    },
    {
      q: 'Welches Sprachniveau brauche ich für den MSA in Englisch?',
      a: 'Die MSA-Englischprüfung liegt ungefähr auf Niveau B1 des Gemeinsamen Europäischen '
        + 'Referenzrahmens (GER).',
    },
    {
      q: 'Sind die Übungen kostenlos? Muss ich mich anmelden?',
      a: 'Die Übungen sind kostenlos und ohne Anmeldung nutzbar. Mit der Schaltfläche „Nur üben — ohne '
        + 'Abgabe“ bearbeitest du jede Einheit, ohne einen Namen einzugeben; die Auswertung siehst du '
        + 'trotzdem sofort.',
    },
    {
      q: 'Woher kommen die Hörtexte?',
      a: 'Sie werden direkt im Browser über die Sprachausgabe deines Geräts erzeugt — es wird keine '
        + 'Audiodatei geladen. Stimme und Akzent hängen deshalb von deinem Browser und Betriebssystem '
        + 'ab und klingen nicht wie eine Studioaufnahme. Zum Üben des Prüfungsformats reicht das.',
    },
  ],

  'abitur-mediation.html': [
    {
      q: 'Was ist Mediation (Sprachmittlung) im Abitur?',
      a: 'Bei der Sprachmittlung gibst du den Inhalt eines deutschen Textes auf Englisch wieder — für '
        + 'eine bestimmte Leserschaft und einen bestimmten Zweck, die in der Aufgabe genannt werden. '
        + 'Es ist keine Übersetzung: Du wählst aus, was für den Auftrag relevant ist, und lässt den '
        + 'Rest weg.',
    },
    {
      q: 'Was ist der Unterschied zwischen Sprachmittlung und Übersetzung?',
      a: 'Eine Übersetzung überträgt den ganzen Text möglichst genau. Bei der Sprachmittlung entscheidet '
        + 'der Auftrag: Adressat, Textsorte und Zweck bestimmen, welche Informationen du übernimmst und '
        + 'wie du sie formulierst. Sätze eins zu eins zu übertragen kostet Punkte, auch wenn sie '
        + 'grammatisch richtig sind.',
    },
    {
      q: 'Wie lang soll eine Mediation im Abitur sein?',
      a: 'In den Abituraufgaben sind meist etwa 100 bis 150 Wörter vorgegeben. Halte dich an die '
        + 'Wortangabe im Auftrag — deutlich zu kurz oder zu lang wird in der Bewertung berücksichtigt.',
    },
    {
      q: 'Worauf achten die Prüfer bei der Sprachmittlung?',
      a: 'Auf fünf Dinge: die Auswahl der für den Auftrag relevanten Informationen, ein zum Adressaten '
        + 'passendes Register, eigenständige Formulierungen statt Wort-für-Wort-Übertragung, das '
        + 'Vermeiden von Germanismen und eine kurze Erklärung kulturspezifischer Begriffe.',
    },
    {
      q: 'Was sind Germanismen und wie vermeide ich sie?',
      a: 'Germanismen sind Formulierungen, die direkt aus dem Deutschen übernommen sind und im '
        + 'Englischen falsch oder unidiomatisch klingen — etwa „handy“ statt mobile phone, „become“ '
        + 'für bekommen, „informations“ im Plural oder „since three years“ statt for three years. '
        + 'Wer den Inhalt erst versteht und dann frei auf Englisch formuliert, macht sie seltener als '
        + 'wer Satz für Satz überträgt.',
    },
    {
      q: 'Muss ich deutsche Begriffe wie Abitur oder Bundesland erklären?',
      a: 'Ja, wenn die Leserschaft im Auftrag sie nicht kennt. Eine kurze Erklärung im Satz reicht, '
        + 'zum Beispiel „the Abitur, the German school-leaving exam“ oder „a Bundesland, one of '
        + 'Germany’s sixteen federal states“.',
    },
    {
      q: 'Welche Themen kommen in der Mediation vor?',
      a: 'Die vier Übungspakete auf dieser Seite folgen den Berliner und Brandenburger '
        + 'Schwerpunktthemen: Aims and Ambitions, Nations Between Tradition and Change, Science and '
        + 'Technology sowie The Impact of the Media on Society.',
    },
  ],

  'abitur-text-analysis.html': [
    {
      q: 'Was ist eine Text Analysis im Abitur?',
      a: 'Eine Analyse, wie ein Text auf sein Publikum wirkt und mit welchen sprachlichen Mitteln er das '
        + 'erreicht — nicht nur eine Liste gefundener Stilmittel, sondern die Verbindung aus Mittel, '
        + 'Textstelle und Wirkung.',
    },
    {
      q: 'Was bedeuten Purpose, Audience und Tone?',
      a: 'Purpose ist das Ziel des Textes — informieren, überzeugen, unterhalten, aufrütteln. Audience ist '
        + 'die Zielgruppe, erkennbar an Wortwahl und Anrede. Tone ist die Grundhaltung — sachlich, '
        + 'ironisch, dringlich, persönlich. Alle drei bestimmen zusammen, wie ein Text zu lesen ist.',
    },
    {
      q: 'Reicht es, rhetorische Mittel aufzuzählen?',
      a: 'Nein. Ein Stilmittel allein ist noch keine Analyse — erst die Verbindung aus Mittel, Textstelle '
        + 'und Wirkung auf das Publikum zählt. Eine Liste gefundener Begriffe ohne diese Verbindung bringt '
        + 'kaum Punkte.',
    },
    {
      q: 'Wie ist ein Analyseaufsatz aufgebaut?',
      a: 'Eine Einleitung mit Titel, Autor, Textsorte und Thema; ein Hauptteil, der Stilmittel mit ihrer '
        + 'Wirkung verbindet statt sie nur aufzuzählen, mit jeweils einem Punkt pro Absatz; und ein Schluss, '
        + 'der die Gesamtwirkung des Textes einordnet.',
    },
    {
      q: 'Welche rhetorischen Mittel kommen im Abitur am häufigsten vor?',
      a: 'Rhetorical question, anecdote, statistic, metaphor, direct address, tricolon und antithesis — '
        + 'diese sieben Mittel decken die meisten Abiturtexte ab. Jedes hat eine typische Wirkung: eine '
        + 'rhetorische Frage regt zum Nachdenken an, eine Anekdote macht einen Punkt persönlich, ein '
        + 'Tricolon (drei parallele Begriffe) sorgt für Rhythmus und Nachdruck.',
    },
    {
      q: 'Wie lang muss die vollständige Analyse sein?',
      a: 'In den Übungspaketen dieser Seite sind 150–200 Wörter für den letzten Schritt vorgegeben — '
        + 'ähnlich wie im echten Abitur, wo die Wortangabe im Aufgabentext steht.',
    },
  ],

  'abitur-argumentative-writing.html': [
    {
      q: 'Was verlangt ein Argumentationsaufsatz im Abitur?',
      a: 'Beide Seiten eines Themas darstellen, sie mit konkreten Argumenten stützen — nicht nur '
        + 'behaupten — und am Ende eine eigene, klar begründete Position beziehen. Ein Aufsatz, der nur '
        + 'eine Seite zeigt, gilt als unausgewogen.',
    },
    {
      q: 'Wie ist ein Argumentationsaufsatz aufgebaut?',
      a: 'Einleitung mit Themeneinordnung, ein bis zwei Argumente für die eine Position, ein bis zwei '
        + 'Argumente für die andere Position, eine begründete eigene Stellungnahme, und ein Schluss, der '
        + 'die Kernaussage zusammenfasst, ohne neue Argumente einzuführen.',
    },
    {
      q: 'Was unterscheidet ein starkes von einem schwachen Argument?',
      a: 'Ein starkes Argument ist konkret und durch ein Beispiel, eine Zahl oder eine plausible Konsequenz '
        + 'gestützt. „Homework helps students learn“ ist eine bloße Behauptung; „Homework gives students a '
        + 'structured chance to practise skills without the pressure of being watched“ ist ein Argument, '
        + 'weil es erklärt, warum.',
    },
    {
      q: 'Welche Konnektoren passen zu welcher Funktion?',
      a: 'however/on the other hand für Gegensätze, as a result/consequently für Ursache und Wirkung, '
        + 'although/admittedly für ein Zugeständnis, in addition/furthermore für einen weiteren Punkt, und '
        + 'in conclusion/to sum up für den Schluss.',
    },
    {
      q: 'Wie lang muss der vollständige Aufsatz sein?',
      a: 'In den Übungspaketen dieser Seite sind 200–250 Wörter für den letzten Schritt vorgegeben — '
        + 'ähnlich wie im echten Abitur, wo die Wortangabe im Aufgabentext steht.',
    },
  ],

  'abitur-writing-summaries.html': [
    {
      q: 'Was ist eine Summary im Abitur-Englisch?',
      a: 'Eine kurze Wiedergabe der Kernaussagen eines Textes in eigenen Worten — ohne Details, Beispiele '
        + 'oder rhetorische Ausschmückungen des Originals zu übernehmen. Wer Sätze aus dem Original nur '
        + 'leicht verändert übernimmt, verliert Punkte, auch wenn der Inhalt stimmt.',
    },
    {
      q: 'In welcher Zeitform schreibt man eine Summary?',
      a: 'Im Simple Present, selbst wenn der Originaltext in der Vergangenheit geschrieben ist: „The '
        + 'article explains that …“, nicht „explained“.',
    },
    {
      q: 'Darf man in einer Summary die eigene Meinung einbringen?',
      a: 'Nein. Eine Summary gibt die Ideen der Autorin oder des Autors wieder, nicht die eigene Meinung — '
        + '„I think …“ oder „In my opinion …“ gehören nicht hinein.',
    },
    {
      q: 'Was sind Umbrella Sentences?',
      a: 'Sätze, die mehrere Einzelheiten unter einer allgemeinen Aussage bündeln, statt sie einzeln '
        + 'aufzuzählen: statt drei Beispiele aufzulisten, schreibt man „The article gives several examples '
        + 'of this trend.“',
    },
    {
      q: 'Wie unterscheidet man Kernaussage, Detail und Irrelevantes?',
      a: 'Eine Kernaussage gehört unbedingt in die Zusammenfassung. Ein Detail stützt eine Kernaussage, '
        + 'gehört aber meist nicht selbst hinein. Irrelevant für eine Zusammenfassung sind Beispiele, '
        + 'Anekdoten und rhetorische Fragen — sie machen den Originaltext lebendig, tragen aber keine '
        + 'eigene Kernaussage.',
    },
    {
      q: 'Wie lang muss die vollständige Zusammenfassung sein?',
      a: 'In den Übungspaketen dieser Seite sind 100–120 Wörter für den letzten Schritt vorgegeben — '
        + 'ähnlich wie im echten Abitur, wo die Wortangabe im Aufgabentext steht.',
    },
  ],

  'business-activities.html': [
    {
      q: 'Are these Business English exercises free?',
      a: 'Yes, all 18 exercises are free and need no sign-up. Use "Just practise" on any exercise to '
        + 'work through it without entering a name — you still get instant feedback and a score.',
    },
    {
      q: 'Who are these exercises for?',
      a: 'Adult learners and professionals who want to practise workplace English — writing emails, '
        + 'running meetings, negotiating, presenting, or reading a business case study and responding to '
        + 'it in writing. No prior business-English course is required.',
    },
    {
      q: 'Are the exercises based on real business situations?',
      a: 'Several are: the Mercedes exercise works through a real change-management case, and Eurofiber '
        + 'Online is built around an actual internal-communications scenario at a fibre-network provider, '
        + 'rather than a generic textbook dialogue.',
    },
    {
      q: 'How are the exercises scored?',
      a: 'Each exercise grades itself automatically as you go and shows a score and grade at the end, so '
        + 'you get feedback immediately rather than waiting for a teacher to mark it.',
    },
    {
      q: 'Is this the same as the corporate training Shaun offers?',
      a: 'No — these are free self-study exercises. The corporate Business English training (linked above) '
        + 'is a separate, paid programme for companies; the two are independent of each other.',
    },
  ],

  'it-activities.html': [
    {
      q: 'Are these IT English exercises free?',
      a: 'Yes, all 12 exercises are free and need no sign-up. Use "Just practise" on any exercise to work '
        + 'through it without entering a name — you still get instant feedback and a score.',
    },
    {
      q: 'Who are these exercises for?',
      a: 'Vocational IT trainees (Auszubildende) at roughly B1–B2 level. The reading texts and vocabulary '
        + 'are drawn from real IT workplace situations — tickets, security incidents, hardware faults, '
        + 'stand-up meetings — rather than general office English.',
    },
    {
      q: 'What level are the exercises?',
      a: 'Around B1–B2 on the CEFR scale — appropriate for IT apprentices partway through their training, '
        + 'building on general English toward the vocabulary and reading skills an IT role needs.',
    },
    {
      q: 'Can a trainer see a student\'s results?',
      a: 'Each unit ends with an optional "send to teacher" step, so a trainer can review a class\'s '
        + 'answers — but it is optional, and "Just practise" mode skips it entirely for self-study.',
    },
    {
      q: 'Do the exercises cover AI and modern IT topics?',
      a: 'Yes — alongside networking, cybersecurity and project management basics, there are units on '
        + 'Smart Tech, AI & Industry 4.0 and Conventional & AI-Assisted Programming.',
    },
  ],

  'ielts-vocabulary-glossary.html': [
    {
      q: 'How many words does the glossary cover?',
      a: '85 terms often used in IELTS reading, listening and writing tasks, each with a part of '
        + 'speech, a plain-English definition and an example sentence.',
    },
    {
      q: 'Is this glossary free? Do I need an account?',
      a: 'Yes, it is completely free and needs no sign-up. Nothing you search or click is recorded '
        + 'or sent anywhere — it only runs in your browser.',
    },
    {
      q: 'How does the matching game work?',
      a: 'Each round picks 8 random terms from the glossary. Click a word, then click the definition '
        + 'you think matches it; a correct pair turns green and stays matched, a wrong pair shakes '
        + 'and resets so you can try again. Click "New Round" for a fresh set of 8.',
    },
    {
      q: 'Can I filter the glossary by word type?',
      a: 'Yes — the Glossary tab has chips for noun, verb, adjective, adverb, phrase and phrasal '
        + 'verb, plus a search box that matches against both the word and its definition.',
    },
    {
      q: 'Is my score in the matching game saved anywhere?',
      a: 'No. The score shown during a round is just for you to see how you did — it resets on the '
        + 'next round and is never stored or sent to anyone.',
    },
  ],
};
