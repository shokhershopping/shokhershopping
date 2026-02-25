"use client";

import Image from "next/image";
import toast from "react-hot-toast";
import { useCallback, useState } from "react";
import { useDropzone } from "react-dropzone";
import UploadIcon from "../../components/shape/upload";
import { FieldError, Loader, Text } from "rizzui";
import cn from "../../utils/class-names";
import { PiPencilSimple } from "react-icons/pi";
import { LoadingSpinner } from "../../ui/file-upload/upload-zone";

interface UploadZoneProps {
  name: string;
  getValues?: any;
  setValue?: any;
  className?: string;
  error?: string;
}

export default function AvatarUpload({
  name,
  error,
  className,
  getValues,
  setValue,
}: UploadZoneProps) {
  const [isUploading, setIsUploading] = useState(false);

  const formValue = getValues(name);

  const onDrop = useCallback(
    async (acceptedFiles: File[]) => {
      if (!acceptedFiles.length) return;
      setIsUploading(true);
      try {
        const formData = new FormData();
        formData.append("files", acceptedFiles[0]);

        const res = await fetch(`/api/uploads/multiple`, {
          method: "POST",
          body: formData,
        });

        if (!res.ok) throw new Error("Failed to upload avatar");

        const data = (await res.json()) as any;
        const uploaded = (data.data || data.files || [])[0];

        if (uploaded && setValue) {
          setValue(name, {
            name: uploaded.originalname || uploaded.filename || "avatar",
            size: uploaded.size || 0,
            url: uploaded.url,
          });
          toast.success(
            <Text as="b" className="font-semibold">
              Avatar updated
            </Text>
          );
        }
      } catch (error) {
        console.error(error);
        toast.error("Error uploading avatar");
      }
      setIsUploading(false);
    },
    [name, setValue]
  );

  const { getRootProps, getInputProps } = useDropzone({
    onDrop,
    accept: {
      "image/*": [],
    },
    maxFiles: 1,
  });

  return (
    <div className={cn("grid gap-5", className)}>
      <div
        className={cn("relative grid h-40 w-40 place-content-center rounded-full border-[1.8px]")}
      >
        {formValue ? (
          <>
            <figure className="absolute inset-0 rounded-full">
              <Image
                fill
                alt="user avatar"
                src={formValue?.url}
                className="rounded-full"
              />
            </figure>
            <div
              {...getRootProps()}
              className={cn("absolute inset-0 grid place-content-center rounded-full bg-black/70")}
            >
              {isUploading ? <LoadingSpinner /> : <PiPencilSimple className="h-5 w-5 text-white" />}

              <input {...getInputProps()} />
            </div>
          </>
        ) : (
          <div
            {...getRootProps()}
            className={cn("absolute inset-0 z-10 grid cursor-pointer place-content-center")}
          >
            <input {...getInputProps()} />
            <UploadIcon className="mx-auto h-12 w-12" />

            {isUploading ? (
              <Loader
                variant="spinner"
                className="justify-center"
              />
            ) : (
              <Text className="font-medium">Drop or select file</Text>
            )}
          </div>
        )}
      </div>
      {error && <FieldError error={error} />}
    </div>
  );
}
