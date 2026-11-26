import { ImageResponse } from "next/og";

export const alt = "TechFixSoftware — Jasa Servis Software Android Remote & Rangkasbitung";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OpenGraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: "64px 72px",
          background:
            "radial-gradient(circle at 0% 100%, rgba(16, 185, 129, 0.42) 0%, rgba(13, 148, 136, 0.12) 45%, rgba(7, 11, 17, 0) 75%), linear-gradient(135deg, #070b11 0%, #0b1220 55%, #111c26 100%)",
          color: "#ffffff",
          fontFamily: "system-ui, sans-serif",
        }}
      >
        {/* Top bar */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "14px" }}>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                width: "52px",
                height: "52px",
                borderRadius: "12px",
                background: "rgba(255,255,255,0.08)",
                border: "1px solid rgba(255,255,255,0.16)",
                fontSize: "26px",
                fontWeight: 800,
              }}
            >
              <span>T</span>
              <span
                style={{
                  width: "10px",
                  height: "10px",
                  borderRadius: "2px",
                  background: "#14B8A6",
                  marginLeft: "3px",
                }}
              />
            </div>
            <div style={{ display: "flex", flexDirection: "column" }}>
              <span style={{ fontSize: "26px", fontWeight: 700, letterSpacing: "-0.02em" }}>
                TechFixSoftware
              </span>
              <span
                style={{
                  fontSize: "13px",
                  letterSpacing: "0.18em",
                  color: "#94a3b8",
                  textTransform: "uppercase",
                }}
              >
                Android Software Specialist
              </span>
            </div>
          </div>

          <div
            style={{
              display: "flex",
              padding: "10px 20px",
              borderRadius: "999px",
              background: "rgba(16, 185, 129, 0.16)",
              border: "1px solid rgba(52, 211, 153, 0.35)",
              color: "#6EE7B7",
              fontSize: "18px",
              fontWeight: 600,
            }}
          >
            Remote Seluruh Indonesia &amp; Rangkasbitung
          </div>
        </div>

        {/* Center hero copy */}
        <div style={{ display: "flex", flexDirection: "column", gap: "20px", maxWidth: "960px" }}>
          <div
            style={{
              fontSize: "62px",
              fontWeight: 700,
              lineHeight: 1.08,
              letterSpacing: "-0.03em",
              display: "flex",
              flexWrap: "wrap",
            }}
          >
            <span>Servis Software&nbsp;</span>
            <span style={{ color: "#34d399" }}>Android,</span>
            <span>&nbsp;Tanpa Perlu ke Toko.</span>
          </div>
          <div style={{ fontSize: "24px", color: "#cbd5e1", lineHeight: 1.45 }}>
            Fix Bootloop · Unbrick EDL 9008 · Flash Firmware · Root Magisk/KernelSU · Custom ROM ·
            Unlock Bootloader
          </div>
        </div>

        {/* Bottom bar */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            paddingTop: "24px",
            borderTop: "1px solid rgba(255,255,255,0.14)",
            fontSize: "20px",
            color: "#cbd5e1",
          }}
        >
          <span>Konsultasi WhatsApp · Estimasi mulai dari Rp50.000</span>
          <span style={{ color: "#34d399", fontWeight: 700 }}>techfixsoftware.web.id</span>
        </div>
      </div>
    ),
    size
  );
}
