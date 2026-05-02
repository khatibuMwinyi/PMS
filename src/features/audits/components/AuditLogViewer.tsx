'use client';

import { useState, useCallback } from 'react';
import { 
  Search, Filter, Download, ChevronLeft, ChevronRight, 
  ArrowUpRight, ArrowDownRight, RefreshCw, Eye 
} from 'lucide-react';
import { cn } from '@/core/lib/utils';
import { getAuditStats } from '@/features/audits/queries';

export function AuditLogViewer({ 
  initialEvents, 
  initialPagination,
  stats,
  filters: initialFilters 
}: { 
  initialEvents: any[];
  initialPagination: any;
  stats: any;
  filters: any;
}) {
  const [events] = useState(initialEvents);
  const [pagination] = useState(initialPagination);
  const [filters, setFilters] = useState({
    entityType: initialFilters.entityType || '',
    action: initialFilters.action || '',
    page: initialFilters.page || 1,
  });

  const entityTypes = ['User', 'Property', 'Quote', 'Agreement', 'Assignment', 'Task', 'Wallet'];
  const actions = ['CREATE', 'UPDATE', 'DELETE', 'STATUS_CHANGE'];

  const getActionColor = (action: string) => {
    switch (action) {
      case 'CREATE': return 'text-green-600 bg-green-50';
      case 'UPDATE': return 'text-blue-600 bg-blue-50';
      case 'DELETE': return 'text-red-600 bg-red-50';
      case 'STATUS_CHANGE': return 'text-amber-600 bg-amber-50';
      default: return 'text-gray-600 bg-gray-50';
    }
  };

  const formatTimestamp = (timestamp: Date) => {
    return new Date(timestamp).toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    });
  };

  const formatJson = (data: any) => {
    if (!data) return '-';
    try {
      const obj = typeof data === 'string' ? JSON.parse(data) : data;
      return JSON.stringify(obj, null, 2);
    } catch {
      return String(data);
    }
  };

  const truncateJson = (data: any, maxLength: number = 50) => {
    const formatted = formatJson(data);
    return formatted.length > maxLength ? formatted.substring(0, maxLength) + '...' : formatted;
  };

  return (
    <div className="space-y-4">
      {/* Filters */}
      <div className="bg-[var(--surface-card)] rounded-lg border border-[var(--border-subtle)] p-4">
        <div className="flex flex-wrap gap-3">
          <div className="flex-1 min-w-[200px]">
            <label className="block text-xs font-medium text-[var(--text-muted)] mb-1">
              Entity Type
            </label>
            <select
              value={filters.entityType}
              onChange={(e) => setFilters(prev => ({ ...prev, entityType: e.target.value }))}
              className="w-full px-3 py-1.5 text-sm border border-[var(--border-default)] rounded-lg bg-[var(--surface-input)] text-[var(--text-primary)]"
            >
              <option value="">All Types</option>
              {entityTypes.map(type => (
                <option key={type} value={type}>{type}</option>
              ))}
            </select>
          </div>

          <div className="flex-1 min-w-[200px]">
            <label className="block text-xs font-medium text-[var(--text-muted)] mb-1">
              Action
            </label>
            <select
              value={filters.action}
              onChange={(e) => setFilters(prev => ({ ...prev, action: e.target.value }))}
              className="w-full px-3 py-1.5 text-sm border border-[var(--border-default)] rounded-lg bg-[var(--surface-input)] text-[var(--text-primary)]"
            >
              <option value="">All Actions</option>
              {actions.map(action => (
                <option key={action} value={action}>{action}</option>
              ))}
            </select>
          </div>

          <div className="flex items-end">
            <button
              onClick={() => {
                // Apply filters - would trigger a server action or router.push
                console.log('Apply filters:', filters);
              }}
              className="px-4 py-1.5 text-sm font-medium text-white bg-[var(--brand-primary)] rounded-lg hover:bg-[var(--brand-primary-dark)] transition-colors"
            >
              <Filter size={14} className="inline mr-1" />
              Filter
            </button>
          </div>
        </div>
      </div>

      {/* Audit Table */}
      <div className="bg-[var(--surface-card)] rounded-lg border border-[var(--border-subtle)] overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-[var(--border-subtle)] bg-[var(--surface-overlay)]">
                <th className="text-left p-3 text-xs font-medium text-[var(--text-muted)] uppercase">Timestamp</th>
                <th className="text-left p-3 text-xs font-medium text-[var(--text-muted)] uppercase">Actor</th>
                <th className="text-left p-3 text-xs font-medium text-[var(--text-muted)] uppercase">Action</th>
                <th className="text-left p-3 text-xs font-medium text-[var(--text-muted)] uppercase">Entity</th>
                <th className="text-left p-3 text-xs font-medium text-[var(--text-muted)] uppercase">Old Value</th>
                <th className="text-left p-3 text-xs font-medium text-[var(--text-muted)] uppercase">New Value</th>
              </tr>
            </thead>
            <tbody>
              {events.length === 0 ? (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-[var(--text-muted)]">
                    No audit events found
                  </td>
                </tr>
              ) : (
                events.map((event) => (
                  <tr key={event.id} className="border-b border-[var(--border-subtle)] last:border-0 hover:bg-[var(--surface-overlay)] transition-colors">
                    <td className="p-3 text-xs text-[var(--text-secondary)]">
                      {formatTimestamp(event.timestamp)}
                    </td>
                    <td className="p-3">
                      <div className="text-xs">
                        <span className="text-[var(--text-primary)]">{event.actor?.email || 'System'}</span>
                        {event.actor?.role && (
                          <span className="ml-1 text-[var(--text-muted)]">({event.actor.role})</span>
                        )}
                      </div>
                    </td>
                    <td className="p-3">
                      <span className={cn(
                        'inline-flex items-center px-2 py-0.5 rounded text-xs font-medium',
                        getActionColor(event.action)
                      )}>
                        {event.action}
                      </span>
                    </td>
                    <td className="p-3">
                      <span className="text-xs text-[var(--text-secondary)]">
                        {event.entityType} #{event.entityId.substring(0, 8)}...
                      </span>
                    </td>
                    <td className="p-3">
                      <code className="text-xs text-[var(--text-muted)] font-mono">
                        {truncateJson(event.oldValue, 30)}
                      </code>
                    </td>
                    <td className="p-3">
                      <code className="text-xs text-[var(--text-muted)] font-mono">
                        {truncateJson(event.newValue, 30)}
                      </code>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {pagination.totalPages > 1 && (
          <div className="flex items-center justify-between px-4 py-3 border-t border-[var(--border-subtle)]">
            <p className="text-xs text-[var(--text-muted)]">
              Showing page {pagination.page} of {pagination.totalPages}
            </p>
            <div className="flex gap-2">
              <button
                disabled={pagination.page <= 1}
                className="px-3 py-1 text-xs border border-[var(--border-default)] rounded hover:bg-[var(--surface-overlay)] disabled:opacity-50 transition-colors"
              >
                <ChevronLeft size={14} className="inline" />
                Previous
              </button>
              <button
                disabled={pagination.page >= pagination.totalPages}
                className="px-3 py-1 text-xs border border-[var(--border-default)] rounded hover:bg-[var(--surface-overlay)] disabled:opacity-50 transition-colors"
              >
                Next
                <ChevronRight size={14} className="inline" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
