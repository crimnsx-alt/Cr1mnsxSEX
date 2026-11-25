/**
 * Automated Brawl Stars Live Sync Worker (#2RGUQJQ0R - Cr1mnsx)
 * Fetches real-time player profile & battlelog from Official Supercell API (or a custom proxy)
 * and updates assets/brawl/initial_player_data.json while preserving curated metadata.
 *
 * Environment variables:
 *   BRAWL_TAG        - Optional player tag without '#' (default: 2RGUQJQ0R)
 *   BRAWL_API_TOKEN  - Official Supercell Developer API Bearer token
 *   BRAWL_PROXY_URL  - Optional custom HTTP proxy returning { player, battlelog }
 */

import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT_DIR = path.resolve(__dirname, "..");
const SNAPSHOT_PATH = path.join(ROOT_DIR, "assets", "brawl", "initial_player_data.json");

const BRAWL_TAG = (process.env.BRAWL_TAG || "2RGUQJQ0R").replace(/^#/, "").toUpperCase();

function getSlug(rawName) {
  if (!rawName) return "leon";
  const s = String(rawName).toLowerCase().trim();
  if (s === "8-bit" || s === "8bit") return "8-bit";
  if (s === "el primo") return "el_primo";
  if (s === "mr. p" || s === "mr p") return "mr_p";
  if (s === "r-t" || s === "r t") return "r-t";
  if (s.includes("larry")) return "larry_lawrie";
  if (s === "starr nova") return "starr_nova";
  if (s === "jae-yong") return "jae-yong";
  return s.replace(/[^a-z0-9]/g, "");
}

function parseBattleTime(rawTime) {
  if (!rawTime) return new Date().toISOString();
  if (/^\d{4}-\d{2}-\d{2}T/.test(rawTime)) return rawTime;
  const m = String(rawTime).match(/^(\d{4})(\d{2})(\d{2})T(\d{2})(\d{2})(\d{2})(?:\.(\d+))?Z$/i);
  if (!m) return rawTime;
  return `${m[1]}-${m[2]}-${m[3]}T${m[4]}:${m[5]}:${m[6]}.${m[7] || "000"}Z`;
}

function mergePlayerData(existing, rawPlayer, rawBattlelog) {
  const prev = existing || {};
  const prevBrawlers = prev.brawlers && !Array.isArray(prev.brawlers) ? prev.brawlers : {};
  const prevById = new Map();
  Object.entries(prevBrawlers).forEach(([slug, b]) => {
    if (b?.id) prevById.set(Number(b.id), { slug, ...b });
    prevById.set(String(b?.name || slug).toUpperCase(), { slug, ...b });
  });

  const cleanTag = (t) => String(t || "").replace(/^#/, "").toUpperCase();
  const nextBrawlers = {};

  if (Array.isArray(rawPlayer.brawlers)) {
    for (const b of rawPlayer.brawlers) {
      const slug = prevById.get(Number(b.id))?.slug || getSlug(b.name);
      const prevMatch = prevById.get(Number(b.id)) || prevById.get(String(b.name || "").toUpperCase()) || {};
      nextBrawlers[slug] = {
        ...prevMatch,
        id: b.id,
        name: b.name,
        power: b.power ?? prevMatch.power ?? 1,
        rank: b.rank ?? prevMatch.rank ?? 1,
        trophies: b.trophies ?? prevMatch.trophies ?? 0,
        highestTrophies: Math.max(b.highestTrophies ?? 0, prevMatch.highestTrophies ?? 0),
        gadgets: b.gadgets ?? prevMatch.gadgets ?? [],
        starPowers: b.starPowers ?? prevMatch.starPowers ?? [],
        gears: b.gears ?? prevMatch.gears ?? []
      };
    }
  } else if (rawPlayer.brawlers && typeof rawPlayer.brawlers === "object") {
    Object.assign(nextBrawlers, prevBrawlers, rawPlayer.brawlers);
  } else {
    Object.assign(nextBrawlers, prevBrawlers);
  }

  let battles = prev.battles || [];
  const items = rawBattlelog?.items || (Array.isArray(rawBattlelog) ? rawBattlelog : null);
  if (Array.isArray(items) && items.length > 0) {
    battles = items.slice(0, 25).map((item) => {
      const bInfo = item.battle || {};
      const resultStr = bInfo.result || (bInfo.rank ? `Rank ${bInfo.rank}` : "match");
      const isWin = bInfo.result === "victory" || bInfo.rank === 1 || (bInfo.trophyChange > 0);
      let teams = [];
      if (Array.isArray(bInfo.teams)) {
        teams = bInfo.teams.map((team) =>
          team.map((pl) => ({
            tag: cleanTag(pl.tag),
            name: pl.name || "Player",
            brawler: (pl.brawler?.name || pl.brawler || "leon").toLowerCase(),
            id: pl.brawler?.id || null,
            brawlerTrophies: pl.brawler?.trophies ?? null,
            brawlerPower: pl.brawler?.power ?? 11
          }))
        );
      } else if (Array.isArray(bInfo.players)) {
        teams = [
          bInfo.players.map((pl) => ({
            tag: cleanTag(pl.tag),
            name: pl.name || "Player",
            brawler: (pl.brawler?.name || pl.brawler || "leon").toLowerCase(),
            id: pl.brawler?.id || null,
            brawlerTrophies: pl.brawler?.trophies ?? null,
            brawlerPower: pl.brawler?.power ?? 11
          }))
        ];
      }
      return {
        timestamp: parseBattleTime(item.battleTime),
        event: {
          mode: item.event?.mode || bInfo.mode || "3v3",
          map: item.event?.map || "Арена"
        },
        victory: Boolean(isWin),
        result: resultStr,
        trophyChange: bInfo.trophyChange ?? null,
        teams
      };
    });
  }

  return {
    ...prev,
    tag: cleanTag(rawPlayer.tag || BRAWL_TAG),
    name: rawPlayer.name || prev.name || "Cr1mnsx",
    nameColor: rawPlayer.nameColor || prev.nameColor,
    icon: rawPlayer.icon || prev.icon,
    trophies: rawPlayer.trophies ?? prev.trophies,
    highestTrophies: Math.max(rawPlayer.highestTrophies ?? 0, prev.highestTrophies ?? 0),
    expLevel: rawPlayer.expLevel ?? prev.expLevel,
    expPoints: rawPlayer.expPoints ?? prev.expPoints,
    isQualifiedFromChampionshipChallenge: rawPlayer.isQualifiedFromChampionshipChallenge ?? prev.isQualifiedFromChampionshipChallenge,
    "3vs3Victories": rawPlayer["3vs3Victories"] ?? prev["3vs3Victories"],
    soloVictories: rawPlayer.soloVictories ?? prev.soloVictories,
    duoVictories: rawPlayer.duoVictories ?? prev.duoVictories,
    bestRoboRumbleTime: rawPlayer.bestRoboRumbleTime ?? prev.bestRoboRumbleTime,
    bestTimeAsBigBrawler: rawPlayer.bestTimeAsBigBrawler ?? prev.bestTimeAsBigBrawler,
    club: rawPlayer.club?.name
      ? { tag: cleanTag(rawPlayer.club.tag), name: rawPlayer.club.name }
      : prev.club,
    lastUpdated: new Date().toISOString(),
    brawlers: nextBrawlers,
    battles
  };
}

async function main() {
  console.log(`=== Brawl Stars Live Sync Worker (#${BRAWL_TAG}) ===`);
  const token = process.env.BRAWL_API_TOKEN?.trim();
  const proxyUrl = process.env.BRAWL_PROXY_URL?.trim();

  if (!token && !proxyUrl) {
    console.log("[NOTICE] Neither BRAWL_API_TOKEN nor BRAWL_PROXY_URL is configured. Skipping remote Brawl Stars fetch.");
    return;
  }

  let existing = {};
  if (fs.existsSync(SNAPSHOT_PATH)) {
    try {
      existing = JSON.parse(fs.readFileSync(SNAPSHOT_PATH, "utf8"));
    } catch (_) {}
  }

  let rawPlayer = null;
  let rawBattlelog = null;

  if (proxyUrl) {
    const target = `${proxyUrl.replace(/\/+$/, "")}/api/brawl/player?tag=${BRAWL_TAG}`;
    console.log(`Fetching from live proxy: ${target}`);
    const res = await fetch(target);
    if (!res.ok) throw new Error(`Proxy responded ${res.status}`);
    const json = await res.json();
    rawPlayer = json.player || json;
    rawBattlelog = json.battlelog || null;
  } else {
    const encoded = encodeURIComponent(`#${BRAWL_TAG}`);
    const headers = {
      Authorization: `Bearer ${token}`,
      Accept: "application/json"
    };
    const pRes = await fetch(`https://api.brawlstars.com/v1/players/${encoded}`, { headers });
    if (!pRes.ok) {
      throw new Error(`Supercell API /players failed (${pRes.status}): ${await pRes.text()}`);
    }
    rawPlayer = await pRes.json();

    const bRes = await fetch(`https://api.brawlstars.com/v1/players/${encoded}/battlelog`, { headers });
    if (bRes.ok) {
      rawBattlelog = await bRes.json();
    } else {
      console.warn(`[WARN] Supercell API /battlelog responded ${bRes.status}`);
    }
  }

  const merged = mergePlayerData(existing, rawPlayer, rawBattlelog);
  fs.writeFileSync(SNAPSHOT_PATH, `${JSON.stringify(merged, null, 2)}\n`, "utf8");
  console.log(`✓ Synced #${merged.tag} (${merged.trophies} trophies, ${Object.keys(merged.brawlers || {}).length} brawlers, ${(merged.battles || []).length} battles)`);
}

main().catch((err) => {
  console.error("BRAWL SYNC ERROR:", err.message);
  process.exit(1);
});
