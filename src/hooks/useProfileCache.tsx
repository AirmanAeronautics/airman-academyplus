import { useState, useEffect } from 'react';

const PROFILE_CACHE_KEY = 'airman_profile_cache';
const CACHE_EXPIRY_MS = 5 * 60 * 1000; // 5 minutes

interface CachedProfile {
  data: any;
  timestamp: number;
  userId: string;
}

export function useProfileCache(userId: string | undefined) {
  const [cachedProfile, setCachedProfile] = useState<any>(null);

  // Load from cache on mount
  useEffect(() => {
    if (!userId) return;

    try {
      const cached = localStorage.getItem(PROFILE_CACHE_KEY);
      if (cached) {
        const parsed: CachedProfile = JSON.parse(cached);
        const isExpired = Date.now() - parsed.timestamp > CACHE_EXPIRY_MS;
        const isWrongUser = parsed.userId !== userId;

        if (!isExpired && !isWrongUser) {
          setCachedProfile(parsed.data);
        } else {
          // Clear expired or wrong user cache
          localStorage.removeItem(PROFILE_CACHE_KEY);
        }
      }
    } catch (error) {
      console.error('Error loading profile cache:', error);
      localStorage.removeItem(PROFILE_CACHE_KEY);
    }
  }, [userId]);

  const saveToCache = (profile: any, userId: string) => {
    if (!userId || !profile) return;

    try {
      const cacheData: CachedProfile = {
        data: profile,
        timestamp: Date.now(),
        userId
      };
      localStorage.setItem(PROFILE_CACHE_KEY, JSON.stringify(cacheData));
      setCachedProfile(profile);
    } catch (error) {
      console.error('Error saving profile cache:', error);
    }
  };

  const clearCache = () => {
    localStorage.removeItem(PROFILE_CACHE_KEY);
    setCachedProfile(null);
  };

  return {
    cachedProfile,
    saveToCache,
    clearCache
  };
}