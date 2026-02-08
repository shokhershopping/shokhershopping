'use client';

import { Controller, useFieldArray, useFormContext } from 'react-hook-form';
import { Input, Button, ActionIcon, Textarea, Select } from 'rizzui';
import cn from '@core/utils/class-names';
import FormGroup from '@/app/shared/form-group';
import { useCallback, useState, useEffect } from 'react';
import TrashIcon from '@core/components/icons/trash';
import { PiPlusBold } from 'react-icons/pi';
import UploadZone from '@core/ui/file-upload/upload-zone';
import { specificationOption, variantOption } from './form-utils';

// Default variant data
const defaultVariant = {
  name: '',
  description: '',
  images: [],
  color: '',
  size: '',
  price: 0,
  salePrice: 0,
  stock: 0,
  sku: '',
  status: 'PUBLISHED',
};

export default function ProductVariants({ className }: { className?: string }) {
  const {
    control,
    register,
    formState: { errors },
    getValues,
    setValue,
    watch,
  } = useFormContext();

  const {
    fields: variants,
    append: appendVariant,
    remove: removeVariant,
  } = useFieldArray({
    control,
    name: 'productVariants',
  });

  // Initialize uploadedFiles state with existing form values
  const [uploadedFiles, setUploadedFiles] = useState<Record<number, any[]>>(
    () => {
      const initialFiles: Record<number, any[]> = {};
      const currentVariants = getValues('productVariants') || [];
      currentVariants.forEach((variant: any, index: number) => {
        initialFiles[index] = variant.images || [];
      });
      return initialFiles;
    }
  );

  // Watch for changes in productVariants to keep uploadedFiles in sync
  const watchedVariants = watch('productVariants');

  useEffect(() => {
    if (watchedVariants) {
      const newUploadedFiles: Record<number, any[]> = {};
      watchedVariants.forEach((variant: any, index: number) => {
        newUploadedFiles[index] = variant.images || [];
      });
      setUploadedFiles(newUploadedFiles);
    }
  }, [watchedVariants]);

  const addVariant = useCallback(() => {
    appendVariant({ ...defaultVariant });
    // Initialize the new variant's uploadedFiles entry
    setUploadedFiles((prev) => ({
      ...prev,
      [variants.length]: [],
    }));
  }, [appendVariant, variants.length]);

  const handleFilesChange = useCallback(
    (files: any[], variantIndex: number) => {
      // Update local state
      setUploadedFiles((prev) => ({
        ...prev,
        [variantIndex]: files,
      }));

      // Update form state
      setValue(`productVariants.${variantIndex}.images`, files, {
        shouldValidate: true,
      });
    },
    [setValue]
  );

  return (
    <FormGroup
      title="Product Variants"
      description="Add your product variants here"
      className={cn(className)}
    >
      {variants.map((variant, variantIndex) => (
        <div
          key={variant.id}
          className="col-span-full mb-5 space-y-5 border-b border-gray-200 pb-5"
        >
          <div className="flex flex-wrap gap-4 xl:gap-7">
            <Input
              type="text"
              label="Variant Name"
              placeholder="e.g. Premium Edition"
              className="min-w-[200px] flex-grow"
              error={
                (errors?.productVariants as any)?.[variantIndex]?.name?.message
              }
              {...register(`productVariants.${variantIndex}.name`, {
                required: 'Name is required',
                minLength: {
                  value: 3,
                  message: 'Name must be at least 3 characters',
                },
              })}
            />

            <Input
              type="number"
              label="Price"
              placeholder="0.00"
              className="min-w-[150px] flex-grow"
              prefix={'$'}
              error={
                (errors?.productVariants as any)?.[variantIndex]?.price?.message
              }
              {...register(`productVariants.${variantIndex}.price`, {
                valueAsNumber: true,
                required: 'Price is required',
                min: {
                  value: 0.01,
                  message: 'Price must be positive',
                },
              })}
            />

            <Input
              type="number"
              label="Sale Price"
              placeholder="0.00"
              className="min-w-[150px] flex-grow"
              prefix={'$'}
              error={
                (errors?.productVariants as any)?.[variantIndex]?.salePrice
                  ?.message
              }
              {...register(`productVariants.${variantIndex}.salePrice`, {
                valueAsNumber: true,
                min: {
                  value: 0.01,
                  message: 'Sale price must be positive',
                },
              })}
            />

            <Input
              type="number"
              label="Stock"
              placeholder="0"
              className="min-w-[100px] flex-grow"
              error={
                (errors?.productVariants as any)?.[variantIndex]?.stock?.message
              }
              {...register(`productVariants.${variantIndex}.stock`, {
                valueAsNumber: true,
                required: 'Stock is required',
                min: {
                  value: 0,
                  message: 'Stock cannot be negative',
                },
              })}
            />

            <Input
              type="text"
              label="SKU"
              placeholder="SKU-12345"
              className="min-w-[150px] flex-grow"
              error={
                (errors?.productVariants as any)?.[variantIndex]?.sku?.message
              }
              {...register(`productVariants.${variantIndex}.sku`, {
                required: 'SKU is required',
              })}
            />

            {variants.length > 1 && (
              <ActionIcon
                onClick={() => removeVariant(variantIndex)}
                variant="flat"
                className="mt-7 shrink-0"
              >
                <TrashIcon className="h-4 w-4" />
              </ActionIcon>
            )}
          </div>

          <Textarea
            label="Description"
            placeholder="Enter variant description..."
            className="col-span-full"
            error={
              (errors?.productVariants as any)?.[variantIndex]?.description
                ?.message
            }
            {...register(`productVariants.${variantIndex}.description`, {
              minLength: {
                value: 10,
                message: 'Description must be at least 10 characters',
              },
            })}
          />

          <FormGroup
            title="Variant Images"
            description="Upload images specific to this variant"
            className="col-span-full"
          >
            <UploadZone
              name={`productVariants.${variantIndex}.images`}
              getValues={() => uploadedFiles[variantIndex] || []}
              setValue={(name: string, files: any[]) => {
                handleFilesChange(files, variantIndex);
              }}
              className="col-span-full"
              onUploadedFileChange={(files) => {
                handleFilesChange(files, variantIndex);
              }}
            />
          </FormGroup>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Controller
              name={`productVariants.${variantIndex}.color`}
              control={control}
              render={({ field: { onChange, value } }) => (
                <Input
                  type="text"
                  value={value}
                  onChange={onChange}
                  label="Color"
                  placeholder="e.g. Red"
                  error={
                    (errors?.productVariants as any)?.[variantIndex]?.color
                      ?.message
                  }
                />
              )}
            />

            <Controller
              name={`productVariants.${variantIndex}.size`}
              control={control}
              render={({ field: { onChange, value } }) => (
                <Select
                  options={variantOption}
                  value={value}
                  onChange={onChange}
                  label="Size"
                  placeholder="Select size"
                  error={
                    (errors?.productVariants as any)?.[variantIndex]?.size
                      ?.message
                  }
                  getOptionValue={(option) => option.value}
                  displayValue={(selected) =>
                    variantOption.find((opt) => opt.value === selected)
                      ?.label || ''
                  }
                  dropdownClassName="h-auto"
                />
              )}
            />
          </div>
        </div>
      ))}

      <Button
        onClick={addVariant}
        variant="outline"
        className="col-span-full ml-auto w-auto"
      >
        <PiPlusBold className="me-2 h-4 w-4" /> Add Variant
      </Button>
    </FormGroup>
  );
}
