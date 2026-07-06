import { useState, useRef, useEffect } from 'react'
import { Html5Qrcode } from 'html5-qrcode'
import { processScan } from '@/lib/attendance'
import type { ScanResult } from '@/lib/attendance'
import { useAuth } from '@/context/AuthContext'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

export function BarcodeScanner() {
  const { user } = useAuth()
  const isSupervisor = user?.role === 'supervisor'
  const canUseManualEntry = user?.role === 'staff' || user?.role === 'administrator'

  const [manualCode, setManualCode] = useState('')
  const [result, setResult] = useState<ScanResult | null>(null)
  const [scanning, setScanning] = useState(false)
  const [cameraActive, setCameraActive] = useState(false)
  const scannerRef = useRef<Html5Qrcode | null>(null)
  const readerId = 'barcode-reader'

  const handleScan = async (code: string) => {
    if (scanning) return
    setScanning(true)
    const res = await processScan(code, user?.id ?? '', user?.name ?? 'Unknown')
    setResult(res)
    setScanning(false)
  }

  const handleManualSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!manualCode.trim()) return
    handleScan(manualCode.trim())
    setManualCode('')
  }

  const startCamera = async () => {
    try {
      const scanner = new Html5Qrcode(readerId)
      scannerRef.current = scanner
      await scanner.start(
        { facingMode: 'environment' },
        { fps: 10, qrbox: 250 },
        (decodedText) => {
          handleScan(decodedText)
        },
        () => {}
      )
      setCameraActive(true)
    } catch (err) {
      console.error('Camera start failed:', err)
      alert('Could not access camera. Check browser permissions, or use manual entry below.')
    }
  }

  const stopCamera = async () => {
    if (scannerRef.current) {
      await scannerRef.current.stop()
      await scannerRef.current.clear()
      scannerRef.current = null
    }
    setCameraActive(false)
  }

  useEffect(() => {
    return () => {
      if (scannerRef.current) {
        scannerRef.current.stop().catch(() => {})
      }
    }
  }, [])

  return (
    <div className="flex min-h-screen flex-col md:flex-row">
      <div className="flex-1 bg-brand-charcoal p-6 text-white">
        <h2 className="mb-4 text-center text-xl font-bold text-brand-orange">
          {isSupervisor ? 'SUPERVISOR SCAN STATION' : 'SCAN ID BARCODE'}
        </h2>

        <div id={readerId} className="mx-auto mb-4 w-full max-w-sm overflow-hidden rounded-lg" />

        {!cameraActive ? (
          <Button onClick={startCamera} className="mb-4 w-full bg-brand-orange text-black">
            Start Camera Scan
          </Button>
        ) : (
          <div className="mb-4 space-y-2">
            <Button onClick={stopCamera} variant="outline" className="w-full">
              Stop Camera
            </Button>
            {scanning ? (
              <div className="flex items-center justify-center gap-2 rounded-md bg-brand-orange/20 py-2 text-sm text-brand-orange">
                <span className="h-3 w-3 animate-spin rounded-full border-2 border-brand-orange border-t-transparent" />
                Scanning...
              </div>
            ) : (
              <div className="flex items-center justify-center gap-2 rounded-md bg-gray-700/30 py-2 text-sm text-gray-300">
                <span className="h-2 w-2 animate-pulse rounded-full bg-green-400" />
                Camera ready — waiting for barcode
              </div>
            )}
          </div>
        )}

        {canUseManualEntry ? (
          <form onSubmit={handleManualSubmit} className="space-y-2">
            <label className="text-sm text-gray-300">Or enter barcode manually:</label>
            <Input
              value={manualCode}
              onChange={(e) => setManualCode(e.target.value)}
              placeholder="e.g. SSF-090923-..."
              autoFocus
              className="border-brand-orange bg-white text-brand-charcoal"
            />
            <Button type="submit" disabled={scanning} className="w-full bg-brand-orange text-black">
              Submit
            </Button>
          </form>
        ) : (
          <p className="text-center text-sm text-gray-400">
            If the camera isn't working, please contact a staff member to scan manually.
          </p>
        )}
      </div>

      <div className="flex-1 bg-white p-6">
        {!result ? (
          <div className="flex h-full items-center justify-center text-gray-400">
            <p>Waiting for scan...</p>
          </div>
        ) : result.success ? (
          <div className="space-y-3">
            <h3 className="text-2xl font-bold">{result.member?.name}</h3>
            <p className="text-gray-600">{result.member?.role} — {result.member?.department}</p>
            <div className="rounded-lg border-2 border-brand-orange p-4">
              <p><strong>Event:</strong> {result.eventType === 'check-in' ? 'Check-In' : 'Check-Out'}</p>
              <p><strong>Time:</strong> {new Date(result.eventType === 'check-in' ? result.record!.check_in : result.record!.check_out!).toLocaleTimeString()}</p>
              {result.record?.duration_minutes != null && (
                <p><strong>Duration:</strong> {Math.floor(result.record.duration_minutes / 60)}h {result.record.duration_minutes % 60}m</p>
              )}
            </div>
            {result.isLate && (
              <div className="rounded bg-red-100 p-3 text-red-700">⚠️ Late Arrival</div>
            )}
            {result.isOvertime && (
              <div className="rounded bg-orange-100 p-3 text-orange-700">⏰ Overtime session (8h+)</div>
            )}
            {result.isEarlyDeparture && (
              <div className="rounded bg-yellow-100 p-3 text-yellow-700">⚠️ Early Departure</div>
            )}
            {result.isBuddyPunch && (
              <div className="rounded bg-purple-100 p-3 text-purple-700">⚠️ Same barcode scanned again within 2 minutes</div>
            )}
          </div>
        ) : (
          <div className="rounded bg-red-100 p-4 text-red-700">
            <p className="font-bold">Scan Rejected</p>
            <p>{result.error}</p>
          </div>
        )}
      </div>
    </div>
  )
}