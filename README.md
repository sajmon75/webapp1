# 🥪 Paninoteca Scolastica - Ordinazioni Intervallo

Webapp moderna, veloce e responsive per la gestione completa delle ordinazioni dei panini e snack per l'intervallo nelle scuole superiori.

Progettata specificamente per l'uso pratico sia da **smartphone** (studenti e responsabili di classe) che da **PC / Tablet** (personale del bar e amministrazione scolastica).

---

## 🌟 Funzionalità Principali

### 1. Portale Pubblico Studenti (Mobile-First)
- **Catalogo Panini & Snack**: suddiviso in categorie (*Panini Caldi, Focacce & Piadine, Gluten Free & Veg, Snack & Dolci, Bevande*).
- **Personalizzazione**: aggiunta note per la cucina (es. *"senza maionese"*, *"pane integrale"*, *"ben tostato"*).
- **Controllo Scorte Opzionale**: mostra i pezzi rimanenti solo per gli istituti che attivano il tracciamento quantità.
- **Badge Esaurito**: prodotti non disponibili disabilitati in tempo reale.
- **Carrello Rapido & Countdown**: timer e orario limite di ricezione comande (*es. entro le ore 09:30*).
- **Tracciamento Ordine**: visualizzazione dello stato della comanda (*Bozza $\rightarrow$ Confermato dal Responsabile $\rightarrow$ In Cucina $\rightarrow$ Pronto per il ritiro $\rightarrow$ Consegnato*).

### 2. Dashboard Responsabile di Classe (Studente Incaricato)
- **Riepilogo Ordini Compagni**: lista in tempo reale di tutti i compagni della classe che hanno inserito un ordine.
- **Gestore Cassa & Raccolta Soldi**:
  - Tracker con caselle *"Pagato"* per spuntare i contanti consegnati da ciascun compagno.
  - Conteggio automatico: *Totale da portare al Bar*, *Già incassati*, *Ancora mancanti*.
- **Conferma Ordine per la Cucina**:
  - **Regola di business chiave**: gli ordini della classe rimangono in bozza finché il responsabile non li convalida; solo dopo la conferma diventano visibili alla cucina del bar!
- **Distinta di Ritiro Stampabile**: scheda digitale per facilitare il ritiro al bancone e la successiva distribuzione in aula.

### 3. Backoffice Servizio Ristorazione & Cucina Bar
- **Dashboard Produzione in Tempo Reale**:
  - **Vista Buste per Classe**: buste contrassegnate per Plesso e Classe con checklist interna, nominativo del responsabile e totale contanti da incassare al ritiro.
  - **Vista Preparazione Cumulativa**: distinta aggregata con il conteggio totale di panini per tipologia da farcire (es. *42 Panini Cotto, 25 Focacce, 15 Acque*), evidenziando le varianti speciali.
  - **Avanzamento Stato**: *"In Lavorazione"* $\rightarrow$ *"Segna Pronto"* $\rightarrow$ *"Ritirato con Contanti"*.
- **Gestione Listino Prezzi**:
  - Modifica prezzi, allergeni, descrizioni e categorie.
  - **Toggle 1-Click "Disponibile / Esaurito"**.
  - Impostazione scorte giornaliere massime (se attive).

### 4. Backoffice Amministrazione Scolastica
- **Multi-Scuola & Multi-Sede**: supporto a più istituti e plessi (es. *Sede Centrale*, *Succursale*).
- **Anagrafica Classi**: associazione delle aule e nomina del rispettivo studente Responsabile di Classe.
- **Configurazione Istituzionale**:
  - Abilitazione / Disabilitazione tracciamento scorte e quantità residue per singola scuola.
  - Impostazione dell'orario limite giornaliero di cutoff.

### 5. Autenticazione Ibrida & SSO
- **Built-in**: Email e Password con hashing sicuro bcrypt.
- **SSO Google & Microsoft**: supporto a Google Workspace for Education e Microsoft 365 Entra ID (`@istituto.edu.it`).
- **Barra Demo Switcher**: switch istantaneo con 1 click tra i profili per testare l'intera applicazione senza digitare password.

---

## 🚀 Avvio Rapido

Il server di sviluppo è già pronto. Per avviarlo manualmente:

```bash
# Avvio del server di sviluppo
npm run dev
```

L'applicazione sarà disponibile su: **http://localhost:3000**

---

## 🔑 Profili Demo Preconfigurati (Password: `password123`)

| Ruolo | Nome Utente | Email | Note |
|---|---|---|---|
| **Studente** | Mario Rossi | `mario.rossi@scuola.it` | Classe 3A - Sede Centrale |
| **Resp. Classe** | Luca Bianchi | `luca.bianchi@scuola.it` | Responsabile 3A (raccoglie soldi e conferma) |
| **Resp. Succursale** | Matteo Colombo | `matteo.colombo@scuola.it` | Responsabile 5A - Succursale |
| **Bar / Cucina** | Luigi Barista | `bar@scuola.it` | Servizio Ristorazione |
| **Admin Scuola** | Prof.ssa Anna | `admin@scuola.it` | Direzione e Gestione Plessi |

> **Suggerimento**: In basso a destra su qualsiasi pagina è presente il pulsante **"Switch Ruolo Demo"** per cambiare profilo istantaneamente senza effettuare logout!

---

## 🧪 Esecuzione Test End-to-End

Per verificare l'intero ciclo di vita (Studente ordina $\rightarrow$ Responsabile spunta cassa e convalida $\rightarrow$ Cucina riceve e impacchetta busta):

```bash
node test-api.mjs
```

---

## 📁 Struttura del Progetto

```
webapp1/
├── prisma/
│   ├── schema.prisma      # Schema database relazionale (Scuole, Sedi, Classi, Utenti, Prodotti, Ordini)
│   └── seed.ts            # Dati dimostrativi italiani precaricati
├── src/
│   ├── app/
│   │   ├── (student) /    # Pagina principale ordinazioni (mobile-first)
│   │   ├── mio-ordine/    # Dettaglio stato comanda dello studente
│   │   ├── responsabile/  # Pannello responsabile di classe (cassa + convalida ordine)
│   │   ├── backoffice/
│   │   │   ├── cucina/    # Dashboard cucina e preparazione buste per classe
│   │   │   ├── listino/   # Gestione prezzi, toggle esaurito e scorte
│   │   │   └── scuole/    # Anagrafica multi-scuola, plessi e impostazioni
│   │   ├── login/         # Pagina di accesso con credenziali e SSO
│   │   └── api/           # Endpoint REST Next.js 15 (Auth, Ordini, Prodotti, Scuole)
│   ├── components/
│   │   ├── Navbar.tsx     # Barra di navigazione responsive con badge classe
│   │   └── DemoSwitcher.tsx # Barra flottante 1-click per testare i ruoli
│   └── lib/
│       ├── auth.ts        # Gestione sessioni JWT (jose) e bcrypt
│       └── prisma.ts      # Singleton client database
└── test-api.mjs           # Suite di test automatizzati end-to-end
```

