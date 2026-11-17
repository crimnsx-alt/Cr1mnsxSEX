// =============================================================================
// Cr1mnsx PS5 — Real Friends & Requests Service
// Supports Supabase Backend with Persistent Local Storage Fallback
// =============================================================================

import { SUPABASE_CONFIG } from "./supabase-config.js";

const STORAGE_KEYS = {
  FRIENDS: "ps5_confirmed_friends_v2",
  REQUESTS: "ps5_friend_requests_v2",
  MY_REQUEST: "ps5_my_friend_request_v2",
  LAST_SUBMIT: "ps5_friends_last_submit_ts",
  BLOCKED: "ps5_blocked_users_v2"
};

// 8 Authentic PS5 Preset Avatars
export const PRESET_AVATARS = [
  { id: "kratos", name: "Kratos (God of War)", bg: "linear-gradient(135deg, #b91c1c, #450a0a)", icon: "⚔️" },
  { id: "jin", name: "Ghost of Tsushima", bg: "linear-gradient(135deg, #475569, #0f172a)", icon: "🗡️" },
  { id: "clank", name: "Clank (Ratchet & Clank)", bg: "linear-gradient(135deg, #eab308, #854d0e)", icon: "⚙️" },
  { id: "aloy", name: "Horizon Forbidden West", bg: "linear-gradient(135deg, #ea580c, #7c2d12)", icon: "🏹" },
  { id: "ellie", name: "The Last of Us Part I", bg: "linear-gradient(135deg, #15803d, #14532d)", icon: "🌿" },
  { id: "dualsense", name: "DualSense Wireless", bg: "linear-gradient(135deg, #0284c7, #0369a1)", icon: "🎮" },
  { id: "helldiver", name: "Helldivers 2", bg: "linear-gradient(135deg, #f59e0b, #18181b)", icon: "🛡️" },
  { id: "crash", name: "Crash Bandicoot", bg: "linear-gradient(135deg, #ea580c, #7c2d12)", icon: "🍎" }
];

export function escapeHtml(str) {
  if (typeof str !== "string") return "";
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

export function isSupabaseConfigured() {
  return Boolean(
    SUPABASE_CONFIG.url &&
    SUPABASE_CONFIG.url.startsWith("https://") &&
    !SUPABASE_CONFIG.url.includes("your-project") &&
    SUPABASE_CONFIG.anonKey &&
    SUPABASE_CONFIG.anonKey.length > 20
  );
}

// -----------------------------------------------------------------------------
// Local Storage Operations (Offline / Non-configured mode)
// -----------------------------------------------------------------------------
const memoryStore = {};

function getRawStorage(key) {
  try {
    if (typeof localStorage === "undefined") return memoryStore[key] || null;
    return localStorage.getItem(key);
  } catch (e) {
    return memoryStore[key] || null;
  }
}

function setRawStorage(key, value) {
  try {
    if (typeof localStorage === "undefined") {
      memoryStore[key] = value;
      return;
    }
    localStorage.setItem(key, value);
  } catch (e) {
    memoryStore[key] = value;
  }
}

function removeRawStorage(key) {
  try {
    if (typeof localStorage === "undefined") {
      delete memoryStore[key];
      return;
    }
    localStorage.removeItem(key);
  } catch (e) {
    delete memoryStore[key];
  }
}

function getLocalStore(key, defaultValue = []) {
  try {
    const raw = getRawStorage(key);
    return raw ? JSON.parse(raw) : defaultValue;
  } catch (e) {
    console.warn("[FriendsService] Storage read error:", e);
    return defaultValue;
  }
}

function setLocalStore(key, value) {
  try {
    setRawStorage(key, JSON.stringify(value));
  } catch (e) {
    console.warn("[FriendsService] Storage write error:", e);
  }
}

// -----------------------------------------------------------------------------
// Supabase REST Client (Direct fetch without bulky SDK)
// -----------------------------------------------------------------------------
async function supabaseFetch(endpoint, options = {}) {
  const url = `${SUPABASE_CONFIG.url.replace(/\/$/, "")}/rest/v1/${endpoint}`;
  const headers = {
    "apikey": SUPABASE_CONFIG.anonKey,
    "Authorization": `Bearer ${SUPABASE_CONFIG.anonKey}`,
    "Content-Type": "application/json",
    "Prefer": options.prefer || "return=representation",
    ...options.headers
  };

  const response = await fetch(url, {
    method: options.method || "GET",
    headers,
    body: options.body ? JSON.stringify(options.body) : undefined
  });

  if (!response.ok) {
    const errText = await response.text();
    throw new Error(`Supabase request failed (${response.status}): ${errText}`);
  }

  return response.json();
}

// -----------------------------------------------------------------------------
// Friends Service API
// -----------------------------------------------------------------------------
export const FriendsService = {
  isConfigured() {
    return isSupabaseConfigured();
  },

  getBackendStatus() {
    if (this.isConfigured()) {
      return {
        isLive: true,
        type: "supabase",
        label: "Supabase Cloud Database",
        url: SUPABASE_CONFIG.url
      };
    }
    return {
      isLive: false,
      type: "local",
      label: "Локальный режим (ожидает настройки Supabase)",
      details: "Все заявки сохраняются в браузере. Для синхронизации между устройствами следуйте SUPABASE_SETUP.md."
    };
  },

  // 1. Fetch Confirmed Friends
  async getConfirmedFriends() {
    if (this.isConfigured()) {
      try {
        const data = await supabaseFetch("friendships?select=*&order=created_at.desc");
        return Array.isArray(data) ? data : [];
      } catch (err) {
        console.error("[FriendsService] Supabase fetch error, fallback to local:", err);
      }
    }
    return getLocalStore(STORAGE_KEYS.FRIENDS, []);
  },

  // 2. Fetch Requests (Requires Owner PIN for admin review)
  async getFriendRequests(ownerPin) {
    const isOwner = Boolean(ownerPin && ownerPin.trim() === SUPABASE_CONFIG.adminPin.trim());
    if (!isOwner) {
      throw new Error("Неверный ПИН-код владельца.");
    }

    if (this.isConfigured()) {
      try {
        const data = await supabaseFetch("friend_requests?select=*&order=created_at.desc");
        return Array.isArray(data) ? data : [];
      } catch (err) {
        console.error("[FriendsService] Supabase requests error, fallback to local:", err);
      }
    }
    return getLocalStore(STORAGE_KEYS.REQUESTS, []);
  },

  // 3. Get Visitor's Submitted Request
  getMyRequest() {
    return getLocalStore(STORAGE_KEYS.MY_REQUEST, null);
  },

  // 4. Submit Friend Request
  async submitFriendRequest(formData) {
    // A. Validation
    const nickname = (formData.nickname || "").trim();
    const displayName = (formData.displayName || "").trim();
    const bio = (formData.bio || "").trim();
    const avatar = formData.avatar || PRESET_AVATARS[0].id;
    const consent = Boolean(formData.consent);

    if (nickname.length < 2 || nickname.length > 32) {
      throw new Error("Игровой никнейм должен содержать от 2 до 32 символов.");
    }
    if (!/^[a-zA-Z0-9_\-\.А-Яа-яЁё ]+$/.test(nickname)) {
      throw new Error("Никнейм содержит недопустимые символы.");
    }
    if (displayName.length < 1 || displayName.length > 40) {
      throw new Error("Укажите имя или псевдоним (от 1 до 40 символов).");
    }
    if (bio.length > 250) {
      throw new Error("Описание не должно превышать 250 символов.");
    }

    // Check blocked list
    const blocked = getLocalStore(STORAGE_KEYS.BLOCKED, []);
    if (blocked.some((b) => b.toLowerCase() === nickname.toLowerCase())) {
      throw new Error("Этот пользователь заблокирован за нарушение правил.");
    }

    // Anti-spam cooldown check (2 minutes)
    const lastSubmit = parseInt(getRawStorage(STORAGE_KEYS.LAST_SUBMIT) || "0", 10);
    const now = Date.now();
    const COOLDOWN_MS = 120 * 1000;
    if (now - lastSubmit < COOLDOWN_MS) {
      const waitSec = Math.ceil((COOLDOWN_MS - (now - lastSubmit)) / 1000);
      throw new Error(`Подождите ${waitSec} сек. перед отправкой следующей заявки.`);
    }

    // Format Social Links safely
    const sanitizeHandle = (v) => (v ? escapeHtml(v.trim()) : "");
    const steam = sanitizeHandle(formData.steam);
    const telegram = sanitizeHandle(formData.telegram);
    const vk = sanitizeHandle(formData.vk);
    const discord = sanitizeHandle(formData.discord);
    const psnId = sanitizeHandle(formData.psnId);
    const otherPlatforms = sanitizeHandle(formData.otherPlatforms);

    const newRequest = {
      id: "req_" + Date.now() + "_" + Math.random().toString(36).substr(2, 6),
      nickname: escapeHtml(nickname),
      displayName: escapeHtml(displayName),
      bio: escapeHtml(bio),
      avatar: escapeHtml(avatar),
      steam,
      telegram,
      vk,
      discord,
      psnId,
      otherPlatforms,
      consent_public_contacts: consent,
      status: "pending",
      createdAt: new Date().toISOString()
    };

    // Save in Supabase if configured
    if (this.isConfigured()) {
      try {
        const payload = {
          nickname: newRequest.nickname,
          display_name: newRequest.displayName,
          bio: newRequest.bio,
          avatar_url: newRequest.avatar,
          steam: newRequest.steam,
          telegram: newRequest.telegram,
          vk: newRequest.vk,
          discord: newRequest.discord,
          psn_id: newRequest.psnId,
          other_platforms: newRequest.otherPlatforms,
          consent_public_contacts: newRequest.consent_public_contacts,
          status: "pending"
        };
        const res = await supabaseFetch("friend_requests", {
          method: "POST",
          body: payload
        });
        if (Array.isArray(res) && res[0]?.id) {
          newRequest.id = res[0].id;
        }
      } catch (err) {
        console.error("[FriendsService] Supabase submit error, saving locally:", err);
      }
    }

    // Save in Local Store
    const requests = getLocalStore(STORAGE_KEYS.REQUESTS, []);
    // Prevent duplicate pending requests from same nickname
    const existingIdx = requests.findIndex(
      (r) => r.nickname.toLowerCase() === newRequest.nickname.toLowerCase() && r.status === "pending"
    );
    if (existingIdx !== -1) {
      throw new Error("Заявка с таким никнеймом уже находится на рассмотрении.");
    }

    requests.unshift(newRequest);
    setLocalStore(STORAGE_KEYS.REQUESTS, requests);
    setLocalStore(STORAGE_KEYS.MY_REQUEST, newRequest);
    setRawStorage(STORAGE_KEYS.LAST_SUBMIT, now.toString());

    return { success: true, request: newRequest };
  },

  // 5. Accept Request (Admin Owner Action)
  async acceptRequest(requestId, ownerPin) {
    const isOwner = Boolean(ownerPin && ownerPin.trim() === SUPABASE_CONFIG.adminPin.trim());
    if (!isOwner) throw new Error("Неверный ПИН-код владельца.");

    const requests = getLocalStore(STORAGE_KEYS.REQUESTS, []);
    const req = requests.find((r) => r.id === requestId);
    if (!req) throw new Error("Заявка не найдена.");

    req.status = "accepted";
    req.reviewedAt = new Date().toISOString();
    setLocalStore(STORAGE_KEYS.REQUESTS, requests);

    // Add to Confirmed Friends
    const friends = getLocalStore(STORAGE_KEYS.FRIENDS, []);
    const alreadyFriend = friends.some((f) => f.nickname.toLowerCase() === req.nickname.toLowerCase());
    
    if (!alreadyFriend) {
      const newFriend = {
        id: "fr_" + Date.now(),
        requestId: req.id,
        nickname: req.nickname,
        displayName: req.displayName,
        bio: req.bio,
        avatar: req.avatar,
        status: "Online",
        currentGame: "PlayStation®5 System Shell",
        steam: req.steam,
        telegram: req.telegram,
        vk: req.vk,
        discord: req.discord,
        psnId: req.psnId,
        otherPlatforms: req.otherPlatforms,
        consent_public_contacts: req.consent_public_contacts,
        addedAt: new Date().toISOString()
      };
      friends.unshift(newFriend);
      setLocalStore(STORAGE_KEYS.FRIENDS, friends);

      // If Supabase is active, persist friendship
      if (this.isConfigured()) {
        try {
          await supabaseFetch("friendships", {
            method: "POST",
            body: {
              nickname: newFriend.nickname,
              display_name: newFriend.displayName,
              bio: newFriend.bio,
              avatar_url: newFriend.avatar,
              status: newFriend.status,
              current_game: newFriend.currentGame,
              steam: newFriend.steam,
              telegram: newFriend.telegram,
              vk: newFriend.vk,
              discord: newFriend.discord,
              psn_id: newFriend.psnId,
              other_platforms: newFriend.otherPlatforms,
              consent_public_contacts: newFriend.consent_public_contacts
            }
          });
        } catch (e) {
          console.warn("[FriendsService] Supabase friendship save warning:", e);
        }
      }
    }

    // Update visitor's local cache if it was their request
    const myReq = this.getMyRequest();
    if (myReq && myReq.id === requestId) {
      myReq.status = "accepted";
      setLocalStore(STORAGE_KEYS.MY_REQUEST, myReq);
    }

    return { success: true, request: req };
  },

  // 6. Reject Request (Admin Owner Action)
  async rejectRequest(requestId, ownerPin) {
    const isOwner = Boolean(ownerPin && ownerPin.trim() === SUPABASE_CONFIG.adminPin.trim());
    if (!isOwner) throw new Error("Неверный ПИН-код владельца.");

    const requests = getLocalStore(STORAGE_KEYS.REQUESTS, []);
    const req = requests.find((r) => r.id === requestId);
    if (!req) throw new Error("Заявка не найдена.");

    req.status = "rejected";
    req.reviewedAt = new Date().toISOString();
    setLocalStore(STORAGE_KEYS.REQUESTS, requests);

    const myReq = this.getMyRequest();
    if (myReq && myReq.id === requestId) {
      myReq.status = "rejected";
      setLocalStore(STORAGE_KEYS.MY_REQUEST, myReq);
    }

    return { success: true, request: req };
  },

  // 7. Block User & Remove Friend
  async blockUser(nickname, ownerPin) {
    const isOwner = Boolean(ownerPin && ownerPin.trim() === SUPABASE_CONFIG.adminPin.trim());
    if (!isOwner) throw new Error("Неверный ПИН-код владельца.");

    const cleanNick = (nickname || "").trim();
    if (!cleanNick) return;

    // Add to blocked
    const blocked = getLocalStore(STORAGE_KEYS.BLOCKED, []);
    if (!blocked.includes(cleanNick)) {
      blocked.push(cleanNick);
      setLocalStore(STORAGE_KEYS.BLOCKED, blocked);
    }

    // Remove from confirmed friends
    const friends = getLocalStore(STORAGE_KEYS.FRIENDS, []);
    const filtered = friends.filter((f) => f.nickname.toLowerCase() !== cleanNick.toLowerCase());
    setLocalStore(STORAGE_KEYS.FRIENDS, filtered);

    // Mark request as blocked
    const requests = getLocalStore(STORAGE_KEYS.REQUESTS, []);
    requests.forEach((r) => {
      if (r.nickname.toLowerCase() === cleanNick.toLowerCase()) {
        r.status = "blocked";
      }
    });
    setLocalStore(STORAGE_KEYS.REQUESTS, requests);

    return { success: true };
  },

  // 8. Report User
  async reportRequest(requestId, reason) {
    const requests = getLocalStore(STORAGE_KEYS.REQUESTS, []);
    const req = requests.find((r) => r.id === requestId);
    if (req) {
      req.reported = true;
      req.reportReason = escapeHtml(reason || "Подозрение на спам");
      setLocalStore(STORAGE_KEYS.REQUESTS, requests);
    }
    return { success: true };
  },

  // 9. Delete My Request (Cancel)
  deleteMyRequest() {
    const myReq = this.getMyRequest();
    if (myReq) {
      const requests = getLocalStore(STORAGE_KEYS.REQUESTS, []);
      const filtered = requests.filter((r) => r.id !== myReq.id);
      setLocalStore(STORAGE_KEYS.REQUESTS, filtered);
      removeRawStorage(STORAGE_KEYS.MY_REQUEST);
    }
    return { success: true };
  },

  // 10. Search Confirmed Friends & Profiles
  async searchFriends(query = "") {
    const q = (query || "").trim().toLowerCase();
    const friends = await this.getConfirmedFriends();
    if (!q) return friends;
    return friends.filter(
      (f) =>
        (f.nickname && f.nickname.toLowerCase().includes(q)) ||
        (f.displayName && f.displayName.toLowerCase().includes(q)) ||
        (f.bio && f.bio.toLowerCase().includes(q)) ||
        (f.psnId && f.psnId.toLowerCase().includes(q))
    );
  },

  // 11. Unblock User
  async unblockUser(nickname, ownerPin) {
    const isOwner = Boolean(ownerPin && ownerPin.trim() === SUPABASE_CONFIG.adminPin.trim());
    if (!isOwner) throw new Error("Неверный ПИН-код владельца.");
    const cleanNick = (nickname || "").trim();
    const blocked = getLocalStore(STORAGE_KEYS.BLOCKED, []);
    const filtered = blocked.filter((b) => b.toLowerCase() !== cleanNick.toLowerCase());
    setLocalStore(STORAGE_KEYS.BLOCKED, filtered);
    return { success: true };
  },

  // 12. Get Blocked Users List
  getBlockedUsers(ownerPin) {
    const isOwner = Boolean(ownerPin && ownerPin.trim() === SUPABASE_CONFIG.adminPin.trim());
    if (!isOwner) throw new Error("Неверный ПИН-код владельца.");
    return getLocalStore(STORAGE_KEYS.BLOCKED, []);
  }
};
