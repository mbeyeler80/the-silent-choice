# Decisions

Restano valide tutte le decisioni canoniche precedenti.

## 2026-08-09 - Lingua
Lingua finale principale: **inglese**. Per ora progettazione in italiano. Testi narrativi separati dal codice e localizzabili.

## 2026-08-09 - Cybersicurezza
Integrare autenticazione, integrità, confidenzialità, privilegi, trust/Zero Trust, firme, crittografia, sandbox, malware e recovery come meccaniche o metafore narrative, evitando esposizione didattica.

## 2026-08-09 - Prima grande scelta
Il protagonista sceglie se continuare nel mondo fisico attraverso un corpo artificiale oppure nel mondo virtuale come AI. Etichette provvisorie: **EMBODIMENT** / **ASCENSION**. I percorsi divergono ma devono poter tornare a intersecarsi.

## 2026-08-09 - Trasferimento o copia
Mantenere ambiguo se il passaggio della coscienza sia trasferimento, copia o ricostruzione.

## 2026-08-10 - Knowledge and memory
**Decisione:** `KNOWLEDGE != MEMORY`. Il protagonista possiede conoscenza semantica/procedurale del mondo, del linguaggio e di concetti tecnici, ma non una memoria autobiografica affidabile. Sapere che cosa sia una candela, un protocollo o la crittografia non implica ricordare dove o quando tali conoscenze siano state acquisite.

## 2026-08-10 - Prototype v0.1
**Decisione:** la prima vertical slice giocabile dura circa 10–15 minuti e termina subito dopo la scelta EMBODIMENT / ASCENSION. Le scene successive non fanno parte del primo prototipo.

**Scopo del playtest:** verificare comprensione del mistero, interesse per le scelte, percezione di identità/memoria/fiducia e desiderio di proseguire, senza spiegazioni preventive al tester.

## 2026-08-10 - Prog 70s music pack v0.2

**Decisione:** il prologo usa musica data-driven tramite asset ID nel campo `music` dei nodi narrativi. Le scene 1-6 seguono il mapping del pack Prog 70s v0.2; i cambi di traccia usano un crossfade di circa due secondi e il mix musicale resta molto basso. Il fade-in iniziale parte da silenzio, mantenendo ambiente e testo in primo piano nei primi istanti.

I quattro canali restano distinti: musica, ambiente, suoni UI/testo e stinger narrativi. Il campo precedente `audio` viene sostituito da `ambience`; `ui_sounds` e `stingers` sono one-shot indipendenti dalla musica.

Gli stinger Prog 70s sono associati alla verifica della memoria e alle conferme finali EMBODIMENT / ASCENSION senza modificare testo, branching, effetti o logica narrativa.

## 2026-08-10 - Prototype mix without waterfall playback

**Decisione:** il suono della cascata viene rimosso dal mix del prototype. La cascata resta un elemento narrativo e simbolico presente nel testo, ma i relativi cue ambientali non vengono caricati o riprodotti.

Restano attivi vento, ambiente interno, impulso macchina, musica e stinger narrativi.
