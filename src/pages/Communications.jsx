import { useEffect, useState } from "react";
import axiosClient from "../api/axiosClient";

const box = { border: "1px solid #eee", borderRadius: 8, padding: 16, marginBottom: 16 };

export default function Communications() {
  const [phone, setPhone] = useState("");
  const [tickets, setTickets] = useState([]);
  const [announcements, setAnnouncements] = useState([]);
  const [form, setForm] = useState({
    title: "",
    body: "",
    audience: "all",
    zone: "",
    channel_in_app: true,
    channel_push: false,
    channel_sms: false,
    channel_email: false,
    channel_whatsapp: false,
    scheduled_at: "",
    expires_at: "",
  });
  const [preview, setPreview] = useState(null);
  const [vatName, setVatName] = useState("");
  const [vatRate, setVatRate] = useState("18");
  const [vatRows, setVatRows] = useState([]);
  const [msg, setMsg] = useState("");

  const load = async () => {
    const [t, a, v] = await Promise.allSettled([
      axiosClient.get("/admin/support/tickets"),
      axiosClient.get("/admin/announcements"),
      axiosClient.get("/admin/vat"),
    ]);
    if (t.status === "fulfilled") setTickets(t.value.data?.data?.data || t.value.data?.data || []);
    if (a.status === "fulfilled") setAnnouncements(a.value.data?.data?.data || a.value.data?.data || []);
    if (v.status === "fulfilled") setVatRows(v.value.data?.data?.classifications || []);
  };

  useEffect(() => {
    load().catch(() => setMsg("Could not load communications data"));
  }, []);

  const savePhone = async () => {
    await axiosClient.post("/admin/support/phone", { support_phone: phone });
    setMsg("Support number saved. The app shows it as text and does not call.");
  };

  const sendAnnouncement = async (saveAs) => {
    const body = { ...form, save_as: saveAs };
    if (!body.scheduled_at) delete body.scheduled_at;
    if (!body.expires_at) delete body.expires_at;
    if (!body.zone) delete body.zone;
    const res = await axiosClient.post("/admin/announcements", body);
    setMsg(res.data?.message || "Saved");
    load();
  };

  const doPreview = async () => {
    const res = await axiosClient.post("/admin/announcements/preview", {
      audience: form.audience,
      zone: form.zone || undefined,
    });
    setPreview(res.data?.data?.recipients ?? 0);
  };

  const addVat = async () => {
    await axiosClient.post("/admin/vat", {
      code: vatName.toLowerCase().replace(/\s+/g, "-").slice(0, 40) || "vat",
      name: vatName,
      rate_percent: Number(vatRate),
      is_default: vatRows.length === 0,
    });
    setVatName("");
    load();
  };

  const reply = async (id) => {
    const body = window.prompt("Reply");
    if (!body) return;
    await axiosClient.post(`/admin/support/tickets/${id}/messages`, { body });
    load();
  };

  const rows = Array.isArray(tickets) ? tickets : [];
  const ann = Array.isArray(announcements) ? announcements : [];

  return (
    <div style={{ padding: 24, maxWidth: 960 }}>
      <h1>Communications</h1>
      {msg && <p>{msg}</p>}

      <section style={box}>
        <h2>Support number</h2>
        <p>Shown as plain text. The mobile app does not place a call.</p>
        <input value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="Phone number" />
        <button type="button" onClick={savePhone}>Save</button>
      </section>

      <section style={box}>
        <h2>Support tickets</h2>
        {rows.length === 0 && <p>No tickets.</p>}
        {rows.map((t) => (
          <div key={t.id} style={{ marginBottom: 12 }}>
            <strong>#{t.id} {t.subject}</strong>
            <div>{t.account_type} · {t.status} · {t.priority} · {t.zone || "any location"}</div>
            <button type="button" onClick={() => reply(t.id)}>Reply</button>
          </div>
        ))}
      </section>

      <section style={box}>
        <h2>Announcements</h2>
        <input placeholder="Title" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
        <textarea placeholder="Message" value={form.body} onChange={(e) => setForm({ ...form, body: e.target.value })} />
        <div>
          <label>Audience </label>
          <select value={form.audience} onChange={(e) => setForm({ ...form, audience: e.target.value })}>
            <option value="all">All</option>
            <option value="buyers">Buyers</option>
            <option value="vendors">Vendors</option>
            <option value="drivers">Drivers</option>
            <option value="transport">Transport</option>
          </select>
          <input placeholder="Zone (optional)" value={form.zone} onChange={(e) => setForm({ ...form, zone: e.target.value })} />
        </div>
        <label><input type="checkbox" checked={form.channel_in_app} onChange={(e) => setForm({ ...form, channel_in_app: e.target.checked })} /> In-app</label>
        <label><input type="checkbox" checked={form.channel_push} onChange={(e) => setForm({ ...form, channel_push: e.target.checked })} /> Push</label>
        <label><input type="checkbox" checked={form.channel_sms} onChange={(e) => setForm({ ...form, channel_sms: e.target.checked })} /> SMS</label>
        <label><input type="checkbox" checked={form.channel_email} onChange={(e) => setForm({ ...form, channel_email: e.target.checked })} /> Email</label>
        <label><input type="checkbox" checked={form.channel_whatsapp} onChange={(e) => setForm({ ...form, channel_whatsapp: e.target.checked })} /> WhatsApp</label>
        <div>
          <label>Schedule <input type="datetime-local" value={form.scheduled_at} onChange={(e) => setForm({ ...form, scheduled_at: e.target.value })} /></label>
          <label> Expiry <input type="datetime-local" value={form.expires_at} onChange={(e) => setForm({ ...form, expires_at: e.target.value })} /></label>
        </div>
        <button type="button" onClick={doPreview}>Preview recipients</button>
        {preview != null && <span> {preview} people</span>}
        <button type="button" onClick={() => sendAnnouncement("send")}>Send</button>
        <button type="button" onClick={() => sendAnnouncement("draft")}>Save draft</button>
        <ul>
          {ann.map((row) => (
            <li key={row.id}>{row.title} — {row.status} — delivered {row.delivered_count ?? 0} — {row.audience}</li>
          ))}
        </ul>
      </section>

      <section style={box}>
        <h2>VAT classifications</h2>
        <p>Vendors enter prices before VAT. They cannot type a VAT percent.</p>
        <input placeholder="Name" value={vatName} onChange={(e) => setVatName(e.target.value)} />
        <input placeholder="Rate %" value={vatRate} onChange={(e) => setVatRate(e.target.value)} />
        <button type="button" onClick={addVat}>Add</button>
        <ul>
          {vatRows.map((row) => (
            <li key={row.id}>{row.name} — {row.rate_percent}% {row.is_default ? "(default)" : ""} zone {row.zone_id ?? "all"}</li>
          ))}
        </ul>
      </section>
    </div>
  );
}
