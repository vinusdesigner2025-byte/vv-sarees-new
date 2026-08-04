import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";

import { getWebsiteMedia } from "../data/websiteMedia";

type WebsiteMediaContextType = {
  media: any[];
  loading: boolean;
  refreshMedia: () => Promise<void>;
};

const WebsiteMediaContext = createContext<WebsiteMediaContextType>({
  media: [],
  loading: true,
  refreshMedia: async () => {},
});

export function WebsiteMediaProvider({
  children,
}: {
  children: ReactNode;
}) {
  const [media, setMedia] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const refreshMedia = async () => {
    try {
      setLoading(true);
      const data = await getWebsiteMedia();
      setMedia(data ?? []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    refreshMedia();
  }, []);

  return (
    <WebsiteMediaContext.Provider
      value={{
        media,
        loading,
        refreshMedia,
      }}
    >
      {children}
    </WebsiteMediaContext.Provider>
  );
}

export function useWebsiteMedia() {
  return useContext(WebsiteMediaContext);
}