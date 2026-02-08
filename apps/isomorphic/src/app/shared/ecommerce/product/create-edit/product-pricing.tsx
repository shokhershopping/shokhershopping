'use client';

import { useFormContext } from 'react-hook-form';
import { Input } from 'rizzui';

export default function ProductPricing() {
  const {
    register,
    formState: { errors },
  } = useFormContext();

  return (
    <>
      <Input
        label="Price"
        placeholder="10"
        {...register('price')}
        error={errors.price?.message as string}
        prefix={'$'}
        type="number"
      />

      <Input
        label="Sale Price"
        placeholder="20"
        {...register('salePrice')}
        error={errors.salePrice?.message as string}
        prefix={'$'}
        type="number"
      />
    </>
  );
}
