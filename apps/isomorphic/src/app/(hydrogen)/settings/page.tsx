'use client';

import { useState, useEffect } from 'react';
import { Button, Input, Title, Text, Password } from 'rizzui';
import toast from 'react-hot-toast';
import PageHeader from '@/app/shared/page-header';
import { routes } from '@/config/routes';

const pageHeader = {
  title: 'Settings',
  breadcrumb: [
    { href: routes.eCommerce.dashboard, name: 'Dashboard' },
    { name: 'Settings' },
  ],
};

export default function SettingsPage() {
  const [metaPixelId, setMetaPixelId] = useState('');
  const [steadfastApiKey, setSteadfastApiKey] = useState('');
  const [steadfastSecretKey, setSteadfastSecretKey] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    async function fetchSettings() {
      try {
        const res = await fetch('/api/settings');
        const data = await res.json();
        if (data.status === 'success' && data.data) {
          setMetaPixelId(data.data.metaPixelId || '');
          setSteadfastApiKey(data.data.steadfastApiKey || '');
          setSteadfastSecretKey(data.data.steadfastSecretKey || '');
        }
      } catch {
        toast.error('Failed to load settings');
      } finally {
        setLoading(false);
      }
    }
    fetchSettings();
  }, []);

  const handleSave = async () => {
    setSaving(true);
    try {
      const res = await fetch('/api/settings', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          metaPixelId: metaPixelId.trim(),
          steadfastApiKey: steadfastApiKey.trim(),
          steadfastSecretKey: steadfastSecretKey.trim(),
        }),
      });
      const data = await res.json();
      if (data.status === 'success') {
        toast.success('Settings saved successfully');
      } else {
        toast.error(data.message || 'Failed to save settings');
      }
    } catch {
      toast.error('Failed to save settings');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <>
        <PageHeader title={pageHeader.title} breadcrumb={pageHeader.breadcrumb} />
        <div className="mt-6 text-center">Loading settings...</div>
      </>
    );
  }

  return (
    <>
      <PageHeader title={pageHeader.title} breadcrumb={pageHeader.breadcrumb} />

      {/* Meta Pixel Section */}
      <div className="mt-6 rounded-lg border border-muted p-6">
        <Title as="h4" className="mb-1">
          Facebook Meta Pixel
        </Title>
        <Text className="mb-4 text-gray-500">
          Enter your Meta Pixel ID to track conversions and optimize your Facebook/Instagram ads.
        </Text>
        <div className="max-w-md">
          <Input
            label="Meta Pixel ID"
            placeholder="e.g. 1597013731536085"
            value={metaPixelId}
            onChange={(e) => setMetaPixelId(e.target.value)}
          />
          <Text className="mt-1 text-xs text-gray-400">
            Leave empty to disable Meta Pixel tracking.
          </Text>
        </div>
      </div>

      {/* Steadfast Courier Section */}
      <div className="mt-4 rounded-lg border border-muted p-6">
        <Title as="h4" className="mb-1">
          Steadfast Courier
        </Title>
        <Text className="mb-4 text-gray-500">
          Enter your Steadfast Courier API credentials to enable automatic shipment creation and live tracking.
          When you change an order status to &quot;Dispatched&quot;, a shipment will be automatically created with Steadfast.
        </Text>
        <div className="max-w-md space-y-4">
          <Input
            label="API Key"
            placeholder="Enter Steadfast API Key"
            value={steadfastApiKey}
            onChange={(e) => setSteadfastApiKey(e.target.value)}
          />
          <Password
            label="Secret Key"
            placeholder="Enter Steadfast Secret Key"
            value={steadfastSecretKey}
            onChange={(e) => setSteadfastSecretKey(e.target.value)}
          />
          <Text className="text-xs text-gray-400">
            You can find these in your Steadfast merchant portal under API Settings.
          </Text>
        </div>
      </div>

      <Button
        className="mt-6"
        onClick={handleSave}
        isLoading={saving}
      >
        Save Settings
      </Button>
    </>
  );
}
