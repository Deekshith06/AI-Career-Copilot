import { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import Layout from "../components/layout";
import API_BASE_URL from "../config/api";
import "./progress-premium.css";

const PRESET_AVATARS = [
  "https://api.dicebear.com/7.x/bottts/svg?seed=Prometheus&backgroundColor=0b1020",
  "https://api.dicebear.com/7.x/bottts/svg?seed=AI&backgroundColor=111827",
  "https://api.dicebear.com/7.x/bottts/svg?seed=Cyber&backgroundColor=161b2e",
  "https://api.dicebear.com/7.x/bottts/svg?seed=Nexus&backgroundColor=0b1020",
  "https://api.dicebear.com/7.x/bottts/svg?seed=Core&backgroundColor=111827",
  "https://api.dicebear.com/7.x/bottts/svg?seed=Synapse&backgroundColor=161b2e",
];

const MAX_PROFILE_IMAGE_SIZE = 5 * 1024 * 1024;

function Profile() {
  const navigate = useNavigate();
  const [account, setAccount] = useState({ email: "", profileImage: "" });
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [statusMsg, setStatusMsg] = useState({ type: "", text: "" });
  const [loading, setLoading] = useState(false);

  const token = typeof window !== "undefined" ? localStorage.getItem("token") || "" : "";
  const fallbackEmail = typeof window !== "undefined" ? localStorage.getItem("prometheus_username") || "" : "";
  const displayName = (account.email || fallbackEmail).split("@")[0].split(/[._-]/)[0];
  const nameCapd = displayName.charAt(0).toUpperCase() + displayName.slice(1) || "Operative";

  useEffect(() => {
    if (!token) return;
    axios.get(`${API_BASE_URL}/api/profile`, { headers: { authorization: token } })
      .then(res => setAccount({ email: res.data?.user?.email || fallbackEmail, profileImage: res.data?.user?.profileImage || "" }))
      .catch(() => {});
  }, [token, fallbackEmail]);

  const showStatus = (type, text) => {
    setStatusMsg({ type, text });
    setTimeout(() => setStatusMsg({ type: "", text: "" }), 4000);
  };

  const updateAvatar = async (base64OrUrl) => {
    setLoading(true);
    try {
      await axios.patch(`${API_BASE_URL}/api/profile`, { profileImage: base64OrUrl }, { headers: { authorization: token }, timeout: 15000 });
      setAccount(prev => ({ ...prev, profileImage: base64OrUrl }));
      showStatus("success", "Avatar updated successfully.");
    } catch (err) {
      if (err?.response?.status === 401) { handleLogout(); return; }
      showStatus("error", `Avatar update failed: ${err?.response?.data?.message || err?.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (file.size > MAX_PROFILE_IMAGE_SIZE) { showStatus("error", "Image must be under 5MB."); return; }
    
    const reader = new FileReader();
    reader.onload = (ev) => updateAvatar(ev.target.result);
    reader.onerror = () => showStatus("error", "Failed to read file.");
    reader.readAsDataURL(file);
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    if (newPassword.length < 6) { showStatus("error", "New password must be at least 6 characters."); return; }
    setLoading(true);
    try {
      await axios.patch(`${API_BASE_URL}/api/profile/password`, { currentPassword, newPassword }, { headers: { authorization: token } });
      showStatus("success", "Password changed successfully.");
      setCurrentPassword(""); setNewPassword("");
    } catch (err) {
      if (err?.response?.status === 401) { handleLogout(); return; }
      showStatus("error", err.response?.data?.message || "Password change failed.");
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("prometheus_username");
    window.dispatchEvent(new Event("storage"));
    navigate("/login");
  };

  return (
    <Layout>
      <div className="mobile-profile-shell" style={{ padding: "40px 60px 80px", maxWidth: 1000, margin: "0 auto" }}>
        <header className="mobile-profile-header" style={{ marginBottom: 48, display: "flex", justifyContent: "space-between", alignItems: "flex-end" }}>
          <div>
            <h1 className="nm-h1" style={{ fontSize: "2.4rem", fontWeight: 800, margin: 0 }}>Operative Profile</h1>
            <p style={{ fontSize: "1rem", color: "var(--nm-dim)", marginTop: 8, fontWeight: 500 }}>Manage your credentials and visual identity.</p>
          </div>
          <button onClick={handleLogout} className="nm-card nm-card-hover" style={{ padding: "12px 24px", color: "#ef4444", fontWeight: 800, display: "flex", alignItems: "center", gap: 10 }}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>
            DISCONNECT
          </button>
        </header>

        {statusMsg.text && (
          <div className="nm-card" style={{ padding: "16px 24px", marginBottom: 32, borderLeft: `4px solid ${statusMsg.type === 'error' ? '#ef4444' : '#10b981'}` }}>
            <span style={{ fontWeight: 700, color: statusMsg.type === 'error' ? '#ef4444' : '#10b981' }}>{statusMsg.text}</span>
          </div>
        )}

        <div className="mobile-two-col-grid" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 40 }}>
          
          <section className="nm-card" style={{ padding: 32 }}>
            <h2 className="nm-h1" style={{ fontSize: "1.2rem", fontWeight: 800, marginBottom: 24 }}>Visual Identity</h2>
            
            <div className="mobile-profile-identity" style={{ display: "flex", alignItems: "center", gap: 24, marginBottom: 32 }}>
              <div style={{ position: "relative" }}>
                {account.profileImage 
                  ? <img src={account.profileImage} alt="Avatar" style={{ width: 80, height: 80, borderRadius: "50%", border: "3px solid var(--nm-accent)", objectFit: "cover" }} />
                  : <div className="nm-recessed" style={{ width: 80, height: 80, borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 800, fontSize: "2rem", color: "var(--nm-accent)" }}>{nameCapd.charAt(0)}</div>
                }
                {loading && <div className="nm-loader" style={{ position: "absolute", top: 16, left: 16, width: 48, height: 48, borderWidth: 3 }} />}
              </div>
              <div>
                <label className="btn-primary" style={{ display: "inline-block", padding: "10px 20px", fontSize: "12px", cursor: "pointer" }}>
                  UPLOAD CUSTOM AVATAR
                  <input type="file" accept="image/*" style={{ display: "none" }} onChange={handleFileUpload} disabled={loading} />
                </label>
                <p style={{ fontSize: "11px", color: "var(--nm-dim)", marginTop: 8, fontWeight: 600 }}>JPG, PNG or GIF. Max size of 5MB.</p>
              </div>
            </div>

            <div style={{ borderTop: "1px solid var(--nm-border)", paddingTop: 24 }}>
              <h3 style={{ fontSize: "11px", fontWeight: 800, color: "var(--nm-dim)", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 16 }}>Suggested Avatars</h3>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 16 }}>
                {PRESET_AVATARS.map((url, i) => (
                  <button key={i} onClick={() => updateAvatar(url)} disabled={loading} className="nm-icon-btn" style={{ width: 56, height: 56, padding: 0, overflow: "hidden", borderRadius: 12 }}>
                    <img src={url} alt={`Preset ${i}`} style={{ width: "100%", height: "100%" }} />
                  </button>
                ))}
              </div>
            </div>
          </section>

          <section className="nm-card" style={{ padding: 32 }}>
            <h2 className="nm-h1" style={{ fontSize: "1.2rem", fontWeight: 800, marginBottom: 24 }}>Security Clearance</h2>
            <form onSubmit={handleChangePassword} style={{ display: "flex", flexDirection: "column", gap: 20 }}>
              <div>
                <label style={{ fontSize: "10px", fontWeight: 900, color: "var(--nm-dim)", textTransform: "uppercase", letterSpacing: "0.15em", display: "block", marginBottom: 8 }}>Current Password</label>
                <input type="password" placeholder="Enter current password" required className="input-premium" value={currentPassword} onChange={e => setCurrentPassword(e.target.value)} style={{ padding: "12px 16px" }} disabled={loading} />
              </div>
              <div>
                <label style={{ fontSize: "10px", fontWeight: 900, color: "var(--nm-dim)", textTransform: "uppercase", letterSpacing: "0.15em", display: "block", marginBottom: 8 }}>New Password</label>
                <input type="password" placeholder="Enter new password (min 6 chars)" required className="input-premium" value={newPassword} onChange={e => setNewPassword(e.target.value)} style={{ padding: "12px 16px" }} disabled={loading} />
              </div>
              <button type="submit" disabled={loading} className="btn-primary" style={{ padding: "16px", marginTop: 8, display: "flex", alignItems: "center", justifyContent: "center", gap: 10 }}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
                UPDATE CLEARANCE CODE
              </button>
            </form>
          </section>
          
        </div>
      </div>
    </Layout>
  );
}

export default Profile;
