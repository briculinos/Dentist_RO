# Sistem Evaluare Medicală Pre-operatorie

Un sistem modern, securizat și conform GDPR pentru evaluarea medicală a pacienților înainte de intervenții chirurgicale stomatologice și de altă natură.

## Caracteristici principale

- **Interfață optimizată pentru tablete** - Text mare, butoane accesibile, perfectă pentru tablete Android ieftine
- **UX pentru vârstnici** - Design simplu, clar, ușor de folosit
- **Multi-tenant** - Suport pentru multiple clinici
- **GDPR compliant** - Consimțământ, audit logs, criptare date
- **Căutare avansată** - După nume, prenume, CNP
- **Arhivare** - Sistem complet de arhivare cu export
- **Formulare complete** - Toate secțiunile din chestionarul medical standard

## Arhitectură

### Backend
- **Node.js** + **Express** - Server API RESTful
- **PostgreSQL** - Bază de date relațională
- **Prisma ORM** - Gestionare bază de date
- **JWT** - Autentificare securizată
- **Winston** - Logging

### Frontend
- **React** - Framework UI modern
- **Material-UI** - Componente optimizate pentru tablete
- **Vite** - Build tool rapid
- **Zustand** - State management
- **Axios** - HTTP client

### Deployment
- **Docker** + **Docker Compose** - Deployment ușor pe server local
- **Nginx** - Reverse proxy pentru frontend

## Instalare și configurare

### Prerequisite

- Docker și Docker Compose instalate
- Minim 2GB RAM disponibil
- Port 3000 (frontend) și 5000 (backend) libere

### Instalare rapidă cu Docker

1. **Clonează sau copiază proiectul**
   ```bash
   cd Dentist_RO
   ```

2. **Configurare variabile de mediu**
   ```bash
   cp .env.example .env
   ```

   Editează `.env` și schimbă parolele:
   ```
   DB_PASSWORD=parola-ta-sigura-aici
   JWT_SECRET=secret-jwt-minim-32-caractere-foarte-sigur
   ```

3. **Pornește aplicația**
   ```bash
   docker-compose up -d
   ```

4. **Aplică migrațiile bazei de date și seed-ul**
   ```bash
   docker-compose exec backend npx prisma migrate deploy
   docker-compose exec backend node prisma/seed.js
   ```

5. **Accesează aplicația**
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:5000

### Credențiale de login inițiale

După seed, poți te autentifica cu:

**Admin:**
- Email: `admin@clinica.ro`
- Parolă: `admin123`

**Doctor:**
- Email: `doctor@clinica.ro`
- Parolă: `admin123`

**IMPORTANT:** Schimbă aceste parole imediat după prima autentificare!

## Configurare tabletă Android

### Recomandări hardware
- **RAM:** Minim 2GB
- **Android:** Versiune 8.0+
- **Browser:** Chrome sau Firefox
- **Ecran:** Minim 7 inch

### Setup rețea locală

1. Găsește IP-ul serverului local:
   ```bash
   ip addr show
   # sau pe macOS:
   ifconfig
   ```

2. Pe tabletă, deschide browserul și accesează:
   ```
   http://[IP_SERVER]:3000
   ```

3. **(Opțional)** Pentru acces mai ușor:
   - Adaugă la ecranul principal (Add to Home Screen)
   - Activează mod offline în browser

## Securitate și GDPR

### Măsuri de securitate implementate

- Autentificare JWT cu expirare
- Parole criptate cu bcrypt
- Rate limiting pe API
- Helmet.js pentru securitate HTTP
- CORS configurat
- Input validation
- SQL injection prevention (Prisma ORM)

### Conformitate GDPR

- Consimțământ explicit pacient
- Audit logs pentru toate operațiunile
- Dreptul la ștergere (soft delete)
- Export date personale
- Informații despre controller de date
- Notificări privind prelucarea datelor

## Utilizare

### 1. Adăugare pacient nou
1. Click pe "Pacient nou"
2. Completează datele personale
3. Bifează consimțământul GDPR
4. Salvează

### 2. Creare evaluare medicală
1. Selectează pacientul
2. Click "Evaluare nouă"
3. Completează toate secțiunile:
   - Informații declarant
   - Sarcină (pentru femei)
   - Alergii
   - Tratamente curente
   - Istoric medical complet
   - Intervenții anterioare
   - Consum substanțe
4. Semnează declarația
5. Salvează

### 3. Căutare și arhivare
- Caută pacienți după nume, prenume sau CNP
- Vezi istoric complet evaluări
- Arhivează dosare vechi
- Export pentru arhivare oficială

## Development local (fără Docker)

### Backend

```bash
cd backend

# Instalează dependențe
npm install

# Configurare
cp .env.example .env
# Editează .env cu datele tale

# Pornește PostgreSQL local sau folosește Docker:
docker run -d -p 5432:5432 -e POSTGRES_PASSWORD=postgres postgres:15

# Aplică migrațiile
npx prisma migrate dev

# Seed database
node prisma/seed.js

# Pornește serverul
npm run dev
```

### Frontend

```bash
cd frontend

# Instalează dependențe
npm install

# Pornește dev server
npm run dev
```

## Structura bazei de date

### Modele principale

- **Clinic** - Informații clinică (multi-tenant)
- **User** - Utilizatori (Admin, Doctor, Nurse, Receptionist)
- **Patient** - Date pacienți
- **MedicalEvaluation** - Evaluări medicale complete
- **AuditLog** - Jurnalizare operațiuni (GDPR)

## Backup și restore

### Backup bază de date

```bash
docker-compose exec postgres pg_dump -U postgres medical_evaluation > backup_$(date +%Y%m%d).sql
```

### Restore bază de date

```bash
docker-compose exec -T postgres psql -U postgres medical_evaluation < backup_20240101.sql
```

## Extensii viitoare

### În dezvoltare
- [ ] Export PDF complet pentru evaluări
- [ ] Semnătură electronică
- [ ] Notificări automate
- [ ] Statistici și rapoarte
- [ ] Integrare cu sisteme de programare

### Planificate
- [ ] Suport pentru alte tipuri de chirurgie (estetică, generală)
- [ ] Aplicație mobilă nativă
- [ ] OCR pentru scanare documente
- [ ] Integrare cu CNAS/CAS

## Depanare

### Aplicația nu pornește

```bash
# Verifică logs
docker-compose logs backend
docker-compose logs frontend

# Restart servicii
docker-compose restart
```

### Erori de conexiune la baza de date

```bash
# Verifică starea PostgreSQL
docker-compose ps postgres

# Restart PostgreSQL
docker-compose restart postgres
```

### Port-uri ocupate

```bash
# Schimbă port-urile în docker-compose.yml
# De exemplu, pentru frontend:
ports:
  - "8080:80"  # în loc de 3000:80
```

## Suport

Pentru probleme sau întrebări:
1. Verifică această documentație
2. Caută în Issues pe GitHub
3. Contactează echipa de dezvoltare

## Licență

Acest proiect este dezvoltat pentru uz medical și trebuie folosit conform legislației în vigoare privind datele medicale și GDPR.

---

**Dezvoltat pentru medicii din România**
