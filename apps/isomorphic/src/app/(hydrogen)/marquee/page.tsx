'use client';

import { useEffect, useState, useCallback } from 'react';
import { useFirebaseAuth } from '@/lib/firebase-auth-provider';
import { Button, Switch, Title, Text, Badge, Input } from 'rizzui';
import {
  PiPlusBold,
  PiTrashBold,
  PiPencilSimpleBold,
  PiArrowUpBold,
  PiArrowDownBold,
  PiCheckBold,
  PiXBold,
} from 'react-icons/pi';

interface Marquee {
  id: string;
  text: string;
  isActive: boolean;
  sortOrder: number;
}

export default function MarqueePage() {
  const { user, getToken } = useFirebaseAuth();
  const [marquees, setMarquees] = useState<Marquee[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [newText, setNewText] = useState('');
  const [adding, setAdding] = useState(false);
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editText, setEditText] = useState('');

  const fetchMarquees = useCallback(async () => {
    try {
      setLoading(true);
      setError('');
      const res = await fetch('/api/marquee');
      if (res.ok) {
        const data = await res.json();
        setMarquees(data?.data || []);
      } else {
        setError('Failed to load marquee items.');
      }
    } catch {
      setError('Failed to connect to marquee API.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchMarquees();
  }, [fetchMarquees]);

  const handleAdd = async () => {
    if (!newText.trim()) return;
    try {
      setAdding(true);
      const token = await getToken();
      const res = await fetch('/api/marquee', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ text: newText.trim(), isActive: true }),
      });
      if (res.ok) {
        setNewText('');
        setShowAddForm(false);
        fetchMarquees();
      } else {
        const data = await res.json().catch(() => ({}));
        setError(data.message || 'Failed to add marquee item.');
      }
    } catch {
      setError('Failed to add marquee item.');
    } finally {
      setAdding(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this marquee item?')) return;
    try {
      const token = await getToken();
      await fetch(`/api/marquee/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
      fetchMarquees();
    } catch {
      setError('Failed to delete marquee item.');
    }
  };

  const handleToggleActive = async (item: Marquee) => {
    try {
      const token = await getToken();
      await fetch(`/api/marquee/${item.id}`, {
        method: 'PATCH',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ isActive: !item.isActive }),
      });
      fetchMarquees();
    } catch {
      setError('Failed to update marquee item.');
    }
  };

  const handleReorder = async (id: string, direction: 'up' | 'down') => {
    const idx = marquees.findIndex((m) => m.id === id);
    if (idx === -1) return;
    if (direction === 'up' && idx === 0) return;
    if (direction === 'down' && idx === marquees.length - 1) return;

    const swapIdx = direction === 'up' ? idx - 1 : idx + 1;
    const token = await getToken();

    await Promise.all([
      fetch(`/api/marquee/${marquees[idx].id}`, {
        method: 'PATCH',
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ sortOrder: marquees[swapIdx].sortOrder }),
      }),
      fetch(`/api/marquee/${marquees[swapIdx].id}`, {
        method: 'PATCH',
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ sortOrder: marquees[idx].sortOrder }),
      }),
    ]);

    fetchMarquees();
  };

  const startEdit = (item: Marquee) => {
    setEditingId(item.id);
    setEditText(item.text);
  };

  const handleSaveEdit = async (id: string) => {
    if (!editText.trim()) return;
    try {
      const token = await getToken();
      await fetch(`/api/marquee/${id}`, {
        method: 'PATCH',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ text: editText.trim() }),
      });
      setEditingId(null);
      fetchMarquees();
    } catch {
      setError('Failed to update marquee item.');
    }
  };

  if (user && user.role !== 'ADMIN') {
    return (
      <div className="flex h-[50vh] items-center justify-center">
        <div className="text-center">
          <Title as="h4" className="mb-2">Access Denied</Title>
          <Text className="text-gray-500">Only administrators can manage marquee items.</Text>
        </div>
      </div>
    );
  }

  return (
    <div className="@container">
      {/* Header */}
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <div>
          <Title as="h4" className="font-semibold">Marquee Items</Title>
          <Text className="mt-1 text-gray-500">
            Manage the scrolling marquee bar shown on the storefront homepage.
          </Text>
        </div>
        <Button className="flex items-center gap-2" onClick={() => setShowAddForm((v) => !v)}>
          <PiPlusBold className="h-4 w-4" />
          Add Item
        </Button>
      </div>

      {/* Add Form */}
      {showAddForm && (
        <div className="mb-6 rounded-lg border border-blue-200 bg-blue-50 p-4 dark:bg-blue-900/10">
          <Title as="h6" className="mb-3 font-semibold text-blue-800">New Marquee Text</Title>
          <div className="flex items-center gap-3">
            <Input
              placeholder="e.g. Spring Sale: Up to 50% Off!"
              value={newText}
              onChange={(e) => setNewText(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleAdd()}
              className="flex-1"
            />
            <Button onClick={handleAdd} isLoading={adding} className="flex items-center gap-1">
              <PiPlusBold className="h-4 w-4" />
              Add
            </Button>
            <Button variant="outline" onClick={() => { setShowAddForm(false); setNewText(''); }}>
              Cancel
            </Button>
          </div>
        </div>
      )}

      {/* Error */}
      {error && (
        <div className="mb-4 rounded-lg border border-red-200 bg-red-50 p-4">
          <Text className="text-sm text-red-600">{error}</Text>
          <Button variant="outline" size="sm" className="mt-2" onClick={fetchMarquees}>
            Retry
          </Button>
        </div>
      )}

      {/* List */}
      {loading ? (
        <div className="flex h-40 items-center justify-center">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-gray-300 border-t-blue-600" />
        </div>
      ) : marquees.length === 0 ? (
        <div className="flex h-40 items-center justify-center rounded-lg border border-gray-200 bg-white dark:bg-gray-100">
          <div className="text-center">
            <Text className="text-gray-500">No marquee items yet.</Text>
            <Text className="text-sm text-gray-400 mt-1">Click &quot;Add Item&quot; to create your first scrolling message.</Text>
          </div>
        </div>
      ) : (
        <div className="space-y-3">
          {marquees.map((item, index) => (
            <div
              key={item.id}
              className="flex flex-wrap items-center gap-3 rounded-lg border border-gray-200 bg-white px-4 py-3 shadow-sm dark:bg-gray-100"
            >
              {/* Reorder */}
              <div className="flex flex-col gap-1">
                <button
                  onClick={() => handleReorder(item.id, 'up')}
                  disabled={index === 0}
                  className="rounded p-1 text-gray-400 hover:bg-gray-100 disabled:opacity-30"
                >
                  <PiArrowUpBold className="h-3.5 w-3.5" />
                </button>
                <button
                  onClick={() => handleReorder(item.id, 'down')}
                  disabled={index === marquees.length - 1}
                  className="rounded p-1 text-gray-400 hover:bg-gray-100 disabled:opacity-30"
                >
                  <PiArrowDownBold className="h-3.5 w-3.5" />
                </button>
              </div>

              {/* Text / Edit */}
              <div className="flex flex-1 items-center gap-2">
                {editingId === item.id ? (
                  <>
                    <Input
                      value={editText}
                      onChange={(e) => setEditText(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && handleSaveEdit(item.id)}
                      className="flex-1"
                    />
                    <button
                      onClick={() => handleSaveEdit(item.id)}
                      className="rounded p-1 text-green-600 hover:bg-green-50"
                    >
                      <PiCheckBold className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => setEditingId(null)}
                      className="rounded p-1 text-gray-400 hover:bg-gray-100"
                    >
                      <PiXBold className="h-4 w-4" />
                    </button>
                  </>
                ) : (
                  <Text className="flex-1 text-sm font-medium">{item.text}</Text>
                )}
              </div>

              {/* Status badge */}
              <Badge className={item.isActive ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-600'}>
                {item.isActive ? 'Active' : 'Inactive'}
              </Badge>

              {/* Toggle */}
              <div className="flex items-center gap-1.5">
                <Switch checked={item.isActive} onChange={() => handleToggleActive(item)} />
              </div>

              {/* Edit button */}
              {editingId !== item.id && (
                <button
                  onClick={() => startEdit(item)}
                  className="rounded p-1.5 text-gray-500 hover:bg-gray-100"
                  title="Edit"
                >
                  <PiPencilSimpleBold className="h-4 w-4" />
                </button>
              )}

              {/* Delete */}
              <button
                onClick={() => handleDelete(item.id)}
                className="rounded p-1.5 text-red-500 hover:bg-red-50"
                title="Delete"
              >
                <PiTrashBold className="h-4 w-4" />
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Info */}
      <div className="mt-8 rounded-lg border border-yellow-200 bg-yellow-50 p-4 dark:bg-yellow-900/10">
        <Title as="h6" className="mb-2 font-semibold text-yellow-800">How it works</Title>
        <ul className="list-inside list-disc space-y-1 text-sm text-yellow-700">
          <li>Active items scroll continuously in the yellow bar below the navigation.</li>
          <li>Use the arrows to reorder items.</li>
          <li>Toggle the switch to show/hide individual items without deleting them.</li>
          <li>Click the pencil icon to edit the text inline.</li>
        </ul>
      </div>
    </div>
  );
}
