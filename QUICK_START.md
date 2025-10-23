# 🚀 Quick Start Guide

## Pornire rapidă (5 minute)

### Pentru Linux/macOS:

```bash
./setup.sh
```

### Pentru Windows:

```cmd
setup.bat
```

Atât! Scriptul va:
1. Crea fișierul `.env` cu parole sigure
2. Porni containerele Docker
3. Crea baza de date
4. Adăuga utilizatori demo

## Accesare aplicație

Deschide browser-ul și accesează: **http://localhost:3000**

### Login:
- **Email:** admin@clinica.ro
- **Parolă:** admin123

⚠️ Schimbă parola imediat după prima autentificare!

## Accesare de pe tabletă (aceeași rețea Wi-Fi)

1. Găsește IP-ul computerului:
   - Windows: `ipconfig`
   - Linux/macOS: `ifconfig` sau `ip addr`

2. Pe tabletă, deschide browser și accesează:
   ```
   http://[IP_COMPUTER]:3000
   ```
   Exemplu: `http://192.168.1.100:3000`

3. Salvează ca bookmark sau adaugă pe ecranul principal

## Comenzi utile

### Oprire aplicație
```bash
docker-compose down
```

### Restart aplicație
```bash
docker-compose restart
```

### Vezi logs
```bash
docker-compose logs -f backend
docker-compose logs -f frontend
```

### Backup bază de date
```bash
docker-compose exec postgres pg_dump -U postgres medical_evaluation > backup.sql
```

## Utilizare de bază

### 1. Adăugare pacient
1. Click "Pacienți" în meniu
2. Click "Pacient nou"
3. Completează formularul
4. Bifează consimțământul GDPR
5. Click "Salvează și creează evaluare"

### 2. Completare evaluare medicală
1. Completează secțiunile din accordion
2. Bifează condiții medicale relevante
3. Adaugă detalii unde este necesar
4. La final, bifează "Confirm și semnez declarația"
5. Click "Salvează evaluarea"

### 3. Căutare pacient
1. Click "Căutare" în meniu
2. Introdu nume, prenume sau CNP
3. Click pe pacient pentru detalii
4. Vezi istoricul evaluărilor

## Probleme frecvente

### Port-ul 3000 este ocupat
Editează `docker-compose.yml` și schimbă:
```yaml
ports:
  - "8080:80"  # folosește 8080 în loc de 3000
```

### Eroare la pornire
```bash
# Oprește tot
docker-compose down

# Șterge volumes (⚠️ pierde datele)
docker-compose down -v

# Pornește din nou
./setup.sh
```

### Nu văd aplicația pe tabletă
- Verifică că tableta și serverul sunt pe aceeași rețea Wi-Fi
- Verifică firewall-ul (permite port 3000)
- Încearcă să pinguiești serverul de pe tabletă

## Suport

Pentru probleme sau întrebări, vezi **README.md** pentru documentație completă.
