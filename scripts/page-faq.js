/**
 * page-faq.js — the "Häufige Fragen" content for the two hubs whose job is to
 * answer exactly these questions.
 *
 * One source, two consumers: scripts/build-head.js renders it as a visible
 * <section> inside an FAQ:START/FAQ:END block on the page **and** as the
 * `FAQPage` JSON-LD in the same page's HEAD block. Keeping both from one file is
 * the point — structured data that answers a question the page itself does not
 * answer is markup spam, and would drift the moment either half was edited alone.
 *
 * Answers are plain text (they are re-used verbatim inside JSON), so no markup
 * here. German, because both pages target German search queries.
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
};
