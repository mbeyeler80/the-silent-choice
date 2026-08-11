# Music & Sound Direction


**Versione:** 0.1  
**Data:** 2026-08-08


## Principio sonoro


Nel gioco il suono viene subito dopo il testo per importanza. Deve amplificare atmosfera, spazio e ritmo senza sovraccaricare la lettura.


## Apertura


Nei primi istanti **nessuna musica**.


Il giocatore percepisce prima:


1. il rumore continuo e distante della cascata;
2. il fruscio del vento;
3. eventuali piccoli suoni dell'ambiente;
4. solo in seguito, se necessario, elementi musicali.


Questo paesaggio sonoro deve far percepire isolamento, altezza, spazio e continuità.


## Cascata


La cascata non è soltanto ambiente. Può diventare un motivo sonoro ricorrente legato a cambiamento, flusso e memoria. In futuro il suo suono può ricomparire in luoghi o ricordi apparentemente lontani dall'eremo.


## Vento


Il vento deve essere irregolare e vivo, non un loop troppo evidente. Può accompagnare pause nel testo e momenti in cui il giocatore non riceve spiegazioni.


## Candele


Eventuali suoni delle fiamme devono essere quasi impercettibili. Il valore delle candele è soprattutto visivo e narrativo.


## Musica


La colonna sonora dovrà essere minimale e atmosferica. Prima ipotesi:


- elettronica ambient;
- texture sintetiche discrete;
- elementi acustici o rituali reinterpretati;
- pochi temi melodici riconoscibili;
- largo uso di silenzio e spazio.


Evitare musica continua per tutta l'esperienza.


## Silenzio


Il silenzio è parte della composizione. Può precedere una scelta, seguire una rivelazione o costituire una risposta narrativa.


## Temi musicali futuri


Possibili leitmotiv:


- origine;
- identità;
- controllo;
- libertà;
- luce;
- frammento/memoria.


La loro definizione verrà affrontata dopo il primo prototipo narrativo.


## Implementazione


Prevedere controlli separati per:


- musica;
- ambiente;
- effetti sonori;
- eventuali voci.

## Prototype v0.1 - Prog 70s pack v0.2

Nel prototype la musica è dichiarata nei nodi narrativi tramite asset ID e segue le sei scene: eremo (1-2), frammento (3), stanza silenziosa (4), terminale di continuità (5), scelta (6).

La musica parte da volume zero, sale gradualmente e rimane molto bassa sotto testo, ambiente ed eventi. I cambi di traccia usano un crossfade di circa due secondi; la scena 4 conserva un livello ancora più contenuto.

L'implementazione mantiene quattro canali distinti:

1. musica;
2. ambiente;
3. suoni UI/testo;
4. stinger narrativi.


## Memory integrity puzzle soundtrack

music_06_memory_integrity_puzzle.wav accompagna esclusivamente il puzzle. E un loop originale di 35 secondi in 7/8, molto discreto, con organo soffuso, texture Mellotron-like, synth analogico e basso pulsante leggero. Non usa batteria rock evidente, assoli, chitarre protagoniste o hiss continuo.

L'ingresso usa lo stesso crossfade di circa due secondi. Durante l'analisi la musica continua sotto i cue UI; un tentativo fallito usa una breve dissonanza non arcade. Alla soluzione il bed viene abbassato rapidamente, lo stinger di consistenza viene riprodotto e il passaggio alla scena 3 ripristina il normale crossfade.

Il livello registry della traccia e 0.12; sulla soluzione viene applicata una scala temporanea 0.18, mantenendo testo e segnali di sistema in primo piano.
