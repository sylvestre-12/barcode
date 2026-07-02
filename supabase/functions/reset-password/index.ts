import { createClient } from '@supabase/supabase-js'
Deno.serve(async (req) => {
  try {
    const { email, otp, newPassword } = await req.json()

    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    )

    // 1. Verify the OTP is correct and not expired
    const { data: pending, error: fetchError } = await supabaseAdmin
      .from('pending_registrations')
      .select('*')
      .eq('email', email)
      .single()

    if (fetchError || !pending) {
      return new Response(JSON.stringify({ error: 'Reset request not found.' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      })
    }

    if (pending.otp !== otp) {
      return new Response(JSON.stringify({ error: 'Incorrect code.' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      })
    }

    if (new Date(pending.otp_expires_at) < new Date()) {
      return new Response(JSON.stringify({ error: 'Code expired.' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      })
    }

    // 2. Find the actual auth user by email
    const { data: userList, error: listError } = await supabaseAdmin.auth.admin.listUsers()
    if (listError) throw listError

    const targetUser = userList.users.find((u) => u.email === email)
    if (!targetUser) {
      return new Response(JSON.stringify({ error: 'No account found with that email.' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      })
    }

    // 3. Update the password using admin privileges
    const { error: updateError } = await supabaseAdmin.auth.admin.updateUserById(
      targetUser.id,
      { password: newPassword }
    )

    if (updateError) throw updateError

    // 4. Clean up the pending OTP record
    await supabaseAdmin.from('pending_registrations').delete().eq('email', email)

    // 5. Audit log
    await supabaseAdmin.from('audit_logs').insert({
      actor_id: targetUser.id,
      actor_name: email,
      action: 'USER_PASSWORD_RESET',
      target_type: 'profile',
      target_id: targetUser.id,
    })

    return new Response(JSON.stringify({ success: true }), {
      headers: { 'Content-Type': 'application/json' },
    })
  } catch (err) {
    return new Response(JSON.stringify({ error: String(err) }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    })
  }
})