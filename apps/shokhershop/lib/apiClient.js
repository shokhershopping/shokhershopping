// lib/apiClient.js
class ApiClient {
  constructor() {
    this.cacheEnabled = false;
    this.cache = new Map();
    this.cacheDuration = 5 * 60 * 1000; // 5 minutes cache
  }

  async fetchCategories() {
    const cacheKey = "categories";
    const cached = this.cache.get(cacheKey);

    // Skip cache check if disabled
    if (this.cacheEnabled) {
      const cached = this.cache.get(cacheKey);
      if (cached && Date.now() - cached.timestamp < this.cacheDuration) {
        return cached.data;
      }
    }
    try {
      const response = await fetch(
        `/api/categories`
      );
      if (!response.ok) return [];
      const data = await response.json();

      // Process categories into nested structure
      const processedData = this.buildCategoryTree(data.data || []);

      if (this.cacheEnabled) {
        this.cache.set(cacheKey, {
          data: processedData,
          timestamp: Date.now(),
        });
      }

      return processedData;
    } catch (error) {
      return [];
    }
  }

  buildCategoryTree(categories, parentId = null) {
    return categories
      .filter((category) => category.parentId === parentId)
      .map((category) => ({
        ...category,
        children: this.buildCategoryTree(categories, category.id),
      }));
  }

  async searchProducts(query, options = {}) {
    const { limit = 10, page = 1, category, status = "PUBLISHED" } = options;

    // Build query string
    const params = new URLSearchParams({
      q: query,
      limit: limit.toString(),
      page: page.toString(),
      status: status,
    });

    if (category) {
      params.append("category", category);
    }

    const cacheKey = `search_${params.toString()}`;

    // Check cache if enabled
    if (this.cacheEnabled) {
      const cached = this.cache.get(cacheKey);
      if (cached && Date.now() - cached.timestamp < this.cacheDuration) {
        return cached.data;
      }
    }

    try {
      const response = await fetch(
        `/api/products/search?${params.toString()}`
      );

      if (!response.ok) return { data: [], total: 0 };

      const data = await response.json();

      // Cache the results if enabled
      if (this.cacheEnabled) {
        this.cache.set(cacheKey, {
          data: data,
          timestamp: Date.now(),
        });
      }

      return data;
    } catch (error) {
      return { data: [], total: 0 };
    }
  }
}
export const apiClient = new ApiClient();
