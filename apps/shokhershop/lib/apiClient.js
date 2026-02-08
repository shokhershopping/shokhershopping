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
        `${process.env.NEXT_PUBLIC_APP_URL}/categories`
      );
      if (!response.ok)
        throw new Error(`HTTP error! status: ${response.status}`);
      const data = await response.json();

      // Process categories into nested structure
      const processedData = this.buildCategoryTree(data.data);

      if (this.cacheEnabled) {
        this.cache.set(cacheKey, {
          data: processedData,
          timestamp: Date.now(),
        });
      }

      return processedData;
    } catch (error) {
      console.error("Failed to fetch categories:", error);
      throw error;
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
        `${process.env.NEXT_PUBLIC_APP_URL}/products/search?${params.toString()}`
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

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
      console.error("Failed to search products:", error);
      throw error;
    }
  }
}
export const apiClient = new ApiClient();
