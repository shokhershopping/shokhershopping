'use client';
import { useFormContext } from 'react-hook-form';
import UploadZone from '@core/ui/file-upload/upload-zone';
import FormGroup from '@/app/shared/form-group';
import cn from '@core/utils/class-names';
import { useEffect, useState } from 'react';

interface ProductMediaProps {
  className?: string;
}

export default function ProductMedia({ className }: ProductMediaProps) {
  const { getValues, setValue, watch } = useFormContext();
  const [uploadedFiles, setUploadedFiles] = useState<any[]>([]);
  // Watch for changes in productVariants to keep uploadedFiles in sync
  const watchedProductImages = watch('productImages');

  useEffect(() => {
    if (watchedProductImages && watchedProductImages.length > 0) {
      const newUploadedFiles: any[] = [];
      watchedProductImages.forEach((image: any) => {
        newUploadedFiles.push(image);
      });
      setUploadedFiles(newUploadedFiles);
    }
  }, [watchedProductImages]);
  return (
    <FormGroup
      title="Upload new product images"
      description="Upload your product image gallery here"
      className={cn(className)}
    >
      {/* <UploadZone
        className="col-span-full"
        name="productImages"
        getValues={getValues}
        setValue={setValue}
      /> */}
      <UploadZone
        name="productImages"
        getValues={() => uploadedFiles} // Pass current uploaded files
        setValue={(name: any, files: any) => {
          setUploadedFiles(files);
          setValue('productImages', files, { shouldValidate: true });
        }}
        className="col-span-full"
        onUploadedFileChange={(files) => {
          setUploadedFiles(files);
          setValue('productImages', files, { shouldValidate: true });
        }}
      />
    </FormGroup>
  );
}
