/**
 * Caches remote PSN game icons, recent trophy icons, and PSN avatar
 * locally into assets/psn/ so every trophy and cover icon loads instantaneously.
 */

import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, "..");

const PSN_JSON_PATH = path.join(ROOT, "data", "psn-trophies.json");
const BRAWL_JSON_PATH = path.join(ROOT, "assets", "brawl", "initial_player_data.json");
const PSN_GAMES_DIR = path.join(ROOT, "assets", "psn", "games");
const PSN_RECENT_DIR = path.join(ROOT, "assets", "psn", "recent");
const BRAWL_PORTRAITS_DIR = path.join(ROOT, "assets", "brawl", "portraits");

for (const dir of [PSN_GAMES_DIR, PSN_RECENT_DIR, BRAWL_PORTRAITS_DIR]) {
  fs.mkdirSync(dir, { recursive: true });
}

async function downloadFile(url, destPathWithoutExt) {
  const existing = [".png", ".jpg", ".webp"].map((e) => destPathWithoutExt + e).find((p) => fs.existsSync(p));
  if (existing && fs.statSync(existing).size > 200) {
    return existing;
  }

  const res = await fetch(url, { headers: { "User-Agent": "Mozilla/5.0" } });
  if (!res.ok) throw new Error(`HTTP ${res.status} for ${url}`);
  const ct = (res.headers.get("content-type") || "").toLowerCase();
  let ext = ".png";
  if (ct.includes("jpeg") || ct.includes("jpg") || /\.jpe?g(\?|$)/i.test(url)) ext = ".jpg";
  else if (ct.includes("webp") || /\.webp(\?|$)/i.test(url)) ext = ".webp";

  const finalPath = destPathWithoutExt + ext;
  const buf = Buffer.from(await res.arrayBuffer());
  if (buf.length < 100) throw new Error(`Empty response for ${url}`);
  fs.writeFileSync(finalPath, buf);
  return finalPath;
}

async function runPool(items, concurrency, fn) {
  let idx = 0;
  let ok = 0;
  let fail = 0;
  const workers = Array.from({ length: Math.min(concurrency, items.length) }, async () => {
    while (idx < items.length) {
      const i = idx++;
      try {
        await fn(items[i]);
        ok++;
      } catch (err) {
        fail++;
        console.warn(`[WARN] ${err.message}`);
      }
    }
  });
  await Promise.all(workers);
  return { ok, fail };
}

export async function cachePsnIconsInDataset(psnData) {
  const tasks = [];

  if (psnData.profile?.avatarUrl && psnData.profile.avatarUrl.startsWith("http")) {
    tasks.push(async () => {
      const saved = await downloadFile(psnData.profile.avatarUrl, path.join(ROOT, "assets", "psn", "avatar"));
      psnData.profile.avatarUrl = path.relative(ROOT, saved).replace(/\\/g, "/");
    });
  }

  for (const g of psnData.games || []) {
    if (g.isBrowserGame || !g.titleIconUrl || !g.titleIconUrl.startsWith("http")) continue;
    const remoteUrl = g.titleIconUrl;
    const commId = String(g.npCommunicationId || "unknown").replace(/[^a-zA-Z0-9_-]/g, "_");
    tasks.push(async () => {
      const saved = await downloadFile(remoteUrl, path.join(PSN_GAMES_DIR, commId));
      g.remoteTitleIconUrl = remoteUrl;
      g.titleIconUrl = path.relative(ROOT, saved).replace(/\\/g, "/");
    });
  }

  for (const rt of psnData.recentTrophies || []) {
    if (!rt.trophyIconUrl || !rt.trophyIconUrl.startsWith("http")) continue;
    const remoteUrl = rt.trophyIconUrl;
    const cid = String(rt.npCommunicationId || "psn").replace(/[^a-zA-Z0-9_-]/g, "_");
    const tid = String(rt.trophyId || "0").replace(/[^a-zA-Z0-9_-]/g, "_");
    tasks.push(async () => {
      const saved = await downloadFile(remoteUrl, path.join(PSN_RECENT_DIR, `${cid}_${tid}`));
      rt.remoteTrophyIconUrl = remoteUrl;
      rt.trophyIconUrl = path.relative(ROOT, saved).replace(/\\/g, "/");
    });
  }

  return runPool(tasks, 16, (fn) => fn());
}

async function main() {
  const psnData = JSON.parse(fs.readFileSync(PSN_JSON_PATH, "utf8"));
  const psnStats = await cachePsnIconsInDataset(psnData);
  console.log(`PSN icons cached: ${psnStats.ok} ok, ${psnStats.fail} failed`);
  fs.writeFileSync(PSN_JSON_PATH, `${JSON.stringify(psnData, null, 2)}\n`, "utf8");

  if (fs.existsSync(BRAWL_JSON_PATH)) {
    const brawlData = JSON.parse(fs.readFileSync(BRAWL_JSON_PATH, "utf8"));
    const brawlerIds = Array.from(
      new Set(
        Object.values(brawlData.brawlers || {})
          .map((b) => b?.id)
          .filter(Boolean)
      )
    );
    const brawlStats = await runPool(brawlerIds, 16, async (id) => {
      const url = `https://raw.githubusercontent.com/Brawlify/CDN/master/brawlers/borderless/${id}.png`;
      await downloadFile(url, path.join(BRAWL_PORTRAITS_DIR, String(id)));
    });
    console.log(`Brawl portraits cached: ${brawlStats.ok} ok, ${brawlStats.fail} failed`);
  }
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  main().catch((err) => {
    console.error(err);
    process.exit(1);
  });
}
