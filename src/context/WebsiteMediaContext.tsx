import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";

import { getWebsiteMedia } from "../data/websiteMedia";

type WebsiteMediaContextType = {
  media: any[];
  loading: boolean;
  refreshMedia: () => Promise<void>;
};

const WebsiteMediaContext =
  createContext<WebsiteMediaContextType>({
    media: [],
    loading: true,
    refreshMedia: async () => {},
  });

const CACHE_KEY = "vv-website-media-cache";
const CACHE_TIME_KEY = "vv-website-media-cache-time";

const CACHE_DURATION = 10 * 60 * 1000; // 10 minutes

function getCachedMedia(): any[] | null {
  try {
    const cached = localStorage.getItem(CACHE_KEY);
    const cachedTime = localStorage.getItem(
      CACHE_TIME_KEY
    );

    if (!cached || !cachedTime) {
      return null;
    }

    const age = Date.now() - Number(cachedTime);

    if (age > CACHE_DURATION) {
      localStorage.removeItem(CACHE_KEY);
      localStorage.removeItem(CACHE_TIME_KEY);
      return null;
    }

    const parsed = JSON.parse(cached);

    return Array.isArray(parsed) ? parsed : null;
  } catch {
    return null;
  }
}

function saveMediaToCache(data: any[]) {
  try {
    localStorage.setItem(
      CACHE_KEY,
      JSON.stringify(data)
    );

    localStorage.setItem(
      CACHE_TIME_KEY,
      String(Date.now())
    );
  } catch {
    // Ignore storage errors
  }
}

export function WebsiteMediaProvider({
  children,
}: {
  children: ReactNode;
}) {
  const cachedMedia = useMemo(
    () => getCachedMedia(),
    []
  );

  const [media, setMedia] = useState<any[]>(
    cachedMedia ?? []
  );

  const [loading, setLoading] = useState(
    !cachedMedia
  );

  const loadMedia = useCallback(
    async (showLoader = false) => {
      try {
        if (showLoader) {
          setLoading(true);
        }

        const data =
          (await getWebsiteMedia()) ?? [];

        setMedia(data);
        saveMediaToCache(data);
      } catch (error) {
        console.error(
          "Failed to load website media:",
          error
        );
      } finally {
        setLoading(false);
      }
    },
    []
  );

  const refreshMedia = useCallback(async () => {
    localStorage.removeItem(CACHE_KEY);
    localStorage.removeItem(CACHE_TIME_KEY);

    await loadMedia(true);
  }, [loadMedia]);

  useEffect(() => {
    if (cachedMedia) {
      // Cached content immediately visible.
      // Refresh silently in background.
      loadMedia(false);
    } else {
      loadMedia(true);
    }
  }, [cachedMedia, loadMedia]);

  const contextValue = useMemo(
    () => ({
      media,
      loading,
      refreshMedia,
    }),
    [media, loading, refreshMedia]
  );

  return (
    <WebsiteMediaContext.Provider
      value={contextValue}
    >
      {children}
    </WebsiteMediaContext.Provider>
  );
}

export function useWebsiteMedia() {
  return useContext(WebsiteMediaContext);
}