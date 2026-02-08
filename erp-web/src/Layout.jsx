import { NavLink, Outlet } from "react-router-dom";
import "./App.css";

const linkStyle = ({ isActive }) => ({
  padding: "10px 12px",
  borderRadius: 10,
  textDecoration: "none",
  color: "inherit",
  background: isActive ? "rgba(0,0,0,0.08)" : "transparent",
  fontWeight: isActive ? 700 : 500,
});

export default function Layout() {
  return (
    <div style={{ display: "flex", minHeight: "100vh" }}>
      <aside style={{ width: 240, padding: 14, borderRight: "1px solid rgba(0,0,0,0.1)" }}>
        <div style={{ fontWeight: 800, marginBottom: 12 }}>ERP</div>
        <nav style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          <NavLink to="/boyahane" style={linkStyle}>Boyahane</NavLink>
          <NavLink to="/muhasebe" style={linkStyle}>Muhasebe</NavLink>
          <NavLink to="/personel" style={linkStyle}>Personel</NavLink>
          <NavLink to="/takip" style={linkStyle}>Takip / Sevkiyat</NavLink>
        </nav>
        <div style={{ marginTop: 18, fontSize: 12, opacity: 0.7 }}>
          Not: Ekranlar kilit dokümana göre ilerler.
        </div>
      </aside>
      <main style={{ flex: 1, padding: 18 }}>
        <Outlet />
      </main>
    </div>
  );
}
