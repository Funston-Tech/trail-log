import { createContext, useCallback, useContext, useEffect, useRef, useState, type PropsWithChildren } from 'react';

import {
  createHike,
  deleteHike as deleteHikeRequest,
  loadHikes,
  sortHikes,
  updateHike as updateHikeRequest,
  type Hike,
  type HikeDraft,
} from '../lib/hikes';

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
  const [hikes, setHikes] = useState<Hike[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(false);
  const hikesRef = useRef<Hike[]>([]);

  const reload = useCallback(async () => {
    setLoading(true);
    setLoadError(false);

    try {
      const savedHikes = await loadHikes();
      hikesRef.current = savedHikes;
      setHikes(savedHikes);
    } catch {
      setLoadError(true);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void reload();
  }, [reload]);

  const commit = useCallback((nextHikes: Hike[]) => {
    const sortedHikes = sortHikes(nextHikes);
    hikesRef.current = sortedHikes;
    setHikes(sortedHikes);
  }, []);

  const addHike = useCallback(async (draft: HikeDraft) => {
    const hike = await createHike(draft);
    commit([...hikesRef.current, hike]);
    return hike;
  }, [commit]);

  const updateHike = useCallback(async (id: string, draft: HikeDraft) => {
    const hike = await updateHikeRequest(id, draft);
    commit(hikesRef.current.map((item) => item.id === id ? hike : item));
  }, [commit]);

  const deleteHike = useCallback(async (id: string) => {
    await deleteHikeRequest(id);
    commit(hikesRef.current.filter((hike) => hike.id !== id));
  }, [commit]);

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
