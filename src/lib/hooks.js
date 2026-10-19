import { useState, useEffect, useRef, useCallback } from 'react';
import { fetchAll, countRows, subscribeCollection } from './supabase';

/* ─── Fetch data from a Supabase/Firebase table with Real-Time Sync ─── */
export function useSupabaseQuery(table, options = {}, deps = []) {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const refetch = useCallback(async () => {
    try {
      const result = await fetchAll(table, options);
      setData(result);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [table, JSON.stringify(options), ...deps]);

  useEffect(() => {
    refetch();

    // Attach real-time cloud listener
    let unsubscribeCloud = () => {};
    try {
      unsubscribeCloud = subscribeCollection(
        table,
        options,
        (liveData) => {
          setData(liveData);
          setLoading(false);
        },
        (err) => {
          console.warn(`Realtime subscription notice for ${table}:`, err.message);
        }
      );
    } catch (e) {
      console.warn(`Could not subscribe to ${table}:`, e);
    }

    const handleSync = (e) => {
      if (!e.detail?.collection || e.detail.collection === table) {
        refetch();
      }
    };

    const handleStorage = (e) => {
      if (e.key === 'icc_last_sync' || e.key === `icc_store_${table}`) {
        refetch();
      }
    };

    window.addEventListener('icc_data_sync', handleSync);
    window.addEventListener('storage', handleStorage);

    return () => {
      if (typeof unsubscribeCloud === 'function') {
        unsubscribeCloud();
      }
      window.removeEventListener('icc_data_sync', handleSync);
      window.removeEventListener('storage', handleStorage);
    };
  }, [refetch, table, JSON.stringify(options)]);

  return { data, loading, error, refetch };
}

/* ─── Count rows in a Supabase/Firebase table with Real-Time Sync ─── */
export function useSupabaseCount(table, filter = {}, deps = []) {
  const [count, setCount] = useState(0);
  const [loading, setLoading] = useState(true);

  const recount = useCallback(() => {
    countRows(table, filter)
      .then(setCount)
      .catch(() => setCount(0))
      .finally(() => setLoading(false));
  }, [table, JSON.stringify(filter), ...deps]);

  useEffect(() => {
    recount();

    const handleSync = (e) => {
      if (!e.detail?.collection || e.detail.collection === table) {
        recount();
      }
    };

    const handleStorage = (e) => {
      if (e.key === 'icc_last_sync' || e.key === `icc_store_${table}`) {
        recount();
      }
    };

    window.addEventListener('icc_data_sync', handleSync);
    window.addEventListener('storage', handleStorage);

    return () => {
      window.removeEventListener('icc_data_sync', handleSync);
      window.removeEventListener('storage', handleStorage);
    };
  }, [recount, table]);

  return { count, loading };
}

/* ─── Intersection Observer for scroll animations ─── */
export function useInView(options = {}) {
  const ref = useRef(null);
  const [inView, setInView] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) {
        setInView(true);
        observer.unobserve(el);
      }
    }, { threshold: 0.1, ...options });
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return [ref, inView];
}

/* ─── Animated Counter ─── */
export function useCounter(end, duration = 2000, startWhen = true) {
  const [value, setValue] = useState(0);

  useEffect(() => {
    if (!startWhen || end === 0) return;
    let start = 0;
    const increment = end / (duration / 16);
    const timer = setInterval(() => {
      start += increment;
      if (start >= end) {
        setValue(end);
        clearInterval(timer);
      } else {
        setValue(Math.floor(start));
      }
    }, 16);
    return () => clearInterval(timer);
  }, [end, duration, startWhen]);

  return value;
}

/* ─── Scroll position (for navbar) ─── */
export function useScrollPosition() {
  const [scrollY, setScrollY] = useState(0);

  useEffect(() => {
    const handleScroll = () => setScrollY(window.scrollY);
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return scrollY;
}

/* ─── Media query hook ─── */
export function useMediaQuery(query) {
  const [matches, setMatches] = useState(false);

  useEffect(() => {
    const media = window.matchMedia(query);
    setMatches(media.matches);
    const listener = (e) => setMatches(e.matches);
    media.addEventListener('change', listener);
    return () => media.removeEventListener('change', listener);
  }, [query]);

  return matches;
}
