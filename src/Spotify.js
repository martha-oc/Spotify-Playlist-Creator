const clientId = import.meta.env.VITE_SPOTIFY_CLIENT_ID;
const redirectUri = "http://127.0.0.1:5173";

function generateRandomString(length) {
  const characters =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

  const values = crypto.getRandomValues(new Uint8Array(length));

  return values.reduce(
    (string, value) => string + characters[value % characters.length],
    "",
  );
}

async function generateCodeChallenge(codeVerifier) {
  const encoder = new TextEncoder();
  const data = encoder.encode(codeVerifier);

  const digest = await crypto.subtle.digest("SHA-256", data);

  return btoa(String.fromCharCode(...new Uint8Array(digest)))
    .replace(/=/g, "")
    .replace(/\+/g, "-")
    .replace(/\//g, "_");
}

async function login() {
  const codeVerifier = generateRandomString(64);
  const codeChallenge = await generateCodeChallenge(codeVerifier);

  localStorage.setItem("code_verifier", codeVerifier);

  const scope = "playlist-modify-public playlist-modify-private";

  const authUrl = new URL("https://accounts.spotify.com/authorize");

  const params = {
    response_type: "code",
    client_id: clientId,
    scope: scope,
    code_challenge_method: "S256",
    code_challenge: codeChallenge,
    redirect_uri: redirectUri,
  };

  authUrl.search = new URLSearchParams(params).toString();

  window.location.href = authUrl.toString();
}

async function getAccessToken(code) {
  const codeVerifier = localStorage.getItem("code_verifier");

  const response = await fetch("https://accounts.spotify.com/api/token", {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: new URLSearchParams({
      client_id: clientId,
      grant_type: "authorization_code",
      code: code,
      redirect_uri: redirectUri,
      code_verifier: codeVerifier,
    }),
  });

  console.log("Spotify token response status:", response.status);

  const data = await response.json();

  if (!response.ok) {
    console.error("Spotify token error:", data);
    throw new Error(data.error_description || data.error);
  }

  console.log("New Spotify access token received");

  localStorage.setItem("access_token", data.access_token);

  return data.access_token;
}

async function searchSpotify(term) {
  const accessToken = localStorage.getItem("access_token");

  console.log("Access token exists:", !!accessToken);

  if (!accessToken) {
    throw new Error("No Spotify access token. Please log in first.");
  }

  const response = await fetch(
    `https://api.spotify.com/v1/search?q=${encodeURIComponent(term)}&type=track`,
    {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    },
  );

  if (!response.ok) {
    throw new Error("Spotify search failed");
  }

  const data = await response.json();

  return data.tracks.items;
}

async function getCurrentUser() {
  const accessToken = localStorage.getItem("access_token");

  console.log("Testing token:", !!accessToken);

  const response = await fetch("https://api.spotify.com/v1/me", {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });

  console.log("Spotify /me status:", response.status);

  const data = await response.json();

  console.log("Spotify /me response:", data);

  if (!response.ok) {
    throw new Error(data.error?.message || "Could not get Spotify user");
  }

  return data;
}

async function createPlaylist(playlistName) {
  const accessToken = localStorage.getItem("access_token");

  const response = await fetch("https://api.spotify.com/v1/me/playlists", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      name: playlistName,
      public: false,
    }),
  });

  if (!response.ok) {
    const errorData = await response.json();
    console.error("Create playlist error:", errorData);
    throw new Error("Could not create Spotify playlist");
  }

  const data = await response.json();

  return data;
}

async function addTracksToPlaylist(playlistId, trackUris) {
  const accessToken = localStorage.getItem("access_token");

  const response = await fetch(
    `https://api.spotify.com/v1/playlists/${playlistId}/items`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        uris: trackUris,
      }),
    },
  );

  if (!response.ok) {
    const errorData = await response.json();
    console.error("Add tracks error:", errorData);
    throw new Error("Could not add tracks to Spotify playlist");
  }

  return await response.json();
}

export {
  login,
  getAccessToken,
  searchSpotify,
  getCurrentUser,
  createPlaylist,
  addTracksToPlaylist,
};
