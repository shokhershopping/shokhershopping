'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { routes } from '@/config/routes';
import { Button, Input, Select, Textarea, Title } from 'rizzui';
import toast from 'react-hot-toast';
import FormGroup from '@/app/shared/form-group';

const typeOptions = [
  { label: 'Percentage', value: 'PERCENTAGE' },
  { label: 'Fixed Amount', value: 'FIXED' },
];

const statusOptions = [
  { label: 'Active', value: 'ACTIVE' },
  { label: 'Expired', value: 'EXPIRED' },
  { label: 'Blocked', value: 'BLOCKED' },
];

// Helper to parse Firestore timestamps to YYYY-MM-DD
function parseTimestampToDate(ts: any): string {
  if (!ts) return '';
  if (ts._seconds) return new Date(ts._seconds * 1000).toISOString().split('T')[0];
  const d = new Date(ts);
  return isNaN(d.getTime()) ? '' : d.toISOString().split('T')[0];
}

interface CreateCouponProps {
  couponId?: string;
}

export default function CreateCoupon({ couponId }: CreateCouponProps) {
  const router = useRouter();
  const isEdit = !!couponId;
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(isEdit);

  const [formData, setFormData] = useState({
    code: '',
    description: '',
    type: 'PERCENTAGE' as string,
    amount: '' as string | number,
    minimum: '' as string | number,
    maximum: '' as string | number,
    limit: '' as string | number,
    status: 'ACTIVE' as string,
    start: '',
    end: '',
  });

  useEffect(() => {
    if (!couponId) return;

    const fetchCoupon = async () => {
      try {
        setFetching(true);
        const res = await fetch(`/api/coupons/${couponId}`);
        if (!res.ok) throw new Error('Failed to fetch coupon');
        const json = await res.json();
        const coupon = json.data;
        if (coupon) {
          setFormData({
            code: coupon.code || '',
            description: coupon.description || '',
            type: coupon.type || 'PERCENTAGE',
            amount: coupon.amount || '',
            minimum: coupon.minimum || '',
            maximum: coupon.maximum || '',
            limit: coupon.limit || '',
            status: coupon.status || 'ACTIVE',
            start: parseTimestampToDate(coupon.start),
            end: parseTimestampToDate(coupon.end || coupon.expiry),
          });
        }
      } catch {
        toast.error('Failed to load coupon');
      } finally {
        setFetching(false);
      }
    };

    fetchCoupon();
  }, [couponId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.code.trim()) {
      toast.error('Coupon code is required');
      return;
    }
    if (formData.amount <= 0) {
      toast.error('Amount must be greater than 0');
      return;
    }

    setLoading(true);
    try {
      const payload = {
        ...formData,
        code: formData.code.toUpperCase().trim(),
        amount: Number(formData.amount),
        minimum: Number(formData.minimum),
        maximum: Number(formData.maximum),
        limit: Number(formData.limit),
        start: formData.start || undefined,
        end: formData.end || undefined,
        expiry: formData.end || undefined,
      };

      const url = isEdit ? `/api/coupons/${couponId}` : '/api/coupons';
      const method = isEdit ? 'PATCH' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.message || 'Failed to save coupon');
      }

      toast.success(isEdit ? 'Coupon updated successfully' : 'Coupon created successfully');
      router.push(routes.eCommerce.coupons);
    } catch (err: any) {
      toast.error(err.message || 'Failed to save coupon');
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
          title="Coupon Info"
          description="Add coupon code and description"
          className=""
        >
          <Input
            label="Coupon Code"
            placeholder="e.g. SAVE20"
            value={formData.code}
            onChange={(e) => setFormData({ ...formData, code: e.target.value })}
            className="col-span-full"
          />
          <Textarea
            label="Description"
            placeholder="Coupon description"
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            className="col-span-full"
          />
        </FormGroup>

        <FormGroup
          title="Discount"
          description="Set discount type and amount"
          className="pt-7 @2xl:pt-9 @3xl:pt-11"
        >
          <Select
            label="Discount Type"
            options={typeOptions}
            value={typeOptions.find((o) => o.value === formData.type)}
            onChange={(option: any) =>
              setFormData({ ...formData, type: option.value })
            }
          />
          <Input
            type="number"
            label={formData.type === 'PERCENTAGE' ? 'Discount (%)' : 'Discount Amount (৳)'}
            placeholder="Enter discount amount"
            value={formData.amount}
            onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
          />
          <Input
            type="number"
            label="Minimum Order Amount (৳)"
            placeholder="Enter minimum amount"
            value={formData.minimum}
            onChange={(e) => setFormData({ ...formData, minimum: e.target.value })}
          />
          <Input
            type="number"
            label="Maximum Discount Amount (৳)"
            placeholder="Leave empty for no limit"
            value={formData.maximum}
            onChange={(e) => setFormData({ ...formData, maximum: e.target.value })}
          />
        </FormGroup>

        <FormGroup
          title="Usage & Validity"
          description="Set usage limits and validity period"
          className="pt-7 @2xl:pt-9 @3xl:pt-11"
        >
          <Input
            type="number"
            label="Usage Limit"
            placeholder="Leave empty for unlimited"
            value={formData.limit}
            onChange={(e) => setFormData({ ...formData, limit: e.target.value })}
          />
          <Select
            label="Status"
            options={statusOptions}
            value={statusOptions.find((o) => o.value === formData.status)}
            onChange={(option: any) =>
              setFormData({ ...formData, status: option.value })
            }
          />
          <Input
            type="date"
            label="Start Date"
            value={formData.start}
            onChange={(e) => setFormData({ ...formData, start: e.target.value })}
          />
          <Input
            type="date"
            label="End Date"
            value={formData.end}
            onChange={(e) => setFormData({ ...formData, end: e.target.value })}
          />
        </FormGroup>
      </div>

      <div className="sticky bottom-0 z-40 flex items-center justify-end gap-3 bg-gray-0/10 backdrop-blur @lg:gap-4 @xl:grid @xl:auto-cols-max @xl:grid-flow-col -mx-1 -mb-1 px-4 py-4">
        <Button
          variant="outline"
          className="w-full @xl:w-auto"
          onClick={() => router.push(routes.eCommerce.coupons)}
          type="button"
        >
          Cancel
        </Button>
        <Button
          type="submit"
          isLoading={loading}
          className="w-full @xl:w-auto"
        >
          {isEdit ? 'Update Coupon' : 'Create Coupon'}
        </Button>
      </div>
    </form>
  );
}
