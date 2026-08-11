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


## 2026-08-11 - Memory integrity consistency puzzle

**Decisione:** dopo il primo scambio di identita con il terminale, il prologo inserisce un puzzle data-driven di analisi della consistenza prima della scena 3. La definizione vive in game_data/puzzles/memory_integrity_v0_1.json; la UI interpreta i dati e non contiene il testo o la soluzione del puzzle.

Il principio canonico introdotto e: **integrity/provenance verification != truth**. Il sistema puo identificare un frammento meno coerente con la sequenza corrente, ma non certifica che sia falso. Per questo la soluzione dichiara "TRUTH STATUS: UNKNOWN." e non usa giudizi come "CORRECT".

Il puzzle usa stato separato dal narrative state e dall'audio state. Vengono conservati frammenti esaminati, numero di tentativi, numero di fallimenti, primo isolamento tentato e frammento finale isolato. Il narrative engine impedisce di lasciare il nodo finche il puzzle non e risolto.

Il motivo delle tre candele e reso nella stessa interfaccia terminale: la luce associata a un tentativo si spegne, torna lentamente dopo un reset fallito e resta spenta quando C viene isolato. La musica del puzzle e un asset dedicato e data-driven; UI cues e stinger rimangono categorie audio separate.

## 2026-08-11 - First Complete Playable Alpha 0.3.0

**Decisione:** la vertical slice 0.1 non e piu il limite eseguibile dell'app. L'alpha 0.3.0 conserva il prologo e lo estende con cinque capitoli e un finale completo, privilegiando un percorso end-to-end giocabile rispetto alla rifinitura di singole scene.

Le sei decisioni canoniche (`ontology`, `trace`, `self`, `control`, `center`, `continuity`) sono stato narrativo persistente. Il finale e risolto in modo deterministico in quattro famiglie, ognuna resa per EMBODIMENT e ASCENSION. I puzzle conservano stato e telemetria separati e non espongono un punteggio morale.

I salvataggi locali usano schema versionato 1, massimo tre continuita e checkpoint immutabili ai confini dei capitoli. Un ripristino crea una nuova continuita; la sostituzione di uno slot pieno richiede conferma esplicita tramite selezione.

Per la prima alpha sono accettati fondali riutilizzati e tracce procedurali provvisorie. Non si aggiunge testo di riempimento per raggiungere una durata nominale: ritmo e durata saranno misurati nel primo playtest completo.
## 2026-08-11 - Compass visible geometry

**Decisione:** The Compass non usa piu coordinate-obiettivo nascoste. I tre punti visibili sono segnali identitari etichettati; ogni condizione dichiara quali segnali devono rimanere dentro il campo e quale deve restare fuori. Il motore verifica la stessa geometria normalizzata mostrata dalla UI. Un campo piu grande non e automaticamente migliore, perche puo includere un segnale escluso. Questa regola rende comprensibile perche il centro debba adattarsi senza trasformare il puzzle in una ricerca di numeri arbitrari.
## 2026-08-11 - Last Allocation legibility

**Decisione:** Last Allocation mantiene capacità, soglie e progressione esistenti, porta la finestra a 60 secondi per fase e rende visibili i minimi operativi, la capacità libera e gli scostamenti da correggere. Il giocatore non deve dedurre numeri nascosti.

I quattro parametri vengono presentati come aspetti dell'identità: memoria, coerenza, relazione e continuità. Le tre riallocazioni esprimono che preservare un sé non significa conservare tutto: in condizioni diverse alcune parti devono contrarsi perché una continuità coerente possa sopravvivere. La spiegazione filosofica e le definizioni restano nei dati del puzzle, non nella logica React.
