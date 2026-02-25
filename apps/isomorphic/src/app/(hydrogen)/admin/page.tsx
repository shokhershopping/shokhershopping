'use client';

import { useEffect, useState, useCallback } from 'react';
import { useFirebaseAuth } from '@/lib/firebase-auth-provider';
import { Button, Input, Select, Title, Text, Badge } from 'rizzui';
import cn from '@core/utils/class-names';
import { PiPlusBold, PiTrashBold } from 'react-icons/pi';

interface AdminUser {
  id: string;
  email: string;
  name: string | null;
  role: string;
  createdAt: any;
}

const roleOptions = [
  { value: 'ADMIN', label: 'Admin' },
  { value: 'EDITOR', label: 'Editor' },
];

export default function AdminPage() {
  const { user, getToken } = useFirebaseAuth();
  const [adminUsers, setAdminUsers] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);

  // Form state
  const [formName, setFormName] = useState('');
  const [formEmail, setFormEmail] = useState('');
  const [formPassword, setFormPassword] = useState('');
  const [formRole, setFormRole] = useState('ADMIN');
  const [formError, setFormError] = useState('');
  const [formLoading, setFormLoading] = useState(false);

  const fetchAdminUsers = useCallback(async () => {
    try {
      setLoading(true);
      const token = await getToken();
      const res = await fetch('/api/users/admin', {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        setAdminUsers(data?.data || []);
      }
    } catch (error) {
      // silently handle error
    } finally {
      setLoading(false);
    }
  }, [getToken]);

  useEffect(() => {
    fetchAdminUsers();
  }, [fetchAdminUsers]);

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');

    if (!formName || !formEmail || !formPassword) {
      setFormError('All fields are required');
      return;
    }
    if (formPassword.length < 6) {
      setFormError('Password must be at least 6 characters');
      return;
    }

    try {
      setFormLoading(true);
      const token = await getToken();
      const res = await fetch('/api/users/admin', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          name: formName,
          email: formEmail,
          password: formPassword,
          role: formRole,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setFormError(data.message || 'Failed to create user');
        return;
      }

      // Reset form and refresh list
      setFormName('');
      setFormEmail('');
      setFormPassword('');
      setFormRole('ADMIN');
      setShowForm(false);
      fetchAdminUsers();
    } catch (error) {
      setFormError('Failed to create user');
    } finally {
      setFormLoading(false);
    }
  };

  const handleDeleteUser = async (userId: string) => {
    if (!confirm('Are you sure you want to remove this user?')) return;

    try {
      const token = await getToken();
      const res = await fetch(`/api/users/${userId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });

      if (res.ok) {
        fetchAdminUsers();
      }
    } catch (error) {
      // silently handle error
    }
  };

  const handleRoleChange = async (userId: string, newRole: string) => {
    try {
      const token = await getToken();
      const res = await fetch(`/api/users/${userId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ role: newRole }),
      });

      if (res.ok) {
        fetchAdminUsers();
      }
    } catch (error) {
      // silently handle error
    }
  };

  // Only admins can access this page
  if (user && user.role !== 'ADMIN') {
    return (
      <div className="flex h-[50vh] items-center justify-center">
        <div className="text-center">
          <Title as="h4" className="mb-2">Access Denied</Title>
          <Text className="text-gray-500">Only administrators can manage users.</Text>
        </div>
      </div>
    );
  }

  return (
    <div className="@container">
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <div>
          <Title as="h4" className="font-semibold">Admin Management</Title>
          <Text className="mt-1 text-gray-500">
            Create and manage admin & editor users
          </Text>
        </div>
        <Button
          onClick={() => setShowForm(!showForm)}
          className="flex items-center gap-2"
        >
          <PiPlusBold className="h-4 w-4" />
          {showForm ? 'Cancel' : 'Add New User'}
        </Button>
      </div>

      {/* Create User Form */}
      {showForm && (
        <div className="mb-8 rounded-lg border border-gray-200 bg-white p-6 shadow-sm dark:bg-gray-100">
          <Title as="h5" className="mb-4 font-semibold">Create New User</Title>
          <form onSubmit={handleCreateUser} className="grid grid-cols-1 gap-4 @lg:grid-cols-2">
            <Input
              label="Full Name"
              placeholder="Enter full name"
              value={formName}
              onChange={(e) => setFormName(e.target.value)}
              required
            />
            <Input
              label="Email"
              type="email"
              placeholder="Enter email address"
              value={formEmail}
              onChange={(e) => setFormEmail(e.target.value)}
              required
            />
            <Input
              label="Password"
              type="password"
              placeholder="Min 6 characters"
              value={formPassword}
              onChange={(e) => setFormPassword(e.target.value)}
              required
            />
            <Select
              label="Role"
              options={roleOptions}
              value={formRole}
              onChange={setFormRole}
              getOptionValue={(option) => option.value}
              displayValue={(selected) =>
                roleOptions.find((opt) => opt.value === selected)?.label ?? 'Admin'
              }
            />

            {formError && (
              <div className="col-span-full">
                <Text className="text-red-500">{formError}</Text>
              </div>
            )}

            <div className="col-span-full flex justify-end gap-3">
              <Button
                variant="outline"
                onClick={() => setShowForm(false)}
                type="button"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                isLoading={formLoading}
                disabled={formLoading}
              >
                Create User
              </Button>
            </div>
          </form>
        </div>
      )}

      {/* Users Table */}
      {loading ? (
        <div className="flex h-40 items-center justify-center">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-gray-300 border-t-blue-600" />
        </div>
      ) : adminUsers.length === 0 ? (
        <div className="flex h-40 items-center justify-center rounded-lg border border-gray-200 bg-white dark:bg-gray-100">
          <Text className="text-gray-500">No admin or editor users found. Create one to get started.</Text>
        </div>
      ) : (
        <div className="overflow-hidden rounded-lg border border-gray-200 bg-white shadow-sm dark:bg-gray-100">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200 bg-gray-50 dark:bg-gray-200/50">
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Name</th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Email</th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Role</th>
                <th className="px-4 py-3 text-right text-sm font-semibold text-gray-700">Actions</th>
              </tr>
            </thead>
            <tbody>
              {adminUsers.map((adminUser) => (
                <tr
                  key={adminUser.id}
                  className="border-b border-gray-100 last:border-b-0 hover:bg-gray-50 dark:hover:bg-gray-200/30"
                >
                  <td className="px-4 py-3">
                    <Text className="font-medium">{adminUser.name || 'No Name'}</Text>
                  </td>
                  <td className="px-4 py-3">
                    <Text className="text-gray-600">{adminUser.email}</Text>
                  </td>
                  <td className="px-4 py-3">
                    {adminUser.id === user?.uid ? (
                      <Badge
                        className={cn(
                          'text-xs',
                          adminUser.role === 'ADMIN'
                            ? 'bg-green-100 text-green-700'
                            : 'bg-blue-100 text-blue-700'
                        )}
                      >
                        {adminUser.role} (You)
                      </Badge>
                    ) : (
                      <Select
                        options={roleOptions}
                        value={adminUser.role}
                        onChange={(newRole: any) => handleRoleChange(adminUser.id, newRole)}
                        getOptionValue={(option) => option.value}
                        displayValue={(selected) =>
                          roleOptions.find((opt) => opt.value === selected)?.label ?? selected
                        }
                        dropdownClassName="h-auto"
                        className="w-32"
                        size="sm"
                      />
                    )}
                  </td>
                  <td className="px-4 py-3 text-right">
                    {adminUser.id !== user?.uid && (
                      <Button
                        variant="text"
                        color="danger"
                        size="sm"
                        onClick={() => handleDeleteUser(adminUser.id)}
                        className="text-red-500 hover:text-red-700"
                      >
                        <PiTrashBold className="h-4 w-4" />
                      </Button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Role descriptions */}
      <div className="mt-8 grid grid-cols-1 gap-4 @lg:grid-cols-2">
        <div className="rounded-lg border border-green-200 bg-green-50 p-4 dark:bg-green-900/10">
          <Title as="h6" className="mb-2 font-semibold text-green-800">Admin</Title>
          <Text className="text-sm text-green-700">
            Full access to all features: Dashboard, Products, Categories, Orders,
            Transactions, Affiliates, Notifications, Coupons, Reviews, and Admin Management.
          </Text>
        </div>
        <div className="rounded-lg border border-blue-200 bg-blue-50 p-4 dark:bg-blue-900/10">
          <Title as="h6" className="mb-2 font-semibold text-blue-800">Editor</Title>
          <Text className="text-sm text-blue-700">
            Limited access: Dashboard, Products (view & edit), Categories (view & edit),
            Orders (view), and Reviews (view).
          </Text>
        </div>
      </div>
    </div>
  );
}
