import Link from 'next/link';
import { PiPlusBold } from 'react-icons/pi';
import { routes } from '@/config/routes';
import { Button } from 'rizzui/button';
import PageHeader from '@/app/shared/page-header';
import ProductsTable from '@/app/shared/ecommerce/product/product-list/table';
import { metaObject } from '@/config/site.config';
import ExportButton from '@/app/shared/export-button';
import { getProducts } from 'firebase-config/services/product.service';

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
  const result = await getProducts(1000000, 1);

  const rawItems = Array.isArray(result?.data) ? result.data : [];

  const productsData = rawItems.map((product: any) => {
    return {
    id: product.id,
    name: product.name || 'Unknown Product',
    category: product.categoryNames?.[0] || 'Uncategorized',
    image: product.imageUrls?.length
      ? product.imageUrls[0]
      : (product.images?.[0]?.url || product.images?.[0]?.path || 'https://placehold.co/600x400.png'),
    sku: product.sku || 'N/A',
    stock: product.variableProducts?.length > 0
      ? product.variableProducts.reduce((sum: number, v: any) => sum + (v.stock || 0), 0)
      : (product.stock || 0),
    price: product.price || 0,
    status: product.status || 'DRAFT',
    rating: product.averageRating ?? 0,
    // Include variant data for stock view
    variableProducts: product.variableProducts?.map((variant: any) => {
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
        color: parsedSpecs.color || parsedSpecs.Color || '',
        size: parsedSpecs.size || parsedSpecs.Size || '',
        stock: variant.stock,
        sku: variant.sku,
      };
    }) || [],
    };
  });

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
