import { getItem, setItem, removeItem } from './storage';

export const DEFAULT_ITCH_USER = 'deadsml';
const ITCH_API = 'https://api.itch.io';

function parseProfileGames(html, username) {
  const games = [];
  const seen = new Set();
  const profileHost = `${username.toLowerCase()}.itch.io`;
  const anchorRe = /<a\b[^>]*href=["']([^"']+)["'][^>]*>([\s\S]*?)<\/a>/gi;
  let match;

  while ((match = anchorRe.exec(html))) {
    const rawUrl = match[1].replace(/&amp;/g, '&');
    let parsed;
    try { parsed = new URL(rawUrl, `https://${profileHost}/`); } catch { continue; }
    const url = parsed.href;
    if (parsed.hostname.toLowerCase() !== profileHost) continue;

    const slug = parsed.pathname.replace(/^\//, '').replace(/\/$/, '').split('/')[0];
    if (!slug || seen.has(slug) || ['community', 'followers', 'following', 'posts'].includes(slug)) continue;

    const block = match[2];
    const titleMatch = block.match(/(?:game_title|title|alt)=["']([^"']+)["']/i);
    const textTitle = block.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
    const title = titleMatch?.[1]?.trim() || textTitle || slug.replace(/-/g, ' ');
    const coverMatch = block.match(/<img\b[^>]*src=["']([^"']+)["']/i) || block.match(/data-(?:original|image)=["']([^"']+)["']/i);

    seen.add(slug);
    games.push({
      id: `${username}:${slug}`,
      title,
      url: `https://${profileHost}/${slug}`,
      cover_url: coverMatch?.[1] || null,
      source: 'deadsml',
    });
  }

  return games;
}
export async function fetchPublicItchGames(username = DEFAULT_ITCH_USER) {
  const clean = String(username || DEFAULT_ITCH_USER).trim().replace(/^@/, '').toLowerCase();
  const profileUrl = `https://${clean}.itch.io/`;
  try {
    const response = await fetch(profileUrl, { headers: { Accept: 'text/html' } });
    if (!response.ok) throw new Error(`Itch profile returned ${response.status}`);
    const html = await response.text();
    const games = parseProfileGames(html, clean);
    if (games.length || clean !== DEFAULT_ITCH_USER) return games;
    throw new Error('No public games detected');
  } catch (error) {
    if (clean === DEFAULT_ITCH_USER) {
      return [
        { id: 'deadsml:the-pain-machine', title: 'The Pain Machine', url: 'https://deadsml.itch.io/the-pain-machine', cover_url: null, source: 'deadsml' },
        { id: 'deadsml:deadsmile', title: 'DEADSMILE', url: 'https://deadsml.itch.io/deadsmile', cover_url: null, source: 'deadsml' },
        { id: 'deadsml:light', title: 'LIGHT', url: 'https://deadsml.itch.io/light', cover_url: null, source: 'deadsml' },
      ];
    }
    throw error;
  }
}

export async function fetchItchConnectedGames(apiKey) {
  if (!apiKey) return { profile: null, games: [], owned: [] };
  const headers = { Authorization: `Bearer ${apiKey}`, Accept: 'application/json' };
  const [profileResponse, gamesResponse, ownedResponse] = await Promise.all([
    fetch(`${ITCH_API}/profile`, { headers }),
    fetch(`${ITCH_API}/profile/games`, { headers }),
    fetch(`${ITCH_API}/profile/owned-keys`, { headers }),
  ]);
  if (!profileResponse.ok) throw new Error('Invalid itch.io credentials');
  const profile = await profileResponse.json();
  const gamesPayload = gamesResponse.ok ? await gamesResponse.json() : {};
  const ownedPayload = ownedResponse.ok ? await ownedResponse.json() : {};
  const games = gamesPayload.games || [];
  const owned = ownedPayload.games || ownedPayload.owned || ownedPayload.owned_games || [];
  return { profile: profile.user || null, games, owned };
}

export async function getItchConnection() {
  const [username, key] = await Promise.all([getItem('itch-username'), getItem('itch-api-key')]);
  return { username: username || DEFAULT_ITCH_USER, apiKey: key || '' };
}

export async function saveItchConnection({ username, apiKey }) {
  const cleanUsername = String(username || DEFAULT_ITCH_USER).trim().replace(/^@/, '');
  await setItem('itch-username', cleanUsername || DEFAULT_ITCH_USER);
  if (apiKey) await setItem('itch-api-key', String(apiKey).trim());
  else await removeItem('itch-api-key');
  return { username: cleanUsername || DEFAULT_ITCH_USER, apiKey: apiKey || '' };
}

export function itchProfileUrl(username = DEFAULT_ITCH_USER) {
  return `https://${username}.itch.io/`;
}
