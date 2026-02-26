'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { routes } from '@/config/routes';
import { Button, Input, Select, Switch, Title } from 'rizzui';
import toast from 'react-hot-toast';
import FormGroup from '@/app/shared/form-group';

const statusOptions = [
  { label: 'Active', value: 'ACTIVE' },
  { label: 'Inactive', value: 'INACTIVE' },
];

interface CreateDeliveryAreaProps {
  deliveryAreaId?: string;
}

export default function CreateDeliveryArea({ deliveryAreaId }: CreateDeliveryAreaProps) {
  const router = useRouter();
  const isEdit = !!deliveryAreaId;
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(isEdit);

  const [formData, setFormData] = useState({
    name: '',
    price: '' as string | number,
    status: 'ACTIVE' as string,
    isDefault: false,
  });

  useEffect(() => {
    if (!deliveryAreaId) return;

    const fetchDeliveryArea = async () => {
      try {
        setFetching(true);
        const res = await fetch(`/api/delivery-areas/${deliveryAreaId}`);
        if (!res.ok) throw new Error('Failed to fetch delivery area');
        const json = await res.json();
        const area = json.data;
        if (area) {
          setFormData({
            name: area.name || '',
            price: area.price || '',
            status: area.status || 'ACTIVE',
            isDefault: area.isDefault || false,
          });
        }
      } catch {
        toast.error('Failed to load delivery area');
      } finally {
        setFetching(false);
      }
    };

    fetchDeliveryArea();
  }, [deliveryAreaId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name.trim()) {
      toast.error('Area name is required');
      return;
    }
    if (!formData.price || Number(formData.price) < 0) {
      toast.error('Price must be 0 or greater');
      return;
    }

    setLoading(true);
    try {
      const payload = {
        name: formData.name.trim(),
        price: Number(formData.price),
        status: formData.status,
        isDefault: formData.isDefault,
      };

      const url = isEdit ? `/api/delivery-areas/${deliveryAreaId}` : '/api/delivery-areas';
      const method = isEdit ? 'PATCH' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.message || 'Failed to save delivery area');
      }

      toast.success(isEdit ? 'Delivery area updated successfully' : 'Delivery area created successfully');
      router.push(routes.eCommerce.deliveryAreas);
    } catch (err: any) {
      toast.error(err.message || 'Failed to save delivery area');
    } finally {
      setLoading(false);
    }
  };

  if (fetching) {
    return (
      <div className="flex items-center justify-center h-[300px]">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-gray-300 border-t-blue-600" />
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="@container">
      <div className="mb-10 grid gap-7 divide-y divide-dashed divide-gray-200 @2xl:gap-9 @3xl:gap-11">
        <FormGroup
          title="Delivery Area Info"
          description="Add area name and delivery price"
          className=""
        >
          <Input
            label="Area Name"
            placeholder="e.g. Inside Dhaka, Chittagong"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            className="col-span-full"
          />
          <Input
            type="number"
            label="Delivery Price (৳)"
            placeholder="Enter delivery charge"
            value={formData.price}
            onChange={(e) => setFormData({ ...formData, price: e.target.value })}
            min={0}
          />
          <Select
            label="Status"
            options={statusOptions}
            value={statusOptions.find((o) => o.value === formData.status)}
            onChange={(option: any) =>
              setFormData({ ...formData, status: option.value })
            }
          />
        </FormGroup>

        <FormGroup
          title="Default Area"
          description="Set this area as the default selection in checkout"
          className="pt-7 @2xl:pt-9 @3xl:pt-11"
        >
          <div className="flex items-center gap-3">
            <Switch
              checked={formData.isDefault}
              onChange={() => setFormData({ ...formData, isDefault: !formData.isDefault })}
            />
            <span className="text-sm text-gray-600">
              {formData.isDefault ? 'This is the default delivery area' : 'Not the default delivery area'}
            </span>
          </div>
        </FormGroup>
      </div>

      <div className="sticky bottom-0 z-40 flex items-center justify-end gap-3 bg-gray-0/10 backdrop-blur @lg:gap-4 @xl:grid @xl:auto-cols-max @xl:grid-flow-col -mx-1 -mb-1 px-4 py-4">
        <Button
          variant="outline"
          className="w-full @xl:w-auto"
          onClick={() => router.push(routes.eCommerce.deliveryAreas)}
          type="button"
        >
          Cancel
        </Button>
        <Button
          type="submit"
          isLoading={loading}
          className="w-full @xl:w-auto"
        >
          {isEdit ? 'Update Delivery Area' : 'Create Delivery Area'}
        </Button>
      </div>
    </form>
  );
}
