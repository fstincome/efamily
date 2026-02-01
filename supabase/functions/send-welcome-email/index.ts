import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { SmtpClient } from "https://deno.land/x/smtp@v0.7.0/mod.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders })

  try {
    const { user_email, full_name, access_key, role, admin_email } = await req.json()

    const client = new SmtpClient();

    // Connexion directe à ton SMTP cPanel Freeti
    await client.connectTLS({
      hostname: "mail.freeti.org",
      port: 465,
      username: "messagerie@freeti.org",
      password: "FREETI.2024@NET", 
    });

    await client.send({
      from: "messagerie@freeti.org",
      to: [user_email, admin_email],
      subject: `FSTI HUB - Inscription ${role.toUpperCase()} Confirmée`,
      content: "text/html",
      html: `
        <div style="font-family: sans-serif; max-width: 600px; margin: auto; border: 1px solid #eee; border-radius: 20px; padding: 30px;">
          <h2 style="color: #2563eb;">FSTI HUB BURUNDI</h2>
          <p>Bonjour <strong>${full_name}</strong>,</p>
          <p>Ton compte a été créé. Voici tes accès au Hub :</p>
          <div style="background: #f1f5f9; padding: 20px; border-radius: 15px; text-align: center; margin: 20px 0;">
            <span style="font-size: 10px; text-transform: uppercase;">Code d'accès FSTI</span><br/>
            <strong style="font-size: 32px;">${access_key}</strong>
          </div>
          <p style="font-size: 12px; color: #666;">Utilise ton email et ce code pour te connecter.</p>
        </div>
      `,
    });

    await client.close();

    return new Response(JSON.stringify({ sent: true }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    })
  } catch (e) {
    return new Response(JSON.stringify({ error: e.message }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    })
  }
})