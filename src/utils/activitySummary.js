import { moduleLabel } from "./activityModules";

const ACTION_LABELS = {
  created: "created",
  updated: "updated",
  deleted: "removed",
  mutated: "changed",
  banned: "banned",
  unbanned: "restored",
  approved: "approved",
  rejected: "rejected",
  resolved: "resolved",
  dismissed: "dismissed",
};

/**
 * Clear, non-technical summary for activity rows.
 * Rewrites legacy "PATCH admin/…" descriptions.
 */
export function formatActivitySummary(log = {}) {
  const description = String(log.description || "").trim();
  if (description && !looksTechnical(description)) {
    return description;
  }

  const actor = log.actor_name || "A user";
  const area = (moduleLabel(log.module) || "record").toLowerCase();
  const status = String(log.status || "success").toLowerCase();
  const verb = resolveVerb(log);

  if (status === "failed") {
    return `${actor} attempted to ${toInfinitive(verb)} ${area}, but the action did not complete.`;
  }

  return `${actor} successfully ${verb} ${area}.`;
}

export function formatActionLabel(action) {
  if (!action) return "—";
  const raw = String(action);
  if (looksTechnical(raw)) return "Record change";

  const parts = raw.split("_").filter(Boolean);
  if (parts.length === 0) return "—";

  const first = ACTION_LABELS[parts[0]] || parts[0];
  const rest = parts
    .slice(1)
    .join(" ")
    .replace(/_/g, " ");
  const label = `${capitalize(first)}${rest ? ` ${rest}` : ""}`.replace(/\s+/g, " ").trim();
  return label;
}

function resolveVerb(log) {
  const action = String(log.action || "").toLowerCase();
  for (const key of Object.keys(ACTION_LABELS)) {
    if (action.startsWith(`${key}_`) || action === key) {
      return ACTION_LABELS[key];
    }
  }

  const method = String(log.http_method || "").toUpperCase();
  if (method === "POST") return "created";
  if (method === "PUT" || method === "PATCH") return "updated";
  if (method === "DELETE") return "removed";
  return "updated";
}

function toInfinitive(past) {
  const map = {
    created: "create",
    updated: "update",
    removed: "remove",
    changed: "change",
    banned: "ban",
    restored: "restore",
    approved: "approve",
    rejected: "reject",
    resolved: "resolve",
    dismissed: "dismiss",
  };
  return map[past] || past;
}

function looksTechnical(text) {
  return /\b(GET|POST|PUT|PATCH|DELETE)\b/i.test(text) || /admin\/[a-z0-9_\-/]+/i.test(text);
}

function capitalize(value) {
  if (!value) return "";
  return value.charAt(0).toUpperCase() + value.slice(1);
}
