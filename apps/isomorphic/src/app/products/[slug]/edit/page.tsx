import Link from 'next/link';
import { Metadata } from 'next';
import { PiPlusBold } from 'react-icons/pi';
import CreateEditProduct from '@/app/shared/ecommerce/product/create-edit';
import PageHeader from '@/app/shared/page-header';
import { metaObject } from '@/config/site.config';
import { Button } from 'rizzui/button';
import { routes } from '@/config/routes';
import { getProductById } from 'firebase-config/services/product.service';
import { inferPresetFromSpecs, buildAttributesFromSpecs } from '@/app/shared/ecommerce/product/create-edit/form-utils';

type Props = {
  params: Promise<{ slug: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
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

export const dynamic = 'force-dynamic';

export default async function EditProductPage({ params }: any) {
  const slug = (await params).slug;

  const result = await getProductById(slug);
  if (result.status !== 'success' || !result.data) {
    return <div>Product not found</div>;
  }
  const productData = JSON.parse(JSON.stringify(result.data));

  // Infer product attributes from existing variant specifications
  const firstVariantSpecs = productData.variableProducts?.[0]?.specifications || {};
  const specKeys = Object.keys(firstVariantSpecs).filter(
    (k) => k !== 'colorValue' // exclude internal keys
  );
  const inferredPreset = inferPresetFromSpecs(specKeys);
  const inferredAttributes = buildAttributesFromSpecs(specKeys, inferredPreset);

  const transformedProductData = {
    title: productData.name,
    sku: productData.sku,
    type: productData.kind,
    categories: productData.categoryIds?.[0] || '',
    description: productData.description,
    price: productData.price,
    salePrice: productData.salePrice,
    currentStock: productData.stock,
    productImages: (productData.imageUrls || []).map((url: string, i: number) => ({
      id: `img-${i}`,
      name: `image-${i}`,
      url: url || 'https://placehold.co/600x400.png',
    })),
    brand: productData.brand,
    deliveryTime: productData.deliveryTime?.replace(/\s*Days?/i, '') || '5',
    returnTime: productData.returnTime?.replace(/\s*Days?/i, '') || '15',
    productAttributePreset: inferredPreset,
    productAttributes: inferredAttributes,
    productVariants:
      (productData.variableProducts || []).map((vp: any) => ({
        id: vp.id,
        name: vp.name,
        description: vp.description || '',
        images:
          (vp.imageUrls || []).map((url: string, i: number) => ({
            id: `vimg-${i}`,
            name: `variant-image-${i}`,
            url: url || 'https://placehold.co/600x400.png',
          })),
        specifications: vp.specifications || {},
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
