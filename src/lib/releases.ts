const REPO = "bitcoinaustria/kassiber";

export const RELEASES_URL = `https://github.com/${REPO}/releases`;

const API_URL = `https://api.github.com/repos/${REPO}/releases?per_page=1`;
const CACHE_KEY = "kassiber-latest-release";

export interface ReleaseAsset {
  name: string;
  browser_download_url: string;
}

export interface Release {
  tag_name: string;
  html_url: string;
  assets: ReleaseAsset[];
}

export async function fetchLatestRelease(): Promise<Release> {
  const cached = sessionStorage.getItem(CACHE_KEY);
  if (cached) {
    try {
      return JSON.parse(cached);
    } catch {
      sessionStorage.removeItem(CACHE_KEY);
    }
  }

  const response = await fetch(API_URL);
  if (!response.ok) throw new Error(`GitHub releases request failed: ${response.status}`);

  const [release] = (await response.json()) as Release[];
  if (!release) throw new Error("No published Kassiber release found");

  sessionStorage.setItem(CACHE_KEY, JSON.stringify(release));
  return release;
}
