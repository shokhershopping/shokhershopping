'use client';

import { useState } from 'react';
import toast from 'react-hot-toast';
import { Element } from 'react-scroll';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm, FormProvider, SubmitHandler } from 'react-hook-form';
import { Text } from 'rizzui';
import cn from '@core/utils/class-names';
import FormNav, {
  formParts,
} from '@/app/shared/ecommerce/product/create-edit/form-nav';
import ProductSummary from '@/app/shared/ecommerce/product/create-edit/product-summary';
import { defaultValues } from '@/app/shared/ecommerce/product/create-edit/form-utils';
import ProductMedia from '@/app/shared/ecommerce/product/create-edit/product-media';
import PricingInventory from '@/app/shared/ecommerce/product/create-edit/pricing-inventory';
import ProductIdentifiers from '@/app/shared/ecommerce/product/create-edit/product-identifiers';
import ShippingInfo from '@/app/shared/ecommerce/product/create-edit/shipping-info';
import ProductSeo from '@/app/shared/ecommerce/product/create-edit/product-seo';
import DeliveryEvent from '@/app/shared/ecommerce/product/create-edit/delivery-event';
import ProductVariants from '@/app/shared/ecommerce/product/create-edit/product-variants';
import ProductTaxonomies from '@/app/shared/ecommerce/product/create-edit/product-tags';
import FormFooter from '@core/components/form-footer';
import {
  CreateProductInput,
  productFormSchema,
} from '@/validators/create-product.schema';
import { useLayout } from '@/layouts/use-layout';
import { LAYOUT_OPTIONS } from '@/config/enums';

const MAP_STEP_TO_COMPONENT: Record<string, React.ComponentType<{ className?: string; slug?: string }>> = {
  [formParts.summary]: ProductSummary,
  [formParts.media]: ProductMedia,
  [formParts.pricingInventory]: PricingInventory,
  [formParts.variantOptions]: ProductVariants,
  // [formParts.productIdentifiers]: ProductIdentifiers,
  // [formParts.shipping]: ShippingInfo,
  // [formParts.seo]: ProductSeo,
  // [formParts.deliveryEvent]: DeliveryEvent,
  // [formParts.tagsAndCategory]: ProductTaxonomies,
};

interface IndexProps {
  slug?: string;
  className?: string;
  product?: any;
}

export default function CreateEditProduct({
  slug,
  product,
  className,
}: IndexProps) {
  const { layout } = useLayout();
  const [isLoading, setLoading] = useState(false);
  const methods = useForm<CreateProductInput>({
    resolver: zodResolver(productFormSchema),
    defaultValues: defaultValues(product),
  });

  const onSubmit: SubmitHandler<CreateProductInput> = async (data) => {
    setLoading(true);
    let url = `/api/products`;
    let method = 'POST';

    if (slug) {
      url += `/${slug}`;
      method = 'PATCH';
    }

    const transformedData: any = {
      name: data.title,
      description: data.description || 'No description provided',
      sku: data.sku || 'SKU-' + Date.now(),
      imageUrls: data.productImages?.map((image: any) => image.url).filter(Boolean) || [],
      specifications: {
        color: data.color || 'Default Color',
        size: data.size || 'Default Size',
      },
      deliveryTime: '5 Days',
      returnTime: '15 Days',
      price: data.price,
      salePrice: data.salePrice || data.price,
      stock: parseInt(String(data?.currentStock ?? '')) || 0,
      kind: data.type || 'PHYSICAL',
      status: 'PUBLISHED',
      brand: data.brand || 'Shokher Shop',
      categoryIds: [data.categories].filter(Boolean),
      variants: [],
    };

    if (slug) {
      transformedData.deletedVariableIds = [];
    }

    if (data.productVariants && data.productVariants.length > 0) {
      transformedData.variants = data.productVariants.map(
        (variant) => ({
          id: variant.id || undefined,
          name: variant.name,
          description: variant.description || 'No description provided',
          imageUrls: variant.images?.map((image: any) => image.url).filter(Boolean) || [],
          specifications: {
            color: variant.color || 'Default Color',
            size: variant.size || 'Default Size',
          },
          price: variant.price || 0,
          salePrice: variant.salePrice || variant.price || 0,
          stock: parseInt(String(variant.stock || 0)) || 0,
          sku: variant.sku || 'SKU-' + Date.now(),
          status: variant.status || transformedData.status,
        })
      );
    }

    // populate deletedVariableIds if slug is provided by comparing with existing product data
    if (slug && product?.productVariants) {
      const existingVariantIds = product.productVariants.map(
        (variant: any) => variant.id
      );
      const newVariantIds = data.productVariants?.map((variant) => variant.id);
      transformedData.deletedVariableIds = existingVariantIds.filter(
        (id: string) => !newVariantIds?.includes(id)
      );
    }

    const res = await fetch(url, {
      method,
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(transformedData),
    });
    if (!res.ok) {
      const errorData = await res.json();
      if (res.status === 409 && errorData.message) {
        // SKU duplicate error - extract SKU from message like: SKU "XXXX" is already in use
        const msg = errorData.message as string;
        const skuMatch = msg.match(/SKU\s+"([^"]+)"/i);
        const dupSku = skuMatch ? skuMatch[1] : '';

        if (dupSku) {
          // Check variant SKUs
          if (data.productVariants) {
            const idx = data.productVariants.findIndex(
              (v) => v.sku && v.sku.trim().toLowerCase() === dupSku.trim().toLowerCase()
            );
            if (idx >= 0) {
              methods.setError(`productVariants.${idx}.sku`, {
                type: 'manual',
                message: 'This SKU is already in use',
              });
            }
          }
          // Check base product SKU
          if (data.sku && data.sku.trim().toLowerCase() === dupSku.trim().toLowerCase()) {
            methods.setError('sku', {
              type: 'manual',
              message: 'This SKU is already in use',
            });
          }
        }
        toast.error(
          <Text as="b">{errorData.message || 'Duplicate SKU detected'}</Text>
        );
      } else {
        toast.error(
          <Text as="b">Error {slug ? 'updating' : 'creating'} product</Text>
        );
      }
      setLoading(false);
    } else {
      setLoading(false);
      toast.success(
        <Text as="b">Product successfully {slug ? 'updated' : 'created'}</Text>
      );
      methods.reset();
    }
  };

  return (
    <div className="@container">
      <FormNav
        className={cn(
          layout === LAYOUT_OPTIONS.BERYLLIUM && 'z-[999] 2xl:top-[72px]'
        )}
      />
      <FormProvider {...methods}>
        <form
          onSubmit={methods.handleSubmit(onSubmit)}
          className={cn(
            'relative z-[19] [&_label.block>span]:font-medium',
            className
          )}
        >
          {Object.keys(methods.formState.errors).length > 0 && (
            <div className="mb-4 rounded-lg bg-red-50 p-4 text-red-600">
              <h3 className="font-bold">Form Errors:</h3>
              <ul className="list-disc pl-5">
                {Object.entries(methods.formState.errors).map(
                  ([key, error]) => {
                    return (
                      <li key={key} className="text-sm">
                        {error.message}
                      </li>
                    );
                  }
                )}
              </ul>
            </div>
          )}
          <div className="mb-10 grid gap-7 divide-y divide-dashed divide-gray-200 @2xl:gap-9 @3xl:gap-11">
            {Object.entries(MAP_STEP_TO_COMPONENT).map(([key, Component]) => (
              <Element
                key={key}
                name={formParts[key as keyof typeof formParts]}
              >
                {<Component className="pt-7 @2xl:pt-9 @3xl:pt-11" slug={slug} />}
              </Element>
            ))}
          </div>

          <FormFooter
            isLoading={isLoading}
            submitBtnText={slug ? 'Update Product' : 'Create Product'}
          />
        </form>
      </FormProvider>
    </div>
  );
}
