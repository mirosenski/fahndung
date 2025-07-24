// Diese Datei ist nur für Supabase Edge Functions gedacht und wird im Next.js-Build ignoriert.
// Der gesamte Code ist auskommentiert, damit der Build nicht fehlschlägt.

// import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
// import { SmtpClient } from "https://deno.land/x/smtp@v0.7.0/mod.ts";

// const corsHeaders = {
//   "Access-Control-Allow-Origin": "*",
//   "Access-Control-Allow-Headers":
//     "authorization, x-client-info, apikey, content-type",
//   "Access-Control-Allow-Methods": "POST, GET, OPTIONS",
//   "Access-Control-Max-Age": "86400",
// };

// serve(async (req) => {
//   // Handle CORS preflight requests
//   if (req.method === "OPTIONS") {
//     return new Response("ok", {
//       status: 200,
//       headers: corsHeaders,
//     });
//   }

//   try {
//     const { to, subject, html, text } = await req.json();

//     // Validate required fields
//     if (!to || !subject || (!html && !text)) {
//       console.error("❌ Missing required fields:", {
//         to,
//         subject,
//         hasHtml: !!html,
//         hasText: !!text,
//       });
//       return new Response(
//         JSON.stringify({
//           error: "Missing required fields: to, subject, and html or text",
//           received: { to, subject, hasHtml: !!html, hasText: !!text },
//         }),
//         {
//           status: 400,
//           headers: { ...corsHeaders, "Content-Type": "application/json" },
//         },
//       );
//     }

//     // Configure SMTP client
//     const client = new SmtpClient();

//     // Gmail SMTP configuration
//     await client.connectTLS({
//       hostname: "smtp.gmail.com",
//       port: 587,
//       username: "ptlsweb@gmail.com",
//       password: "your-app-password-here", // Replace with your Gmail app password
//     });

//     // Send email
//     await client.send({
//       from: "ptlsweb@gmail.com",
//       to: to,
//       subject: subject,
//       content: html || text,
//       html: html,
//     });

//     await client.close();

//     console.log("✅ Email sent successfully to:", to);

//     return new Response(
//       JSON.stringify({
//         success: true,
//         message: "Email sent successfully",
//         to: to,
//         subject: subject,
//       }),
//       {
//         status: 200,
//         headers: { ...corsHeaders, "Content-Type": "application/json" },
//       },
//     );
//   } catch (error) {
//     console.error("❌ Email function error:", error);
//     return new Response(
//       JSON.stringify({
//         error: "Failed to send email",
//         details: error.message,
//         stack: error.stack,
//       }),
//       {
//         status: 500,
//         headers: { ...corsHeaders, "Content-Type": "application/json" },
//       },
//     );
//   }
// });

export {};
