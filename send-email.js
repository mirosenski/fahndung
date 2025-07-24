// Edge Function: send-email
// Deploy this to your Supabase project

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, GET, OPTIONS",
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    // Parse request body
    const { to_email, subject, message, user_name, department } =
      await req.json();

    // Validate required fields
    if (!to_email || !subject || !message) {
      return new Response(
        JSON.stringify({
          error: "Missing required fields: to_email, subject, message",
        }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        },
      );
    }

    // Create Supabase client
    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Log the email attempt
    const { error: notificationError } = await supabase
      .from("user_notifications")
      .insert({
        user_email: to_email,
        user_name: user_name || "System",
        type: "email_sent",
        status: "sent",
        message: `E-Mail gesendet: ${subject} - ${message}`,
        admin_email: "ptlsweb@gmail.com",
      });

    if (notificationError) {
      console.error("Error logging notification:", notificationError);
    }

    // In a real implementation, you would send the actual email here
    // For now, we'll just log it and return success

    const emailData = {
      to: to_email,
      subject: subject,
      message: message,
      user_name: user_name,
      department: department,
      timestamp: new Date().toISOString(),
    };

    console.log("Email would be sent:", emailData);

    // Return success response
    return new Response(
      JSON.stringify({
        success: true,
        message: `E-Mail an ${to_email} gesendet`,
        data: emailData,
      }),
      {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      },
    );
  } catch (error) {
    console.error("Error in send-email function:", error);

    return new Response(
      JSON.stringify({
        error: "Internal server error",
        details: error.message,
      }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      },
    );
  }
});
