import React, { useCallback, useEffect, useState } from "react";
import axiosClient from "../../api/axiosClient";

const OPTIONS_BASE = "/admin/location-filter/options";
const LEGACY_BASE = "/visibility-zones/options";

function parseItems(res) {
  const data = res.data?.data ?? res.data ?? {};
  if (Array.isArray(data.items)) return data.items;
  if (Array.isArray(data.zones)) return data.zones;
  if (Array.isArray(data.states)) return data.states;
  if (Array.isArray(data.towns)) return data.towns;
  if (Array.isArray(data)) return data;
  return [];
}

async function fetchZones(entity) {
  try {
    const res = await axiosClient.get(`${OPTIONS_BASE}/zones`, { params: { entity } });
    return parseItems(res);
  } catch (e) {
    if (e?.response?.status === 403 || e?.response?.status === 404) {
      try {
        const res = await axiosClient.get(`${LEGACY_BASE}/zones`);
        return parseItems(res);
      } catch {
        return [];
      }
    }
    throw e;
  }
}

async function fetchStates(entity, zone) {
  try {
    const res = await axiosClient.get(`${OPTIONS_BASE}/states`, {
      params: { entity, zone },
    });
    return parseItems(res);
  } catch (e) {
    if (e?.response?.status === 403 || e?.response?.status === 404) {
      try {
        const res = await axiosClient.get(`${LEGACY_BASE}/states`, { params: { zone } });
        return parseItems(res);
      } catch {
        return [];
      }
    }
    throw e;
  }
}

async function fetchTowns(entity, zone, state) {
  try {
    const res = await axiosClient.get(`${OPTIONS_BASE}/towns`, {
      params: { entity, zone, state: state || undefined },
    });
    return parseItems(res);
  } catch (e) {
    if (e?.response?.status === 403 || e?.response?.status === 404) {
      try {
        const res = await axiosClient.get(`${LEGACY_BASE}/towns`, {
          params: { zone, state: state || undefined },
        });
        return parseItems(res);
      } catch {
        return [];
      }
    }
    throw e;
  }
}

/**
 * Cascading zone → state → town filters (profile + visibility_zones options).
 * @param {string} entity buyer | vendor | driver | transport | product | affiliate
 * @param {{ zone?: string, state?: string, town?: string }} value
 * @param {(next: { zone: string, state: string, town: string }) => void} onChange
 */
export default function AdminLocationFilterBar({
  entity = "buyer",
  value = {},
  onChange,
  className = "",
}) {
  const [zones, setZones] = useState([]);
  const [states, setStates] = useState([]);
  const [towns, setTowns] = useState([]);
  const zone = value.zone || "";
  const state = value.state || "";
  const town = value.town || "";

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const list = await fetchZones(entity);
        if (!cancelled) setZones(list);
      } catch (e) {
        console.error(e);
        if (!cancelled) setZones([]);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [entity]);

  const loadStates = useCallback(
    async (z) => {
      if (!z) {
        setStates([]);
        return;
      }
      try {
        const list = await fetchStates(entity, z);
        setStates(list);
      } catch (e) {
        console.error(e);
        setStates([]);
      }
    },
    [entity]
  );

  const loadTowns = useCallback(
    async (z, st) => {
      if (!z) {
        setTowns([]);
        return;
      }
      try {
        const list = await fetchTowns(entity, z, st);
        setTowns(list);
      } catch (e) {
        console.error(e);
        setTowns([]);
      }
    },
    [entity]
  );

  useEffect(() => {
    loadStates(zone);
  }, [zone, loadStates]);

  useEffect(() => {
    loadTowns(zone, state);
  }, [zone, state, loadTowns]);

  const emit = (patch) => {
    onChange?.({
      zone: patch.zone ?? zone,
      state: patch.state ?? state,
      town: patch.town ?? town,
    });
  };

  return (
    <div className={`flex flex-wrap gap-3 items-end ${className}`}>
      <div>
        <label className="block text-xs text-gray-500 mb-1">Zone</label>
        <select
          className="border border-[#8AB3D3] rounded-lg px-3 py-2 text-sm min-w-[140px]"
          value={zone}
          onChange={(e) => {
            const z = e.target.value;
            emit({ zone: z, state: "", town: "" });
          }}
        >
          <option value="">All zones</option>
          {zones.map((z) => (
            <option key={z} value={z}>{z}</option>
          ))}
        </select>
      </div>
      <div>
        <label className="block text-xs text-gray-500 mb-1">State</label>
        <select
          className="border border-[#8AB3D3] rounded-lg px-3 py-2 text-sm min-w-[140px]"
          value={state}
          disabled={!zone}
          onChange={(e) => {
            const st = e.target.value;
            emit({ state: st, town: "" });
          }}
        >
          <option value="">All states</option>
          {states.map((s) => (
            <option key={s} value={s}>{s}</option>
          ))}
        </select>
      </div>
      <div>
        <label className="block text-xs text-gray-500 mb-1">Town</label>
        <select
          className="border border-[#8AB3D3] rounded-lg px-3 py-2 text-sm min-w-[140px]"
          value={town}
          disabled={!zone}
          onChange={(e) => emit({ town: e.target.value })}
        >
          <option value="">All towns</option>
          {towns.map((t) => (
            <option key={t} value={t}>{t}</option>
          ))}
        </select>
      </div>
      {(zone || state || town) && (
        <button
          type="button"
          className="text-sm text-[#0059A0] underline pb-2"
          onClick={() => onChange?.({ zone: "", state: "", town: "" })}
        >
          Clear location
        </button>
      )}
    </div>
  );
}
