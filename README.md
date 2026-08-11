# TextAdventure


Progetto di **avventura testuale narrativa per dispositivi mobili** ambientata in un futuro cyberpunk/postumano.


## Concept


Il giocatore controlla una entità cosciente astratta che non conosce la propria origine né la propria natura. La ricerca di sé è costruita attorno al paradosso della **Nave di Teseo**: recuperare ciò che si era può trasformare ciò che si è diventati.


Conflitto centrale: **libertà / controllo**.


## Apertura


La prima presa di coscienza avviene presso un eremo isolato in alta montagna. Le prime percezioni sono il rumore di una cascata e il vento. Alcune candele sono già accese. Non è chiaro perché l'entità si trovi lì né dove debba andare.


Il prologo usa testo descrittivo a scorrimento. Ordine di importanza espressiva:


**testo > suono > immagine > animazione**.


## Tecnologia prevista


- Visual Studio Code;
- React Native;
- Expo;
- TypeScript;
- Git;
- Codex come agente di sviluppo.


## Documentazione principale


- `docs/vision.md` - visione del progetto;
- `docs/design/game_design.md` - struttura dell'esperienza;
- `docs/design/story.md` - trama e prologo;
- `docs/design/world.md` - ambientazione;
- `docs/design/characters.md` - protagonista e personaggi;
- `docs/design/mechanics.md` - scelte, frammenti e identità;
- `docs/design/ui_ux.md` - interfaccia mobile;
- `docs/design/art_direction.md` - direzione visiva;
- `docs/design/music_direction.md` - direzione sonora;
- `docs/design/philosophical_framework.md` - quadro filosofico derivato anche dagli scritti dell'autore;
- `docs/development/decisions.md` - decisioni canoniche;
- `CHANGELOG.md` - cronologia.


## Stato

**First Complete Playable Alpha 0.3.0.**

Il percorso giocabile comprende Prologo, cinque capitoli, Finale, undici puzzle complessivi, sei decisioni persistenti, otto varianti finali, autosave locale e tre slot di continuità.

## Avvio dell'app mobile

Requisiti: Node.js, `pnpm`, Android Studio con un emulatore configurato oppure un telefono Android con Expo Go.

Installare le dipendenze dalla cartella del progetto:

```powershell
pnpm install
```

### Emulatore Android

Avviare prima l'emulatore da Android Studio, quindi eseguire:

```powershell
pnpm exec expo start --android --clear
```

Se Metro è già avviato, premere `a` nel terminale per aprire il gioco nell'emulatore.

### Telefono Android con Expo Go

Con computer e telefono collegati alla stessa rete:

```powershell
pnpm exec expo start --clear
```

Aprire Expo Go sul telefono e scansionare il codice QR mostrato da Metro.

I dettagli della milestone e i placeholder intenzionali sono descritti in `docs/development/full_alpha_v0_3.md`.
