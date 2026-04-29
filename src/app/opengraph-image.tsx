import { ImageResponse } from "next/og";

export const runtime = "edge";

export const alt = "Vendora";
export const size = {
  width: 1200,
  height: 630,
};

export default function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          height: "100%",
          width: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "#050505",
          color: "#fafafa",
        }}
      >
        <div
          style={{
            width: 1000,
            display: "flex",
            flexDirection: "column",
            gap: 18,
            padding: 64,
            borderRadius: 32,
            border: "1px solid rgba(255,255,255,0.08)",
            background:
              "linear-gradient(135deg, rgba(255,255,255,0.06), rgba(255,255,255,0.02))",
          }}
        >
          <div style={{ fontSize: 56, fontWeight: 700, letterSpacing: -1 }}>
            Vendora
          </div>
          <div style={{ fontSize: 28, opacity: 0.85 }}>
            BUY BETTER WITH VENDORA
          </div>
        </div>
      </div>
    ),
    size,
  );
}

