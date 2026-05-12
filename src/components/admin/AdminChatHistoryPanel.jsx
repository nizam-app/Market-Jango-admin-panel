// Admin audit: group flat API messages by conversation partner (buyer, vendor, driver, transport…).
import React, { useMemo, useState, useEffect } from "react";
import { MessageCircle, ShieldOff } from "lucide-react";

function groupIntoConversations(messages, subjectUserId) {
  const uid = Number(subjectUserId);
  if (!Array.isArray(messages) || Number.isNaN(uid)) return [];

  const map = new Map();

  for (const msg of messages) {
    const sid = Number(msg.sender_id);
    const partnerId = sid === uid ? Number(msg.receiver_id) : Number(msg.sender_id);
    const partner = sid === uid ? msg.receiver : msg.sender;

    if (!map.has(partnerId)) {
      map.set(partnerId, {
        partnerId,
        partner,
        messages: [],
      });
    }
    map.get(partnerId).messages.push(msg);
  }

  const list = Array.from(map.values());
  for (const c of list) {
    c.messages.sort(
      (a, b) =>
        new Date(a.created_at || 0) - new Date(b.created_at || 0)
    );
    const last = c.messages[c.messages.length - 1];
    const t = last?.created_at ? new Date(last.created_at).getTime() : 0;
    c.lastAt = t;
    const raw =
      last?.message?.trim() ||
      (last?.image ? "[attachment]" : "") ||
      (last?.is_offer ? "[offer]" : "");
    c.preview = raw.length > 72 ? `${raw.slice(0, 72)}…` : raw || "—";
  }

  list.sort((a, b) => b.lastAt - a.lastAt);
  return list;
}

/**
 * Two-panel chat viewer for admin: conversations list + selected thread.
 *
 * @param {number|string} subjectUserId  — vendor/driver user id (the account being inspected)
 * @param {string}        outgoingLabel  — shown on outbound bubbles, e.g. "Vendor" or "Driver"
 * @param {object}        blockData      — { blocked_by_user: [...], blocked_user: [...] }
 */
export default function AdminChatHistoryPanel({
  subjectUserId,
  messages = [],
  loading,
  error,
  brandColor = "#FF8C00",
  outgoingLabel = "Account",
  blockData = null,
}) {
  // Build fast lookup sets from blockData
  const blockedBySubject = useMemo(() => {
    const ids = new Set();
    if (Array.isArray(blockData?.blocked_by_user)) {
      blockData.blocked_by_user.forEach((u) => ids.add(Number(u.user_id)));
    }
    return ids;
  }, [blockData]);

  const blockedSubject = useMemo(() => {
    const ids = new Set();
    if (Array.isArray(blockData?.blocked_user)) {
      blockData.blocked_user.forEach((u) => ids.add(Number(u.user_id)));
    }
    return ids;
  }, [blockData]);
  const conversations = useMemo(
    () => groupIntoConversations(messages, subjectUserId),
    [messages, subjectUserId]
  );

  const [selectedPartnerId, setSelectedPartnerId] = useState(null);

  useEffect(() => {
    if (conversations.length === 0) {
      setSelectedPartnerId(null);
      return;
    }
    setSelectedPartnerId((prev) => {
      const exists =
        prev != null && conversations.some((c) => c.partnerId === prev);
      if (exists) return prev;
      return conversations[0].partnerId;
    });
  }, [conversations]);

  const active = conversations.find((c) => c.partnerId === selectedPartnerId);
  const uid = Number(subjectUserId);

  const partnerTitle = (p) =>
    p?.name || p?.email || `User #${p?.id ?? "?"}`;
  const partnerType = (p) =>
    p?.user_type ? String(p.user_type).toUpperCase() : "";

  return (
    <div className="mt-4">
      <div className="flex items-center gap-2 mb-2">
        <MessageCircle className="w-[18px] h-[18px]" style={{ color: brandColor }} />
        <span className="font-bold text-gray-900 text-[15px]">Chat history</span>
        {!loading && !error && conversations.length > 0 && (
          <span className="text-xs font-medium text-gray-500">
            {conversations.length} conversation
            {conversations.length !== 1 ? "s" : ""}
          </span>
        )}
      </div>

      {loading && (
        <p className="text-sm text-gray-500 py-3">Loading messages...</p>
      )}

      {!loading && error && (
        <div className="rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-900">
          {error}
        </div>
      )}

      {!loading && !error && messages.length === 0 && (
        <p className="text-sm text-gray-500 text-center py-8 rounded-lg border border-gray-100 bg-gray-50">
          No chat messages for this account yet.
        </p>
      )}

      {!loading && !error && messages.length > 0 && conversations.length > 0 && (
        <div
          className="flex rounded-lg border border-gray-200 bg-white overflow-hidden min-h-[280px] max-h-[380px]"
          style={{ boxShadow: "0 1px 3px rgba(0,0,0,0.06)" }}
        >
          {/* Conversation list */}
          <div className="w-[min(100%,240px)] shrink-0 border-r border-gray-200 bg-gray-50 overflow-y-auto">
            {conversations.map((c) => {
              const sel = c.partnerId === selectedPartnerId;
              const pt = partnerType(c.partner);
              const subjectBlockedPartner = blockedBySubject.has(c.partnerId);
              const partnerBlockedSubject = blockedSubject.has(c.partnerId);
              const hasBlock = subjectBlockedPartner || partnerBlockedSubject;
              return (
                <button
                  key={c.partnerId}
                  type="button"
                  onClick={() => setSelectedPartnerId(c.partnerId)}
                  className={`w-full text-left px-3 py-2.5 border-b border-gray-100 transition-colors ${
                    sel
                      ? "bg-white border-l-4 shadow-sm"
                      : "hover:bg-gray-100 border-l-4 border-l-transparent"
                  }`}
                  style={sel ? { borderLeftColor: brandColor } : undefined}
                >
                  <div className="font-semibold text-sm text-gray-900 truncate">
                    {partnerTitle(c.partner)}
                  </div>
                  <div className="flex items-center gap-1 mt-0.5 flex-wrap">
                    {pt && (
                      <span className="text-[10px] font-bold uppercase px-1.5 py-0 rounded bg-gray-200 text-gray-700">
                        {pt}
                      </span>
                    )}
                    <span className="text-[11px] text-gray-500">
                      {c.messages.length} msg{c.messages.length !== 1 ? "s" : ""}
                    </span>
                    {hasBlock && (
                      <span className="flex items-center gap-0.5 text-[10px] font-bold px-1.5 py-0 rounded bg-red-100 text-red-700">
                        <ShieldOff className="w-2.5 h-2.5" />
                        Blocked
                      </span>
                    )}
                  </div>
                  <div className="text-[11px] text-gray-500 truncate mt-1">
                    {c.preview}
                  </div>
                </button>
              );
            })}
          </div>

          {/* Active thread */}
          <div className="flex-1 flex flex-col min-w-0 bg-gray-50/50">
            {active && (
              <>
                <div className="shrink-0 px-3 py-2 border-b border-gray-200 bg-white">
                  <div className="text-xs text-gray-500">Conversation with</div>
                  <div className="font-semibold text-gray-900 truncate">
                    {partnerTitle(active.partner)}
                    {partnerType(active.partner) && (
                      <span className="ml-2 text-xs font-normal text-gray-500">
                        ({partnerType(active.partner)})
                      </span>
                    )}
                  </div>
                  {/* Block status banners */}
                  {blockedBySubject.has(active.partnerId) && (
                    <div className="flex items-center gap-1.5 mt-1.5 px-2 py-1 rounded bg-red-50 border border-red-200 text-red-700 text-[11px] font-semibold">
                      <ShieldOff className="w-3 h-3 shrink-0" />
                      {outgoingLabel} has blocked this user
                    </div>
                  )}
                  {blockedSubject.has(active.partnerId) && (
                    <div className="flex items-center gap-1.5 mt-1 px-2 py-1 rounded bg-orange-50 border border-orange-200 text-orange-700 text-[11px] font-semibold">
                      <ShieldOff className="w-3 h-3 shrink-0" />
                      This user has blocked {outgoingLabel}
                    </div>
                  )}
                </div>
                <div className="flex-1 overflow-y-auto p-3 space-y-3">
                  {active.messages.map((msg, idx) => {
                    const fromSubject =
                      Number(msg.sender_id) === uid;
                    const partnerLabel = outgoingLabel;
                    return (
                      <div
                        key={msg.id ?? idx}
                        className={`flex flex-col ${fromSubject ? "items-end" : "items-start"}`}
                      >
                        <div
                          className={`text-[11px] text-gray-500 mb-1 max-w-[95%] ${fromSubject ? "text-right" : "text-left"}`}
                        >
                          <span className="font-semibold text-gray-700">
                            {fromSubject ? `${partnerLabel} → ` : "← "}
                          </span>
                          {msg.created_at && (
                            <span className="text-gray-400 ml-1">
                              {new Date(msg.created_at).toLocaleString()}
                            </span>
                          )}
                        </div>
                        <div
                          className={`max-w-[92%] rounded-lg px-3 py-2 text-sm border ${
                            fromSubject
                              ? "text-gray-900"
                              : "bg-white border-gray-200 text-gray-900"
                          }`}
                          style={
                            fromSubject
                              ? {
                                  backgroundColor: `${brandColor}18`,
                                  borderColor: `${brandColor}66`,
                                }
                              : undefined
                          }
                        >
                          {msg.is_offer && (
                            <div
                              className="text-[11px] font-bold mb-1"
                              style={{ color: brandColor }}
                            >
                              OFFER MESSAGE
                            </div>
                          )}
                          {msg.message ? (
                            <div className="whitespace-pre-wrap break-words">{msg.message}</div>
                          ) : !msg.image ? (
                            <span className="italic text-gray-400">(empty)</span>
                          ) : null}
                          {msg.image && (
                            <a
                              href={msg.image}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="mt-2 inline-block text-xs font-semibold"
                              style={{ color: brandColor }}
                            >
                              Attachment / image
                            </a>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
