import type { SslResult } from "@/lib/enrichment-types"
import tls from "tls"

/**
 * Connects to the target hostname over TLS and inspects the
 * presented certificate.  Returns issuer, validity, self-signed
 * status, protocol version, and SANs.
 *
 * Uses rejectUnauthorized: false so we can still inspect invalid
 * or self-signed certificates.
 *
 * No API key required — pure Node.js.
 */
export async function checkSsl(
  hostname: string,
  port: number = 443
): Promise<SslResult> {
  return new Promise((resolve, reject) => {
    const socket = tls.connect(
      {
        host: hostname,
        port,
        servername: hostname,
        rejectUnauthorized: false,
        timeout: 10_000,
      },
      () => {
        try {
          const cert = socket.getPeerCertificate(true)

          if (!cert || !cert.subject) {
            socket.destroy()
            reject(new Error("No SSL certificate found"))
            return
          }

          const validFrom = cert.valid_from
            ? new Date(cert.valid_from).toISOString()
            : null
          const validTo = cert.valid_to
            ? new Date(cert.valid_to).toISOString()
            : null

          let daysUntilExpiry: number | null = null
          if (validTo) {
            daysUntilExpiry = Math.floor(
              (new Date(validTo).getTime() - Date.now()) / (1000 * 60 * 60 * 24)
            )
          }

          const isExpired = daysUntilExpiry !== null && daysUntilExpiry < 0

          // Self-signed check: issuer matches subject
          const isSelfSigned =
            cert.issuer && cert.subject
              ? JSON.stringify(cert.issuer) === JSON.stringify(cert.subject)
              : false

          const issuerParts: string[] = []
          if (cert.issuer?.O) issuerParts.push(cert.issuer.O)
          if (cert.issuer?.CN) issuerParts.push(cert.issuer.CN)

          const subjectAltNames: string[] = cert.subjectaltname
            ? cert.subjectaltname
                .split(",")
                .map((s: string) => s.trim().replace(/^DNS:/, ""))
            : []

          const result: SslResult = {
            issuer: issuerParts.join(" — ") || null,
            subject: cert.subject?.CN || null,
            validFrom,
            validTo,
            daysUntilExpiry,
            isSelfSigned,
            isExpired,
            protocol: socket.getProtocol() || null,
            serialNumber: cert.serialNumber || null,
            subjectAltNames,
          }

          socket.destroy()
          resolve(result)
        } catch (err) {
          socket.destroy()
          reject(err)
        }
      }
    )

    socket.on("error", (err) => {
      socket.destroy()
      reject(new Error(`SSL connection failed: ${err.message}`))
    })

    socket.on("timeout", () => {
      socket.destroy()
      reject(new Error("SSL connection timed out"))
    })
  })
}
