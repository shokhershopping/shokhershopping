export const fetchProducts = async (page = 1, limit = 12) => {
  try {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_APP_URL}/products/top-selling?page=${page}&limit=${limit}`
    );
    if (!response.ok) {
      throw new Error('Failed to fetch products');
    }
    const data = await response.json();
    return {
      data: data.data, // Your actual products array
      total: data.total, // Total count of products
      page: data.page, // Current page
      totalPages: data.totalPages // Total available pages
    };
  } catch (error) {
    console.error('Error fetching products:', error);
    throw error;
  }
};