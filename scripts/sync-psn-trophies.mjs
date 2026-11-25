#!/usr/bin/env node
/**
 * PlayStation Network (PSN) Trophy Synchronizer
 * TASK 10: Automatic Synchronization with PlayStation 5 Welcome Hub
 * 
 * Safely fetches trophies, levels, and games from official PlayStation Network API
 * using standard OAuth authentication via NPSSO token stored in server/repo secrets.
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { cachePsnIconsInDataset } from './cache-icons.mjs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT_DIR = path.resolve(__dirname, '..');
const DATA_DIR = path.join(ROOT_DIR, 'data');
const TROPHIES_JSON_PATH = path.join(DATA_DIR, 'psn-trophies.json');

// Official Sony Client ID & Secret for PlayStation App OAuth
const CLIENT_ID = '09515159-7237-4370-9b40-3806e67c0891';
const CLIENT_SECRET_BASIC = 'MDk1MTUxNTktNzIzNy00MzcwLTliNDAtMzgwNmU2N2MwODkxOnVjUGprYTV0bnRCMktxc1A=';
const REDIRECT_URI = 'com.scee.psxandroid.scecompcall://redirect';

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

/**
 * Step 1: Exchange 64-character NPSSO cookie for OAuth accessCode
 */
async function exchangeNpssoForCode(npsso) {
  const url = new URL('https://ca.account.sony.com/api/authz/v3/oauth/authorize');
  url.searchParams.set('access_type', 'offline');
  url.searchParams.set('client_id', CLIENT_ID);
  url.searchParams.set('response_type', 'code');
  url.searchParams.set('scope', 'psn:mobile.v2.core psn:clientapp');
  url.searchParams.set('redirect_uri', REDIRECT_URI);

  const res = await fetch(url.toString(), {
    headers: {
      Cookie: `npsso=${npsso}`,
      'User-Agent': 'PlayStation/23.11.0 CFNetwork/1408.0.4 Darwin/22.5.0'
    },
    redirect: 'manual'
  });

  const location = res.headers.get('location');
  if (!location) {
    const body = await res.text().catch(() => '');
    throw new Error(`NPSSO authorization failed (HTTP ${res.status}): ${body.slice(0, 180)}`);
  }

  const redirectUrl = new URL(location);
  const code = redirectUrl.searchParams.get('code');
  if (!code) {
    throw new Error(`Failed to extract authorization code from redirect: ${location}`);
  }

  return code;
}

/**
 * Step 2: Exchange authorization code for bearer accessToken
 */
async function exchangeCodeForTokens(code) {
  const params = new URLSearchParams({
    code,
    redirect_uri: REDIRECT_URI,
    grant_type: 'authorization_code',
    token_format: 'jwt'
  });

  const res = await fetch('https://ca.account.sony.com/api/authz/v3/oauth/token', {
    method: 'POST',
    headers: {
      Authorization: `Basic ${CLIENT_SECRET_BASIC}`,
      'Content-Type': 'application/x-www-form-urlencoded'
    },
    body: params.toString()
  });

  if (!res.ok) {
    const errText = await res.text();
    throw new Error(`Failed to exchange code for access token (${res.status}): ${errText}`);
  }

  const data = await res.json();
  return data.access_token;
}

/**
 * Step 3: Fetch Profile, Trophy Summary, Titles and Trophies from PSN
 */
async function fetchPsnData(accessToken) {
  const headers = {
    Authorization: `Bearer ${accessToken}`,
    'Accept-Language': 'ru-RU, ru;q=0.9, en-US;q=0.8',
    'User-Agent': 'PlayStation/23.11.0 CFNetwork/1408.0.4 Darwin/22.5.0'
  };

  // 1. User Profile (decode account_id from JWT since userProfile expects numeric accountId)
  let accountId = 'me';
  try {
    const jwtPayload = JSON.parse(Buffer.from(accessToken.split('.')[1], 'base64url').toString('utf8'));
    accountId = jwtPayload?.account_id || jwtPayload?.sub || 'me';
  } catch (_) {}

  console.log(`Fetching user profile (accountId: ${accountId})...`);
  let onlineId = process.env.PSN_ONLINE_ID?.trim() || 'Cr1mnsx';
  let avatarUrl = 'assets/brawl/avatars/player_avatar.webp';
  let aboutMe = '';
  try {
    const profRes = await fetch(`https://m.np.playstation.com/api/userProfile/v1/internal/users/${accountId}/profiles`, { headers });
    if (profRes.ok) {
      const profileData = await profRes.json();
      onlineId = profileData.onlineId || onlineId;
      avatarUrl = (
        profileData.personalDetail?.profilePictureUrls?.[0]?.profilePictureUrl ||
        profileData.avatars?.[0]?.url ||
        profileData.avatarUrls?.[0]?.avatarUrl ||
        avatarUrl
      ).replace(/^http:\/\//i, 'https://');
      aboutMe = profileData.aboutMe || '';
    } else {
      console.warn(`Profile metadata returned HTTP ${profRes.status}, continuing with trophySummary for ${onlineId}`);
    }
  } catch (err) {
    console.warn(`Profile metadata fetch skipped: ${err.message}`);
  }

  // 2. Trophy Summary (Level, Total, Platinum, Gold, Silver, Bronze)
  console.log(`Fetching trophy summary for ${onlineId}...`);
  const summaryRes = await fetch('https://m.np.playstation.com/api/trophy/v1/users/me/trophySummary', { headers });
  if (!summaryRes.ok) throw new Error(`Failed to fetch trophy summary: ${summaryRes.status}`);
  const summary = await summaryRes.json();

  const trophyLevel = summary.trophyLevel || 1;
  const levelProgress = summary.progress || 0;
  const tier = summary.tier || 1;
  const counts = summary.earnedTrophies || { bronze: 0, silver: 0, gold: 0, platinum: 0 };
  const totalTrophies = counts.bronze + counts.silver + counts.gold + counts.platinum;

  // 3. User Titles / Games
  console.log('Fetching game titles...');
  const titlesRes = await fetch('https://m.np.playstation.com/api/trophy/v1/users/me/trophyTitles?limit=150', { headers });
  if (!titlesRes.ok) throw new Error(`Failed to fetch titles: ${titlesRes.status}`);
  const titlesData = await titlesRes.json();
  const rawTitles = titlesData.trophyTitles || [];

  console.log(`Found ${rawTitles.length} games with trophies.`);

  const games = [];
  const allRecentTrophies = [];

  // 4. Fetch metadata + earned status for all titles (PS4/PS3/Vita require npServiceName=trophy)
  const limitCount = Math.min(rawTitles.length, 150);
  for (let i = 0; i < limitCount; i++) {
    const title = rawTitles[i];
    const commId = title.npCommunicationId;
    const titleName = title.trophyTitleName;
    const titleIcon = title.trophyTitleIconUrl;
    const platform = title.trophyTitlePlatform || 'PS5';
    const serviceParam = (title.npServiceName === 'trophy' || !String(platform).includes('PS5'))
      ? '?npServiceName=trophy'
      : '';
    const progress = title.progress || 0;
    const earnedCounts = title.earnedTrophies || { bronze: 0, silver: 0, gold: 0, platinum: 0 };
    const definedCounts = title.definedTrophies || { bronze: 0, silver: 0, gold: 0, platinum: 0 };
    const hasPlat = earnedCounts.platinum > 0;

    console.log(`[${i + 1}/${limitCount}] Fetching trophies for "${titleName}" (${platform})...`);
    await sleep(140);

    let trophies = [];
    try {
      const [metaRes, userRes] = await Promise.all([
        fetch(`https://m.np.playstation.com/api/trophy/v1/npCommunicationIds/${commId}/trophyGroups/all/trophies${serviceParam}`, { headers }),
        fetch(`https://m.np.playstation.com/api/trophy/v1/users/me/npCommunicationIds/${commId}/trophyGroups/all/trophies${serviceParam}`, { headers })
      ]);
      const metaMap = new Map();
      if (metaRes.ok) {
        const metaData = await metaRes.json();
        for (const m of metaData.trophies || []) {
          metaMap.set(m.trophyId, m);
        }
      }
      if (userRes.ok) {
        const userData = await userRes.json();
        trophies = (userData.trophies || []).map((t) => {
          const meta = metaMap.get(t.trophyId) || {};
          const item = {
            trophyId: t.trophyId,
            trophyHidden: !!(meta.trophyHidden ?? t.trophyHidden),
            trophyType: t.trophyType || meta.trophyType || 'bronze',
            trophyName: meta.trophyName || t.trophyName || (t.trophyHidden ? 'Секретный приз' : `Приз #${t.trophyId}`),
            trophyDetail: meta.trophyDetail || t.trophyDetail || '',
            trophyIconUrl: meta.trophyIconUrl || t.trophyIconUrl || titleIcon || '',
            trophyRare: t.trophyRare ?? 0,
            earned: !!t.earned,
            earnedDateTime: t.earnedDateTime || null
          };

          if (item.earned && item.earnedDateTime) {
            allRecentTrophies.push({
              ...item,
              gameTitle: titleName,
              npCommunicationId: commId
            });
          }
          return item;
        });
      }
    } catch (err) {
      console.warn(`Warning: Could not fetch trophies for ${titleName}: ${err.message}`);
    }

    const totalDefined =
      (definedCounts.bronze || 0) +
      (definedCounts.silver || 0) +
      (definedCounts.gold || 0) +
      (definedCounts.platinum || 0);

    games.push({
      npCommunicationId: commId,
      titleName,
      titleIconUrl: titleIcon,
      platform,
      progress,
      platinumEarned: hasPlat,
      earnedTrophies: earnedCounts,
      totalTrophiesCount: totalDefined || trophies.length || (earnedCounts.bronze + earnedCounts.silver + earnedCounts.gold + earnedCounts.platinum),
      lastUpdatedDateTime: title.lastUpdatedDateTime || null,
      trophies
    });
  }

  // Sort recent trophies by earned date descending
  allRecentTrophies.sort((a, b) => new Date(b.earnedDateTime).getTime() - new Date(a.earnedDateTime).getTime());
  const recentTrophies = allRecentTrophies.slice(0, 20);

  return {
    profile: {
      onlineId,
      psnOnlineId: onlineId,
      psnLinked: true,
      confirmedPsnPlatinums: counts.platinum,
      avatarUrl,
      aboutMe,
      trophyLevel,
      levelProgress,
      levelTier: tier,
      totalTrophies,
      platinum: counts.platinum,
      gold: counts.gold,
      silver: counts.silver,
      bronze: counts.bronze,
      lastSyncAt: new Date().toISOString()
    },
    recentTrophies,
    games
  };
}

/**
 * Step 4: Write to Supabase (if configured)
 */
async function syncToSupabase(payload) {
  const supabaseUrl = process.env.SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !serviceKey) {
    console.log('Supabase environment variables not provided. Skipping Supabase table sync.');
    return;
  }

  console.log(`Syncing to Supabase at ${supabaseUrl}...`);
  const headers = {
    apikey: serviceKey,
    Authorization: `Bearer ${serviceKey}`,
    'Content-Type': 'application/json',
    Prefer: 'resolution=merge-duplicates'
  };

  const p = payload.profile;

  // Upsert profile
  const profRes = await fetch(`${supabaseUrl}/rest/v1/psn_profiles`, {
    method: 'POST',
    headers,
    body: JSON.stringify([{
      online_id: p.onlineId,
      avatar_url: p.avatarUrl,
      about_me: p.aboutMe,
      trophy_level: p.trophyLevel,
      level_tier: p.levelTier,
      level_progress: p.levelProgress,
      total_trophies: p.totalTrophies,
      platinum: p.platinum,
      gold: p.gold,
      silver: p.silver,
      bronze: p.bronze,
      last_sync_at: p.lastSyncAt,
      is_public: true,
      updated_at: new Date().toISOString()
    }])
  });

  if (!profRes.ok) {
    const txt = await profRes.text();
    console.warn('Supabase profile upsert warning:', txt);
  } else {
    console.log('✓ Profile upserted to Supabase');
  }

  // Upsert games
  const gameRows = payload.games.map((g) => ({
    online_id: p.onlineId,
    np_communication_id: g.npCommunicationId,
    title_name: g.titleName,
    title_icon_url: g.titleIconUrl,
    title_platform: g.platform,
    progress: g.progress,
    platinum_earned: g.platinumEarned,
    trophy_count_total: g.totalTrophiesCount,
    trophy_count_earned: g.earnedTrophies.bronze + g.earnedTrophies.silver + g.earnedTrophies.gold + g.earnedTrophies.platinum,
    trophy_count_bronze: g.earnedTrophies.bronze,
    trophy_count_silver: g.earnedTrophies.silver,
    trophy_count_gold: g.earnedTrophies.gold,
    trophy_count_platinum: g.earnedTrophies.platinum,
    last_played_at: g.lastUpdatedDateTime,
    updated_at: new Date().toISOString()
  }));

  if (gameRows.length > 0) {
    const gameRes = await fetch(`${supabaseUrl}/rest/v1/psn_games`, {
      method: 'POST',
      headers,
      body: JSON.stringify(gameRows)
    });
    if (gameRes.ok) console.log(`✓ ${gameRows.length} games upserted to Supabase`);
  }

  // Log sync history
  await fetch(`${supabaseUrl}/rest/v1/psn_sync_history`, {
    method: 'POST',
    headers: { ...headers, Prefer: 'return=minimal' },
    body: JSON.stringify([{
      online_id: p.onlineId,
      sync_status: 'success',
      sync_source: process.env.GITHUB_ACTIONS ? 'github_actions' : 'manual_script',
      games_synced: payload.games.length,
      trophies_synced: payload.games.reduce((acc, g) => acc + (g.trophies?.length || 0), 0)
    }])
  }).catch(() => {});
}

/**
 * Main Execution
 */
async function main() {
  console.log('=== PlayStation Network Trophy Sync Worker ===');
  const npsso = process.env.PSN_NPSSO?.trim();

  if (!npsso) {
    console.log('\n[NOTICE] PSN_NPSSO environment variable is not set.');
    console.log('To synchronize real PSN trophies:');
    console.log('1. Log into https://ca.account.sony.com/api/v1/ssocookie in your browser.');
    console.log('2. Copy your 64-character "npsso" token.');
    console.log('3. Set PSN_NPSSO in your environment or GitHub Secrets.\n');

    if (fs.existsSync(TROPHIES_JSON_PATH)) {
      console.log(`Current cached dataset exists at: ${TROPHIES_JSON_PATH}`);
      return;
    }

    console.log('Creating initial base dataset for PlayStation 5 Welcome Hub...');
    const defaultData = getBaseDataset();
    if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });
    fs.writeFileSync(TROPHIES_JSON_PATH, JSON.stringify(defaultData, null, 2), 'utf8');
    console.log(`Created ${TROPHIES_JSON_PATH}`);
    return;
  }

  try {
    const startTime = Date.now();
    console.log('Authenticating with PlayStation Network...');
    const code = await exchangeNpssoForCode(npsso);
    const accessToken = await exchangeCodeForTokens(code);
    console.log('✓ Successfully authenticated with Sony OAuth!');

    const payload = await fetchPsnData(accessToken);
    const durationSec = ((Date.now() - startTime) / 1000).toFixed(1);
    console.log(`✓ Retrieved PSN data in ${durationSec}s: Level ${payload.profile.trophyLevel}, ${payload.profile.totalTrophies} trophies across ${payload.games.length} PlayStation games.`);

    // Preserve kept browser-playable entries alongside synced PlayStation games
    let browserGames = [];
    if (fs.existsSync(TROPHIES_JSON_PATH)) {
      try {
        const prev = JSON.parse(fs.readFileSync(TROPHIES_JSON_PATH, 'utf8'));
        browserGames = (prev.games || []).filter((g) => g && g.isBrowserGame === true);
      } catch (_) {}
    }
    if (browserGames.length === 0) {
      browserGames = getBaseDataset().games.filter((g) => g.isBrowserGame === true);
    }
    const existingIds = new Set(payload.games.map((g) => g.npCommunicationId));
    for (const bg of browserGames) {
      if (!existingIds.has(bg.npCommunicationId)) {
        payload.games.push(bg);
      }
    }

    try {
      const cacheRes = await cachePsnIconsInDataset(payload);
      console.log(`✓ Cached PSN icons locally (${cacheRes.ok} ok, ${cacheRes.fail} failed)`);
    } catch (cacheErr) {
      console.warn(`Warning: Could not cache PSN icons locally: ${cacheErr.message}`);
    }

    if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });
    fs.writeFileSync(TROPHIES_JSON_PATH, JSON.stringify(payload, null, 2), 'utf8');
    console.log(`✓ Saved to ${TROPHIES_JSON_PATH} (total ${payload.games.length} games including browser ports)`);

    await syncToSupabase(payload);
    console.log('=== Sync completed successfully! ===');
  } catch (err) {
    console.error('SYNC ERROR:', err.message);
    process.exit(1);
  }
}

/**
 * Honest base dataset (awaiting PSN link; keeps browser games and confirmed 2 PS platinums)
 */
function getBaseDataset() {
  return {
    profile: {
      onlineId: "Cr1mnsx",
      psnOnlineId: "Cr1mnsx",
      psnLinked: false,
      confirmedPsnPlatinums: 2,
      avatarUrl: "assets/brawl/avatars/player_avatar.webp",
      aboutMe: "Brawl Stars (#2RGUQJQ0R) & PlayStation 5",
      trophyLevel: 0,
      levelProgress: 0,
      levelTier: 1,
      totalTrophies: 2,
      platinum: 2,
      gold: 0,
      silver: 0,
      bronze: 0,
      lastSyncAt: new Date().toISOString()
    },
    recentTrophies: [],
    games: [
      {
        npCommunicationId: "NPWR10001_00",
        titleName: "Grand Theft Auto: Vice City",
        titleIconUrl: "assets/covers/gta_vc.jpg",
        platform: "Браузер · PS5 Hub",
        progress: 0,
        platinumEarned: false,
        totalTrophiesCount: 4,
        earnedTrophies: { bronze: 0, silver: 0, gold: 0, platinum: 0 },
        lastUpdatedDateTime: null,
        trophies: [
          {
            trophyId: 1,
            trophyType: "gold",
            trophyName: "Take the Cannoli",
            trophyDetail: "Запуск и прохождение браузерной версии Grand Theft Auto: Vice City.",
            trophyIconUrl: "assets/covers/gta_vc.jpg",
            earned: false,
            earnedDateTime: null
          },
          {
            trophyId: 2,
            trophyType: "silver",
            trophyName: "Mischief Managed",
            trophyDetail: "Выполнить сюжетную миссию «Keep Your Friends Close...».",
            trophyIconUrl: "assets/covers/gta_vc.jpg",
            earned: false,
            earnedDateTime: null
          },
          {
            trophyId: 3,
            trophyType: "bronze",
            trophyName: "Safe Counsel",
            trophyDetail: "Открыть особняк на Starfish Island в браузерной сессии.",
            trophyIconUrl: "assets/covers/gta_vc.jpg",
            earned: false,
            earnedDateTime: null
          },
          {
            trophyId: 4,
            trophyType: "bronze",
            trophyName: "Welcome to Vice City",
            trophyDetail: "Завершить миссию «The Party».",
            trophyIconUrl: "assets/covers/gta_vc.jpg",
            earned: false,
            earnedDateTime: null
          }
        ]
      },
      {
        npCommunicationId: "NPWR10002_00",
        titleName: "Grand Theft Auto V",
        titleIconUrl: "assets/covers/gta_v.jpg",
        platform: "Браузер · PS5 Hub",
        progress: 0,
        platinumEarned: false,
        totalTrophiesCount: 3,
        earnedTrophies: { bronze: 0, silver: 0, gold: 0, platinum: 0 },
        lastUpdatedDateTime: null,
        trophies: [
          {
            trophyId: 1,
            trophyType: "gold",
            trophyName: "Career Criminal",
            trophyDetail: "Достигнуть максимального прогресса в открытом мире Лос-Сантоса.",
            trophyIconUrl: "assets/covers/gta_v.jpg",
            earned: false,
            earnedDateTime: null
          },
          {
            trophyId: 2,
            trophyType: "silver",
            trophyName: "San Andreas Sightseer",
            trophyDetail: "Исследовать весь Лос-Сантос и округ Блейн.",
            trophyIconUrl: "assets/covers/gta_v.jpg",
            earned: false,
            earnedDateTime: null
          },
          {
            trophyId: 3,
            trophyType: "bronze",
            trophyName: "Welcome to Los Santos",
            trophyDetail: "Пройти пролог в браузерной сессии GTA V.",
            trophyIconUrl: "assets/covers/gta_v.jpg",
            earned: false,
            earnedDateTime: null
          }
        ]
      },
      {
        npCommunicationId: "NPWR10003_00",
        titleName: "DOOM (1993)",
        titleIconUrl: "assets/covers/doom.jpg",
        platform: "Браузер · DOSBox",
        progress: 0,
        platinumEarned: false,
        totalTrophiesCount: 2,
        earnedTrophies: { bronze: 0, silver: 0, gold: 0, platinum: 0 },
        lastUpdatedDateTime: null,
        trophies: [
          {
            trophyId: 1,
            trophyType: "gold",
            trophyName: "Thy Flesh Consumed",
            trophyDetail: "Пройти классические эпизоды DOOM в встроенном DOSBox.",
            trophyIconUrl: "assets/covers/doom.jpg",
            earned: false,
            earnedDateTime: null
          },
          {
            trophyId: 2,
            trophyType: "bronze",
            trophyName: "Knee-Deep in the Dead",
            trophyDetail: "Завершить первый эпизод на станции Phobos.",
            trophyIconUrl: "assets/covers/doom.jpg",
            earned: false,
            earnedDateTime: null
          }
        ]
      }
    ]
  };
}

main();
