import { getItem, setItem } from './storage';

export const DEFAULT_GITHUB_USER = 'luxjson';

export async function fetchGithubProfile(username = DEFAULT_GITHUB_USER) {
  const clean = String(username || DEFAULT_GITHUB_USER).trim();
  const [profileResponse, reposResponse] = await Promise.all([
    fetch(`https://api.github.com/users/${encodeURIComponent(clean)}`, { headers: { Accept: 'application/vnd.github+json' } }),
    fetch(`https://api.github.com/users/${encodeURIComponent(clean)}/repos?per_page=100&sort=pushed`, { headers: { Accept: 'application/vnd.github+json' } }),
  ]);
  if (!profileResponse.ok || !reposResponse.ok) throw new Error('GitHub profile could not be loaded');
  return { profile: await profileResponse.json(), repos: await reposResponse.json() };
}

export async function saveGithubConnection(username) {
  const clean = String(username || DEFAULT_GITHUB_USER).trim().replace(/^@/, '');
  await setItem('github-username', clean || DEFAULT_GITHUB_USER);
  return clean || DEFAULT_GITHUB_USER;
}

export async function getGithubConnection() {
  return (await getItem('github-username')) || DEFAULT_GITHUB_USER;
}

