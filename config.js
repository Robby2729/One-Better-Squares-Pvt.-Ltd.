const API_BASE_URL = 'http://localhost:5000/api';

// Cache utility
const cacheData = (key, data, ttlMinutes = 5) => {
    const now = new Date();
    const item = {
        data: data,
        expiry: now.getTime() + (ttlMinutes * 60 * 1000)
    };
    localStorage.setItem(key, JSON.stringify(item));
};

const getCachedData = (key) => {
    const itemStr = localStorage.getItem(key);
    if (!itemStr) return null;
    const item = JSON.parse(itemStr);
    const now = new Date();
    if (now.getTime() > item.expiry) {
        localStorage.removeItem(key);
        return null;
    }
    return item.data;
};

// Fetch wrapper with cache support
const fetchWithCache = async (endpoint, options = {}, useCache = false, cacheKey = '', ttlMinutes = 5) => {
    if (useCache && cacheKey) {
        const cached = getCachedData(cacheKey);
        if (cached) return cached;
    }

    const res = await fetch(`${API_BASE_URL}${endpoint}`, options);
    const data = await res.json();

    if (useCache && cacheKey && data.success) {
        cacheData(cacheKey, data, ttlMinutes);
    }
    return data;
};

window.api = {
    API_BASE_URL,
    fetchWithCache,
    cacheData,
    getCachedData
};
