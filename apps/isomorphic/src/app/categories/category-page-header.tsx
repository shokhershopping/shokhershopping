'use client';

import React from 'react';
import PageHeader from '@/app/shared/page-header';
import { Button, Title, ActionIcon } from 'rizzui';
import CreateCategory from '@/app/shared/ecommerce/category/create-category';
import { PiPlusBold, PiXBold } from 'react-icons/pi';
import { useModal } from '@/app/shared/modal-views/use-modal';
import { useRouter } from 'next/navigation';
function CreateCategoryModalView() {
  const { closeModal } = useModal();

  return (
    <div className="m-auto px-5 pb-8 pt-5 @lg:pt-6 @2xl:px-7">
      <div className="mb-7 flex items-center justify-between">
        <Title as="h4" className="font-semibold">
          Add Category
        </Title>
        <ActionIcon size="sm" variant="text" onClick={() => closeModal()}>
          <PiXBold className="h-auto w-5" />
        </ActionIcon>
      </div>
      <CreateCategory isModalView={false} />
    </div>
  );
}

type PageHeaderTypes = {
  title: string;
  breadcrumb: { name: string; href?: string }[];
  className?: string;
};

export default function CategoryPageHeader({
  title,
  breadcrumb,
  className,
}: PageHeaderTypes) {
  const { openModal } = useModal();
  const router = useRouter();
  return (
    <>
      <PageHeader title={title} breadcrumb={breadcrumb} className={className}>
        <Button
          onClick={() => router.push('/categories/create')}
          as="span"
          className="cursor-pointer"
        >
          <PiPlusBold className="me-1 h-4 w-4" />
          Add Category
        </Button>
      </PageHeader>
    </>
  );
}
