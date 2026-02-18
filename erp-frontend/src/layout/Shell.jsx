import React from "react";
import { NavLink, Outlet } from "react-router-dom";

const menu = [
  { path: "/dashboard", label: "Dashboard" },
  { path: "/model", label: "Model Panel" },
  { path: "/muhasebe", label: "Muhasebe" },
  { path: "/ik", label: "İK / Yövmiye" },
  { path: "/turlama", label: "Turlama" },
  { path: "/imalat", label: "İmalat" },
  { path: "/kaliphane", label: "Kalıphane" },
  { path: "/boyahane", label: "Boyahane" },
  { path: "/desen", label: "Desen" },
  { path: "/numune", label: "Numune" },
  { path: "/sevkiyat", label: "Sevkiyat" },
  { path: "/admin", label: "Admin / Root" },
];

export default function Shell() {
  return (
    <div style={{ display:"grid", gridTemplateColumns:"260px 1fr", minHeight:"100vh", background:"#f4f6fb" }}>

      {/* SIDEBAR */}
      <aside style={{
        background:"#111827",
        color:"#fff",
        padding:"20px",
        display:"flex",
        flexDirection:"column"
      }}>
        <div style={{ fontSize:18, fontWeight:700, marginBottom:20 }}>
          ERP PROTOTYPE
        </div>

        {menu.map(item => (
          <NavLink
            key={item.path}
            to={item.path}
            style={({isActive})=>({
              padding:"10px 14px",
              marginBottom:6,
              borderRadius:10,
              textDecoration:"none",
              background:isActive ? "#3b82f6" : "transparent",
              color:"#fff"
            })}
          >
            {item.label}
          </NavLink>
        ))}
      </aside>

      {/* MAIN */}
      <div>
        {/* TOPBAR */}
        <div style={{
          height:60,
          background:"#fff",
          borderBottom:"1px solid #e5e7eb",
          display:"flex",
          alignItems:"center",
          justifyContent:"space-between",
          padding:"0 20px"
        }}>
          <div style={{ fontWeight:600 }}>Yönetici Paneli</div>
          <div>Rol: Yönetici</div>
        </div>

        {/* CONTENT */}
        <div style={{ padding:20 }}>
          <Outlet/>
        </div>
      </div>

    </div>
  );
}
