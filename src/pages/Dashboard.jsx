import React, { useMemo, useState, useEffect } from 'react';
import { useQuery, useMutation } from 'convex/react';
import { api } from '../../convex/_generated/api';
import { Search, Plus, Activity, CheckCircle2, AlertCircle, Clock, DollarSign } from 'lucide-react';
import LineChart from '../components/charts/LineChart';
import PieChart from '../components/charts/PieChart';
import ActionButton from '../components/ui/ActionButton';
import StatRow from '../components/ui/StatRow';
import StatusBadge from '../components/ui/StatusBadge';
import SortableHeader from '../components/ui/SortableHeader';
import ReceiptDetailModal from '../components/modals/ReceiptDetailModal';
import DateFilter from '../components/filters/DateFilter';
import { formatAmount } from '../utils/formatAmount';

export default function Dashboard() {
  const receiptsData = useQuery(api.receipts.get);
  const receipts = receiptsData || [];
  const isLoading = receiptsData === undefined;

  const seed = useMutation(api.receipts.seed);

  // Log connection status
  useEffect(() => {
    if (!isLoading) {
      console.log('📊 Convex Connection Status:', {
        connected: receiptsData !== undefined,
        receiptCount: receipts.length,
        hasData: receipts.length > 0,
        rawData: receiptsData?.length || 0
      });
      if (receipts.length === 0) {
        console.log('⚠️ No receipts found. Click "Seed Data" button to populate the database.');
      } else {
        console.log('✅ Receipts loaded:', receipts.length, 'total receipts from database');
      }
    }
  }, [isLoading, receiptsData, receipts.length]);

  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [selectedId, setSelectedId] = useState(null);
  const [sortConfig, setSortConfig] = useState({ key: 'receipt_date', direction: 'desc' });
  const [dateRange, setDateRange] = useState({ start: null, end: null });
  const [rowLimit, setRowLimit] = useState(10);
  const [showAll, setShowAll] = useState(true); // Default to showing all rows

  const filteredReceipts = useMemo(() => {
    if (!receipts || receipts.length === 0) {
      return [];
    }

    // If no date range is set, don't filter by date
    const shouldFilterByDate = dateRange.start && dateRange.end;

    const filtered = receipts.filter(r => {
      if (!r) return false;
      // Date filter - only apply if date range is explicitly set
      if (shouldFilterByDate && r.receipt_date) {
        try {
          // Parse receipt date - handle YYYY-MM-DD format
          const receiptDateStr = r.receipt_date;

          // If it's already in YYYY-MM-DD format, parse it directly
          let receiptDate;
          if (receiptDateStr.match(/^\d{4}-\d{2}-\d{2}$/)) {
            // Parse YYYY-MM-DD format (avoid timezone issues)
            const [year, month, day] = receiptDateStr.split('-').map(Number);
            receiptDate = new Date(year, month - 1, day);
          } else {
            // Try standard Date parsing
            receiptDate = new Date(receiptDateStr);
          }

          // Check if date is valid
          if (isNaN(receiptDate.getTime())) {
            // If date parsing fails, skip date filter for this receipt
            return true; // Include it if we can't parse the date
          }

          // Normalize dates to midnight for comparison (avoid timezone issues)
          receiptDate.setHours(0, 0, 0, 0);
          const start = new Date(dateRange.start);
          start.setHours(0, 0, 0, 0);
          const end = new Date(dateRange.end);
          end.setHours(23, 59, 59, 999);

          // Compare dates using getTime() for reliable numeric comparison
          const receiptTime = receiptDate.getTime();
          const startTime = start.getTime();
          const endTime = end.getTime();

          if (receiptTime < startTime || receiptTime > endTime) {
            return false;
          }
        } catch (e) {
          // If date parsing fails, include the receipt (don't filter it out)
          console.warn('Failed to parse receipt date:', r.receipt_date, e);
          return true;
        }
      }

      // Search filter
      const searchLower = searchQuery.toLowerCase();
      const matchesSearch =
        (r.merchant_name || '').toLowerCase().includes(searchLower) ||
        (r.employee_name || '').toLowerCase().includes(searchLower) ||
        (r.total_amount || 0).toString().includes(searchQuery);

      // Status filter - handle case-insensitive matching and trim whitespace
      const receiptStatus = (r.status || '').toString().trim();
      const filterStatus = statusFilter.trim();
      const matchesStatus = statusFilter === 'ALL'
        ? true
        : receiptStatus === filterStatus;

      return matchesSearch && matchesStatus;
    });

    // Debug logging for status filter issues
    if (statusFilter === 'Paid') {
      const allStatuses = [...new Set(receipts.map(r => r?.status).filter(Boolean))];
      const paidReceipts = receipts.filter(r => {
        const status = (r?.status || '').toString().trim();
        return status === 'Paid';
      });
      console.log('🔍 Filtering by "Paid":', {
        filterValue: statusFilter,
        allStatusesInData: allStatuses,
        receiptsWithPaidStatus: paidReceipts.map(r => ({ id: r._id, status: r.status })),
        filteredCount: filtered.length,
        totalReceipts: receipts.length,
        filteredReceipts: filtered.map(r => ({ id: r._id, status: r.status }))
      });
    }

    // Debug logging to track filtering
    console.log('🔍 Receipt Filtering:', {
      totalReceipts: receipts.length,
      filteredCount: filtered.length,
      searchQuery,
      statusFilter,
      dateRange: dateRange.start && dateRange.end ? `${dateRange.start.toLocaleDateString()} - ${dateRange.end.toLocaleDateString()}` : 'No date filter',
      filtersApplied: {
        search: searchQuery.length > 0,
        status: statusFilter !== 'ALL',
        date: dateRange.start && dateRange.end
      }
    });

    return filtered;
  }, [receipts, searchQuery, statusFilter, dateRange]);

  const sortedReceipts = useMemo(() => {
    const sorted = [...filteredReceipts];
    if (sortConfig.key) {
      sorted.sort((a, b) => {
        let aValue = a[sortConfig.key];
        let bValue = b[sortConfig.key];

        if (sortConfig.key === 'total_amount') {
          aValue = Number(aValue || 0);
          bValue = Number(bValue || 0);
        }

        if (aValue < bValue) return sortConfig.direction === 'asc' ? -1 : 1;
        if (aValue > bValue) return sortConfig.direction === 'asc' ? 1 : -1;
        return 0;
      });
    }
    return sorted;
  }, [filteredReceipts, sortConfig]);

  // Calculate available date range from all receipts (for filter bounds)
  const availableDateRange = useMemo(() => {
    const allDates = receipts
      .map(r => r.receipt_date)
      .filter(d => d)
      .sort();

    return {
      minDate: allDates[0] || null,
      maxDate: allDates[allDates.length - 1] || null
    };
  }, [receipts]);

  const analytics = useMemo(() => {
    if (!filteredReceipts || filteredReceipts.length === 0) {
      return {
        total: 0,
        count: 0,
        graphPoints: []
      };
    }

    const total = filteredReceipts.reduce((sum, r) => {
      if (!r) return sum;
      return sum + Number(r.total_amount || 0);
    }, 0);
    const count = filteredReceipts.length;

    const dailyData = {};
    filteredReceipts.forEach(r => {
      if (!r) return;
      const date = r.receipt_date;
      if (!date) return;
      dailyData[date] = (dailyData[date] || 0) + Number(r.total_amount || 0);
    });

    const graphPoints = Object.entries(dailyData)
      .sort((a, b) => a[0].localeCompare(b[0]))
      .map(([date, amount]) => ({ date, amount }));

    return { total, count, graphPoints };
  }, [filteredReceipts]);

  const handleSort = (key) => {
    setSortConfig(current => ({
      key,
      direction: current.key === key && current.direction === 'asc' ? 'desc' : 'asc'
    }));
  };

  const approveMutation = useMutation(api.receipts.approve);
  const payMutation = useMutation(api.receipts.pay);
  const initiatePayoutMutation = useMutation(api.receipts.initiatePayout);
  const undoApprovalMutation = useMutation(api.receipts.undoApproval);
  const reopenClaimMutation = useMutation(api.receipts.reopenClaim);
  const sendRejectionNoteMutation = useMutation(api.receipts.sendRejectionNote);
  const archiveMutation = useMutation(api.receipts.archive);

  const handleApprove = async (id) => {
    try {
      await approveMutation({ id });
      setSelectedId(null);
    } catch (error) {
      console.error('Failed to approve receipt:', error);
    }
  };

  const handlePay = async (id) => {
    try {
      console.log('🔄 Starting payment flow for receipt:', id);

      // Call the scheduled payout mutation
      // Note: In a real app, get the actual user ID. For now, we omit approvedBy or use a placeholder.
      const result = await initiatePayoutMutation({
        id,
        // approvedBy: "user_id_here" // Optional
      });

      console.log(`✅ Receipt approved! Payment will complete at ${result.willCompleteAt}`);
      alert(`Receipt approved! Payment will be processed in 30 seconds via Ryt Bank.`);

      // No need to manually update status or close modal immediately if we want them to see the status update via real-time query.
    } catch (error) {
      console.error('❌ Failed to initiate payment:', error);
      alert('Failed to initiate payment. Please try again.');
    }
  };

  const handleDirectPay = async (id) => {
    try {
      await payMutation({ id });
      setSelectedId(null);
    } catch (error) {
      console.error('Failed to process payment:', error);
    }
  };

  const handleUndoApproval = async (id) => {
    try {
      await undoApprovalMutation({ id });
      setSelectedId(null);
    } catch (error) {
      console.error('Failed to undo approval:', error);
    }
  };

  const handleReopenClaim = async (id) => {
    try {
      await reopenClaimMutation({ id });
      setSelectedId(null);
    } catch (error) {
      console.error('Failed to reopen claim:', error);
    }
  };

  const handleSendRejectionNote = async (id) => {
    try {
      const note = prompt('Enter rejection note:');
      if (note !== null) {
        await sendRejectionNoteMutation({ id, note });
        setSelectedId(null);
      }
    } catch (error) {
      console.error('Failed to send rejection note:', error);
    }
  };

  const handleArchive = async (id) => {
    if (window.confirm('Are you sure you want to archive this receipt? This action cannot be undone.')) {
      try {
        await archiveMutation({ id });
        setSelectedId(null);
      } catch (error) {
        console.error('Failed to archive receipt:', error);
      }
    }
  };

  const handleSeed = async () => {
    try {
      console.log('🌱 Seeding database...');
      await seed();
      console.log('✅ Database seeded successfully!');
    } catch (error) {
      console.error('❌ Failed to seed database:', error);
      alert('Failed to seed database. Please check your Convex connection.');
    }
  };

  const selected = useMemo(() =>
    receipts.find(r => r._id === selectedId) || null,
    [receipts, selectedId]);

  // Ensure analytics is always defined
  const safeAnalytics = analytics || { total: 0, count: 0, graphPoints: [] };
  const safeFilteredReceipts = filteredReceipts || [];
  const safeSortedReceipts = sortedReceipts || [];

  // Paginated receipts for table display - MUST be before any early returns
  const displayedReceipts = useMemo(() => {
    if (!safeSortedReceipts || safeSortedReceipts.length === 0) {
      return [];
    }
    if (showAll) {
      return safeSortedReceipts;
    }
    return safeSortedReceipts.slice(0, rowLimit || 10);
  }, [safeSortedReceipts, rowLimit, showAll]);

  // Show loading state
  if (isLoading) {
    return (
      <div className="space-y-8 animate-fade-in">
        <div className="flex items-center justify-center h-96">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand mx-auto mb-4"></div>
            <p className="text-gray-500">Loading dashboard...</p>
            {!import.meta.env.VITE_CONVEX_URL && (
              <div className="mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg max-w-md mx-auto">
                <p className="text-sm text-yellow-800 font-medium">⚠️ Convex not configured</p>
                <p className="text-xs text-yellow-700 mt-1">
                  Please create a <code className="bg-yellow-100 px-1 rounded">.env</code> file with your Convex URL.
                </p>
                <p className="text-xs text-yellow-700 mt-2">
                  Run <code className="bg-yellow-100 px-1 rounded">npx convex dev</code> in a separate terminal to start the Convex backend.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  // Show connection error state
  if (!import.meta.env.VITE_CONVEX_URL) {
    return (
      <div className="space-y-8 animate-fade-in">
        <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-6 max-w-2xl mx-auto">
          <h2 className="text-lg font-semibold text-yellow-900 mb-2">⚠️ Convex Connection Error</h2>
          <p className="text-sm text-yellow-800 mb-4">
            The Convex backend is not configured. Transactions cannot be loaded without a database connection.
          </p>
          <div className="bg-white rounded-lg p-4 border border-yellow-200">
            <p className="text-xs font-medium text-gray-900 mb-2">To fix this:</p>
            <ol className="text-xs text-gray-700 space-y-1 list-decimal list-inside">
              <li>Open a terminal in your project directory</li>
              <li>Run: <code className="bg-gray-100 px-1 rounded">npx convex dev</code></li>
              <li>This will start the Convex backend and create/update your <code className="bg-gray-100 px-1 rounded">.env</code> file</li>
              <li>Restart your development server (<code className="bg-gray-100 px-1 rounded">npm run dev</code>)</li>
            </ol>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Welcome & Actions Row */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-semibold text-gray-900">Welcome, Jane</h1>
          <p className="text-gray-500 mt-1">Here's what's happening with your claims.</p>
        </div>
        <div className="flex gap-2">
          <ActionButton icon={Plus} label="New Claim" primary />
          {receipts.length === 0 && (
            <ActionButton
              icon={Plus}
              label="Seed Data"
              onClick={handleSeed}
            />
          )}
        </div>
      </div>

      {/* Date Filter Bar */}
      <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-card">
        <DateFilter
          onDateRangeChange={(start, end) => setDateRange({ start, end })}
          minDate={availableDateRange.minDate}
          maxDate={availableDateRange.maxDate}
        />
      </div>

      {/* Analytics Cards Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Graph Card */}
        <div className="lg:col-span-2 bg-white p-6 rounded-xl border border-gray-200 shadow-card flex flex-col">
          <div className="flex items-center justify-between mb-6">
            <div>
              <p className="text-sm font-medium text-gray-500">Total Claimed</p>
              <div className="flex items-baseline gap-2">
                <h2 className="text-3xl font-semibold text-gray-900">{formatAmount(safeAnalytics.total)}</h2>
                <span className="text-sm font-medium text-red-500">-2.55%</span>
              </div>
            </div>
            <div className="flex gap-1">
              <button className="p-1.5 rounded hover:bg-gray-100 text-gray-900">
                <Activity size={18} />
              </button>
            </div>
          </div>
          <div className="h-48 w-full">
            <LineChart
              data={safeAnalytics.graphPoints || []}
              minDate={availableDateRange.minDate}
              maxDate={availableDateRange.maxDate}
            />
          </div>
        </div>

        {/* Side Stats Card - Breakdown */}
        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-card flex flex-col">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-medium text-gray-900">All Status</h3>
            <div className="flex gap-1 bg-gray-100 p-1 rounded-lg">
              <button className="px-3 py-1 text-xs font-medium bg-white text-gray-900 shadow-sm rounded-md">Categories</button>
              <button className="px-3 py-1 text-xs font-medium text-gray-500 hover:text-gray-900 rounded-md">Groups</button>
            </div>
          </div>
          <div className="flex-1">
            <PieChart
              data={[
                { label: 'Pending Approve', color: '#f59e0b', amount: receipts.filter(r => r?.status === 'Pending Approve').reduce((s, r) => s + Number(r.total_amount || 0), 0) },
                { label: 'Approved', color: '#10b981', amount: receipts.filter(r => r?.status === 'Approved').reduce((s, r) => s + Number(r.total_amount || 0), 0) },
                { label: 'Flagged', color: '#ef4444', amount: receipts.filter(r => r?.status === 'Flagged').reduce((s, r) => s + Number(r.total_amount || 0), 0) },
                { label: 'Paid', color: '#8b5cf6', amount: receipts.filter(r => r?.status === 'Paid').reduce((s, r) => s + Number(r.total_amount || 0), 0) },
              ].filter(d => d.amount > 0)}
              totalAmount={receipts.reduce((s, r) => s + Number(r.total_amount || 0), 0)}
              onStatusSelect={(label) => setStatusFilter(label === statusFilter ? 'ALL' : label)}
              selectedStatus={statusFilter}
            />
          </div>
        </div>
      </div>

      {/* Transactions Table Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold text-gray-900">Transactions</h2>
          <div className="flex gap-2">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
              <input
                type="text"
                placeholder="Search..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9 pr-4 py-2 bg-white border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-brand focus:ring-1 focus:ring-brand"
              />
            </div>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-2 bg-white border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-brand"
            >
              <option value="ALL">All Status</option>
              <option value="Pending Approve">Pending Approve</option>
              <option value="Approved">Approved</option>
              <option value="Flagged">Flagged</option>
              <option value="Paid">Paid</option>
            </select>
          </div>
        </div>

        {/* Pagination Controls */}
        <div className="flex items-center justify-between bg-white p-4 rounded-xl border border-gray-200 shadow-card">
          <div className="flex items-center gap-3">
            <span className="text-sm text-gray-600">Show:</span>
            <select
              value={showAll ? 'all' : rowLimit}
              onChange={(e) => {
                if (e.target.value === 'all') {
                  setShowAll(true);
                } else {
                  setShowAll(false);
                  setRowLimit(Number(e.target.value));
                }
              }}
              className="px-3 py-2 bg-white border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-brand"
            >
              <option value="10">10 rows</option>
              <option value="50">50 rows</option>
              <option value="100">100 rows</option>
              <option value="all">All rows</option>
            </select>
            <span className="text-sm text-gray-500">
              Showing {displayedReceipts?.length || 0} of {safeSortedReceipts?.length || 0} transactions
            </span>
          </div>
          {!showAll && safeSortedReceipts && safeSortedReceipts.length > (rowLimit || 10) && (
            <button
              onClick={() => setShowAll(true)}
              className="px-4 py-2 bg-brand text-white rounded-lg text-sm font-medium hover:bg-blue-800 transition-colors"
            >
              Show All ({safeSortedReceipts.length})
            </button>
          )}
          {showAll && (
            <button
              onClick={() => {
                setShowAll(false);
                setRowLimit(10);
              }}
              className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-200 transition-colors"
            >
              Show 10
            </button>
          )}
        </div>

        <div className="bg-white rounded-xl border border-gray-200 shadow-card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-gray-50 border-b border-gray-200 text-gray-500 font-medium">
                <tr>
                  <SortableHeader label="Merchant" sortKey="merchant_name" currentSort={sortConfig} onSort={handleSort} />
                  <SortableHeader label="Date" sortKey="receipt_date" currentSort={sortConfig} onSort={handleSort} />
                  <SortableHeader label="Employee" sortKey="employee_name" currentSort={sortConfig} onSort={handleSort} />
                  <SortableHeader label="Amount" sortKey="total_amount" currentSort={sortConfig} onSort={handleSort} />
                  <th className="px-6 py-4 font-medium">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {(displayedReceipts || []).map((r) => {
                  if (!r) return null;
                  return (
                    <tr
                      key={r._id}
                      className="hover:bg-gray-50 transition-colors cursor-pointer group"
                      onClick={() => setSelectedId(r._id)}
                    >
                      <td className="px-6 py-4 font-medium text-gray-900">
                        {r.merchant_name}
                        <div className="text-xs text-gray-500 font-normal mt-0.5">{r.category}</div>
                      </td>
                      <td className="px-6 py-4 text-gray-600">{r.receipt_date}</td>
                      <td className="px-6 py-4 text-gray-600">{r.employee_name}</td>
                      <td className="px-6 py-4 font-medium">{formatAmount(r.total_amount)}</td>
                      <td className="px-6 py-4">
                        <StatusBadge status={r.status} isFlagged={r.is_flagged} />
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          {(!displayedReceipts || displayedReceipts.length === 0) && (!safeSortedReceipts || safeSortedReceipts.length === 0) && (
            <div className="p-12 text-center text-gray-500">
              {receipts.length === 0 ? (
                <>
                  <div className="mb-4">
                    <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3">
                      <Activity size={32} className="text-gray-400" />
                    </div>
                    <p className="text-lg font-medium text-gray-700 mb-2">No transactions found</p>
                    <p className="text-sm text-gray-500 mb-4">The database appears to be empty.</p>
                  </div>
                  <button
                    onClick={handleSeed}
                    className="px-6 py-3 bg-brand text-white rounded-lg font-medium hover:bg-blue-800 transition-colors"
                  >
                    Seed Mock Data
                  </button>
                  <p className="text-xs text-gray-400 mt-4">
                    This will populate the database with sample receipt data.
                  </p>
                </>
              ) : (
                <>
                  <p>No transactions found for the selected filters.</p>
                  {dateRange.start && dateRange.end && (
                    <p className="text-xs mt-2 text-gray-400">
                      Date range: {dateRange.start.toLocaleDateString()} - {dateRange.end.toLocaleDateString()}
                    </p>
                  )}
                </>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Receipt Detail Modal */}
      {selected && (
        <ReceiptDetailModal
          receipt={selected}
          onClose={() => setSelectedId(null)}
          onApprove={handleApprove}
          onPay={handlePay}
          onDirectPay={handleDirectPay}
          onUndoApproval={handleUndoApproval}
          onReopenClaim={handleReopenClaim}
          onSendRejectionNote={handleSendRejectionNote}
          onArchive={handleArchive}
        />
      )}
    </div>
  );
}

