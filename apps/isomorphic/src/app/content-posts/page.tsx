import Link from 'next/link';
import { PiPlusBold } from 'react-icons/pi';
import { Button } from 'rizzui/button';
import ContentPostList from '@/app/shared/content-posts/content-post-list';
import PageHeader from '@/app/shared/page-header';
import { routes } from '@/config/routes';
import { metaObject } from '@/config/site.config';

export const metadata = {
  ...metaObject('Content Posts'),
};

export const dynamic = 'force-dynamic';

const pageHeader = {
  title: 'Content Posts',
  breadcrumb: [
    {
      href: routes.eCommerce.dashboard,
      name: 'Dashboard',
    },
    {
      href: routes.eCommerce.contentPosts,
      name: 'Content Posts',
    },
    {
      name: 'List',
    },
  ],
};

export default function ContentPostsPage() {
  return (
    <>
      <PageHeader title={pageHeader.title} breadcrumb={pageHeader.breadcrumb}>
        <Link
          href={routes.eCommerce.createContentPost}
          className="mt-4 w-full @lg:mt-0 @lg:w-auto"
        >
          <Button as="span" className="w-full @lg:w-auto">
            <PiPlusBold className="me-1.5 size-[17px]" />
            Add Content Post
          </Button>
        </Link>
      </PageHeader>

      <ContentPostList />
    </>
  );
}
