import { createClient } from 'jsr:@supabase/supabase-js@2'

Deno.serve(async (req) => {
  try {
    const { email, otp, type, name } = await req.json()

    const subject = type === 'reset' ? 'Reset Your Password' : 'Verify Your Email'
    const heading = type === 'reset' ? 'Password Reset Code' : 'Welcome to SSF Check-In System'

    const html = `
      <div style="font-family: Arial, sans-serif; background: #1A1A1A; padding: 32px;">
        <div style="max-width: 480px; margin: 0 auto; background: white; border-radius: 8px; overflow: hidden;">
          <div style="background: #1A1A1A; padding: 20px; text-align: center;">
            <h1 style="color: #F2B705; margin: 0; font-size: 18px;">SHERRIE SILVER FOUNDATION</h1>
          </div>
          <div style="padding: 32px; text-align: center;">
            <h2 style="color: #1A1A1A;">${heading}</h2>
            <p style="color: #555;">Hi ${name || ''}, here is your verification code:</p>
            <div style="font-size: 32px; font-weight: bold; letter-spacing: 8px; color: #6C4CE3; background: #F2F2F2; padding: 16px; border-radius: 8px; margin: 24px 0;">
              ${otp}
            </div>
            <p style="color: #888; font-size: 13px;">This code expires in 10 minutes. If you didn't request this, you can safely ignore this email.</p>
          </div>
        </div>
      </div>
    `

    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${Deno.env.get('RESEND_API_KEY')}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: 'SSF Check-In <onboarding@resend.dev>',
        to: [email],
        subject,
        html,
      }),
    })

    const data = await res.json()

    if (!res.ok) {
      return new Response(JSON.stringify({ error: data }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      })
    }

    return new Response(JSON.stringify({ success: true, id: data.id }), {
      headers: { 'Content-Type': 'application/json' },
    })
  } catch (err) {
    return new Response(JSON.stringify({ error: String(err) }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    })
  }
})