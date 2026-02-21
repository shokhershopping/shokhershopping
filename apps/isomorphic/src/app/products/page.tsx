import Link from 'next/link';
import { PiPlusBold } from 'react-icons/pi';
import { routes } from '@/config/routes';
import { Button } from 'rizzui/button';
import PageHeader from '@/app/shared/page-header';
import ProductsTable from '@/app/shared/ecommerce/product/product-list/table';
import { metaObject } from '@/config/site.config';
import ExportButton from '@/app/shared/export-button';
import toast from 'react-hot-toast';
import { any } from 'zod';
import { getBaseUrl } from '@/lib/get-base-url';

export const metadata = {
  ...metaObject('Products'),
};

const pageHeader = {
  title: 'Products',
  breadcrumb: [
    {
      href: routes.eCommerce.dashboard,
      name: 'Dashboard',
    },
    {
      href: routes.eCommerce.products,
      name: 'Products',
    },
    {
      name: 'List',
    },
  ],
};

export default async function ProductsPage() {
  const products = await fetch(
    `${getBaseUrl()}/api/products?limit=1000000`,
    {
      cache: 'no-store',
    }
  );

  if (!products.ok) {
    toast.error('Failed to fetch products');
    throw new Error('Failed to fetch products');
  }

  const data: any = await products.json();
  console.log('Products Data:', data);

  // Log first product with variants for debugging
  const firstProductWithVariants = data.data?.find((p: any) => p.variableProducts?.length > 0);
  if (firstProductWithVariants) {
    console.log('Sample product with variants:', JSON.stringify(firstProductWithVariants, null, 2));
  }

  const rawItems = Array.isArray(data?.data) ? data.data : [];

  const productsData = rawItems.map((product: any) => {
    console.log(`Processing product: ${product.name}, categories:`, product.categories);
    return {
    id: product.id,
    name: product.name || 'Unknown Product',
    // Extract category name from the categories array
    category: product.categories?.[0]?.category?.name || 'Uncategorized',
    image: product.images?.length
      ? (product.images[0].url || product.images[0].path || 'https://placehold.co/600x400.png')
      : 'https://placehold.co/600x400.png',
    sku: product.sku || 'N/A',
    stock: product.stock || 0,
    price: product.price || 0,
    status: product.status || 'DRAFT',
    rating: product.rating || 5,
    // Include variant data for stock view
    variableProducts: product.variableProducts?.map((variant: any) => {
      // Parse specifications JSON if it exists
      let parsedSpecs: any = {};
      if (typeof variant.specifications === 'string') {
        try {
          parsedSpecs = JSON.parse(variant.specifications);
        } catch (e) {
          parsedSpecs = {};
        }
      } else if (typeof variant.specifications === 'object' && variant.specifications !== null) {
        parsedSpecs = variant.specifications;
      }

      return {
        id: variant.id,
        name: variant.name,
        // Check direct fields, then specifications, then try to parse from name
        color: parsedSpecs.color || parsedSpecs.Color || '',
        size: parsedSpecs.size || parsedSpecs.Size || '',
        stock: variant.stock,
        sku: variant.sku,
      };
    }) || [],
    };
  });
  console.log('✅ Transformed Products Data sample:', productsData[0]);
  console.log('First product variants:', productsData[0]?.variableProducts);
  return (
    <>
      <PageHeader title={pageHeader.title} breadcrumb={pageHeader.breadcrumb}>
        <div className="mt-4 flex items-center gap-3 @lg:mt-0">
          <ExportButton
            data={productsData}
            fileName="product_data"
            header="ID,Name,Category,Product Thumbnail,SKU,Stock,Price,Status,Rating"
          />
          <Link
            href={routes.eCommerce.createProduct}
            className="w-full @lg:w-auto"
          >
            <Button as="span" className="w-full @lg:w-auto">
              <PiPlusBold className="me-1.5 h-[17px] w-[17px]" />
              Add Product
            </Button>
          </Link>
        </div>
      </PageHeader>

      <ProductsTable productsData={productsData} pageSize={10} />
    </>
  );
}
