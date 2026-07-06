import * as OTPAuth from 'otpauth'

export function generateTotpSecret(): string {
  const secret = new OTPAuth.Secret({ size: 20 })
  return secret.base32
}

export function getTotpUri(secret: string, email: string): string {
  const totp = new OTPAuth.TOTP({
    issuer: 'SSF CHECKINAI',
    label: email,
    algorithm: 'SHA1',
    digits: 6,
    period: 30,
    secret: OTPAuth.Secret.fromBase32(secret),
  })
  return totp.toString()
}

export function verifyTotpCode(secret: string, code: string): boolean {
  const totp = new OTPAuth.TOTP({
    algorithm: 'SHA1',
    digits: 6,
    period: 30,
    secret: OTPAuth.Secret.fromBase32(secret),
  })
  const delta = totp.validate({ token: code, window: 1 })
  return delta !== null
}