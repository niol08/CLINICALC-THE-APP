import { useEffect, useState } from 'react';
import { CalculationsJson } from '../types/calculations';
import { loadCachedMetadata, syncMetadata } from '../services/metadata';

export function useMetadata() {
  const [data, setData] = useState<CalculationsJson | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;

    async function init() {
      try {
        const cached = await loadCachedMetadata();
        if (mounted && cached.data) {
          setData(cached.data);
          setLoading(false);
        }
        const fresh = await syncMetadata();
        if (mounted && fresh) {
          setData(fresh);
        }
      } catch (err) {
        console.error('Error initializing metadata:', err);
        if (mounted) {
          setError(err instanceof Error ? err.message : 'Unknown error');
        }
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    }

    init();

    return () => {
      mounted = false;
    };
  }, []);

  const refetch = async () => {
    setLoading(true);
    setError(null);
    try {
      const fresh = await syncMetadata();
      if (fresh) setData(fresh);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  };

  return { data, loading, error, refetch };
}
