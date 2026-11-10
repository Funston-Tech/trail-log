import { createContext, useCallback, useContext, useEffect, useRef, useState, type PropsWithChildren } from 'react';

import { isUnauthorized } from '../lib/api';
import {
  createHike,
  deleteHike as deleteHikeRequest,
  loadHikes,
  sortHikes,
  updateHike as updateHikeRequest,
  type Hike,
  type HikeDraft,
} from '../lib/hikes';
import { useAuth } from './AuthContext';

type HikesContextValue = {
  hikes: Hike[];
  loading: boolean;
  loadError: boolean;
  reload: () => Promise<void>;
  addHike: (draft: HikeDraft) => Promise<Hike>;
  updateHike: (id: string, draft: HikeDraft) => Promise<void>;
  deleteHike: (id: string) => Promise<void>;
};

const HikesContext = createContext<HikesContextValue | null>(null);

export function HikesProvider({ children }: PropsWithChildren) {
  const { token, handleUnauthorized } = useAuth();
  const [hikes, setHikes] = useState<Hike[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(false);
  const hikesRef = useRef<Hike[]>([]);

  const runRequest = useCallback(async <T,>(request: (sessionToken: string) => Promise<T>): Promise<T> => {
    if (!token) {
      handleUnauthorized();
      throw new Error('No active session');
    }

    try {
      return await request(token);
    } catch (error) {
      if (isUnauthorized(error)) {
        handleUnauthorized();
      }
      throw error;
    }
  }, [handleUnauthorized, token]);

  const reload = useCallback(async () => {
    if (!token) {
      hikesRef.current = [];
      setHikes([]);
      setLoading(false);
      setLoadError(false);
      return;
    }

    setLoading(true);
    setLoadError(false);

    try {
      const savedHikes = await runRequest(loadHikes);
      hikesRef.current = savedHikes;
      setHikes(savedHikes);
    } catch (error) {
      if (!isUnauthorized(error)) {
        setLoadError(true);
      }
    } finally {
      setLoading(false);
    }
  }, [runRequest, token]);

  useEffect(() => {
    void reload();
  }, [reload]);

  const commit = useCallback((nextHikes: Hike[]) => {
    const sortedHikes = sortHikes(nextHikes);
    hikesRef.current = sortedHikes;
    setHikes(sortedHikes);
  }, []);

  const addHike = useCallback(async (draft: HikeDraft) => {
    const hike = await runRequest((sessionToken) => createHike(sessionToken, draft));
    commit([...hikesRef.current, hike]);
    return hike;
  }, [commit, runRequest]);

  const updateHike = useCallback(async (id: string, draft: HikeDraft) => {
    const hike = await runRequest((sessionToken) => updateHikeRequest(sessionToken, id, draft));
    commit(hikesRef.current.map((item) => item.id === id ? hike : item));
  }, [commit, runRequest]);

  const deleteHike = useCallback(async (id: string) => {
    await runRequest((sessionToken) => deleteHikeRequest(sessionToken, id));
    commit(hikesRef.current.filter((hike) => hike.id !== id));
  }, [commit, runRequest]);

  return (
    <HikesContext.Provider value={{ hikes, loading, loadError, reload, addHike, updateHike, deleteHike }}>
      {children}
    </HikesContext.Provider>
  );
}

export function useHikes() {
  const context = useContext(HikesContext);
  if (!context) {
    throw new Error('useHikes must be used inside HikesProvider');
  }
  return context;
}
