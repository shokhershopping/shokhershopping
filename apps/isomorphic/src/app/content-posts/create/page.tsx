import CreateEditContentPost from '@/app/shared/content-posts/create-edit-content-post';
import PageHeader from '@/app/shared/page-header';
import { routes } from '@/config/routes';
import { metaObject } from '@/config/site.config';

export const metadata = {
  ...metaObject('Create Content Post'),
};

const pageHeader = {
  title: 'Create Content Post',
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
      name: 'Create',
    },
  ],
};

export default function CreateContentPostPage() {
  return (
    <>
      <PageHeader title={pageHeader.title} breadcrumb={pageHeader.breadcrumb} />
      <CreateEditContentPost />
    </>
  );
}
