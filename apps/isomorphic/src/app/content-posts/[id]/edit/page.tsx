import type { Metadata } from 'next';
import CreateEditContentPost from '@/app/shared/content-posts/create-edit-content-post';
import PageHeader from '@/app/shared/page-header';
import { routes } from '@/config/routes';
import { metaObject } from '@/config/site.config';

type EditContentPostPageProps = {
  params: Promise<{ id: string }>;
};

export function generateMetadata(): Metadata {
  return metaObject('Edit Content Post');
}

const pageHeader = {
  title: 'Edit Content Post',
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
      name: 'Edit',
    },
  ],
};

export default async function EditContentPostPage({
  params,
}: EditContentPostPageProps) {
  const { id } = await params;

  return (
    <>
      <PageHeader title={pageHeader.title} breadcrumb={pageHeader.breadcrumb} />
      <CreateEditContentPost postId={id} />
    </>
  );
}
