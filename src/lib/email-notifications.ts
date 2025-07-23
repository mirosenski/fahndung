import { supabase } from './supabase';

interface RegistrationNotification {
  userEmail: string;
  userName: string;
  department: string;
  phone: string;
  registrationDate: string;
}

/**
 * Sendet eine E-Mail-Benachrichtigung an den Super-Admin über eine neue Registrierung
 * Aktuell: Konsolen-Ausgabe + Anleitung für manuelle E-Mail-Konfiguration
 */
export async function sendRegistrationNotification(notification: RegistrationNotification) {
  try {
    console.log('🔔 NEUE BENUTZER-REGISTRIERUNG - FAHNDUNG SYSTEM');
    console.log('⚠️ WICHTIG: Ein neuer Benutzer hat sich registriert und wartet auf Ihre Genehmigung.');
    console.log('');
    console.log('📋 REGISTRIERUNGS-DETAILS:');
    console.log(`Name: ${notification.userName}`);
    console.log(`E-Mail: ${notification.userEmail}`);
    console.log(`Abteilung: ${notification.department}`);
    console.log(`Telefon: ${notification.phone || 'Nicht angegeben'}`);
    console.log(`Registriert am: ${notification.registrationDate}`);
    console.log('');
    console.log('🔗 AKTIONEN:');
    console.log('1. Gehen Sie zu: http://localhost:3000/admin/users');
    console.log('2. Melden Sie sich mit Ihren Admin-Daten an');
    console.log('3. Klicken Sie auf "Genehmigen" oder "Ablehnen"');
    console.log('4. Der Benutzer erhält automatisch eine Bestätigung');
    console.log('');
    console.log('💡 E-MAIL-BENACHRICHTIGUNG KONFIGURIEREN:');
    console.log('Für echte E-Mail-Benachrichtigungen:');
    console.log('1. Gehe zu: https://app.supabase.com/project/rgbxdxrhwrszidbnsmuy/auth/settings');
    console.log('2. Aktiviere "Enable email confirmations"');
    console.log('3. Konfiguriere SMTP-Einstellungen für ptlsweb@gmail.com');
    console.log('4. Verwende Gmail App-Passwort als SMTP Pass');
    console.log('');

    // Optional: Speichere Benachrichtigung in der Datenbank für späteren Abruf
    if (supabase) {
      try {
        await supabase
          .from('admin_notifications')
          .insert({
            type: 'new_registration',
            user_email: notification.userEmail,
            user_name: notification.userName,
            department: notification.department,
            phone: notification.phone,
            registration_date: notification.registrationDate,
            status: 'pending',
            created_at: new Date().toISOString()
          });
        console.log('✅ Benachrichtigung in Datenbank gespeichert');
      } catch (dbError) {
        console.warn('⚠️ Fehler beim Speichern in Datenbank:', dbError);
      }
    }

    return true;
  } catch (error) {
    console.error('Unerwarteter Fehler bei der E-Mail-Benachrichtigung:', error);
    return false;
  }
}

/**
 * Sendet eine Bestätigungs-E-Mail an den registrierten Benutzer
 * Aktuell: Konsolen-Ausgabe + Anleitung
 */
export async function sendUserConfirmationEmail(userEmail: string, userName: string, approved: boolean) {
  try {
    const status = approved ? 'GENEHMIGT' : 'ABGELEHNT';
    const emoji = approved ? '✅' : '❌';
    
    console.log(`${emoji} BENUTZER-BESTÄTIGUNG - FAHNDUNG SYSTEM`);
    console.log(`Status: ${status}`);
    console.log(`Benutzer: ${userName} (${userEmail})`);
    console.log('');
    
    if (approved) {
      console.log('✅ REGISTRIERUNG GENEHMIGT');
      console.log(`Hallo ${userName},`);
      console.log('Ihre Registrierung für das Fahndung System wurde erfolgreich genehmigt!');
      console.log('');
      console.log('🔗 ANMELDUNG:');
      console.log('Gehen Sie zu: http://localhost:3000/login');
      console.log('Melden Sie sich mit Ihrer E-Mail und Ihrem Passwort an');
      console.log('');
      console.log('💡 NÄCHSTE SCHRITTE:');
      console.log('1. Gehen Sie zu http://localhost:3000/login');
      console.log('2. Melden Sie sich mit Ihrer E-Mail und Ihrem Passwort an');
      console.log('3. Sie werden automatisch zum Dashboard weitergeleitet');
      console.log('4. Falls Sie Ihr Passwort vergessen haben, nutzen Sie die "Passwort vergessen" Funktion');
    } else {
      console.log('❌ REGISTRIERUNG ABGELEHNT');
      console.log(`Hallo ${userName},`);
      console.log('Leider wurde Ihre Registrierung für das Fahndung System abgelehnt.');
      console.log('');
      console.log('Dies kann verschiedene Gründe haben:');
      console.log('- Unvollständige oder ungenaue Angaben');
      console.log('- Nicht autorisierte E-Mail-Domain');
      console.log('- System-interne Richtlinien');
      console.log('');
      console.log('Falls Sie glauben, dass dies ein Fehler ist, kontaktieren Sie bitte den Administrator unter ptlsweb@gmail.com.');
      console.log('');
      console.log('💡 ALTERNATIVE:');
      console.log('Sie können sich gerne erneut registrieren, falls sich Ihre Umstände geändert haben.');
    }
    
    console.log('');
    console.log('💡 E-MAIL-BENACHRICHTIGUNG KONFIGURIEREN:');
    console.log('Für echte E-Mail-Benachrichtigungen:');
    console.log('1. Gehe zu: https://app.supabase.com/project/rgbxdxrhwrszidbnsmuy/auth/settings');
    console.log('2. Aktiviere "Enable email confirmations"');
    console.log('3. Konfiguriere SMTP-Einstellungen');
    console.log('4. Verwende Gmail App-Passwort als SMTP Pass');
    console.log('');

    // Optional: Speichere Bestätigung in der Datenbank
    if (supabase) {
      try {
        await supabase
          .from('user_notifications')
          .insert({
            user_email: userEmail,
            user_name: userName,
            type: 'registration_confirmation',
            status: approved ? 'approved' : 'rejected',
            created_at: new Date().toISOString()
          });
        console.log('✅ Bestätigung in Datenbank gespeichert');
      } catch (dbError) {
        console.warn('⚠️ Fehler beim Speichern in Datenbank:', dbError);
      }
    }

    return true;
  } catch (error) {
    console.error('Unerwarteter Fehler bei der Benutzer-Bestätigung:', error);
    return false;
  }
}

/**
 * Generiert HTML-E-Mail für Registrierungs-Benachrichtigung (für zukünftige Verwendung)
 */
// function generateRegistrationEmailHTML(notification: RegistrationNotification): string {
//   return `
//     <!DOCTYPE html>
//     <html lang="de">
//     <head>
//       <meta charset="UTF-8">
//       <meta name="viewport" content="width=device-width, initial-scale=1.0">
//       <title>Neue Registrierung - Fahndung System</title>
//       <style>
//         body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
//         .container { max-width: 600px; margin: 0 auto; padding: 20px; }
//         .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
//         .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
//         .info-box { background: white; border: 1px solid #e0e0e0; border-radius: 8px; padding: 20px; margin: 20px 0; }
//         .info-row { display: flex; justify-content: space-between; margin: 10px 0; }
//         .label { font-weight: bold; color: #555; }
//         .value { color: #333; }
//         .button { display: inline-block; background: #667eea; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin: 10px 5px; }
//         .button:hover { background: #5a6fd8; }
//         .footer { text-align: center; margin-top: 30px; color: #666; font-size: 14px; }
//         .urgent { background: #fff3cd; border: 1px solid #ffeaa7; border-radius: 8px; padding: 15px; margin: 20px 0; }
//       </style>
//     </head>
//     <body>
//       <div class="container">
//         <div class="header">
//           <h1>🔔 Neue Benutzer-Registrierung</h1>
//           <p>Fahndung System - Administrator-Benachrichtigung</p>
//         </div>
//         
//         <div class="content">
//           <div class="urgent">
//             <strong>⚠️ Wichtig:</strong> Ein neuer Benutzer hat sich registriert und wartet auf Ihre Genehmigung.
//           </div>
//           
//           <div class="info-box">
//             <h3>📋 Registrierungs-Details</h3>
//             <div class="info-row">
//               <span class="label">Name:</span>
//               <span class="value">${notification.userName}</span>
//             </div>
//             <div class="info-row">
//               <span class="label">E-Mail:</span>
//               <span class="value">${notification.userEmail}</span>
//             </div>
//             <div class="info-row">
//               <span class="label">Abteilung:</span>
//               <span class="value">${notification.department}</span>
//             </div>
//             <div class="info-row">
//               <span class="label">Telefon:</span>
//               <span class="value">${notification.phone || 'Nicht angegeben'}</span>
//             </div>
//             <div class="info-row">
//               <span class="label">Registriert am:</span>
//               <span class="value">${notification.registrationDate}</span>
//             </div>
//           </div>
//           
//           <div style="text-align: center; margin: 30px 0;">
//             <a href="http://localhost:3000/admin/users" class="button">👥 Benutzer verwalten</a>
//             <a href="http://localhost:3000/dashboard" class="button">🏠 Dashboard</a>
//           </div>
//           
//           <div style="background: #e8f5e8; border: 1px solid #c3e6c3; border-radius: 8px; padding: 15px; margin: 20px 0;">
//             <strong>💡 Hinweis:</strong> 
//             <ul style="margin: 10px 0; padding-left: 20px;">
//               <li>Gehen Sie zu <strong>http://localhost:3000/admin/users</strong></li>
//               <li>Melden Sie sich mit Ihren Admin-Daten an</li>
//               <li>Klicken Sie auf "Genehmigen" oder "Ablehnen"</li>
//               <li>Der Benutzer erhält automatisch eine Bestätigung</li>
//             </ul>
//           </div>
//         </div>
//         
//         <div class="footer">
//           <p>Diese E-Mail wurde automatisch vom Fahndung System generiert.</p>
//           <p>© 2024 Fahndung System - Alle Rechte vorbehalten</p>
//         </div>
//       </div>
//     </body>
//     </html>
//   `;
// }

/**
 * Generiert Text-E-Mail für Registrierungs-Benachrichtigung (für zukünftige Verwendung)
 */
// function generateRegistrationEmailText(notification: RegistrationNotification): string {
//   return `
// 🔔 NEUE BENUTZER-REGISTRIERUNG - FAHNDUNG SYSTEM
// 
// ⚠️ WICHTIG: Ein neuer Benutzer hat sich registriert und wartet auf Ihre Genehmigung.
// 
// 📋 REGISTRIERUNGS-DETAILS:
// Name: ${notification.userName}
// E-Mail: ${notification.userEmail}
// Abteilung: ${notification.department}
// Telefon: ${notification.phone || 'Nicht angegeben'}
// Registriert am: ${notification.registrationDate}
// 
// 🔗 AKTIONEN:
// 1. Gehen Sie zu: http://localhost:3000/admin/users
// 2. Melden Sie sich mit Ihren Admin-Daten an
// 3. Klicken Sie auf "Genehmigen" oder "Ablehnen"
// 4. Der Benutzer erhält automatisch eine Bestätigung
// 
// 💡 HINWEIS:
// - Nur genehmigte Benutzer können sich anmelden
// - Abgelehnte Benutzer erhalten eine Benachrichtigung
// - Alle Aktionen werden protokolliert
// 
// ---
// © 2024 Fahndung System - Alle Rechte vorbehalten
// Diese E-Mail wurde automatisch generiert.
//   `;
// }

/**
 * Generiert HTML-E-Mail für Benutzer-Bestätigung (für zukünftige Verwendung)
 */
// function generateUserConfirmationHTML(userName: string, approved: boolean): string {
//   if (approved) {
//     return `
//       <!DOCTYPE html>
//       <html lang="de">
//       <head>
//         <meta charset="UTF-8">
//         <meta name="viewport" content="width=device-width, initial-scale=1.0">
//         <title>Registrierung genehmigt - Fahndung System</title>
//         <style>
//           body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
//           .container { max-width: 600px; margin: 0 auto; padding: 20px; }
//           .header { background: linear-gradient(135deg, #28a745 0%, #20c997 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
//           .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
//           .button { display: inline-block; background: #28a745; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin: 10px 5px; }
//           .button:hover { background: #218838; }
//           .footer { text-align: center; margin-top: 30px; color: #666; font-size: 14px; }
//         </style>
//       </head>
//       <body>
//         <div class="container">
//           <div class="header">
//             <h1>✅ Registrierung genehmigt!</h1>
//             <p>Fahndung System - Willkommen bei uns</p>
//           </div>
//           
//           <div class="content">
//             <h2>Hallo ${userName},</h2>
//             
//             <p>Ihre Registrierung für das <strong>Fahndung System</strong> wurde erfolgreich genehmigt!</p>
//             
//             <p>Sie können sich jetzt mit Ihren Zugangsdaten anmelden und das System nutzen.</p>
//             
//             <div style="text-align: center; margin: 30px 0;">
//               <a href="http://localhost:3000/login" class="button">🚀 Jetzt anmelden</a>
//             </div>
//             
//             <div style="background: #e8f5e8; border: 1px solid #c3e6c3; border-radius: 8px; padding: 15px; margin: 20px 0;">
//               <strong>💡 Nächste Schritte:</strong>
//               <ul style="margin: 10px 0; padding-left: 20px;">
//                 <li>Gehen Sie zu <strong>http://localhost:3000/login</strong></li>
//                 <li>Melden Sie sich mit Ihrer E-Mail und Ihrem Passwort an</li>
//                 <li>Sie werden automatisch zum Dashboard weitergeleitet</li>
//                 <li>Falls Sie Ihr Passwort vergessen haben, nutzen Sie die "Passwort vergessen" Funktion</li>
//               </ul>
//             </div>
//           </div>
//           
//           <div class="footer">
//             <p>Vielen Dank für Ihr Vertrauen in das Fahndung System.</p>
//             <p>© 2024 Fahndung System - Alle Rechte vorbehalten</p>
//           </div>
//         </div>
//       </body>
//       </html>
//     `;
//   } else {
//     return `
//       <!DOCTYPE html>
//       <html lang="de">
//       <head>
//         <meta charset="UTF-8">
//         <meta name="viewport" content="width=device-width, initial-scale=1.0">
//         <title>Registrierung abgelehnt - Fahndung System</title>
//         <style>
//           body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
//           .container { max-width: 600px; margin: 0 auto; padding: 20px; }
//           .header { background: linear-gradient(135deg, #dc3545 0%, #c82333 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
//           .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
//           .footer { text-align: center; margin-top: 30px; color: #666; font-size: 14px; }
//         </style>
//       </head>
//       <body>
//         <div class="container">
//           <div class="header">
//             <h1>❌ Registrierung abgelehnt</h1>
//             <p>Fahndung System - Benachrichtigung</p>
//           </div>
//           
//           <div class="content">
//             <h2>Hallo ${userName},</h2>
//             
//             <p>Leider wurde Ihre Registrierung für das <strong>Fahndung System</strong> abgelehnt.</p>
//             
//             <p>Dies kann verschiedene Gründe haben:</p>
//             <ul style="margin: 10px 0; padding-left: 20px;">
//               <li>Unvollständige oder ungenaue Angaben</li>
//               <li>Nicht autorisierte E-Mail-Domain</li>
//               <li>System-interne Richtlinien</li>
//             </ul>
//             
//             <p>Falls Sie glauben, dass dies ein Fehler ist, kontaktieren Sie bitte den Administrator unter <strong>ptlsweb@gmail.com</strong>.</p>
//             
//             <div style="background: #fff3cd; border: 1px solid #ffeaa7; border-radius: 8px; padding: 15px; margin: 20px 0;">
//               <strong>💡 Alternative:</strong>
//               <p>Sie können sich gerne erneut registrieren, falls sich Ihre Umstände geändert haben.</p>
//             </div>
//           </div>
//           
//           <div class="footer">
//             <p>Vielen Dank für Ihr Verständnis.</p>
//             <p>© 2024 Fahndung System - Alle Rechte vorbehalten</p>
//           </div>
//         </div>
//       </body>
//       </html>
//     `;
//   }
// }

/**
 * Generiert Text-E-Mail für Benutzer-Bestätigung (für zukünftige Verwendung)
 */
// function generateUserConfirmationText(userName: string, approved: boolean): string {
//   if (approved) {
//     return `
// ✅ REGISTRIERUNG GENEHMIGT - FAHNDUNG SYSTEM
// 
// Hallo ${userName},
// 
// Ihre Registrierung für das Fahndung System wurde erfolgreich genehmigt!
// 
// Sie können sich jetzt mit Ihren Zugangsdaten anmelden und das System nutzen.
// 
// 🔗 ANMELDUNG:
// Gehen Sie zu: http://localhost:3000/login
// Melden Sie sich mit Ihrer E-Mail und Ihrem Passwort an
// 
// 💡 NÄCHSTE SCHRITTE:
// 1. Gehen Sie zu http://localhost:3000/login
// 2. Melden Sie sich mit Ihrer E-Mail und Ihrem Passwort an
// 3. Sie werden automatisch zum Dashboard weitergeleitet
// 4. Falls Sie Ihr Passwort vergessen haben, nutzen Sie die "Passwort vergessen" Funktion
// 
// Vielen Dank für Ihr Vertrauen in das Fahndung System.
// 
// ---
// © 2024 Fahndung System - Alle Rechte vorbehalten
//     `;
//   } else {
//     return `
// ❌ REGISTRIERUNG ABGELEHNT - FAHNDUNG SYSTEM
// 
// Hallo ${userName},
// 
// Leider wurde Ihre Registrierung für das Fahndung System abgelehnt.
// 
// Dies kann verschiedene Gründe haben:
// - Unvollständige oder ungenaue Angaben
// - Nicht autorisierte E-Mail-Domain
// - System-interne Richtlinien
// 
// Falls Sie glauben, dass dies ein Fehler ist, kontaktieren Sie bitte den Administrator unter ptlsweb@gmail.com.
// 
// 💡 ALTERNATIVE:
// Sie können sich gerne erneut registrieren, falls sich Ihre Umstände geändert haben.
// 
// Vielen Dank für Ihr Verständnis.
// 
// ---
// © 2024 Fahndung System - Alle Rechte vorbehalten
//     `;
//   }
// } 