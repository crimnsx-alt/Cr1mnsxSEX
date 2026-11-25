/**
 * Cloudflare Worker — Real-Time 25s Live Relay for Cr1mnsx PS5 Profile (GitHub Pages)
 * Keeps API secrets server-side while giving the static GitHub Pages frontend instant live updates.
 *
 * Deploy via Cloudflare Dashboard / Wrangler (`npx wrangler deploy scripts/cloudflare-live-proxy.js`):
 *   Required Cloudflare Worker Secrets:
 *     - BRAWL_API_TOKEN : Official Supercell Brawl Stars Developer API Bearer token
 *     - PSN_NPSSO       : (Optional) 64-char Sony NPSSO token for PlayStation trophies
 *   Optional Env Vars:
 *     - BRAWL_TAG       : Default "2RGUQJQ0R"
 *     - ALLOWED_ORIGIN  : "*" or "https://crimnsx-alt.github.io"
 *
 * Supported Endpoints:
 *   GET /api/brawl/player?tag=2RGUQJQ0R   -> Official player + battlelog JSON
 *   GET /psn/profile                      -> Live PSN trophy summary & games
 */

const SONY_AUTH_HEADER = "Basic MDk1MTUxNTktNzIzNy00MzcwLTliNDAtMzgwNmU2N2MwODkxOnVjUGprYTV0bnRCMktxc1A=";

async function exchangePsnToken(npsso) {
  const authUrl = new URL("https://ca.account.sony.com/api/authz/v3/oauth/authorize");
  authUrl.searchParams.set("access_type", "offline");
  authUrl.searchParams.set("client_id", "09515159-7237-4370-9b40-3806e67c0891");
  authUrl.searchParams.set("redirect_uri", "com.scee.psxandroid.scecompcall://redirect");
  authUrl.searchParams.set("response_type", "code");
  authUrl.searchParams.set("scope", "psn:mobile.v2.core psn:clientapp");

  const codeRes = await fetch(authUrl.toString(), {
    method: "GET",
    redirect: "manual",
    headers: { Cookie: `npsso=${npsso}` }
  });
  const loc = codeRes.headers.get("location");
  if (!loc) throw new Error(`NPSSO authorize failed (${codeRes.status})`);
  const code = new URL(loc).searchParams.get("code");
  if (!code) throw new Error("Missing Sony OAuth code");

  const tokenParams = new URLSearchParams({
    code,
    redirect_uri: "com.scee.psxandroid.scecompcall://redirect",
    grant_type: "authorization_code",
    token_format: "jwt"
  });
  const tokRes = await fetch("https://ca.account.sony.com/api/authz/v3/oauth/token", {
    method: "POST",
    headers: {
      Authorization: SONY_AUTH_HEADER,
      "Content-Type": "application/x-www-form-urlencoded"
    },
    body: tokenParams.toString()
  });
  if (!tokRes.ok) throw new Error(`Sony token exchange failed (${tokRes.status})`);
  const tokData = await tokRes.json();
  return tokData.access_token;
}

export default {
  async fetch(request, env) {
    const corsHeaders = {
      "Access-Control-Allow-Origin": env.ALLOWED_ORIGIN || "*",
      "Access-Control-Allow-Methods": "GET, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type",
      "Cache-Control": "public, max-age=15"
    };

    if (request.method === "OPTIONS") {
      return new Response(null, { status: 204, headers: corsHeaders });
    }

    const url = new URL(request.url);

    // 1. Live Brawl Stars Player + Battlelog
    if (url.pathname === "/api/brawl/player" || url.pathname === "/brawl/player") {
      if (!env.BRAWL_API_TOKEN) {
        return Response.json({ error: "BRAWL_API_TOKEN secret is not set" }, { status: 500, headers: corsHeaders });
      }
      const tag = (url.searchParams.get("tag") || env.BRAWL_TAG || "2RGUQJQ0R").replace(/^#/, "").toUpperCase();
      const encodedTag = encodeURIComponent(`#${tag}`);
      const headers = {
        Authorization: `Bearer ${env.BRAWL_API_TOKEN.trim()}`,
        Accept: "application/json"
      };
      const bases = env.BRAWL_API_BASE
        ? [env.BRAWL_API_BASE.trim().replace(/\/+$/, "")]
        : ["https://api.brawlstars.com/v1", "https://bsproxy.royaleapi.dev/v1"];

      let playerRes = null;
      let battleRes = null;
      for (const base of bases) {
        playerRes = await fetch(`${base}/players/${encodedTag}`, { headers });
        if (playerRes.ok) {
          battleRes = await fetch(`${base}/players/${encodedTag}/battlelog`, { headers });
          break;
        }
        if (playerRes.status !== 403) break;
      }

      if (!playerRes || !playerRes.ok) {
        return Response.json(
          { error: `Supercell API error ${playerRes?.status || 500}`, detail: playerRes ? await playerRes.text() : "Fetch failed" },
          { status: playerRes?.status || 500, headers: corsHeaders }
        );
      }

      const player = await playerRes.json();
      const battlelog = battleRes.ok ? await battleRes.json() : null;
      return Response.json(
        { player, battlelog, _liveSource: "cloudflare-worker", fetchedAt: new Date().toISOString() },
        { status: 200, headers: corsHeaders }
      );
    }

    // 2. Live PlayStation Network Trophies
    if (url.pathname === "/psn/profile" || url.pathname === "/api/psn/profile") {
      if (!env.PSN_NPSSO) {
        return Response.json({ unlinked: true, error: "PSN_NPSSO secret is not configured" }, { status: 200, headers: corsHeaders });
      }
      try {
        const accessToken = await exchangePsnToken(env.PSN_NPSSO.trim());
        const psnHeaders = {
          Authorization: `Bearer ${accessToken}`,
          "Accept-Language": "ru-RU, ru;q=0.9, en-US;q=0.8",
          "User-Agent": "PlayStation/23.11.0 CFNetwork/1408.0.4 Darwin/22.5.0"
        };
        let accountId = "me";
        try {
          const b64 = accessToken.split(".")[1].replace(/-/g, "+").replace(/_/g, "/");
          const payload = JSON.parse(atob(b64));
          accountId = payload?.account_id || payload?.sub || "me";
        } catch (_) {}

        const [profRes, sumRes, titlesRes] = await Promise.all([
          fetch(`https://m.np.playstation.com/api/userProfile/v1/internal/users/${accountId}/profiles`, { headers: psnHeaders }),
          fetch("https://m.np.playstation.com/api/trophy/v1/users/me/trophySummary", { headers: psnHeaders }),
          fetch("https://m.np.playstation.com/api/trophy/v1/users/me/trophyTitles?limit=150", { headers: psnHeaders })
        ]);
        const prof = profRes.ok ? await profRes.json() : {};
        const sum = sumRes.ok ? await sumRes.json() : {};
        const titles = titlesRes.ok ? await titlesRes.json() : {};
        const counts = sum.earnedTrophies || { bronze: 0, silver: 0, gold: 0, platinum: 0 };

        const games = (titles.trophyTitles || []).map((t) => ({
          npCommunicationId: t.npCommunicationId,
          titleName: t.trophyTitleName,
          titleIconUrl: t.trophyTitleIconUrl,
          platform: t.trophyTitlePlatform || "PS5",
          progress: t.progress || 0,
          platinumEarned: (t.earnedTrophies?.platinum || 0) > 0,
          earnedTrophies: t.earnedTrophies || { bronze: 0, silver: 0, gold: 0, platinum: 0 },
          totalTrophiesCount:
            (t.definedTrophies?.bronze || 0) +
            (t.definedTrophies?.silver || 0) +
            (t.definedTrophies?.gold || 0) +
            (t.definedTrophies?.platinum || 0),
          lastUpdatedDateTime: t.lastUpdatedDateTime,
          trophies: []
        }));

        return Response.json(
          {
            profile: {
              onlineId: prof.onlineId || url.searchParams.get("onlineId") || "Cr1mnsx",
              psnOnlineId: prof.onlineId || url.searchParams.get("onlineId") || "Cr1mnsx",
              psnLinked: true,
              confirmedPsnPlatinums: counts.platinum,
              avatarUrl: (
                prof.personalDetail?.profilePictureUrls?.[0]?.profilePictureUrl ||
                prof.avatars?.[0]?.url ||
                prof.avatarUrls?.[0]?.avatarUrl ||
                "assets/brawl/avatars/player_avatar.webp"
              ).replace(/^http:\/\//i, "https://"),
              trophyLevel: sum.trophyLevel || 1,
              levelProgress: sum.progress || 0,
              levelTier: sum.tier || 1,
              platinum: counts.platinum,
              gold: counts.gold,
              silver: counts.silver,
              bronze: counts.bronze,
              totalTrophies: counts.bronze + counts.silver + counts.gold + counts.platinum,
              lastSyncAt: new Date().toISOString()
            },
            recentTrophies: [],
            games
          },
          { status: 200, headers: corsHeaders }
        );
      } catch (err) {
        return Response.json({ unlinked: true, error: err.message }, { status: 500, headers: corsHeaders });
      }
    }

    return Response.json({ ok: true, service: "cr1mnsx-live-profile-proxy" }, { status: 200, headers: corsHeaders });
  }
};
