# 📧 E-Mail-Benachrichtigungen Setup Guide

## 🎯 Ziel

Nach der Registrierung wird automatisch eine E-Mail an `ptlsweb@gmail.com` gesendet, damit Sie als Admin die Registrierung genehmigen können.

## ✅ Funktionsweise

### 1. Registrierungsprozess

1. **Benutzer registriert sich** auf `/register`
2. **Supabase Auth** erstellt den Benutzer
3. **Automatische E-Mail** wird an `ptlsweb@gmail.com` gesendet
4. **Admin erhält E-Mail** mit Genehmigungslink
5. **Admin klickt Link** und genehmigt/lehnt ab
6. **Benutzer erhält Bestätigung** per E-Mail

### 2. E-Mail-Inhalte

#### Admin-Benachrichtigung (an ptlsweb@gmail.com):

```
🔔 NEUE BENUTZER-REGISTRIERUNG - FAHNDUNG SYSTEM

Ein neuer Benutzer hat sich registriert und wartet auf Ihre Genehmigung.

📋 REGISTRIERUNGS-DETAILS:
Name: Max Mustermann
E-Mail: max@example.com
Abteilung: IT
Telefon: +49 123 456789
Registriert am: 15.01.2024, 14:30

🔗 AKTIONEN:
Genehmigen: http://localhost:3000/admin/approve?email=max@example.com&action=approve
Ablehnen: http://localhost:3000/admin/approve?email=max@example.com&action=reject

Oder gehen Sie zu: http://localhost:3000/admin/users
```

#### Benutzer-Bestätigung (nach Genehmigung):

```
✅ REGISTRIERUNG GENEHMIGT

Hallo Max Mustermann,

Ihre Registrierung für das Fahndung System wurde erfolgreich genehmigt!

🔗 Nächste Schritte:
1. Gehen Sie zu: http://localhost:3000/login
2. Melden Sie sich mit Ihrer E-Mail-Adresse und Ihrem Passwort an
3. Sie können jetzt das System nutzen

📧 Bei Fragen kontaktieren Sie: ptlsweb@gmail.com
```

## 🔧 Setup-Schritte

### Schritt 1: Supabase Edge Function deployen

1. **Gehen Sie zu Ihrem Supabase Dashboard**
2. **Klicken Sie auf "Edge Functions"**
3. **Klicken Sie auf "New Function"**
4. **Name**: `send-email`
5. **Kopieren Sie den Code** aus `supabase/functions/send-email/index.ts`
6. **Klicken Sie auf "Deploy"**

### Schritt 2: E-Mail-Service konfigurieren (optional)

Für echte E-Mail-Versendung können Sie einen E-Mail-Service integrieren:

#### Option A: SendGrid

1. **Erstellen Sie ein SendGrid-Konto**
2. **API-Key generieren**
3. **Environment-Variable setzen**:
   ```bash
   SENDGRID_API_KEY=your-sendgrid-api-key
   ```
4. **Code in Edge Function anpassen** (siehe Kommentare)

#### Option B: Mailgun

1. **Erstellen Sie ein Mailgun-Konto**
2. **API-Key generieren**
3. **Domain verifizieren**
4. **Code anpassen**

#### Option C: Gmail SMTP

1. **Gmail App-Passwort erstellen**
2. **SMTP-Einstellungen konfigurieren**
3. **Code anpassen**

### Schritt 3: Testen

1. **Registrierung testen**:

   ```bash
   # Gehen Sie zu http://localhost:3000/register
   # Füllen Sie das Formular aus
   ```

2. **E-Mail prüfen**:
   - Überprüfen Sie `ptlsweb@gmail.com`
   - Oder schauen Sie in die Supabase Logs

3. **Genehmigung testen**:
   - Klicken Sie auf den Genehmigungslink in der E-Mail
   - Oder gehen Sie zu `/admin/approve?email=test@example.com&action=approve`

## 🚨 Aktuelle Implementierung

### Temporäre Lösung (Konsolen-Ausgabe)

Bis ein echter E-Mail-Service konfiguriert ist, werden E-Mails in der Konsole ausgegeben:

```javascript
// In der Supabase Edge Function Logs sehen Sie:
📧 EMAIL SENT:
To: ptlsweb@gmail.com
Subject: 🔔 Neue Registrierung - Fahndung System
HTML: <email content>
Text: <email content>
---
```

### Datenbank-Speicherung

Alle Benachrichtigungen werden auch in der `user_notifications` Tabelle gespeichert:

```sql
SELECT * FROM user_notifications ORDER BY created_at DESC;
```

## 🔗 Admin-Links

### Direkte Genehmigung über URL:

```
http://localhost:3000/admin/approve?email=user@example.com&action=approve
http://localhost:3000/admin/approve?email=user@example.com&action=reject
```

### Admin-Panel:

```
http://localhost:3000/admin/users
```

## 📊 Monitoring

### Benachrichtigungen überprüfen:

```sql
-- Alle Benachrichtigungen
SELECT * FROM user_notifications ORDER BY created_at DESC;

-- Ausstehende Registrierungen
SELECT * FROM user_profiles WHERE status = 'pending';

-- Genehmigte Benutzer
SELECT * FROM user_profiles WHERE status = 'approved';
```

### Supabase Logs:

1. **Gehen Sie zu Supabase Dashboard**
2. **Klicken Sie auf "Logs"**
3. **Wählen Sie "Edge Functions"**
4. **Suchen Sie nach "send-email"**

## 🔧 Erweiterte Konfiguration

### Tägliche Zusammenfassung

Die Funktion `sendDailySummary()` sendet täglich eine Zusammenfassung aller ausstehenden Registrierungen.

### E-Mail-Templates anpassen

Sie können die E-Mail-Inhalte in `src/lib/email-notifications.ts` anpassen.

### Mehrere Admin-E-Mails

Ändern Sie die E-Mail-Adresse in der `sendRegistrationNotification` Funktion:

```typescript
to: 'ptlsweb@gmail.com', // Ändern Sie diese Zeile
```

## 🚨 Troubleshooting

### E-Mail wird nicht gesendet:

1. **Überprüfen Sie die Supabase Logs**
2. **Testen Sie die Edge Function**:
   ```bash
   curl -X POST https://your-project.supabase.co/functions/v1/send-email \
     -H "Authorization: Bearer your-anon-key" \
     -H "Content-Type: application/json" \
     -d '{"to":"test@example.com","subject":"Test","html":"Test email"}'
   ```

### Genehmigungslink funktioniert nicht:

1. **Überprüfen Sie die URL-Parameter**
2. **Prüfen Sie die Browser-Konsole**
3. **Testen Sie direkt**: `/admin/approve?email=test@example.com&action=approve`

### Benutzer erhält keine Bestätigung:

1. **Überprüfen Sie den Spam-Ordner**
2. **Prüfen Sie die Supabase Logs**
3. **Testen Sie mit einer anderen E-Mail-Adresse**

## 🎯 Nächste Schritte

1. **Testen Sie die Registrierung**
2. **Prüfen Sie die E-Mail-Benachrichtigungen**
3. **Genehmigen Sie einen Test-Benutzer**
4. **Konfigurieren Sie einen echten E-Mail-Service** (optional)

## 📞 Support

Bei Problemen:

1. **Überprüfen Sie die Supabase Logs**
2. **Testen Sie die Edge Function**
3. **Prüfen Sie die Datenbank-Einträge**
4. **Kontaktieren Sie ptlsweb@gmail.com**
