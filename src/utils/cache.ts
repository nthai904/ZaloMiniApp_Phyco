// Cache utility với TTL (Time To Live)
interface CacheItem<T> {
  data: T;
  timestamp: number;
  ttl: number; // milliseconds
}

class CacheManager {
  private memoryCache: Map<string, CacheItem<any>> = new Map();
  private readonly DEFAULT_TTL = 5 * 60 * 1000; // 5 phút mặc định

  // Lấy dữ liệu từ cache
  get<T>(key: string): T | null {
    // Kiểm tra memory cache trước
    const memoryItem = this.memoryCache.get(key);
    if (memoryItem && this.isValid(memoryItem)) {
      return memoryItem.data as T;
    }
    if (memoryItem) {
      this.memoryCache.delete(key);
    }

    // Kiểm tra localStorage
    try {
      const stored = localStorage.getItem(`cache_${key}`);
      if (stored) {
        const item: CacheItem<T> = JSON.parse(stored);
        if (this.isValid(item)) {
          // Lưu lại vào memory cache
          this.memoryCache.set(key, item);
          return item.data;
        } else {
          localStorage.removeItem(`cache_${key}`);
        }
      }
    } catch (error) {
      console.warn("Cache get error:", error);
    }

    return null;
  }

  // Lưu dữ liệu vào cache
  set<T>(key: string, data: T, ttl: number = this.DEFAULT_TTL): void {
    const item: CacheItem<T> = {
      data,
      timestamp: Date.now(),
      ttl,
    };

    // Lưu vào memory cache
    this.memoryCache.set(key, item);

    // Lưu vào localStorage (async để không block UI)
    try {
      localStorage.setItem(`cache_${key}`, JSON.stringify(item));
    } catch (error) {
      console.warn("Cache set error (localStorage full?):", error);
      // Nếu localStorage đầy, xóa các item cũ nhất
      this.cleanupOldItems();
      try {
        localStorage.setItem(`cache_${key}`, JSON.stringify(item));
      } catch (e) {
        console.warn("Cache set failed after cleanup:", e);
      }
    }
  }

  // Kiểm tra cache còn hợp lệ không
  private isValid<T>(item: CacheItem<T>): boolean {
    return Date.now() - item.timestamp < item.ttl;
  }

  // Xóa cache
  delete(key: string): void {
    this.memoryCache.delete(key);
    try {
      localStorage.removeItem(`cache_${key}`);
    } catch (error) {
      console.warn("Cache delete error:", error);
    }
  }

  // Xóa tất cả cache
  clear(): void {
    this.memoryCache.clear();
    try {
      const keys = Object.keys(localStorage);
      keys.forEach((key) => {
        if (key.startsWith("cache_")) {
          localStorage.removeItem(key);
        }
      });
    } catch (error) {
      console.warn("Cache clear error:", error);
    }
  }

  // Xóa các item cũ để giải phóng localStorage
  private cleanupOldItems(): void {
    try {
      const keys = Object.keys(localStorage);
      const cacheKeys = keys.filter((key) => key.startsWith("cache_"));
      
      // Xóa 50% cache cũ nhất
      const items = cacheKeys.map((key) => {
        try {
          const stored = localStorage.getItem(key);
          if (stored) {
            const item: CacheItem<any> = JSON.parse(stored);
            return { key, timestamp: item.timestamp };
          }
        } catch (e) {
          return { key, timestamp: 0 };
        }
        return { key, timestamp: 0 };
      });

      items.sort((a, b) => a.timestamp - b.timestamp);
      const toDelete = items.slice(0, Math.floor(items.length / 2));
      
      toDelete.forEach(({ key }) => {
        localStorage.removeItem(key);
        this.memoryCache.delete(key.replace("cache_", ""));
      });
    } catch (error) {
      console.warn("Cache cleanup error:", error);
    }
  }

  // Lấy kích thước cache (ước tính)
  getSize(): { memory: number; storage: number } {
    let storageSize = 0;
    try {
      const keys = Object.keys(localStorage);
      keys.forEach((key) => {
        if (key.startsWith("cache_")) {
          const value = localStorage.getItem(key);
          if (value) {
            storageSize += value.length;
          }
        }
      });
    } catch (error) {
      // Ignore
    }

    return {
      memory: this.memoryCache.size,
      storage: storageSize,
    };
  }
}

// Export singleton instance
export const cache = new CacheManager();

// Helper function để tạo cache key
export function createCacheKey(prefix: string, ...params: (string | number | undefined)[]): string {
  return `${prefix}_${params.filter(Boolean).join("_")}`;
}

// Wrapper function để cache async function
export async function cachedFetch<T>(
  key: string,
  fetchFn: () => Promise<T>,
  ttl?: number
): Promise<T> {
  // Kiểm tra cache trước
  const cached = cache.get<T>(key);
  if (cached !== null) {
    return cached;
  }

  // Fetch dữ liệu mới
  const data = await fetchFn();
  
  // Lưu vào cache
  cache.set(key, data, ttl);
  
  return data;
}
