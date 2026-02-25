export const fetchProducts = async (page = 1, limit = 12) => {
  try {
    const response = await fetch(
      `/api/products/top-selling?page=${page}&limit=${limit}`
    );
    if (!response.ok) {
      return { data: [], total: 0, page: 1, totalPages: 0 };
    }
    const data = await response.json();
    return {
      data: data.data || [],
      total: data.total || 0,
      page: data.page || 1,
      totalPages: data.totalPages || 0,
    };
  } catch (error) {
    return { data: [], total: 0, page: 1, totalPages: 0 };
  }
};
