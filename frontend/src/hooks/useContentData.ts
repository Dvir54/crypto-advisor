import { useState, useEffect } from 'react';

interface UseContentDataResult<T> {
  data: T;
  loading: boolean;
  error: string | null;
}

/**
 * Custom hook for fetching content data with consistent error handling
 * @param fetchFn - Async function to fetch data
 * @param initialData - Initial data value
 * @returns Object containing data, loading state, and error
 */
export function useContentData<T>(
  fetchFn: () => Promise<T>,
  initialData: T
): UseContentDataResult<T> {
  const [data, setData] = useState<T>(initialData);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);
        const result = await fetchFn();
        setData(result);
      } catch (err: any) {
        console.error('Error fetching data:', err);
        setError(err.response?.data?.detail || 'Failed to load data');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  return { data, loading, error };
}

