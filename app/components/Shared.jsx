"use client";
export function Stars({ v = 5, size = 14 }) {
  return (
    <span style={{ display: "flex", gap: 1 }}>
      {[1, 2, 3, 4, 5].map(i => (
        <svg key={i} width={size} height={size} viewBox="0 0 24 24" fill={i <= Math.round(v) ? "#FBBF24" : "none"} stroke="#FBBF24" strokeWidth="2">
          <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
        </svg>
      ))}
    </span>
  );
}

export function Avatar({ name, size = 40 }) {
  const initials = name?.split(" ").map(w => w[0]).slice(0, 2).join("") || "?";
  return (
    <div style={{ width: size, height: size, borderRadius: "50%", background: "rgba(124,58,237,0.2)", border: "1px solid rgba(124,58,237,0.3)", color: "var(--purple-300)", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 800, fontSize: size * 0.35, flexShrink: 0, letterSpacing: "-0.5px" }}>
      {initials}
    </div>
  );
}
