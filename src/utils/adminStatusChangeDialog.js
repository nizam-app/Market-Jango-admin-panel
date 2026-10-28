import Swal from "sweetalert2";

const BRAND = "#FF8C00";

/**
 * Prompt admin for status change reason and notification channels.
 * @returns {Promise<null | { note: string, notify_in_app: boolean, notify_sms: boolean }>}
 */
export async function promptAdminStatusChange({
  title = "Change status?",
  subjectLabel = "User",
  newStatus,
  requireNote = true,
}) {
  const statusText = newStatus ? String(newStatus) : "";
  const result = await Swal.fire({
    title,
    html: `
      <p class="text-sm text-gray-600 mb-3 text-left">
        ${subjectLabel} will be set to <strong>${statusText}</strong>.
      </p>
      <label class="block text-xs font-medium text-gray-600 mb-1 text-left">Reason (sent to user)</label>
      <textarea id="admin-status-note" class="swal2-textarea w-full text-sm" rows="3"
        placeholder="Explain why the status is changing…"></textarea>
      <div class="mt-3 space-y-2 text-left text-sm text-gray-700">
        <label class="flex items-center gap-2 cursor-pointer">
          <input type="checkbox" id="admin-status-in-app" checked class="rounded" />
          Send in-app notification
        </label>
        <label class="flex items-center gap-2 cursor-pointer">
          <input type="checkbox" id="admin-status-sms" class="rounded" />
          Send SMS (if user allows SMS)
        </label>
      </div>
    `,
    focusConfirm: false,
    showCancelButton: true,
    confirmButtonText: "Update status",
    cancelButtonText: "Cancel",
    confirmButtonColor: BRAND,
    preConfirm: () => {
      const note = document.getElementById("admin-status-note")?.value?.trim() || "";
      if (requireNote && !note) {
        Swal.showValidationMessage("Please enter a reason before updating status.");
        return false;
      }
      const notifyInApp = !!document.getElementById("admin-status-in-app")?.checked;
      const notifySms = !!document.getElementById("admin-status-sms")?.checked;
      return { note, notify_in_app: notifyInApp, notify_sms: notifySms };
    },
  });

  if (!result.isConfirmed || !result.value) return null;
  return result.value;
}

export async function promptProductStatusChange({ productName, isDecline }) {
  const title = isDecline ? "Decline product" : "Approve product";
  const requireNote = isDecline;
  const result = await Swal.fire({
    title,
    html: `
      <p class="text-sm text-gray-600 mb-3 text-left">
        Product: <strong>${productName || "—"}</strong>
      </p>
      ${isDecline ? `
      <label class="block text-xs font-medium text-gray-600 mb-1 text-left">Rejection reason (sent to vendor)</label>
      <textarea id="admin-status-note" class="swal2-textarea w-full text-sm" rows="3"
        placeholder="Why is this product being declined?"></textarea>
      ` : `
      <p class="text-sm text-gray-500 text-left">Optional note to vendor:</p>
      <textarea id="admin-status-note" class="swal2-textarea w-full text-sm" rows="2"
        placeholder="Optional message…"></textarea>
      `}
      <div class="mt-3 space-y-2 text-left text-sm text-gray-700">
        <label class="flex items-center gap-2 cursor-pointer">
          <input type="checkbox" id="admin-status-in-app" checked class="rounded" />
          Notify vendor in-app
        </label>
        <label class="flex items-center gap-2 cursor-pointer">
          <input type="checkbox" id="admin-status-sms" class="rounded" />
          SMS vendor (if allowed)
        </label>
      </div>
    `,
    focusConfirm: false,
    showCancelButton: true,
    confirmButtonText: isDecline ? "Decline" : "Approve",
    cancelButtonText: "Cancel",
    confirmButtonColor: isDecline ? "#b91c1c" : BRAND,
    preConfirm: () => {
      const note = document.getElementById("admin-status-note")?.value?.trim() || "";
      if (requireNote && !note) {
        Swal.showValidationMessage("Please add a rejection reason.");
        return false;
      }
      return {
        note,
        notify_in_app: !!document.getElementById("admin-status-in-app")?.checked,
        notify_sms: !!document.getElementById("admin-status-sms")?.checked,
      };
    },
  });
  if (!result.isConfirmed || !result.value) return null;
  return result.value;
}
