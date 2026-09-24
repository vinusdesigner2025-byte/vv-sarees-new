import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";

import {
  getWebsiteMedia,
} from "../data/websiteMedia";

/* =========================================
   TYPES
========================================= */

type WebsiteMediaContextType = {
  media: any[];
  loading: boolean;
  refreshMedia: () => Promise<void>;
};

/* =========================================
   CONTEXT
========================================= */

const WebsiteMediaContext =
  createContext<WebsiteMediaContextType>({
    media: [],
    loading: true,
    refreshMedia: async () => {},
  });

/* =========================================
   CACHE SETTINGS
========================================= */

const CACHE_KEY =
  "vv-website-media-cache";

const CACHE_TIME_KEY =
  "vv-website-media-cache-time";

/*
  10 minutes.

  Fresh cache irundha Supabase request
  thirumba panna maatom.
*/
const CACHE_DURATION =
  10 * 60 * 1000;

/* =========================================
   IN-MEMORY REQUEST DEDUPE

   Same time-la multiple components/provider
   remount aana duplicate request avoid pannum.
========================================= */

let pendingMediaRequest:
  Promise<any[]> | null = null;

/* =========================================
   READ CACHE
========================================= */

function getCachedMedia():
  | any[]
  | null {
  try {
    const cached =
      localStorage.getItem(
        CACHE_KEY
      );

    const cachedTime =
      localStorage.getItem(
        CACHE_TIME_KEY
      );

    if (
      !cached ||
      !cachedTime
    ) {
      return null;
    }

    const timestamp =
      Number(cachedTime);

    /*
      Invalid timestamp-na cache discard.
    */
    if (
      !Number.isFinite(
        timestamp
      )
    ) {
      localStorage.removeItem(
        CACHE_KEY
      );

      localStorage.removeItem(
        CACHE_TIME_KEY
      );

      return null;
    }

    const age =
      Date.now() -
      timestamp;

    /*
      Cache expired.
    */
    if (
      age >
      CACHE_DURATION
    ) {
      localStorage.removeItem(
        CACHE_KEY
      );

      localStorage.removeItem(
        CACHE_TIME_KEY
      );

      return null;
    }

    const parsed =
      JSON.parse(cached);

    return Array.isArray(
      parsed
    )
      ? parsed
      : null;
  } catch (
    error
  ) {
    console.warn(
      "Website media cache read failed:",
      error
    );

    return null;
  }
}

/* =========================================
   SAVE CACHE
========================================= */

function saveMediaToCache(
  data: any[]
) {
  try {
    localStorage.setItem(
      CACHE_KEY,
      JSON.stringify(data)
    );

    localStorage.setItem(
      CACHE_TIME_KEY,
      String(Date.now())
    );
  } catch (
    error
  ) {
    /*
      Website should still work even if
      storage is unavailable/full.
    */
    console.warn(
      "Website media cache save failed:",
      error
    );
  }
}

/* =========================================
   CLEAR CACHE
========================================= */

function clearMediaCache() {
  try {
    localStorage.removeItem(
      CACHE_KEY
    );

    localStorage.removeItem(
      CACHE_TIME_KEY
    );
  } catch {
    // Ignore storage errors
  }
}

/* =========================================
   FETCH MEDIA

   Duplicate simultaneous requests prevented.
========================================= */

async function fetchWebsiteMediaOnce():
  Promise<any[]> {
  if (
    pendingMediaRequest
  ) {
    return pendingMediaRequest;
  }

  pendingMediaRequest =
    (async () => {
      try {
        const data =
          await getWebsiteMedia();

        return Array.isArray(
          data
        )
          ? data
          : [];
      } finally {
        /*
          Allow future refresh request.
        */
        pendingMediaRequest =
          null;
      }
    })();

  return pendingMediaRequest;
}

/* =========================================
   PROVIDER
========================================= */

export function WebsiteMediaProvider({
  children,
}: {
  children: ReactNode;
}) {
  /*
    Cache read only ONCE.
  */
  const initialCachedMedia =
    useMemo(
      () =>
        getCachedMedia(),
      []
    );

  const [
    media,
    setMedia,
  ] = useState<any[]>(
    initialCachedMedia ??
      []
  );

  const [
    loading,
    setLoading,
  ] = useState(
    !initialCachedMedia
  );

  /*
    Prevent async request finishing after
    provider unmount from changing state.
  */
  const mountedRef =
    useRef(true);

  /* =====================================
     LOAD FROM SERVER
  ===================================== */

  const loadMedia =
    useCallback(
      async (
        showLoader = true
      ) => {
        if (
          showLoader &&
          mountedRef.current
        ) {
          setLoading(true);
        }

        try {
          const data =
            await fetchWebsiteMediaOnce();

          if (
            !mountedRef.current
          ) {
            return;
          }

          setMedia(data);

          saveMediaToCache(
            data
          );
        } catch (
          error
        ) {
          console.error(
            "Failed to load website media:",
            error
          );
        } finally {
          if (
            mountedRef.current
          ) {
            setLoading(false);
          }
        }
      },
      []
    );

  /* =====================================
     FIRST APP LOAD

     IMPORTANT:

     Fresh cache irundha:
     → NO Supabase request.

     Cache illa / expired:
     → fetch from server.
  ===================================== */

  useEffect(() => {
    mountedRef.current =
      true;

    /*
      Cache already fresh.
      Nothing else to do.
    */
    if (
      initialCachedMedia
    ) {
      setLoading(false);

      return () => {
        mountedRef.current =
          false;
      };
    }

    void loadMedia(
      true
    );

    return () => {
      mountedRef.current =
        false;
    };
  }, [
    initialCachedMedia,
    loadMedia,
  ]);

  /* =====================================
     MANUAL REFRESH

     Admin/media update aana apram use pannalaam.
  ===================================== */

  const refreshMedia =
    useCallback(
      async () => {
        clearMediaCache();

        await loadMedia(
          true
        );
      },
      [loadMedia]
    );

  /* =====================================
     CONTEXT VALUE
  ===================================== */

  const contextValue =
    useMemo(
      () => ({
        media,
        loading,
        refreshMedia,
      }),
      [
        media,
        loading,
        refreshMedia,
      ]
    );

  return (
    <WebsiteMediaContext.Provider
      value={
        contextValue
      }
    >
      {children}
    </WebsiteMediaContext.Provider>
  );
}

/* =========================================
   HOOK
========================================= */

export function useWebsiteMedia() {
  return useContext(
    WebsiteMediaContext
  );
}