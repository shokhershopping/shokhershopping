'use client';

import { Controller, useFormContext } from 'react-hook-form';
import { Input, Select } from 'rizzui';
import cn from '@core/utils/class-names';
import FormGroup from '@/app/shared/form-group';
import {
  categoryOption,
  typeOption,
} from '@/app/shared/ecommerce/product/create-edit/form-utils';
import dynamic from 'next/dynamic';
import SelectLoader from '@core/components/loader/select-loader';
import QuillLoader from '@core/components/loader/quill-loader';
import { useEffect, useState } from 'react';
// const Select = dynamic(() => import('rizzui').then((mod) => mod.Select), {
//   ssr: false,
//   loading: () => <SelectLoader />,
// });
const QuillEditor = dynamic(() => import('@core/ui/quill-editor'), {
  ssr: false,
  loading: () => <QuillLoader className="col-span-full h-[143px]" />,
});

export default function ProductSummary({ className }: { className?: string }) {
  const {
    register,
    control,
    formState: { errors },
  } = useFormContext();
  const [categories, setCategories] = useState<any[]>([]);
  useEffect(() => {
    // Simulate fetching categories from an API
    const fetchCategories = async () => {
      // Replace with actual API call
      const res = await fetch(
        `/api/categories?limit=10000`,
        {
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );
      if (!res.ok) {
        throw new Error('Failed to fetch categories');
      }
      const data: any = await res.json();
      const items = Array.isArray(data?.data) ? data.data : [];
      setCategories(
        items.map((cat: any) => ({
          id: cat.id,
          value: cat.id,
          label: cat.name,
          image: cat.imageUrl || cat.image?.url || cat.image?.path || 'https://placehold.co/600x400.png',
        }))
      );
    };
    fetchCategories();
  }, []);

  return (
    <FormGroup
      title="Summary"
      description="Edit your product description and necessary information from here"
      className={cn(className)}
    >
      <Input
        label="Title"
        placeholder="Product title"
        {...register('title')}
        error={errors.title?.message as string}
      />
      <Input
        label="SKU"
        placeholder="Product sku"
        {...register('sku')}
        error={errors.sku?.message as string}
      />

      <Controller
        name="type"
        control={control}
        render={({ field: { onChange, value } }) => (
          <Select
            dropdownClassName="h-auto"
            options={typeOption}
            value={value}
            onChange={onChange}
            label="Product Type"
            error={errors?.type?.message as string}
            getOptionValue={(option) => option.value}
            displayValue={(selected) => {
              const selectedType = typeOption.find(
                (type) => type.value === selected
              );
              return selectedType ? selectedType.label : '';
            }}
          />
        )}
      />

      <Controller
        name="categories"
        control={control}
        render={({ field: { onChange, value } }) => (
          <Select
            options={categories.map((cat) => ({
              value: cat.id,
              label: cat.label,
            }))}
            value={value}
            onChange={onChange}
            label="Categories"
            error={errors?.categories?.message as string}
            getOptionValue={(option) => option.value}
            displayValue={(selected) => {
              const selectedCategory = categories.find(
                (cat) => cat.id === selected
              );
              return selectedCategory ? selectedCategory.label : '';
            }}
            dropdownClassName="h-auto"
          />
        )}
      />

      {/* Brand */}
      <Input
        label="Brand"
        placeholder="Product brand"
        {...register('brand')}
        error={errors.brand?.message as string}
      />

      <Controller
        control={control}
        name="description"
        render={({ field: { onChange, value } }) => (
          <QuillEditor
            value={value}
            onChange={onChange}
            label="Description"
            className="col-span-full [&_.ql-editor]:min-h-[100px]"
            labelClassName="font-medium text-gray-700 dark:text-gray-600 mb-1.5"
          />
        )}
      />
    </FormGroup>
  );
}
