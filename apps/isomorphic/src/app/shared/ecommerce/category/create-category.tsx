'use client';

import { useEffect, useState } from 'react';
import dynamic from 'next/dynamic';
import { SubmitHandler, Controller } from 'react-hook-form';
import SelectLoader from '@core/components/loader/select-loader';
import QuillLoader from '@core/components/loader/quill-loader';
import { Button, Input, Select, Text, Title, Switch } from 'rizzui';
import cn from '@core/utils/class-names';
import { Form } from '@core/ui/form';
import {
  CategoryFormInput,
  categoryFormSchema,
} from '@/validators/create-category.schema';
import UploadZone from '@core/ui/file-upload/upload-zone';
import { useFirebaseAuth } from '@/lib/firebase-auth-provider';
import Image from 'next/image';
import { useRouter } from 'next/navigation';

const QuillEditor = dynamic(() => import('@core/ui/quill-editor'), {
  ssr: false,
  loading: () => <QuillLoader className="col-span-full h-[168px]" />,
});

const parentCategoryOption = [
  { value: 'fruits', label: 'Fruits' },
  { value: 'grocery', label: 'Grocery' },
  { value: 'meat', label: 'Meat' },
  { value: 'cat food', label: 'Cat Food' },
];

function HorizontalFormBlockWrapper({
  title,
  description,
  children,
  className,
  isModalView = true,
}: React.PropsWithChildren<{
  title: string;
  description?: string;
  className?: string;
  isModalView?: boolean;
}>) {
  return (
    <div
      className={cn(
        className,
        isModalView ? '@5xl:grid @5xl:grid-cols-6' : ' '
      )}
    >
      {isModalView && (
        <div className="col-span-2 mb-6 pe-4 @5xl:mb-0">
          <Title as="h6" className="font-semibold">
            {title}
          </Title>
          <Text className="mt-1 text-sm text-gray-500">{description}</Text>
        </div>
      )}
      <div
        className={cn(
          'grid grid-cols-2 gap-3 @lg:gap-4 @2xl:gap-5',
          isModalView ? 'col-span-4' : ' '
        )}
      >
        {children}
      </div>
    </div>
  );
}

export default function CreateCategory({
  id,
  category,
  isModalView = true,
}: {
  id?: string;
  isModalView?: boolean;
  category?: CategoryFormInput;
}) {
  const [isLoading, setLoading] = useState(false);
  const { getToken } = useFirebaseAuth();
  const [uploadedFiles, setUploadedFiles] = useState<any[]>([]);
  const [existingCategories, setExistingCategories] = useState<any[]>([]);
  // Don't use category prop for edit mode - we'll fetch from API instead
  const [currentCategory, setCurrentCategory] = useState<CategoryFormInput | undefined>(id ? undefined : category);
  const router = useRouter();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = await getToken();

        // Fetch all categories for parent category dropdown
        const categoriesRes = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/categories?limit=10000`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
        if (!categoriesRes.ok) {
          throw new Error('Failed to fetch categories');
        }
        const categoriesData: any = await categoriesRes.json();
        setExistingCategories(categoriesData?.data || []);

        // If editing (id exists), fetch the current category data
        if (id) {
          const categoryRes = await fetch(
            `${process.env.NEXT_PUBLIC_API_URL}/categories/${id}`,
            {
              headers: {
                Authorization: `Bearer ${token}`,
              },
            }
          );
          if (!categoryRes.ok) {
            throw new Error('Failed to fetch category');
          }
          const categoryData: any = await categoryRes.json();
          const cat = categoryData?.data;

          // Map API data to form data
          setCurrentCategory({
            name: cat.name,
            description: cat.description,
            parentCategory: cat.parentId || '',
            isFeatured: cat.isFeatured ?? false,
            isSlide: cat.isSlide ?? false,
            isMenu: cat.isMenu ?? false,
          });
        }
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };
    fetchData();
  }, [getToken, id]);

  const onSubmit: SubmitHandler<CategoryFormInput> = async (data) => {
    try {
      setLoading(true);
      const token = await getToken();

      // Create the request body in the correct format
      const requestBody = {
        category: {
          name: data.name,
          description: data.description,
          isFeatured: data.isFeatured || false,
          isSlide: data.isSlide || false,
          isMenu: data.isMenu || false,
          ...(data.parentCategory && {
            parentId:
              existingCategories.find((cat) => cat.id === data.parentCategory)
                ?.id || null,
          }),
        },
        // Include image filename if files were uploaded
        ...(uploadedFiles[0]?.filename && {
          imageFilename: uploadedFiles[0].filename,
        }),
      };

      console.log('Submitting category data:', requestBody);

      let url = `${process.env.NEXT_PUBLIC_API_URL}/categories`;
      if (id && category) {
        // If editing an existing category, include the ID in the URL
        url = `${process.env.NEXT_PUBLIC_API_URL}/categories/${id}`;
      }

      const res = await fetch(url, {
        method: id ? 'PUT' : 'POST', // Use PUT for updates, POST for new categories
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(requestBody), // Stringify the properly formatted object
      });

      if (!res.ok) {
        throw new Error('Failed to create category');
      }

      const response = await res.json();
      console.log('Category created:', response);

      // Reset form after successful submission
      window.location.reload();
    } catch (error) {
      console.error('Error creating category:', error);
      // You might want to show an error message to the user here
    } finally {
      setLoading(false);
    }
  };

  // Show loading state while fetching category data for edit mode
  if (id && !currentCategory) {
    return <div>Loading...</div>;
  }

  return (
    <Form<CategoryFormInput>
      validationSchema={categoryFormSchema}
      onSubmit={onSubmit}
      useFormProps={{
        mode: 'onChange',
        defaultValues: currentCategory || {
          name: '',
          parentCategory: '',
          description: '',
          isFeatured: false,
          isSlide: false,
          isMenu: false,
        },
      }}
      className="isomorphic-form flex flex-grow flex-col @container"
    >
      {({ register, control, formState: { errors, isValid }, setValue }) => (
        <>
          <div className="flex-grow pb-10">
            <div
              className={cn(
                'grid grid-cols-1',
                isModalView
                  ? 'grid grid-cols-1 gap-8 divide-y divide-dashed divide-gray-200 @2xl:gap-10 @3xl:gap-12 [&>div]:pt-7 first:[&>div]:pt-0 @2xl:[&>div]:pt-9 @3xl:[&>div]:pt-11'
                  : 'gap-5'
              )}
            >
              <HorizontalFormBlockWrapper
                title={'Add new category:'}
                description={'Edit your category information from here'}
                isModalView={isModalView}
              >
                <Input
                  label="Category Name"
                  placeholder="category name"
                  {...register('name')}
                  error={errors.name?.message}
                />
                <Controller
                  name="parentCategory"
                  control={control}
                  render={({ field: { onChange, value } }) => (
                    <Select
                      dropdownClassName="!z-0"
                      options={existingCategories.map((cat) => ({
                        value: cat.id,
                        label: cat.name,
                      }))}
                      value={
                        existingCategories.find((cat) => cat.id === value)
                          ?.name || ''
                      }
                      onChange={onChange}
                      label="Parent Category"
                      error={errors?.parentCategory?.message as string}
                      getOptionValue={(option) => option.value}
                      getOptionDisplayValue={(option) => option.label}
                    />
                  )}
                />

                <div className="col-span-2">
                  <Controller
                    control={control}
                    name="description"
                    render={({ field: { onChange, value } }) => (
                      <QuillEditor
                        value={value}
                        onChange={onChange}
                        label="Description"
                        className="[&>.ql-container_.ql-editor]:min-h-[100px]"
                        labelClassName="font-medium text-gray-700 dark:text-gray-600 mb-1.5"
                      />
                    )}
                  />
                </div>
              </HorizontalFormBlockWrapper>

              <HorizontalFormBlockWrapper
                title="Category Display Settings"
                description="Configure where this category should appear"
                isModalView={isModalView}
              >
                <div className="col-span-2 space-y-4">
                  <Controller
                    name="isFeatured"
                    control={control}
                    render={({ field: { value, onChange } }) => (
                      <div className="flex items-center justify-between">
                        <div>
                          <Text className="font-medium text-gray-700">Featured Category</Text>
                          <Text className="text-sm text-gray-500">Show this category in featured sections</Text>
                        </div>
                        <Switch
                          checked={value}
                          onChange={onChange}
                        />
                      </div>
                    )}
                  />

                  <Controller
                    name="isSlide"
                    control={control}
                    render={({ field: { value, onChange } }) => (
                      <div className="flex items-center justify-between">
                        <div>
                          <Text className="font-medium text-gray-700">Show in Slider</Text>
                          <Text className="text-sm text-gray-500">Display this category in homepage slider</Text>
                        </div>
                        <Switch
                          checked={value}
                          onChange={onChange}
                        />
                      </div>
                    )}
                  />

                  <Controller
                    name="isMenu"
                    control={control}
                    render={({ field: { value, onChange } }) => (
                      <div className="flex items-center justify-between">
                        <div>
                          <Text className="font-medium text-gray-700">Show in Menu</Text>
                          <Text className="text-sm text-gray-500">Include this category in navigation menu</Text>
                        </div>
                        <Switch
                          checked={value}
                          onChange={onChange}
                        />
                      </div>
                    )}
                  />
                </div>
              </HorizontalFormBlockWrapper>
              <HorizontalFormBlockWrapper
                title="Upload new thumbnail image"
                description="Upload your product image gallery here"
                isModalView={isModalView}
              >
                <UploadZone
                  name="images"
                  getValues={() => uploadedFiles} // Pass current uploaded files
                  setValue={(name: any, files: any) => {
                    setUploadedFiles(files);
                    setValue('images', files, { shouldValidate: true });
                  }}
                  className="col-span-full"
                  onUploadedFileChange={(files) => {
                    setUploadedFiles(files);
                    setValue('images', files, { shouldValidate: true });
                  }}
                />
                {existingCategories.find((cat) => cat.id === id)?.image && (
                  <Image
                    src={`${process.env.NEXT_PUBLIC_API_URL}/${
                      existingCategories.find((cat) => cat.id === id)?.image
                        .path
                    }`}
                    alt="Category Image"
                    width={600}
                    height={400}
                    className="mt-2 h-44 w-64 rounded object-cover"
                  />
                )}
                {errors.images && (
                  <p className="mt-1 text-sm text-red-500">
                    {errors.images.message}
                  </p>
                )}
              </HorizontalFormBlockWrapper>
            </div>
          </div>

          <div
            className={cn(
              'sticky bottom-0 z-40 flex items-center justify-end gap-3 bg-gray-0/10 backdrop-blur @lg:gap-4 @xl:grid @xl:auto-cols-max @xl:grid-flow-col',
              isModalView ? '-mx-10 -mb-7 px-10 py-5' : 'py-1'
            )}
          >
            <Button
              onClick={() => router.push('/categories')}
              variant="outline"
              className="w-full @xl:w-auto"
            >
              Back to Categories
            </Button>
            <Button
              type="submit"
              isLoading={isLoading}
              disabled={!isValid || isLoading}
              className="w-full @xl:w-auto"
            >
              {id ? 'Update' : 'Create'} Category
            </Button>
          </div>
        </>
      )}
    </Form>
  );
}
