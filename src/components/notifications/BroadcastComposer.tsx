import { useState } from 'react'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/context/AuthContext'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'

export function BroadcastComposer() {
  const { user } = useAuth()
  const [title, setTitle] = useState('')
  const [message, setMessage] = useState('')
  const [sending, setSending] = useState(false)
  const [msg, setMsg] = useState('')

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault()
    setSending(true)
    setMsg('')

    const { error } = await supabase.from('notifications').insert({
      type: 'broadcast',
      scope: 'attendance',
      title,
      message,
      severity: 'info',
      target_role: null,
      created_by: user?.id,
    })

    setSending(false)
    if (error) {
      setMsg(`Error: ${error.message}`)
    } else {
      setMsg('Broadcast sent to all users.')
      setTitle('')
      setMessage('')
    }
  }

  return (
    <Card className="mb-4 p-4">
      <h2 className="mb-3 font-semibold">Send Broadcast</h2>
      <form onSubmit={handleSend} className="space-y-3">
        <div>
          <Label htmlFor="bTitle">Title</Label>
          <Input id="bTitle" value={title} onChange={(e) => setTitle(e.target.value)} required />
        </div>
        <div>
          <Label htmlFor="bMessage">Message</Label>
          <textarea
            id="bMessage"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            required
            className="w-full rounded-md border border-gray-300 p-2 text-sm"
            rows={3}
          />
        </div>
        {msg && <p className={msg.startsWith('Error') ? 'text-sm text-red-500' : 'text-sm text-green-600'}>{msg}</p>}
        <Button type="submit" disabled={sending} className="bg-brand-orange text-black">
          {sending ? 'Sending...' : 'Send Broadcast'}
        </Button>
      </form>
    </Card>
  )
}