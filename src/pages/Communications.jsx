import { useEffect, useState } from "react";
import { Megaphone, Phone, RefreshCw, Send, Ticket, Trash2 } from "lucide-react";
import axiosClient from "../api/axiosClient";
import AdminLocationFilterBar from "../components/filters/AdminLocationFilterBar";

const BRAND = "#FF8C00";

const fieldClass =
  "w-full border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-800 bg-white focus:ring-2 focus:ring-orange-200 focus:border-[#FF8C00] outline-none";

const CHANNELS = [
  { key: "channel_in_app", label: "In-app" },
  { key: "channel_push", label: "Push" },
  { key: "channel_sms", label: "SMS" },
  { key: "channel_email", label: "Email" },
  { key: "channel_whatsapp", label: "WhatsApp" },
];

function placeLabel(row) {
  return [row.country || row.zone, row.state, row.town].filter(Boolean).join(" / ") || "Any place";
}

function statusClass(status) {
  const value = String(status || "").toLowerCase();
  if (["sent", "delivered", "closed", "resolved"].includes(value)) {
    return "bg-emerald-50 text-emerald-700";
  }
  if (["scheduled", "queued", "open", "pending"].includes(value)) {
    return "bg-sky-50 text-sky-700";
  }
  if (["draft"].includes(value)) return "bg-gray-100 text-gray-600";
  if (["high", "urgent"].includes(value)) return "bg-red-50 text-red-700";
  return "bg-amber-50 text-amber-700";
}

function Badge({ children }) {
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium capitalize ${statusClass(children)}`}>
      {children || "—"}
    </span>
  );
}

export default function Communications() {
  const [tickets, setTickets] = useState([]);
  const [announcements, setAnnouncements] = useState([]);
  const [phones, setPhones] = useState([]);
  const [loading, setLoading] = useState(true);
  const [savingPhone, setSavingPhone] = useState(false);
  const [savingAnnouncement, setSavingAnnouncement] = useState("");
  const [replying, setReplying] = useState(false);
  const [phoneForm, setPhoneForm] = useState({
    audience: "buyers",
    zone: "",
    state: "",
    town: "",
    phone: "",
  });
  const [form, setForm] = useState({
    title: "",
    body: "",
    audience: "all",
    zone: "",
    state: "",
    town: "",
    channel_in_app: true,
    channel_push: false,
    channel_sms: false,
    channel_email: false,
    channel_whatsapp: false,
    scheduled_at: "",
    expires_at: "",
  });
  const [preview, setPreview] = useState(null);
  const [previewing, setPreviewing] = useState(false);
  const [msg, setMsg] = useState("");
  const [msgTone, setMsgTone] = useState("ok");
  const [replyFor, setReplyFor] = useState(null);
  const [replyBody, setReplyBody] = useState("");

  const notify = (text, tone = "ok") => {
    setMsg(text);
    setMsgTone(tone);
  };

  const load = async () => {
    const [t, a, p] = await Promise.allSettled([
      axiosClient.get("/admin/support/tickets"),
      axiosClient.get("/admin/announcements"),
      axiosClient.get("/admin/support/phones"),
    ]);
    if (t.status === "fulfilled") setTickets(t.value.data?.data?.data || t.value.data?.data || []);
    if (a.status === "fulfilled") setAnnouncements(a.value.data?.data?.data || a.value.data?.data || []);
    if (p.status === "fulfilled") setPhones(p.value.data?.data?.phones || []);
    if ([t, a, p].every((r) => r.status === "rejected")) {
      notify("Could not load communications data", "err");
    }
  };

  useEffect(() => {
    load()
      .catch(() => notify("Could not load communications data", "err"))
      .finally(() => setLoading(false));
  }, []);

  const savePhone = async () => {
    if (!phoneForm.phone.trim()) {
      notify("Enter a phone number before saving.", "err");
      return;
    }
    setSavingPhone(true);
    try {
      await axiosClient.post("/admin/support/phones", {
        audience: phoneForm.audience,
        country: phoneForm.zone || "",
        state: phoneForm.state || "",
        town: phoneForm.town || "",
        phone: phoneForm.phone.trim(),
      });
      setPhoneForm((f) => ({ ...f, phone: "" }));
      notify("Support number saved. The app opens the phone dialer when it is tapped.");
      await load();
    } catch (e) {
      notify(e?.response?.data?.message || "Could not save the support number.", "err");
    } finally {
      setSavingPhone(false);
    }
  };

  const removePhone = async (id) => {
    try {
      await axiosClient.delete(`/admin/support/phones/${id}`);
      notify("Support number removed.");
      await load();
    } catch (e) {
      notify(e?.response?.data?.message || "Could not remove the support number.", "err");
    }
  };

  const sendAnnouncement = async (saveAs) => {
    if (!form.title.trim()) {
      notify("Add a title before sending or saving.", "err");
      return;
    }
    setSavingAnnouncement(saveAs);
    try {
      const body = { ...form, save_as: saveAs };
      if (!body.scheduled_at) delete body.scheduled_at;
      if (!body.expires_at) delete body.expires_at;
      if (!body.zone) delete body.zone;
      if (!body.state) delete body.state;
      if (!body.town) delete body.town;
      const res = await axiosClient.post("/admin/announcements", body);
      notify(res.data?.message || (saveAs === "draft" ? "Draft saved" : "Announcement sent"));
      setForm((f) => ({ ...f, title: "", body: "", scheduled_at: "", expires_at: "" }));
      setPreview(null);
      await load();
    } catch (e) {
      notify(e?.response?.data?.message || "Could not save the announcement.", "err");
    } finally {
      setSavingAnnouncement("");
    }
  };

  const doPreview = async () => {
    setPreviewing(true);
    try {
      const res = await axiosClient.post("/admin/announcements/preview", {
        audience: form.audience,
        zone: form.zone || undefined,
        state: form.state || undefined,
        town: form.town || undefined,
      });
      setPreview(res.data?.data?.recipients ?? 0);
    } catch (e) {
      notify(e?.response?.data?.message || "Could not preview recipients.", "err");
    } finally {
      setPreviewing(false);
    }
  };

  const reply = async (id) => {
    if (!replyBody.trim()) return;
    setReplying(true);
    try {
      await axiosClient.post(`/admin/support/tickets/${id}/messages`, { body: replyBody.trim() });
      setReplyFor(null);
      setReplyBody("");
      notify("Reply sent.");
      await load();
    } catch (e) {
      notify(e?.response?.data?.message || "Could not send the reply.", "err");
    } finally {
      setReplying(false);
    }
  };

  const rows = Array.isArray(tickets) ? tickets : [];
  const ann = Array.isArray(announcements) ? announcements : [];

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-gray-800 uppercase tracking-wide">
            Communications
          </h1>
          <p className="text-sm text-gray-500 mt-1 max-w-2xl">
            Support numbers, tickets, and announcements for buyers, vendors, drivers, and transport.
          </p>
        </div>
        <button
          type="button"
          onClick={() => {
            setLoading(true);
            load()
              .catch(() => notify("Could not load communications data", "err"))
              .finally(() => setLoading(false));
          }}
          disabled={loading}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-lg border border-gray-200 bg-white text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
          Refresh
        </button>
      </div>

      {msg && (
        <div
          className={`rounded-xl border px-4 py-3 text-sm ${
            msgTone === "err"
              ? "border-red-200 bg-red-50 text-red-700"
              : "border-emerald-200 bg-emerald-50 text-emerald-800"
          }`}
        >
          {msg}
        </div>
      )}

      <section className="bg-white border border-[#E6EEF6] rounded-xl shadow-sm">
        <div className="px-5 py-4 border-b border-[#E6EEF6] flex items-start gap-3">
          <span className="mt-0.5 inline-flex h-9 w-9 items-center justify-center rounded-lg bg-orange-50 text-[#FF8C00]">
            <Phone className="w-4 h-4" />
          </span>
          <div>
            <h2 className="text-base font-semibold text-[#003158]">Support numbers</h2>
            <p className="text-sm text-gray-500 mt-0.5">
              One number per role and place. The closest match is country, then state, then town. Tap opens the phone dialer.
            </p>
          </div>
        </div>

        <div className="p-5 space-y-4">
          <div className="flex flex-wrap gap-4 items-end">
            <div className="min-w-[180px]">
              <label className="block text-xs font-medium text-gray-500 mb-1">Audience</label>
              <select
                value={phoneForm.audience}
                onChange={(e) => setPhoneForm({ ...phoneForm, audience: e.target.value })}
                className={fieldClass}
              >
                <option value="buyers">Buyers</option>
                <option value="vendors">Vendors</option>
                <option value="drivers">Drivers</option>
                <option value="transport">Transport</option>
              </select>
            </div>
            <AdminLocationFilterBar
              entity={phoneForm.audience === "transport" ? "transport" : phoneForm.audience.replace(/s$/, "")}
              zoneLabel="Country"
              value={{ zone: phoneForm.zone, state: phoneForm.state, town: phoneForm.town }}
              onChange={(next) => setPhoneForm((f) => ({ ...f, zone: next.zone, state: next.state, town: next.town }))}
            />
          </div>
          <div className="flex flex-wrap gap-3 items-end">
            <div className="w-full max-w-xs">
              <label className="block text-xs font-medium text-gray-500 mb-1">Phone number</label>
              <input
                value={phoneForm.phone}
                onChange={(e) => setPhoneForm({ ...phoneForm, phone: e.target.value })}
                placeholder="+234 800 000 0000"
                className={fieldClass}
              />
            </div>
            <button
              type="button"
              onClick={savePhone}
              disabled={savingPhone}
              className="h-[38px] px-5 rounded-lg text-sm font-medium text-white disabled:opacity-50"
              style={{ backgroundColor: BRAND }}
            >
              {savingPhone ? "Saving…" : "Save"}
            </button>
          </div>

          <div className="overflow-x-auto border border-[#E6EEF6] rounded-xl">
            <table className="min-w-full text-sm">
              <thead>
                <tr className="bg-[#F8FAFC] border-b border-[#E6EEF6] text-left text-xs uppercase tracking-wide text-gray-500">
                  <th className="px-4 py-3 font-semibold">Audience</th>
                  <th className="px-4 py-3 font-semibold">Location</th>
                  <th className="px-4 py-3 font-semibold">Number</th>
                  <th className="px-4 py-3 font-semibold text-right">Action</th>
                </tr>
              </thead>
              <tbody>
                {phones.length === 0 && (
                  <tr>
                    <td colSpan={4} className="px-4 py-8 text-center text-gray-500">
                      {loading ? "Loading…" : "No support numbers yet."}
                    </td>
                  </tr>
                )}
                {phones.map((row) => (
                  <tr key={row.id} className="border-b border-[#F1F5F9] last:border-0">
                    <td className="px-4 py-3 font-medium text-[#003158] capitalize">{row.audience}</td>
                    <td className="px-4 py-3 text-gray-600">{placeLabel(row)}</td>
                    <td className="px-4 py-3 text-gray-800">{row.phone}</td>
                    <td className="px-4 py-3 text-right">
                      <button
                        type="button"
                        onClick={() => removePhone(row.id)}
                        className="inline-flex items-center gap-1 text-xs font-medium text-red-600 hover:text-red-700"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        Remove
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      <section className="bg-white border border-[#E6EEF6] rounded-xl shadow-sm overflow-hidden">
        <div className="px-5 py-4 border-b border-[#E6EEF6] flex items-start gap-3">
          <span className="mt-0.5 inline-flex h-9 w-9 items-center justify-center rounded-lg bg-orange-50 text-[#FF8C00]">
            <Ticket className="w-4 h-4" />
          </span>
          <div>
            <h2 className="text-base font-semibold text-[#003158]">Support tickets</h2>
            <p className="text-sm text-gray-500 mt-0.5">Reply to open requests from the apps.</p>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead>
              <tr className="bg-[#F8FAFC] border-b border-[#E6EEF6] text-left text-xs uppercase tracking-wide text-gray-500">
                <th className="px-4 py-3 font-semibold">Ticket</th>
                <th className="px-4 py-3 font-semibold">Account</th>
                <th className="px-4 py-3 font-semibold">Status</th>
                <th className="px-4 py-3 font-semibold">Priority</th>
                <th className="px-4 py-3 font-semibold">Location</th>
                <th className="px-4 py-3 font-semibold text-right">Action</th>
              </tr>
            </thead>
            <tbody>
              {rows.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-4 py-8 text-center text-gray-500">
                    {loading ? "Loading…" : "No tickets."}
                  </td>
                </tr>
              )}
              {rows.map((t) => (
                <tr key={t.id} className="border-b border-[#F1F5F9] last:border-0 align-top">
                  <td className="px-4 py-3">
                    <div className="font-semibold text-[#003158]">#{t.id} {t.subject}</div>
                    {replyFor === t.id && (
                      <div className="mt-3 space-y-2 max-w-md">
                        <textarea
                          value={replyBody}
                          onChange={(e) => setReplyBody(e.target.value)}
                          rows={3}
                          placeholder="Write a reply"
                          className={fieldClass}
                        />
                        <div className="flex gap-2">
                          <button
                            type="button"
                            onClick={() => reply(t.id)}
                            disabled={replying || !replyBody.trim()}
                            className="px-3 py-1.5 rounded-lg text-xs font-medium text-white disabled:opacity-50"
                            style={{ backgroundColor: BRAND }}
                          >
                            {replying ? "Sending…" : "Send reply"}
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              setReplyFor(null);
                              setReplyBody("");
                            }}
                            className="px-3 py-1.5 rounded-lg text-xs font-medium border border-gray-200 text-gray-600 hover:bg-gray-50"
                          >
                            Cancel
                          </button>
                        </div>
                      </div>
                    )}
                  </td>
                  <td className="px-4 py-3 text-gray-600 capitalize">{t.account_type || "—"}</td>
                  <td className="px-4 py-3"><Badge>{t.status}</Badge></td>
                  <td className="px-4 py-3"><Badge>{t.priority}</Badge></td>
                  <td className="px-4 py-3 text-gray-600">{t.zone || "Any location"}</td>
                  <td className="px-4 py-3 text-right">
                    <button
                      type="button"
                      onClick={() => {
                        setReplyFor(t.id);
                        setReplyBody("");
                      }}
                      className="text-xs font-medium px-3 py-1.5 rounded-lg text-white"
                      style={{ backgroundColor: BRAND }}
                    >
                      Reply
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section className="bg-white border border-[#E6EEF6] rounded-xl shadow-sm">
        <div className="px-5 py-4 border-b border-[#E6EEF6] flex items-start gap-3">
          <span className="mt-0.5 inline-flex h-9 w-9 items-center justify-center rounded-lg bg-orange-50 text-[#FF8C00]">
            <Megaphone className="w-4 h-4" />
          </span>
          <div>
            <h2 className="text-base font-semibold text-[#003158]">Announcements</h2>
            <p className="text-sm text-gray-500 mt-0.5">
              Send a message now, schedule it, or keep it as a draft.
            </p>
          </div>
        </div>

        <div className="p-5 space-y-5">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="md:col-span-2">
              <label className="block text-xs font-medium text-gray-500 mb-1">Title</label>
              <input
                placeholder="Announcement title"
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
                className={fieldClass}
              />
            </div>
            <div className="md:col-span-2">
              <label className="block text-xs font-medium text-gray-500 mb-1">Message</label>
              <textarea
                placeholder="Write the announcement"
                value={form.body}
                onChange={(e) => setForm({ ...form, body: e.target.value })}
                rows={4}
                className={fieldClass}
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">Audience</label>
              <select
                value={form.audience}
                onChange={(e) => setForm({ ...form, audience: e.target.value })}
                className={fieldClass}
              >
                <option value="all">All</option>
                <option value="buyers">Buyers</option>
                <option value="vendors">Vendors</option>
                <option value="drivers">Drivers</option>
                <option value="transport">Transport</option>
              </select>
            </div>
            <div className="md:col-span-2">
              <p className="text-xs font-medium text-gray-500 mb-1">Location</p>
              <AdminLocationFilterBar
                entity="buyer"
                zoneLabel="Country"
                value={{ zone: form.zone, state: form.state, town: form.town }}
                onChange={(next) => setForm((f) => ({ ...f, zone: next.zone, state: next.state, town: next.town }))}
              />
            </div>
          </div>

          <div>
            <p className="text-xs font-medium text-gray-500 mb-2">Channels</p>
            <div className="flex flex-wrap gap-2">
              {CHANNELS.map((channel) => {
                const checked = form[channel.key];
                return (
                  <label
                    key={channel.key}
                    className={`inline-flex items-center gap-2 px-3 py-2 rounded-lg border text-sm cursor-pointer ${
                      checked
                        ? "border-[#FF8C00] bg-orange-50 text-[#003158]"
                        : "border-gray-200 bg-white text-gray-600"
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={checked}
                      onChange={(e) => setForm({ ...form, [channel.key]: e.target.checked })}
                      className="accent-[#FF8C00]"
                    />
                    {channel.label}
                  </label>
                );
              })}
            </div>
          </div>

          <div className="flex flex-wrap gap-4">
            <div className="w-full max-w-[260px]">
              <label className="block text-xs font-medium text-gray-500 mb-1">Schedule</label>
              <input
                type="datetime-local"
                value={form.scheduled_at}
                onChange={(e) => setForm({ ...form, scheduled_at: e.target.value })}
                className={fieldClass}
              />
            </div>
            <div className="w-full max-w-[260px]">
              <label className="block text-xs font-medium text-gray-500 mb-1">Expiry</label>
              <input
                type="datetime-local"
                value={form.expires_at}
                onChange={(e) => setForm({ ...form, expires_at: e.target.value })}
                className={fieldClass}
              />
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3 pt-1">
            <button
              type="button"
              onClick={doPreview}
              disabled={previewing}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-lg border border-gray-200 bg-white text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50"
            >
              {previewing ? "Checking…" : "Preview recipients"}
            </button>
            {preview != null && (
              <span className="text-sm text-gray-600">
                <strong className="text-[#003158]">{preview}</strong> people
              </span>
            )}
            <div className="flex-1" />
            <button
              type="button"
              onClick={() => sendAnnouncement("draft")}
              disabled={!!savingAnnouncement}
              className="px-4 py-2 rounded-lg border border-gray-200 bg-white text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50"
            >
              {savingAnnouncement === "draft" ? "Saving…" : "Save draft"}
            </button>
            <button
              type="button"
              onClick={() => sendAnnouncement("send")}
              disabled={!!savingAnnouncement}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium text-white disabled:opacity-50"
              style={{ backgroundColor: BRAND }}
            >
              <Send className="w-4 h-4" />
              {savingAnnouncement === "send" ? "Sending…" : "Send"}
            </button>
          </div>

          <div className="overflow-x-auto border border-[#E6EEF6] rounded-xl">
            <table className="min-w-full text-sm">
              <thead>
                <tr className="bg-[#F8FAFC] border-b border-[#E6EEF6] text-left text-xs uppercase tracking-wide text-gray-500">
                  <th className="px-4 py-3 font-semibold">Title</th>
                  <th className="px-4 py-3 font-semibold">Audience</th>
                  <th className="px-4 py-3 font-semibold">Status</th>
                  <th className="px-4 py-3 font-semibold">Delivered</th>
                </tr>
              </thead>
              <tbody>
                {ann.length === 0 && (
                  <tr>
                    <td colSpan={4} className="px-4 py-8 text-center text-gray-500">
                      {loading ? "Loading…" : "No announcements yet."}
                    </td>
                  </tr>
                )}
                {ann.map((row) => (
                  <tr key={row.id} className="border-b border-[#F1F5F9] last:border-0">
                    <td className="px-4 py-3 font-medium text-[#003158]">{row.title}</td>
                    <td className="px-4 py-3 text-gray-600 capitalize">{row.audience || "all"}</td>
                    <td className="px-4 py-3"><Badge>{row.status}</Badge></td>
                    <td className="px-4 py-3 text-gray-600">{row.delivered_count ?? 0}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>
    </div>
  );
}
