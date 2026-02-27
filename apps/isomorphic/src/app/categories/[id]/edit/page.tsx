import { Button } from 'rizzui/button';
import { routes } from '@/config/routes';
import PageHeader from '@/app/shared/page-header';
import CreateCategory from '@/app/shared/ecommerce/category/create-category';
import Link from 'next/link';
import { metaObject } from '@/config/site.config';
import { Metadata } from 'next';
import { getCategoryById } from 'firebase-config/services/category.service';

type Props = {
  params: Promise<{ id: string }>;
};

/**
 * for dynamic metadata
 * @link: https://nextjs.org/docs/app/api-reference/functions/generate-metadata#generatemetadata-function
 */

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  // read route params
  const id = (await params).id;

  return metaObject(`Edit ${id}`);
}

const pageHeader = {
  title: 'Edit Category',
  breadcrumb: [
    {
      href: routes.eCommerce.dashboard,
      name: 'Home',
    },
    {
      href: routes.eCommerce.categories,
      name: 'Categories',
    },
    {
      name: 'Edit',
    },
  ],
};

export const dynamic = 'force-dynamic';

export default async function EditCategoryPage({ params }: any) {
  const id = (await params).id;
  const result = await getCategoryById(id);
  const cat = result.status === 'success' ? JSON.parse(JSON.stringify(result.data)) : null;
  if (!cat) {
    return <div>Category not found</div>;
  }
  const categoryData = {
    id: cat.id,
    name: cat.name,
    description: cat.description,
    parentCategory: cat.parentId ? cat.parentId : '',
    isFeatured: cat.isFeatured ?? false,
    isSlide: cat.isSlide ?? false,
    isMenu: cat.isMenu ?? false,
    image: cat.image?.url || cat.image?.path || null,
  };
  return (
    <>
      <PageHeader title={pageHeader.title} breadcrumb={pageHeader.breadcrumb}>
        <Link
          href={routes.eCommerce.categories}
          className="mt-4 w-full @lg:mt-0 @lg:w-auto"
        >
          <Button as="span" className="w-full @lg:w-auto" variant="outline">
            Cancel
          </Button>
        </Link>
      </PageHeader>
      <CreateCategory id={id} category={categoryData} />
    </>
  );
}
