import { useEffect, useState } from 'react'
import Barcode from 'react-barcode'
import { supabase } from '@/lib/supabase'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Eye, RefreshCw, ToggleLeft, ToggleRight } from 'lucide-react'
import { logAction } from '@/lib/audit'
import { useAuth } from '@/context/AuthContext'
import { getCheckinCutoffHour, setCheckinCutoffHour } from '@/lib/settings'

interface MemberRow {
  id: string
  barcode: string
  name: string
  department: string | null
  role: string
  barcode_active: boolean
  barcode_expires_at: string | null
}

export function BarcodeManagement() {
  const { user } = useAuth()
  const [members, setMembers] = useState<MemberRow[]>([])
  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState(true)
  const [previewMember, setPreviewMember] = useState<MemberRow | null>(null)
  const [cutoffHour, setCutoffHour] = useState<number | null>(null)
  const [savingCutoff, setSavingCutoff] = useState(false)

  const fetchMembers = async () => {
    const { data } = await supabase.from('members').select('*').order('name')
    setMembers(data ?? [])
    setLoading(false)
  }

  useEffect(() => {
    fetchMembers()
    getCheckinCutoffHour().then(setCutoffHour)
  }, [])

  const handleCutoffChange = async (value: string) => {
    setSavingCutoff(true)
    const hour = value === '' ? null : parseInt(value, 10)
    await setCheckinCutoffHour(hour, user!.id)
    setCutoffHour(hour)
    setSavingCutoff(false)
  }

  const filtered = members.filter((m) =>
    [m.name, m.barcode, m.department ?? ''].some((field) =>
      field.toLowerCase().includes(search.toLowerCase())
    )
  )

  const totalMembers = members.length
  const activeBarcodes = members.filter((m) => m.barcode_active).length
  const inactiveBarcodes = totalMembers - activeBarcodes

  const isExpired = (m: MemberRow) =>
    m.barcode_expires_at ? new Date(m.barcode_expires_at) < new Date() : false

  const toggleActive = async (m: MemberRow) => {
    await supabase.from('members').update({ barcode_active: !m.barcode_active }).eq('id', m.id)
    await logAction({
      actorId: user?.id ?? null,
      actorName: user?.name ?? 'Unknown',
      action: m.barcode_active ? 'BARCODE_DEACTIVATED' : 'BARCODE_ACTIVATED',
      targetType: 'member',
      targetId: m.id,
    })
    fetchMembers()
  }

  const regenerateBarcode = async (m: MemberRow) => {
    const newCode = `SSF-${new Date().toISOString().slice(2, 10).replace(/-/g, '')}-${Math.random().toString(36).slice(2, 12)}`
    await supabase.from('members').update({ barcode: newCode }).eq('id', m.id)
    await logAction({
      actorId: user?.id ?? null,
      actorName: user?.name ?? 'Unknown',
      action: 'BARCODE_REGENERATED',
      targetType: 'member',
      targetId: m.id,
      previousValue: { barcode: m.barcode },
      newValue: { barcode: newCode },
    })
    fetchMembers()
  }

  const updateExpiry = async (m: MemberRow, newDate: string) => {
    await supabase.from('members').update({ barcode_expires_at: newDate || null }).eq('id', m.id)
    await logAction({
      actorId: user?.id ?? null,
      actorName: user?.name ?? 'Unknown',
      action: 'BARCODE_EXPIRY_SET',
      targetType: 'member',
      targetId: m.id,
      newValue: { expires: newDate },
    })
    fetchMembers()
  }

  const exportCsv = () => {
    const headers = ['Name', 'Department', 'Role', 'Barcode', 'Active', 'Expires']
    const rows = filtered.map((m) => [m.name, m.department ?? '', m.role, m.barcode, m.barcode_active, m.barcode_expires_at ?? ''])
    const csvContent = [headers, ...rows].map((row) => row.join(',')).join('\n')
    const blob = new Blob([csvContent], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `members_barcodes_${new Date().toISOString().split('T')[0]}.csv`
    link.click()
    URL.revokeObjectURL(url)
  }

  if (loading) return <div className="p-6">Loading barcode management...</div>

  return (
    <div className="space-y-4 p-6">
      <h1 className="text-2xl font-bold">Barcode Management</h1>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <Card className="p-4 text-center">
          <p className="text-sm text-gray-500">Total Members</p>
          <p className="text-2xl font-bold">{totalMembers}</p>
        </Card>
        <Card className="p-4 text-center">
          <p className="text-sm text-gray-500">Active Barcodes</p>
          <p className="text-2xl font-bold text-green-600">{activeBarcodes}</p>
        </Card>
        <Card className="p-4 text-center">
          <p className="text-sm text-gray-500">Inactive Barcodes</p>
          <p className="text-2xl font-bold text-red-500">{inactiveBarcodes}</p>
        </Card>
      </div>

      <Card className="p-4">
        <h2 className="mb-2 font-semibold">Check-In Cutoff Time</h2>
        <p className="mb-3 text-sm text-gray-500">
          After this hour, members will no longer be able to check in. Check-out is never restricted.
        </p>
        <div className="flex items-center gap-3">
          <select
            value={cutoffHour ?? ''}
            onChange={(e) => handleCutoffChange(e.target.value)}
            disabled={savingCutoff}
            className="rounded-md border border-gray-300 px-3 py-2 text-sm"
          >
            <option value="">No cutoff (always allowed)</option>
            {Array.from({ length: 24 }, (_, i) => (
              <option key={i} value={i}>{i}:00</option>
            ))}
          </select>
          {savingCutoff && <span className="text-sm text-gray-400">Saving...</span>}
        </div>
      </Card>

      <Card className="p-4">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <Input
            placeholder="Search by name, barcode, or department..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="sm:max-w-sm"
          />
          <Button onClick={exportCsv} size="sm" className="bg-brand-orange text-black">
            Export CSV
          </Button>
        </div>
      </Card>

      <Card className="overflow-x-auto p-4">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b text-left text-gray-500">
              <th className="py-2">Member</th>
              <th>Department</th>
              <th>Barcode</th>
              <th>Status</th>
              <th>Expires</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((m) => (
              <tr key={m.id} className="border-b">
                <td className="py-2">
                  <p className="font-medium">{m.name}</p>
                  <p className="text-xs text-gray-400">{m.role}</p>
                </td>
                <td>{m.department ?? '—'}</td>
                <td className="font-mono text-xs">{m.barcode}</td>
                <td>
                  <span className={`rounded px-2 py-1 text-xs font-medium ${m.barcode_active ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                    {m.barcode_active ? 'Active' : 'Inactive'}
                  </span>
                  {isExpired(m) && (
                    <span className="ml-1 rounded bg-amber-100 px-2 py-1 text-xs font-medium text-amber-700">
                      Expired
                    </span>
                  )}
                </td>
                <td>
                  <Input
                    type="date"
                    defaultValue={m.barcode_expires_at ?? ''}
                    onBlur={(e) => updateExpiry(m, e.target.value)}
                    className="w-36 text-xs"
                  />
                </td>
                <td>
                  <div className="flex gap-1">
                    <button onClick={() => setPreviewMember(m)} title="Preview Badge" className="cursor-pointer rounded p-1.5 hover:bg-gray-100">
                      <Eye className="h-4 w-4 text-gray-600" />
                    </button>
                    <button onClick={() => regenerateBarcode(m)} title="Regenerate Barcode" className="cursor-pointer rounded p-1.5 hover:bg-gray-100">
                      <RefreshCw className="h-4 w-4 text-gray-600" />
                    </button>
                    <button onClick={() => toggleActive(m)} title={m.barcode_active ? 'Deactivate' : 'Activate'} className="cursor-pointer rounded p-1.5 hover:bg-gray-100">
                      {m.barcode_active ? (
                        <ToggleRight className="h-4 w-4 text-green-600" />
                      ) : (
                        <ToggleLeft className="h-4 w-4 text-red-500" />
                      )}
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>

      <Dialog open={!!previewMember} onOpenChange={() => setPreviewMember(null)}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>Member Badge Preview</DialogTitle>
          </DialogHeader>
          {previewMember && (
            <>
              <style>{`
                @media print {
                  body * { visibility: hidden; }
                  #badge-print-area, #badge-print-area * { visibility: visible; }
                  #badge-print-area {
                    position: fixed;
                    top: 50%;
                    left: 50%;
                    transform: translate(-50%, -50%);
                    width: 320px;
                    margin: 0;
                  }
                  #badge-print-area button { display: none; }
                }
              `}</style>
              <div id="badge-print-area" className="mx-auto w-full max-w-xs space-y-3 rounded-lg border-2 border-brand-orange bg-white p-6 text-center">
                <p className="text-xs font-bold text-brand-charcoal">SHERRIE SILVER FOUNDATION</p>
                <p className="text-lg font-bold leading-tight">{previewMember.name}</p>
                <p className="text-sm text-gray-500">{previewMember.role} — {previewMember.department ?? '—'}</p>
                <div className="flex justify-center py-1">
                  <Barcode value={previewMember.barcode} width={1.5} height={60} fontSize={12} />
                </div>
                <div>
                  <span className={`inline-block rounded px-2 py-1 text-xs font-medium ${previewMember.barcode_active ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                    {previewMember.barcode_active ? 'Active' : 'Inactive'}
                  </span>
                </div>
                <div className="pt-2">
                  <Button onClick={() => window.print()} size="sm" className="bg-brand-orange text-black">
                    Print Badge
                  </Button>
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}