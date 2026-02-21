import Link from 'next/link';
import { Metadata } from 'next';
import { PiPlusBold } from 'react-icons/pi';
import { productData } from '@/app/shared/ecommerce/product/create-edit/form-utils';
import CreateEditProduct from '@/app/shared/ecommerce/product/create-edit';
import PageHeader from '@/app/shared/page-header';
import { metaObject } from '@/config/site.config';
import { Button } from 'rizzui/button';
import { routes } from '@/config/routes';
import toast from 'react-hot-toast';
import { getBaseUrl } from '@/lib/get-base-url';

type Props = {
  params: Promise<{ slug: string }>;
};

/**
 * for dynamic metadata
 * @link: https://nextjs.org/docs/app/api-reference/functions/generate-metadata#generatemetadata-function
 */

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  // read route params
  const slug = (await params).slug;

  return metaObject(`Edit ${slug}`);
}

const pageHeader = {
  title: 'Edit Product',
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
      name: 'Edit',
    },
  ],
};

export default async function EditProductPage({ params }: any) {
  const slug = (await params).slug;

  // Fetch product data based on slug
  const productResponse = await fetch(
    `${getBaseUrl()}/api/products/${slug}`,
    {
      cache: 'no-store',
    }
  );
  if (!productResponse.ok) {
    toast.error('Failed to fetch product data');
    throw new Error('Failed to fetch product data');
  }
  const data: any = await productResponse.json();
  const productData = data.data;
  console.log('Product Data:', productData);
  if (!productData) {
    toast.error('Product not found');
    return <div>Product not found</div>;
  }

  const transformedProductData = {
    title: productData.name,
    sku: productData.sku,
    type: productData.kind,
    categories: productData.categories?.[0]?.categoryId || '',
    description: productData.description,
    price: productData.price,
    salePrice: productData.salePrice,
    currentStock: productData.stock,
    productImages: (productData.images || []).map((img: any) => {
      return {
        ...img,
        name: img.originalname,
        url:
          img.url || img.path ||
          'https://placehold.co/600x400.png',
      };
    }),
    brand: productData.brand,
    productVariants:
      (productData.variableProducts || []).map((vp: any) => ({
        id: vp.id,
        name: vp.name,
        description: vp.description || 'No description provided',
        images:
          (vp.images || []).map((img: any) => {
            return {
              ...img,
              name: img.originalname,
              url:
                img.url || img.path ||
                'https://placehold.co/600x400.png',
            };
          }),
        color: vp.specifications?.color || 'Default Color',
        size: vp.specifications?.size || 'Default Size',
        price: vp.price || 0,
        salePrice: vp.salePrice || vp.price || 0,
        stock: parseInt(String(vp.stock || 0)) || 0,
        sku: vp.sku || 'SKU-' + Date.now(),
        status: vp.status || 'draft',
      })),
    pageTitle: productData.pageTitle || '',
    metaDescription: productData.metaDescription || '',
    metaKeywords: productData.metaKeywords || '',
    productUrl: productData.productUrl || '',
    tags: productData.tags || [],
  };
  console.log('Transformed Product Data:', transformedProductData);
  return (
    <>
      <PageHeader title={pageHeader.title} breadcrumb={pageHeader.breadcrumb}>
        <Link
          href={routes.eCommerce.createProduct}
          className="mt-4 w-full @lg:mt-0 @lg:w-auto"
        >
          <Button as="span" className="w-full @lg:w-auto">
            <PiPlusBold className="me-1.5 h-[17px] w-[17px]" />
            Add Product
          </Button>
        </Link>
      </PageHeader>

      <CreateEditProduct slug={slug} product={transformedProductData} />
    </>
  );
}
