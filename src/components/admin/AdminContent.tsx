'use client';
import { AdminRoute } from './AdminRoute';
import { AdminDashboard } from '@/features/admin/components/AdminDashboard';

export function AdminContent() {
  return (
    <AdminRoute>
      <AdminDashboard />
    </AdminRoute>
  );
}
