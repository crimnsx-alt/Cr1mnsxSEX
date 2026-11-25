/**
 * Live Profile Synchronization Configuration (Brawl Stars + PlayStation Network)
 * Supports:
 * 1) Real-time Serverless Proxy (e.g. Cloudflare Worker / scripts/cloudflare-live-proxy.js)
 * 2) Local Dev Server Proxy (/api/brawl/player)
 * 3) Auto-updated static JSON snapshots via GitHub Actions (.github/workflows/live-profile-sync.yml)
 */

const LS_KEY_BRAWL_PROXY = "ps5_live_brawl_proxy_url";
const LS_KEY_PSN_PROXY = "ps5_live_psn_proxy_url";
const LS_KEY_PSN_ONLINE_ID = "ps5_psn_online_id";

export const DEFAULT_LIVE_CONFIG = {
  // Optional deployed Cloudflare Worker URL (e.g. "https://cr1mnsx-live-sync.workers.dev")
  brawlProxyUrl: "",
  psnProxyUrl: "",
  psnOnlineId: ""
};

export function getLiveSyncSettings() {
  const clean = (s) => (typeof s === "string" ? s.trim().replace(/\/+$/, "") : "");
  let lsBrawl = "";
  let lsPsn = "";
  let lsId = "";
  try {
    lsBrawl = localStorage.getItem(LS_KEY_BRAWL_PROXY) || "";
    lsPsn = localStorage.getItem(LS_KEY_PSN_PROXY) || "";
    lsId = localStorage.getItem(LS_KEY_PSN_ONLINE_ID) || "";
  } catch (_) {}

  return {
    brawlProxyUrl: clean(lsBrawl || DEFAULT_LIVE_CONFIG.brawlProxyUrl),
    psnProxyUrl: clean(lsPsn || DEFAULT_LIVE_CONFIG.psnProxyUrl),
    psnOnlineId: (lsId || DEFAULT_LIVE_CONFIG.psnOnlineId || "").trim()
  };
}

export function saveLiveSyncSettings({ brawlProxyUrl, psnProxyUrl, psnOnlineId } = {}) {
  try {
    if (brawlProxyUrl !== undefined) localStorage.setItem(LS_KEY_BRAWL_PROXY, String(brawlProxyUrl).trim().replace(/\/+$/, ""));
    if (psnProxyUrl !== undefined) localStorage.setItem(LS_KEY_PSN_PROXY, String(psnProxyUrl).trim().replace(/\/+$/, ""));
    if (psnOnlineId !== undefined) localStorage.setItem(LS_KEY_PSN_ONLINE_ID, String(psnOnlineId).trim());
  } catch (_) {}
  return getLiveSyncSettings();
}
