import { useEffect, useMemo, useState } from 'react';
import toast from 'react-hot-toast';
import {
  FiActivity,
  FiAlertTriangle,
  FiChevronLeft,
  FiChevronRight,
  FiCheckCircle,
  FiClock,
  FiCreditCard,
  FiDollarSign,
  FiDownload,
  FiEdit3,
  FiEye,
  FiEyeOff,
  FiFileText,
  FiPackage,
  FiRefreshCw,
  FiSearch,
  FiShield,
  FiShoppingBag,
  FiSlash,
  FiStar,
  FiTag,
  FiToggleLeft,
  FiToggleRight,
  FiTrash2,
  FiTruck,
  FiUserPlus,
  FiUsers,
  FiX,
} from 'react-icons/fi';
import { adminService } from '../services/adminService';

const tabs = ['Overview', 'Users', 'Restaurants', 'Orders', 'Menu', 'Categories', 'Delivery', 'Payments/Wallet', 'Reviews', 'Audit Logs', 'Create Admin'];
const orderStatuses = ['PENDING', 'CONFIRMED', 'PREPARING', 'READY_FOR_PICKUP', 'OUT_FOR_DELIVERY', 'DELIVERED', 'CANCELLED', 'REFUNDED'];
const orderStatusFlow = {
  PENDING: ['PENDING', 'CONFIRMED', 'CANCELLED'],
  CONFIRMED: ['CONFIRMED', 'PREPARING', 'CANCELLED'],
  PREPARING: ['PREPARING', 'READY_FOR_PICKUP'],
  READY_FOR_PICKUP: ['READY_FOR_PICKUP', 'OUT_FOR_DELIVERY'],
  OUT_FOR_DELIVERY: ['OUT_FOR_DELIVERY', 'DELIVERED'],
  DELIVERED: ['DELIVERED'],
  CANCELLED: ['CANCELLED'],
  REFUNDED: ['REFUNDED'],
};
const terminalOrderStatuses = ['DELIVERED', 'CANCELLED', 'REFUNDED'];
const pageSections = ['users', 'restaurants', 'orders', 'menuItems', 'deliveryPartners', 'payments', 'walletTransactions', 'reviews', 'auditLogs'];
const defaultPage = { page: 0, size: 4, totalElements: 0, totalPages: 0 };
const defaultPagination = pageSections.reduce((acc, section) => ({ ...acc, [section]: defaultPage }), {});
const defaultFilters = {
  users: { search: '', role: 'ALL', status: 'ALL' },
  restaurants: { search: '', status: 'ALL', verified: 'ALL' },
  orders: { search: '', status: 'ALL' },
  menu: { search: '', status: 'ALL', category: 'ALL' },
  categories: { search: '', status: 'ALL' },
  delivery: { search: '', status: 'ALL', verified: 'ALL' },
  payments: { search: '', status: 'ALL' },
  wallet: { search: '', type: 'ALL', status: 'ALL' },
  reviews: { search: '', status: 'ALL', rating: 'ALL' },
  auditLogs: { search: '', status: 'ALL', method: 'ALL' },
};

const unwrapApiData = (response) => response?.data?.data ?? response?.data ?? null;
const getSettledData = (results, key) => (
  results[key]?.status === 'fulfilled' ? unwrapApiData(results[key].value) : null
);
const getSettledPage = (results, key) => getSettledData(results, key) || {};
const getSettledList = (results, key) => {
  const data = getSettledData(results, key);
  if (Array.isArray(data)) return data;
  return data?.content || [];
};

const formatCurrency = (value) => new Intl.NumberFormat('en-IN', {
  style: 'currency',
  currency: 'INR',
  maximumFractionDigits: 0,
}).format(Number(value || 0));

const formatDate = (value) => {
  if (!value) return 'Not available';
  return new Intl.DateTimeFormat('en-IN', {
    day: '2-digit',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(value));
};

const getOrderStatusOptions = (status) => orderStatusFlow[status] || orderStatuses;
const toDateInputValue = (date) => {
  const offsetDate = new Date(date.getTime() - date.getTimezoneOffset() * 60000);
  return offsetDate.toISOString().slice(0, 10);
};
const getDefaultRevenueRange = () => {
  const end = new Date();
  const start = new Date();
  start.setDate(end.getDate() - 6);
  return {
    startDate: toDateInputValue(start),
    endDate: toDateInputValue(end),
  };
};
const getRevenueRangeForDays = (days) => {
  const end = new Date();
  const start = new Date();
  start.setDate(end.getDate() - (days - 1));
  return {
    startDate: toDateInputValue(start),
    endDate: toDateInputValue(end),
  };
};
const getCurrentYearRevenueRange = () => {
  const end = new Date();
  const start = new Date(end.getFullYear(), 0, 1);
  return {
    startDate: toDateInputValue(start),
    endDate: toDateInputValue(end),
  };
};

const emptyMenuForm = {
  restaurantId: '',
  name: '',
  description: '',
  price: '',
  categoryId: '',
  preparationTime: '',
  discountPercentage: 0,
  isAvailable: true,
  isVegetarian: false,
};

const emptyCategoryForm = {
  id: null,
  name: '',
  description: '',
  imageUrl: '',
  displayOrder: '',
  parentCategoryId: '',
};

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState('Overview');
  const [summary, setSummary] = useState(null);
  const [users, setUsers] = useState([]);
  const [restaurants, setRestaurants] = useState([]);
  const [orders, setOrders] = useState([]);
  const [menuItems, setMenuItems] = useState([]);
  const [categories, setCategories] = useState([]);
  const [deliveryPartners, setDeliveryPartners] = useState([]);
  const [payments, setPayments] = useState([]);
  const [walletTransactions, setWalletTransactions] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [auditLogs, setAuditLogs] = useState([]);
  const [pagination, setPagination] = useState(defaultPagination);
  const [categoryPagination, setCategoryPagination] = useState({ page: 0, size: 4 });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [actionMessage, setActionMessage] = useState('');
  const [menuSaving, setMenuSaving] = useState(false);
  const [categorySaving, setCategorySaving] = useState(false);
  const [cashbackSaving, setCashbackSaving] = useState(false);
  const [adminSaving, setAdminSaving] = useState(false);
  const [revenueInvoiceLoading, setRevenueInvoiceLoading] = useState(false);
  const [revenueInvoiceRange, setRevenueInvoiceRange] = useState(getDefaultRevenueRange);
  const [showAdminPassword, setShowAdminPassword] = useState(false);
  const [showAdminConfirmPassword, setShowAdminConfirmPassword] = useState(false);
  const [filters, setFilters] = useState(defaultFilters);
  const [detailDrawer, setDetailDrawer] = useState(null);
  const [confirmDialog, setConfirmDialog] = useState(null);
  const [menuForm, setMenuForm] = useState(emptyMenuForm);
  const [categoryForm, setCategoryForm] = useState(emptyCategoryForm);
  const [cashbackForm, setCashbackForm] = useState({ userId: '', amount: '', reason: '' });
  const [adminForm, setAdminForm] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phoneNumber: '',
    password: '',
    confirmPassword: '',
  });

  const loadDashboard = async (nextPagination = pagination) => {
    if (!summary) setLoading(true);
    try {
      const summaryRes = await adminService.getSummary();
      setSummary(unwrapApiData(summaryRes) || {});

      const requests = {
        users: adminService.getUsers(nextPagination.users.page, nextPagination.users.size),
        restaurants: adminService.getRestaurants(nextPagination.restaurants.page, nextPagination.restaurants.size),
        orders: adminService.getOrders(nextPagination.orders.page, nextPagination.orders.size),
        menuItems: adminService.getMenuItems(nextPagination.menuItems.page, nextPagination.menuItems.size),
        categories: adminService.getCategories(),
        deliveryPartners: adminService.getDeliveryPartners(nextPagination.deliveryPartners.page, nextPagination.deliveryPartners.size),
        payments: adminService.getPayments(nextPagination.payments.page, nextPagination.payments.size),
        walletTransactions: adminService.getWalletTransactions(nextPagination.walletTransactions.page, nextPagination.walletTransactions.size),
        reviews: adminService.getReviews(nextPagination.reviews.page, nextPagination.reviews.size),
        auditLogs: adminService.getAuditLogs(nextPagination.auditLogs.page, nextPagination.auditLogs.size, filters.auditLogs),
      };
      const resultEntries = await Promise.allSettled(Object.values(requests));
      const results = Object.fromEntries(Object.keys(requests).map((key, index) => [key, resultEntries[index]]));

      const failedSections = Object.entries(results)
        .filter(([, result]) => result.status === 'rejected')
        .map(([key]) => key);
      if (failedSections.length) {
        toast.error(`Could not load: ${failedSections.join(', ')}`);
      }

      const usersPage = getSettledPage(results, 'users');
      const restaurantsPage = getSettledPage(results, 'restaurants');
      const ordersPage = getSettledPage(results, 'orders');
      const menuPage = getSettledPage(results, 'menuItems');
      const deliveryPage = getSettledPage(results, 'deliveryPartners');
      const paymentPage = getSettledPage(results, 'payments');
      const walletPage = getSettledPage(results, 'walletTransactions');
      const reviewPage = getSettledPage(results, 'reviews');
      const auditPage = getSettledPage(results, 'auditLogs');

      setUsers(usersPage.content || []);
      setRestaurants(restaurantsPage.content || []);
      setOrders(ordersPage.content || []);
      setMenuItems(menuPage.content || []);
      setCategories(getSettledList(results, 'categories'));
      setDeliveryPartners(deliveryPage.content || []);
      setPayments(paymentPage.content || []);
      setWalletTransactions(walletPage.content || []);
      setReviews(reviewPage.content || []);
      setAuditLogs(auditPage.content || []);
      setPagination({
        users: pageMeta(usersPage, nextPagination.users),
        restaurants: pageMeta(restaurantsPage, nextPagination.restaurants),
        orders: pageMeta(ordersPage, nextPagination.orders),
        menuItems: pageMeta(menuPage, nextPagination.menuItems),
        deliveryPartners: pageMeta(deliveryPage, nextPagination.deliveryPartners),
        payments: pageMeta(paymentPage, nextPagination.payments),
        walletTransactions: pageMeta(walletPage, nextPagination.walletTransactions),
        reviews: pageMeta(reviewPage, nextPagination.reviews),
        auditLogs: pageMeta(auditPage, nextPagination.auditLogs),
      });
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to load admin dashboard');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDashboard();
  }, []);

  const roleBreakdown = useMemo(() => ([
    ['Customers', summary?.customers || 0],
    ['Owners', summary?.restaurantOwners || 0],
    ['Delivery', summary?.deliveryPartners || 0],
    ['Admins', summary?.admins || 0],
  ]), [summary]);

  const menuStats = useMemo(() => ({
    total: pagination.menuItems.totalElements || menuItems.length,
    available: menuItems.filter((item) => item.isAvailable).length,
    discounted: menuItems.filter((item) => Number(item.discountPercentage || 0) > 0).length,
  }), [menuItems, pagination.menuItems.totalElements]);

  const reviewStats = useMemo(() => ({
    total: pagination.reviews.totalElements || reviews.length,
    pending: reviews.filter((review) => !review.isApproved).length,
    average: reviews.length ? (reviews.reduce((sum, review) => sum + Number(review.rating || 0), 0) / reviews.length).toFixed(1) : '0.0',
  }), [reviews, pagination.reviews.totalElements]);

  const filteredUsers = useMemo(() => users.filter((user) => {
    const filter = filters.users;
    return matchesSearch(user, filter.search, ['firstName', 'lastName', 'email', 'phoneNumber', 'role'])
      && (filter.role === 'ALL' || user.role === filter.role)
      && (filter.status === 'ALL' || (filter.status === 'ACTIVE' ? user.isActive : !user.isActive));
  }), [users, filters.users]);

  const filteredRestaurants = useMemo(() => restaurants.filter((restaurant) => {
    const filter = filters.restaurants;
    return matchesSearch(restaurant, filter.search, ['name', 'ownerName', 'cuisineType', 'city', 'state'])
      && (filter.status === 'ALL' || (filter.status === 'OPEN' ? restaurant.isOpen : !restaurant.isOpen))
      && (filter.verified === 'ALL' || (filter.verified === 'VERIFIED' ? restaurant.isVerified : !restaurant.isVerified));
  }), [restaurants, filters.restaurants]);

  const filteredOrders = useMemo(() => orders.filter((order) => {
    const filter = filters.orders;
    return matchesSearch(order, filter.search, ['orderNumber', 'status', 'paymentStatus'])
      && (filter.status === 'ALL' || order.status === filter.status);
  }), [orders, filters.orders]);

  const filteredMenuItems = useMemo(() => menuItems.filter((item) => {
    const filter = filters.menu;
    return matchesSearch(item, filter.search, ['name', 'restaurantName', 'categoryName', 'description'])
      && (filter.status === 'ALL' || (filter.status === 'AVAILABLE' ? item.isAvailable : !item.isAvailable))
      && (filter.category === 'ALL' || String(item.categoryId || '') === filter.category);
  }), [menuItems, filters.menu]);

  const filteredCategories = useMemo(() => categories.filter((category) => {
    const filter = filters.categories;
    return matchesSearch(category, filter.search, ['name', 'description', 'parentCategoryName'])
      && (filter.status === 'ALL' || (filter.status === 'ACTIVE' ? category.isActive : !category.isActive));
  }), [categories, filters.categories]);

  const filteredDeliveryPartners = useMemo(() => deliveryPartners.filter((partner) => {
    const filter = filters.delivery;
    return matchesSearch(partner, filter.search, ['name', 'email', 'phoneNumber', 'vehicleNumber', 'vehicleType', 'zone', 'status'])
      && (filter.status === 'ALL' || (filter.status === 'AVAILABLE' ? partner.isAvailable : !partner.isAvailable))
      && (filter.verified === 'ALL' || (filter.verified === 'VERIFIED' ? partner.isVerified : !partner.isVerified));
  }), [deliveryPartners, filters.delivery]);

  const filteredPayments = useMemo(() => payments.filter((payment) => {
    const filter = filters.payments;
    return matchesSearch(payment, filter.search, ['transactionId', 'paymentOrderId', 'orderNumber', 'paymentMethod', 'paymentStatus'])
      && (filter.status === 'ALL' || payment.paymentStatus === filter.status);
  }), [payments, filters.payments]);

  const filteredWalletTransactions = useMemo(() => walletTransactions.filter((transaction) => {
    const filter = filters.wallet;
    return matchesSearch(transaction, filter.search, ['transactionReference', 'description', 'mode', 'status', 'orderNumber'])
      && (filter.type === 'ALL' || transaction.transactionType === filter.type)
      && (filter.status === 'ALL' || transaction.status === filter.status);
  }), [walletTransactions, filters.wallet]);

  const filteredReviews = useMemo(() => reviews.filter((review) => {
    const filter = filters.reviews;
    return matchesSearch(review, filter.search, ['comment', 'restaurantName', 'deliveryPartnerName', 'userName', 'reviewType', 'orderNumber'])
      && (filter.status === 'ALL' || (filter.status === 'APPROVED' ? review.isApproved : !review.isApproved))
      && (filter.rating === 'ALL' || Number(review.rating) === Number(filter.rating));
  }), [reviews, filters.reviews]);

  const filteredAuditLogs = useMemo(() => auditLogs.filter((log) => {
    const filter = filters.auditLogs;
    return matchesSearch(log, filter.search, ['adminEmail', 'adminRole', 'action', 'resource', 'endpoint', 'httpMethod'])
      && (filter.status === 'ALL' || (filter.status === 'SUCCESS' ? log.success : !log.success))
      && (filter.method === 'ALL' || log.httpMethod === filter.method);
  }), [auditLogs, filters.auditLogs]);

  const categoryPage = useMemo(() => {
    const size = categoryPagination.size || 4;
    const totalElements = filteredCategories.length;
    const totalPages = Math.max(Math.ceil(totalElements / size), 1);
    const page = Math.min(categoryPagination.page || 0, totalPages - 1);
    const start = page * size;

    return {
      items: filteredCategories.slice(start, start + size),
      meta: { page, size, totalElements, totalPages },
    };
  }, [filteredCategories, categoryPagination]);

  const runAction = async (action, successMessage, loadingMessage = 'Request process ho rahi hai...') => {
    setSaving(true);
    setActionMessage(loadingMessage);
    try {
      await action();
      toast.success(successMessage);
      await loadDashboard();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Action failed');
    } finally {
      setSaving(false);
      setActionMessage('');
    }
  };

  const handlePageChange = async (section, page, size = pagination[section].size) => {
    const nextPagination = {
      ...pagination,
      [section]: { ...pagination[section], page, size },
    };
    setPagination(nextPagination);
    await loadDashboard(nextPagination);
  };

  const handleCategoryPageChange = (page, size = categoryPagination.size) => {
    setCategoryPagination({ page, size });
  };

  const updateFilter = (section, key, value) => {
    setFilters((current) => ({
      ...current,
      [section]: { ...current[section], [key]: value },
    }));
    if (section === 'categories') {
      setCategoryPagination((current) => ({ ...current, page: 0 }));
    }
  };

  const resetFilters = (section) => {
    setFilters((current) => ({ ...current, [section]: defaultFilters[section] }));
    if (section === 'categories') {
      setCategoryPagination((current) => ({ ...current, page: 0 }));
    }
  };

  const applyAuditFilters = async () => {
    const nextPagination = {
      ...pagination,
      auditLogs: { ...pagination.auditLogs, page: 0 },
    };
    setPagination(nextPagination);
    await loadDashboard(nextPagination);
  };

  const openDetail = (type, item) => {
    setDetailDrawer({ type, item });
  };

  const confirmAction = ({ title, message, action, successMessage, loadingMessage, danger = false }) => {
    setConfirmDialog({ title, message, action, successMessage, loadingMessage, danger });
  };

  const executeConfirmAction = async () => {
    if (!confirmDialog) return;
    const dialog = confirmDialog;
    setConfirmDialog(null);
    await runAction(dialog.action, dialog.successMessage, dialog.loadingMessage);
  };

  const submitMenuItem = async (event) => {
    event.preventDefault();
    setMenuSaving(true);
    try {
      await runAction(async () => {
        const payload = {
          name: menuForm.name,
          description: menuForm.description || null,
          price: Number(menuForm.price),
          preparationTime: menuForm.preparationTime ? Number(menuForm.preparationTime) : null,
          categoryId: menuForm.categoryId ? Number(menuForm.categoryId) : null,
          discountPercentage: Number(menuForm.discountPercentage || 0),
          isAvailable: Boolean(menuForm.isAvailable),
          isVegetarian: Boolean(menuForm.isVegetarian),
        };
        await adminService.createMenuItem(menuForm.restaurantId, payload);
        setMenuForm(emptyMenuForm);
      }, 'Menu item created', 'Menu item add ho raha hai...');
    } finally {
      setMenuSaving(false);
    }
  };

  const submitCategory = async (event) => {
    event.preventDefault();
    setCategorySaving(true);
    try {
      await runAction(async () => {
        const payload = {
          name: categoryForm.name,
          description: categoryForm.description || null,
          imageUrl: categoryForm.imageUrl || null,
          displayOrder: categoryForm.displayOrder ? Number(categoryForm.displayOrder) : null,
          parentCategoryId: categoryForm.parentCategoryId ? Number(categoryForm.parentCategoryId) : null,
        };
        if (categoryForm.id) {
          await adminService.updateCategory(categoryForm.id, payload);
        } else {
          await adminService.createCategory(payload);
        }
        setCategoryForm(emptyCategoryForm);
      }, categoryForm.id ? 'Category updated' : 'Category created', categoryForm.id ? 'Category update ho rahi hai...' : 'Category add ho rahi hai...');
    } finally {
      setCategorySaving(false);
    }
  };

  const submitCashback = async (event) => {
    event.preventDefault();
    setCashbackSaving(true);
    try {
      await runAction(async () => {
        await adminService.addCashback(cashbackForm.userId, cashbackForm.amount, cashbackForm.reason);
        setCashbackForm({ userId: '', amount: '', reason: '' });
      }, 'Cashback added', 'Wallet cashback add ho raha hai...');
    } finally {
      setCashbackSaving(false);
    }
  };

  const submitAdmin = async (event) => {
    event.preventDefault();

    if (adminForm.password !== adminForm.confirmPassword) {
      toast.error('Password aur confirm password match nahi kar rahe');
      return;
    }

    setAdminSaving(true);
    try {
      await runAction(async () => {
        const { confirmPassword, ...adminPayload } = adminForm;
        await adminService.createAdmin(adminPayload);
        setAdminForm({ firstName: '', lastName: '', email: '', phoneNumber: '', password: '', confirmPassword: '' });
        setShowAdminPassword(false);
        setShowAdminConfirmPassword(false);
        setActiveTab('Overview');
      }, 'Admin user created', 'Admin account create ho raha hai...');
    } finally {
      setAdminSaving(false);
    }
  };

  const promptNumberAction = (message, callback, successMessage) => {
    const value = window.prompt(message);
    if (!value) return;
    const numberValue = Number(value);
    if (Number.isNaN(numberValue) || numberValue < 0) {
      toast.error('Please enter a valid number');
      return;
    }
    runAction(() => callback(numberValue), successMessage, 'Update process ho raha hai...');
  };

  const promptRefundAction = (payment) => {
    const value = window.prompt('Enter refund amount');
    if (!value) return;
    const amount = Number(value);
    if (Number.isNaN(amount) || amount <= 0) {
      toast.error('Please enter a valid refund amount');
      return;
    }
    confirmAction({
      title: 'Process refund?',
      message: `Refund ${formatCurrency(amount)} for order ${payment.orderNumber || payment.id}. This action affects payment records.`,
      action: () => adminService.refundPayment(payment.id, amount, 'Admin dashboard refund'),
      successMessage: 'Refund processed',
      loadingMessage: 'Refund process ho raha hai...',
      danger: true,
    });
  };

  const downloadRevenueInvoice = async () => {
    const { startDate, endDate } = revenueInvoiceRange;
    if (!startDate || !endDate) {
      toast.error('Please select both start and end date');
      return;
    }
    if (new Date(endDate) < new Date(startDate)) {
      toast.error('End date start date se pehle nahi ho sakti');
      return;
    }

    setRevenueInvoiceLoading(true);
    try {
      const response = await adminService.downloadRevenueInvoice(revenueInvoiceRange);
      const blob = new Blob([response.data], { type: 'application/pdf' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `ofos-revenue-${startDate}-to-${endDate}.pdf`;
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
      toast.success('Revenue invoice downloaded');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Revenue invoice download failed');
    } finally {
      setRevenueInvoiceLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 p-8">
        <div className="mx-auto flex max-w-6xl items-center justify-center rounded-lg bg-white p-12 shadow-sm">
          <FiRefreshCw className="mr-3 h-5 w-5 animate-spin text-orange-500" />
          <span className="text-gray-600">Loading admin controls...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="mx-auto max-w-7xl px-4">
        <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="flex items-center gap-2 text-2xl font-bold text-gray-900">
              <FiShield className="text-orange-500" /> Admin Dashboard
            </h1>
            <p className="mt-1 text-sm text-gray-500">Control users, restaurants, menu, delivery, payments, wallet, and reviews.</p>
          </div>
          <button
            onClick={() => loadDashboard()}
            disabled={saving}
            className="inline-flex items-center gap-2 rounded-lg border border-gray-200 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 disabled:opacity-60"
          >
            <FiRefreshCw className={saving ? 'animate-spin' : ''} /> Refresh
          </button>
        </div>

        <div className="mb-6 flex gap-2 overflow-x-auto rounded-lg border border-gray-200 bg-white p-1 shadow-sm">
          {tabs.map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`whitespace-nowrap rounded-md px-4 py-2 text-sm font-medium transition ${
                activeTab === tab ? 'bg-orange-500 text-white shadow-sm' : 'text-gray-600 hover:bg-gray-50'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        {saving && actionMessage && (
          <div className="mb-6">
            <ProgressNotice message={actionMessage} />
          </div>
        )}

        {activeTab === 'Overview' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
              <StatCard label="Total Users" value={summary?.totalUsers || 0} icon={FiUsers} tone="orange" />
              <StatCard label="Restaurants" value={summary?.totalRestaurants || 0} icon={FiShoppingBag} tone="green" />
              <StatCard label="Active Orders" value={summary?.activeOrders || 0} icon={FiActivity} tone="blue" />
              <StatCard label="Platform Commission" value={formatCurrency(summary?.platformCommission)} icon={FiDollarSign} tone="violet" />
            </div>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
              <StatCard label="Delivered Revenue" value={formatCurrency(summary?.deliveredRevenue)} icon={FiCreditCard} tone="orange" />
              <StatCard label="Restaurant Payout" value={formatCurrency(summary?.restaurantPayout)} icon={FiShoppingBag} tone="green" />
              <StatCard label="Menu Items" value={menuStats.total} icon={FiPackage} tone="orange" />
            </div>

            <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
              <Panel title="Role Breakdown">
                {roleBreakdown.map(([label, value]) => (
                  <div key={label} className="flex items-center justify-between py-1">
                    <span className="text-sm text-gray-600">{label}</span>
                    <span className="font-semibold text-gray-900">{value}</span>
                  </div>
                ))}
              </Panel>
              <Panel title="Restaurant Health">
                <MetricRow label="Open Now" value={summary?.openRestaurants || 0} tone="green" />
                <MetricRow label="Total Restaurants" value={summary?.totalRestaurants || 0} />
              </Panel>
              <Panel title="Payment Health">
                <MetricRow label="Paid Orders" value={summary?.paidOrders || 0} tone="blue" />
                <MetricRow label="Total Payments" value={pagination.payments.totalElements || 0} />
                <MetricRow label="Platform Commission" value={formatCurrency(summary?.platformCommission)} tone="green" />
              </Panel>
            </div>

            <Panel title="Revenue Invoice" description="Select any date range and download the delivered revenue PDF for that period.">
              <div className="mb-3 flex flex-wrap gap-2">
                {[
                  ['Last 7 days', () => getRevenueRangeForDays(7)],
                  ['Last 15 days', () => getRevenueRangeForDays(15)],
                  ['Current year', getCurrentYearRevenueRange],
                ].map(([label, getRange]) => (
                  <button
                    key={label}
                    type="button"
                    onClick={() => setRevenueInvoiceRange(getRange())}
                    disabled={revenueInvoiceLoading}
                    className="rounded-lg border border-gray-200 bg-white px-3 py-1.5 text-xs font-medium text-gray-700 hover:border-orange-200 hover:bg-orange-50 hover:text-orange-700 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {label}
                  </button>
                ))}
              </div>
              <div className="grid grid-cols-1 gap-3 md:grid-cols-[1fr_1fr_auto] md:items-end">
                <AdminInput
                  label="Start Date"
                  type="date"
                  value={revenueInvoiceRange.startDate}
                  onChange={(value) => setRevenueInvoiceRange((current) => ({ ...current, startDate: value }))}
                  disabled={revenueInvoiceLoading}
                />
                <AdminInput
                  label="End Date"
                  type="date"
                  value={revenueInvoiceRange.endDate}
                  onChange={(value) => setRevenueInvoiceRange((current) => ({ ...current, endDate: value }))}
                  disabled={revenueInvoiceLoading}
                />
                <button
                  type="button"
                  onClick={downloadRevenueInvoice}
                  disabled={revenueInvoiceLoading}
                  className="inline-flex min-h-10 items-center justify-center gap-2 rounded-lg bg-orange-500 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-orange-600 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {revenueInvoiceLoading ? <FiRefreshCw className="animate-spin" /> : <FiDownload />}
                  Download PDF
                </button>
              </div>
            </Panel>
          </div>
        )}

        {activeTab === 'Users' && (
          <DataSection title="Users" description="Activate, deactivate, or remove platform accounts." pagination={pagination.users} onPageChange={(page, size) => handlePageChange('users', page, size)}>
            <FilterBar
              search={filters.users.search}
              onSearch={(value) => updateFilter('users', 'search', value)}
              onReset={() => resetFilters('users')}
            >
              <FilterSelect label="Role" value={filters.users.role} onChange={(value) => updateFilter('users', 'role', value)} options={['ALL', 'CUSTOMER', 'RESTAURANT_OWNER', 'DELIVERY_PARTNER', 'ADMIN']} />
              <FilterSelect label="Status" value={filters.users.status} onChange={(value) => updateFilter('users', 'status', value)} options={['ALL', 'ACTIVE', 'INACTIVE']} />
            </FilterBar>
            <Table columns={['User', 'Role', 'Status', 'Joined', 'Actions']}>
              {filteredUsers.map((user) => (
                <tr key={user.id}>
                  <td className="px-4 py-3"><p className="font-medium text-gray-900">{user.firstName} {user.lastName}</p><p className="text-gray-500">{user.email}</p></td>
                  <td className="px-4 py-3"><Badge tone="blue">{user.role}</Badge></td>
                  <td className="px-4 py-3"><Tooltip label={user.isActive ? 'This user can access the app' : 'This user is blocked from access'}><Badge tone={user.isActive ? 'green' : 'red'}>{user.isActive ? 'Active' : 'Inactive'}</Badge></Tooltip></td>
                  <td className="px-4 py-3 text-gray-500">{formatDate(user.createdAt)}</td>
                  <td className="px-4 py-3 text-right">
                    <RowButton label="View user details" onClick={() => openDetail('User', user)}><FiEye /></RowButton>
                    <RowButton label={user.isActive ? 'Deactivate user' : 'Activate user'} onClick={() => confirmAction({ title: user.isActive ? 'Deactivate user?' : 'Activate user?', message: `${user.firstName} ${user.lastName} account status will change.`, action: () => user.isActive ? adminService.deactivateUser(user.id) : adminService.activateUser(user.id), successMessage: user.isActive ? 'User deactivated' : 'User activated', loadingMessage: 'User status update ho raha hai...', danger: user.isActive })}>{user.isActive ? <FiToggleRight /> : <FiToggleLeft />}</RowButton>
                    <RowButton label="Delete user" danger onClick={() => confirmAction({ title: 'Delete user?', message: `${user.email} permanently remove ho sakta hai. Confirm karne ke baad action run hoga.`, action: () => adminService.deleteUser(user.id), successMessage: 'User deleted', loadingMessage: 'User delete ho raha hai...', danger: true })}><FiTrash2 /></RowButton>
                  </td>
                </tr>
              ))}
            </Table>
            {filteredUsers.length === 0 && <EmptyState title="No users found" message="Search ya filters change karke dobara dekhein." />}
          </DataSection>
        )}

        {activeTab === 'Restaurants' && (
          <DataSection title="Restaurants" description="Verify restaurants and control availability." pagination={pagination.restaurants} onPageChange={(page, size) => handlePageChange('restaurants', page, size)}>
            <FilterBar
              search={filters.restaurants.search}
              onSearch={(value) => updateFilter('restaurants', 'search', value)}
              onReset={() => resetFilters('restaurants')}
            >
              <FilterSelect label="Open" value={filters.restaurants.status} onChange={(value) => updateFilter('restaurants', 'status', value)} options={['ALL', 'OPEN', 'CLOSED']} />
              <FilterSelect label="Verified" value={filters.restaurants.verified} onChange={(value) => updateFilter('restaurants', 'verified', value)} options={['ALL', 'VERIFIED', 'PENDING']} />
            </FilterBar>
            <Table columns={['Restaurant', 'Owner', 'State', 'Rating', 'Actions']}>
              {filteredRestaurants.map((restaurant) => (
                <tr key={restaurant.id}>
                  <td className="px-4 py-3"><p className="font-medium text-gray-900">{restaurant.name}</p><p className="text-gray-500">{restaurant.cuisineType}</p></td>
                  <td className="px-4 py-3 text-gray-600">{restaurant.ownerName || 'Unknown'}</td>
                  <td className="px-4 py-3"><StateBadges open={restaurant.isOpen} verified={restaurant.isVerified} openText="Open" closedText="Closed" /></td>
                  <td className="px-4 py-3 text-gray-600">{Number(restaurant.averageRating || 0).toFixed(1)}</td>
                  <td className="px-4 py-3 text-right">
                    <RowButton label="View restaurant details" onClick={() => openDetail('Restaurant', restaurant)}><FiEye /></RowButton>
                    <RowButton label={restaurant.isOpen ? 'Close restaurant' : 'Open restaurant'} onClick={() => confirmAction({ title: restaurant.isOpen ? 'Close restaurant?' : 'Open restaurant?', message: `${restaurant.name} availability customers ko affect karegi.`, action: () => adminService.updateRestaurantStatus(restaurant.id, !restaurant.isOpen), successMessage: 'Restaurant status updated', loadingMessage: 'Restaurant status update ho raha hai...', danger: restaurant.isOpen })}><FiClock /></RowButton>
                    <RowButton label={restaurant.isVerified ? 'Mark restaurant pending' : 'Verify restaurant'} onClick={() => runAction(() => adminService.verifyRestaurant(restaurant.id, !restaurant.isVerified), 'Restaurant verification updated', 'Restaurant verification update ho rahi hai...')}><FiCheckCircle /></RowButton>
                    <RowButton label="Delete restaurant" danger onClick={() => confirmAction({ title: 'Delete restaurant?', message: `${restaurant.name} ko remove karna orders/menu relation ko affect kar sakta hai.`, action: () => adminService.deleteRestaurant(restaurant.id), successMessage: 'Restaurant deleted', loadingMessage: 'Restaurant delete ho raha hai...', danger: true })}><FiTrash2 /></RowButton>
                  </td>
                </tr>
              ))}
            </Table>
            {filteredRestaurants.length === 0 && <EmptyState title="No restaurants found" message="Name, owner, status ya verification filter adjust karein." />}
          </DataSection>
        )}

        {activeTab === 'Orders' && (
          <DataSection title="Orders" description="Track orders and adjust operational status." pagination={pagination.orders} onPageChange={(page, size) => handlePageChange('orders', page, size)}>
            <FilterBar search={filters.orders.search} onSearch={(value) => updateFilter('orders', 'search', value)} onReset={() => resetFilters('orders')}>
              <FilterSelect label="Status" value={filters.orders.status} onChange={(value) => updateFilter('orders', 'status', value)} options={['ALL', ...orderStatuses]} />
            </FilterBar>
            <Table columns={['Order', 'Customer', 'Restaurant', 'Amount', 'Commission', 'Status', 'Actions']}>
              {filteredOrders.map((order) => (
                <tr key={order.id}>
                  <td className="px-4 py-3"><p className="font-medium text-gray-900">{order.orderNumber}</p><p className="text-gray-500">{formatDate(order.createdAt)}</p></td>
                  <td className="px-4 py-3 text-gray-600">{order.user?.firstName || 'Customer'}</td>
                  <td className="px-4 py-3 text-gray-600">{order.restaurant?.name || 'Restaurant'}</td>
                  <td className="px-4 py-3 font-medium text-gray-900">{formatCurrency(order.totalAmount)}</td>
                  <td className="px-4 py-3"><p className="font-medium text-orange-600">{formatCurrency(order.platformCommission)}</p><p className="text-xs text-gray-500">Payout {formatCurrency(order.restaurantPayout)}</p></td>
                  <td className="px-4 py-3"><StatusSelect value={order.status} options={getOrderStatusOptions(order.status)} disabled={terminalOrderStatuses.includes(order.status)} onChange={(status) => runAction(() => adminService.updateOrderStatus(order.id, status), 'Order status updated', 'Order status update ho raha hai...')} /></td>
                  <td className="px-4 py-3 text-right"><RowButton label="View order details" onClick={() => openDetail('Order', order)}><FiEye /></RowButton></td>
                </tr>
              ))}
            </Table>
            {filteredOrders.length === 0 && <EmptyState title="No orders found" message="Order number ya status filter change karein." />}
          </DataSection>
        )}

        {activeTab === 'Menu' && (
          <div className="grid grid-cols-1 gap-5 xl:grid-cols-[360px_1fr]">
            <Panel title="Add Menu Item" description="Create menu items for any restaurant.">
              <form onSubmit={submitMenuItem} className="space-y-3">
                <SelectInput label="Restaurant" value={menuForm.restaurantId} onChange={(value) => setMenuForm({ ...menuForm, restaurantId: value })} required>
                  <option value="">Select restaurant</option>
                  {restaurants.map((restaurant) => <option key={restaurant.id} value={restaurant.id}>{restaurant.name}</option>)}
                </SelectInput>
                <AdminInput label="Item Name" value={menuForm.name} onChange={(value) => setMenuForm({ ...menuForm, name: value })} />
                <AdminInput label="Price" type="number" value={menuForm.price} onChange={(value) => setMenuForm({ ...menuForm, price: value })} />
                <SelectInput label="Category" value={menuForm.categoryId} onChange={(value) => setMenuForm({ ...menuForm, categoryId: value })}>
                  <option value="">No category</option>
                  {categories.map((category) => <option key={category.id} value={category.id}>{category.name}</option>)}
                </SelectInput>
                <div className="grid grid-cols-2 gap-3">
                  <AdminInput label="Prep Min" type="number" value={menuForm.preparationTime} onChange={(value) => setMenuForm({ ...menuForm, preparationTime: value })} required={false} />
                  <AdminInput label="Discount %" type="number" value={menuForm.discountPercentage} onChange={(value) => setMenuForm({ ...menuForm, discountPercentage: value })} required={false} />
                </div>
                <AdminInput label="Description" value={menuForm.description} onChange={(value) => setMenuForm({ ...menuForm, description: value })} required={false} />
                <ToggleRow label="Available" checked={menuForm.isAvailable} onChange={(checked) => setMenuForm({ ...menuForm, isAvailable: checked })} />
                <ToggleRow label="Vegetarian" checked={menuForm.isVegetarian} onChange={(checked) => setMenuForm({ ...menuForm, isVegetarian: checked })} />
                <SubmitButton icon={FiPackage} disabled={saving || menuSaving} loading={menuSaving}>Add Menu Item</SubmitButton>
                {menuSaving && <ProgressNotice message="Menu item add ho raha hai..." />}
              </form>
            </Panel>
            <DataSection title="Menu Items" description={`${menuStats.available} visible on app, ${menuStats.discounted} discounted on current page.`} pagination={pagination.menuItems} onPageChange={(page, size) => handlePageChange('menuItems', page, size)}>
              <FilterBar search={filters.menu.search} onSearch={(value) => updateFilter('menu', 'search', value)} onReset={() => resetFilters('menu')}>
                <FilterSelect label="Status" value={filters.menu.status} onChange={(value) => updateFilter('menu', 'status', value)} options={['ALL', 'AVAILABLE', 'HIDDEN']} />
                <FilterSelect label="Category" value={filters.menu.category} onChange={(value) => updateFilter('menu', 'category', value)} options={['ALL', ...categories.map((category) => String(category.id))]} labels={{ ALL: 'ALL', ...categories.reduce((acc, category) => ({ ...acc, [String(category.id)]: category.name }), {}) }} />
              </FilterBar>
              <Table columns={['Item', 'Restaurant', 'Price', 'State', 'Actions']}>
                {filteredMenuItems.map((item) => (
                  <tr key={item.id}>
                    <td className="px-4 py-3"><p className="font-medium text-gray-900">{item.name}</p><p className="text-gray-500">{item.categoryName || 'Uncategorized'}</p></td>
                    <td className="px-4 py-3 text-gray-600">{item.restaurantName}</td>
                    <td className="px-4 py-3"><p className="font-medium text-gray-900">{formatCurrency(item.discountedPrice || item.price)}</p><p className="text-gray-500">{Number(item.discountPercentage || 0)}% off</p></td>
                    <td className="px-4 py-3"><Tooltip label={item.isAvailable ? 'Item is visible to customers' : 'Item is hidden from customers'}><Badge tone={item.isAvailable ? 'green' : 'gray'}>{item.isAvailable ? 'Available' : 'Hidden'}</Badge></Tooltip></td>
                    <td className="px-4 py-3 text-right">
                      <RowButton label="View menu item details" onClick={() => openDetail('Menu Item', item)}><FiEye /></RowButton>
                      <RowButton label={item.isAvailable ? 'Hide item' : 'Show item'} disabled={saving} onClick={() => runAction(() => adminService.updateMenuItemAvailability(item.id, !item.isAvailable), 'Menu availability updated', 'Menu availability update ho rahi hai...')}>{item.isAvailable ? <FiToggleRight /> : <FiToggleLeft />}</RowButton>
                      <RowButton label="Update price" onClick={() => promptNumberAction('Enter new price', (value) => adminService.updateMenuItemPrice(item.id, value), 'Menu price updated')}><FiEdit3 /></RowButton>
                      <RowButton label="Update discount" onClick={() => promptNumberAction('Enter discount percentage', (value) => adminService.updateMenuItemDiscount(item.id, value), 'Menu discount updated')}><FiTag /></RowButton>
                      <RowButton label="Delete menu item" danger onClick={() => confirmAction({ title: 'Delete menu item?', message: `${item.name} customer menu se remove ho jayega.`, action: () => adminService.deleteMenuItem(item.id), successMessage: 'Menu item deleted', loadingMessage: 'Menu item delete ho raha hai...', danger: true })}><FiTrash2 /></RowButton>
                    </td>
                  </tr>
                ))}
              </Table>
              {filteredMenuItems.length === 0 && <EmptyState title="No menu items found" message="Item name, restaurant, category ya status filter change karein." />}
            </DataSection>
          </div>
        )}

        {activeTab === 'Categories' && (
          <div className="grid grid-cols-1 gap-5 xl:grid-cols-[360px_1fr]">
            <Panel title={categoryForm.id ? 'Edit Category' : 'Add Category'} description="Control app browsing taxonomy.">
              <form onSubmit={submitCategory} className="space-y-3">
                <AdminInput label="Category Name" value={categoryForm.name} onChange={(value) => setCategoryForm({ ...categoryForm, name: value })} />
                <AdminInput label="Description" value={categoryForm.description} onChange={(value) => setCategoryForm({ ...categoryForm, description: value })} required={false} />
                <AdminInput label="Image URL" value={categoryForm.imageUrl} onChange={(value) => setCategoryForm({ ...categoryForm, imageUrl: value })} required={false} />
                <AdminInput label="Display Order" type="number" value={categoryForm.displayOrder} onChange={(value) => setCategoryForm({ ...categoryForm, displayOrder: value })} required={false} />
                <SelectInput label="Parent Category" value={categoryForm.parentCategoryId} onChange={(value) => setCategoryForm({ ...categoryForm, parentCategoryId: value })}>
                  <option value="">None</option>
                  {categories.filter((category) => category.id !== categoryForm.id).map((category) => <option key={category.id} value={category.id}>{category.name}</option>)}
                </SelectInput>
                <SubmitButton icon={FiTag} disabled={saving || categorySaving} loading={categorySaving}>{categoryForm.id ? 'Update Category' : 'Add Category'}</SubmitButton>
                {categorySaving && <ProgressNotice message={categoryForm.id ? 'Category update ho rahi hai...' : 'Category add ho rahi hai...'} />}
                {categoryForm.id && <button type="button" onClick={() => setCategoryForm(emptyCategoryForm)} className="w-full rounded-lg border border-gray-200 px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-50">Cancel Edit</button>}
              </form>
            </Panel>
            <section className="overflow-hidden rounded-lg border border-gray-200 bg-white shadow-sm">
              <TableHeader title="Categories" description="Create, edit, activate, deactivate, and delete menu categories. Default view shows 4 rows." />
              <FilterBar search={filters.categories.search} onSearch={(value) => updateFilter('categories', 'search', value)} onReset={() => resetFilters('categories')}>
                <FilterSelect label="Status" value={filters.categories.status} onChange={(value) => updateFilter('categories', 'status', value)} options={['ALL', 'ACTIVE', 'INACTIVE']} />
              </FilterBar>
              <Table columns={['Category', 'Parent', 'Items', 'Status', 'Actions']}>
                {categoryPage.items.map((category) => (
                  <tr key={category.id}>
                    <td className="px-4 py-3"><p className="font-medium text-gray-900">{category.name}</p><p className="text-gray-500">{category.description || 'No description'}</p></td>
                    <td className="px-4 py-3 text-gray-600">{category.parentCategoryName || 'Root'}</td>
                    <td className="px-4 py-3 text-gray-600">{category.menuItemsCount || 0}</td>
                    <td className="px-4 py-3"><Tooltip label={category.isActive ? 'Category is visible' : 'Category is hidden'}><Badge tone={category.isActive ? 'green' : 'gray'}>{category.isActive ? 'Active' : 'Inactive'}</Badge></Tooltip></td>
                    <td className="px-4 py-3 text-right">
                      <RowButton label="View category details" onClick={() => openDetail('Category', category)}><FiEye /></RowButton>
                      <RowButton label="Edit category" onClick={() => setCategoryForm({ ...emptyCategoryForm, ...category, parentCategoryId: category.parentCategoryId || '', displayOrder: category.displayOrder || '' })}><FiEdit3 /></RowButton>
                      <RowButton label={category.isActive ? 'Deactivate category' : 'Activate category'} onClick={() => confirmAction({ title: category.isActive ? 'Deactivate category?' : 'Activate category?', message: `${category.name} visibility change hogi.`, action: () => category.isActive ? adminService.deactivateCategory(category.id) : adminService.activateCategory(category.id), successMessage: 'Category status updated', loadingMessage: 'Category status update ho raha hai...', danger: category.isActive })}>{category.isActive ? <FiSlash /> : <FiCheckCircle />}</RowButton>
                      <RowButton label="Delete category" danger onClick={() => confirmAction({ title: 'Delete category?', message: `${category.name} ko delete karna menu grouping ko affect kar sakta hai.`, action: () => adminService.deleteCategory(category.id), successMessage: 'Category deleted', loadingMessage: 'Category delete ho rahi hai...', danger: true })}><FiTrash2 /></RowButton>
                    </td>
                  </tr>
                ))}
              </Table>
              {categoryPage.items.length === 0 && <EmptyState title="No categories found" message="Search ya status filter change karein." />}
              <TablePagination meta={categoryPage.meta} onChange={handleCategoryPageChange} pageSizeOptions={[4, 5, 10, 20]} />
            </section>
          </div>
        )}

        {activeTab === 'Delivery' && (
          <DataSection title="Delivery Partners" description="Verify partners and control platform availability." pagination={pagination.deliveryPartners} onPageChange={(page, size) => handlePageChange('deliveryPartners', page, size)}>
            <FilterBar search={filters.delivery.search} onSearch={(value) => updateFilter('delivery', 'search', value)} onReset={() => resetFilters('delivery')}>
              <FilterSelect label="Availability" value={filters.delivery.status} onChange={(value) => updateFilter('delivery', 'status', value)} options={['ALL', 'AVAILABLE', 'UNAVAILABLE']} />
              <FilterSelect label="Verified" value={filters.delivery.verified} onChange={(value) => updateFilter('delivery', 'verified', value)} options={['ALL', 'VERIFIED', 'PENDING']} />
            </FilterBar>
            <Table columns={['Partner', 'Vehicle', 'Zone', 'Performance', 'State', 'Actions']}>
              {filteredDeliveryPartners.map((partner) => (
                <tr key={partner.id}>
                  <td className="px-4 py-3"><p className="font-medium text-gray-900">{partner.name}</p><p className="text-gray-500">{partner.email}</p></td>
                  <td className="px-4 py-3"><p className="text-gray-700">{partner.vehicleType || 'Vehicle'}</p><p className="text-gray-500">{partner.vehicleNumber || 'No number'}</p></td>
                  <td className="px-4 py-3 text-gray-600">{partner.zone || 'Not set'}</td>
                  <td className="px-4 py-3"><p className="text-gray-700">{partner.totalDeliveries || 0} deliveries</p><p className="text-gray-500">{formatCurrency(partner.totalEarnings)}</p></td>
                  <td className="px-4 py-3"><StateBadges open={partner.isAvailable} verified={partner.isVerified} openText={partner.status || 'Status'} closedText="Unavailable" /></td>
                  <td className="px-4 py-3 text-right">
                    <RowButton label="View partner details" onClick={() => openDetail('Delivery Partner', partner)}><FiEye /></RowButton>
                    <RowButton label={partner.isAvailable ? 'Make unavailable' : 'Make available'} onClick={() => confirmAction({ title: partner.isAvailable ? 'Make partner unavailable?' : 'Make partner available?', message: `${partner.name} delivery allocation availability change hogi.`, action: () => adminService.updateDeliveryPartnerAvailability(partner.id, !partner.isAvailable), successMessage: 'Delivery availability updated', loadingMessage: 'Delivery availability update ho rahi hai...', danger: partner.isAvailable })}>{partner.isAvailable ? <FiToggleRight /> : <FiToggleLeft />}</RowButton>
                    <RowButton label={partner.isVerified ? 'Remove verification' : 'Verify partner'} onClick={() => runAction(() => adminService.verifyDeliveryPartner(partner.id, !partner.isVerified), 'Delivery verification updated', 'Delivery verification update ho rahi hai...')}><FiCheckCircle /></RowButton>
                  </td>
                </tr>
              ))}
            </Table>
            {filteredDeliveryPartners.length === 0 && <EmptyState title="No delivery partners found" message="Name, zone, vehicle, availability ya verification filter adjust karein." />}
          </DataSection>
        )}

        {activeTab === 'Payments/Wallet' && (
          <div className="space-y-5">
            <Panel title="Add Wallet Cashback" description="Credit wallet amount for support adjustments, refunds, or loyalty gestures.">
              <form onSubmit={submitCashback} className="grid grid-cols-1 gap-3 md:grid-cols-4">
                <SelectInput label="User" value={cashbackForm.userId} onChange={(value) => setCashbackForm({ ...cashbackForm, userId: value })} required>
                  <option value="">Select user</option>
                  {users.map((user) => <option key={user.id} value={user.id}>{user.firstName} {user.lastName} - {user.email}</option>)}
                </SelectInput>
                <AdminInput label="Amount" type="number" value={cashbackForm.amount} onChange={(value) => setCashbackForm({ ...cashbackForm, amount: value })} />
                <AdminInput label="Reason" value={cashbackForm.reason} onChange={(value) => setCashbackForm({ ...cashbackForm, reason: value })} />
                <div className="flex items-end"><SubmitButton icon={FiDollarSign} disabled={saving || cashbackSaving} loading={cashbackSaving}>Add Cashback</SubmitButton></div>
              </form>
              {cashbackSaving && <div className="mt-3"><ProgressNotice message="Wallet cashback add ho raha hai..." /></div>}
            </Panel>
            <DataSection title="Payments" description="Monitor payment status and process eligible refunds." pagination={pagination.payments} onPageChange={(page, size) => handlePageChange('payments', page, size)}>
              <FilterBar search={filters.payments.search} onSearch={(value) => updateFilter('payments', 'search', value)} onReset={() => resetFilters('payments')}>
                <FilterSelect label="Status" value={filters.payments.status} onChange={(value) => updateFilter('payments', 'status', value)} options={['ALL', 'PENDING', 'SUCCESS', 'FAILED', 'REFUNDED', 'PARTIALLY_REFUNDED']} />
              </FilterBar>
              <Table columns={['Payment', 'Order', 'Method', 'Amount', 'Status', 'Actions']}>
                {filteredPayments.map((payment) => (
                  <tr key={payment.id}>
                    <td className="px-4 py-3"><p className="font-medium text-gray-900">{payment.transactionId || payment.paymentOrderId || `PAY-${payment.id}`}</p><p className="text-gray-500">{formatDate(payment.paymentDate)}</p></td>
                    <td className="px-4 py-3 text-gray-600">{payment.orderNumber}</td>
                    <td className="px-4 py-3 text-gray-600">{payment.paymentMethod || 'Unknown'}</td>
                    <td className="px-4 py-3 font-medium text-gray-900">{formatCurrency(payment.amount)}</td>
                    <td className="px-4 py-3"><PaymentBadge status={payment.paymentStatus} /></td>
                    <td className="px-4 py-3 text-right">
                      <RowButton label="View payment details" onClick={() => openDetail('Payment', payment)}><FiEye /></RowButton>
                      <RowButton label="Process refund" danger onClick={() => promptRefundAction(payment)}><FiCreditCard /></RowButton>
                    </td>
                  </tr>
                ))}
              </Table>
              {filteredPayments.length === 0 && <EmptyState title="No payments found" message="Transaction, order ya payment status filter change karein." />}
            </DataSection>
            <DataSection title="Wallet Transactions" description="Review wallet credits, debits, cashback, refunds, and order payments." pagination={pagination.walletTransactions} onPageChange={(page, size) => handlePageChange('walletTransactions', page, size)}>
              <FilterBar search={filters.wallet.search} onSearch={(value) => updateFilter('wallet', 'search', value)} onReset={() => resetFilters('wallet')}>
                <FilterSelect label="Type" value={filters.wallet.type} onChange={(value) => updateFilter('wallet', 'type', value)} options={['ALL', 'CREDIT', 'DEBIT']} />
                <FilterSelect label="Status" value={filters.wallet.status} onChange={(value) => updateFilter('wallet', 'status', value)} options={['ALL', 'PENDING', 'SUCCESS', 'FAILED']} />
              </FilterBar>
              <Table columns={['Reference', 'Type', 'Mode', 'Amount', 'Status', 'Date', 'Actions']}>
                {filteredWalletTransactions.map((transaction) => (
                  <tr key={transaction.id}>
                    <td className="px-4 py-3"><p className="font-medium text-gray-900">{transaction.transactionReference}</p><p className="text-gray-500">{transaction.description}</p></td>
                    <td className="px-4 py-3"><Badge tone={transaction.transactionType === 'CREDIT' ? 'green' : 'orange'}>{transaction.transactionType}</Badge></td>
                    <td className="px-4 py-3 text-gray-600">{transaction.mode}</td>
                    <td className="px-4 py-3 font-medium text-gray-900">{formatCurrency(transaction.amount)}</td>
                    <td className="px-4 py-3"><PaymentBadge status={transaction.status} /></td>
                    <td className="px-4 py-3 text-gray-500">{formatDate(transaction.transactionDate)}</td>
                    <td className="px-4 py-3 text-right"><RowButton label="View wallet transaction details" onClick={() => openDetail('Wallet Transaction', transaction)}><FiEye /></RowButton></td>
                  </tr>
                ))}
              </Table>
              {filteredWalletTransactions.length === 0 && <EmptyState title="No wallet transactions found" message="Reference, mode, type ya status filter adjust karein." />}
            </DataSection>
          </div>
        )}

        {activeTab === 'Reviews' && (
          <div className="space-y-5">
            <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
              <StatCard label="Total Reviews" value={reviewStats.total} icon={FiStar} tone="orange" />
              <StatCard label="Pending Approval" value={reviewStats.pending} icon={FiClock} tone="violet" />
              <StatCard label="Avg Rating Page" value={reviewStats.average} icon={FiCheckCircle} tone="green" />
            </div>
            <DataSection title="Reviews" description="Approve customer reviews, moderate unsafe content, or remove invalid entries." pagination={pagination.reviews} onPageChange={(page, size) => handlePageChange('reviews', page, size)}>
              <FilterBar search={filters.reviews.search} onSearch={(value) => updateFilter('reviews', 'search', value)} onReset={() => resetFilters('reviews')}>
                <FilterSelect label="Status" value={filters.reviews.status} onChange={(value) => updateFilter('reviews', 'status', value)} options={['ALL', 'APPROVED', 'PENDING']} />
                <FilterSelect label="Rating" value={filters.reviews.rating} onChange={(value) => updateFilter('reviews', 'rating', value)} options={['ALL', '5', '4', '3', '2', '1']} />
              </FilterBar>
              <Table columns={['Review', 'Target', 'Customer', 'Votes', 'Status', 'Actions']}>
                {filteredReviews.map((review) => (
                  <tr key={review.id}>
                    <td className="px-4 py-3 max-w-sm"><p className="font-medium text-gray-900">{review.rating} star rating</p><p className="line-clamp-2 text-gray-500">{review.comment || 'No comment'}</p></td>
                    <td className="px-4 py-3"><p className="text-gray-700">{review.restaurantName || review.deliveryPartnerName || 'Target'}</p><p className="text-gray-500">{review.reviewType}</p></td>
                    <td className="px-4 py-3 text-gray-600">{review.userName}</td>
                    <td className="px-4 py-3 text-gray-600">{review.helpfulCount || 0} helpful</td>
                    <td className="px-4 py-3"><Tooltip label={review.isApproved ? 'Review is public' : 'Review needs admin approval'}><Badge tone={review.isApproved ? 'green' : 'orange'}>{review.isApproved ? 'Approved' : 'Pending'}</Badge></Tooltip></td>
                    <td className="px-4 py-3 text-right">
                      <RowButton label="View review details" onClick={() => openDetail('Review', review)}><FiEye /></RowButton>
                      {!review.isApproved && <RowButton label="Approve review" onClick={() => runAction(() => adminService.approveReview(review.id), 'Review approved', 'Review approve ho raha hai...')}><FiCheckCircle /></RowButton>}
                      <RowButton label="Delete review" danger onClick={() => confirmAction({ title: 'Delete review?', message: `Review by ${review.userName || 'customer'} remove ho jayega.`, action: () => adminService.deleteReview(review.id), successMessage: 'Review deleted', loadingMessage: 'Review delete ho raha hai...', danger: true })}><FiTrash2 /></RowButton>
                    </td>
                  </tr>
                ))}
              </Table>
              {filteredReviews.length === 0 && <EmptyState title="No reviews found" message="Customer, target, rating ya approval status filter change karein." />}
            </DataSection>
          </div>
        )}

        {activeTab === 'Audit Logs' && (
          <div className="space-y-5">
            <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
              <StatCard label="Loaded Activities" value={auditLogs.length} icon={FiFileText} tone="orange" />
              <StatCard label="Successful Actions" value={auditLogs.filter((log) => log.success).length} icon={FiCheckCircle} tone="green" />
              <StatCard label="Failed Actions" value={auditLogs.filter((log) => !log.success).length} icon={FiAlertTriangle} tone="violet" />
            </div>
            <DataSection title="Audit Logs" description="Track admin actions with operator, endpoint, status, IP address, and timestamp." pagination={pagination.auditLogs} onPageChange={(page, size) => handlePageChange('auditLogs', page, size)}>
              <FilterBar search={filters.auditLogs.search} onSearch={(value) => updateFilter('auditLogs', 'search', value)} onReset={() => resetFilters('auditLogs')}>
                <FilterSelect label="Status" value={filters.auditLogs.status} onChange={(value) => updateFilter('auditLogs', 'status', value)} options={['ALL', 'SUCCESS', 'FAILED']} />
                <FilterSelect label="Method" value={filters.auditLogs.method} onChange={(value) => updateFilter('auditLogs', 'method', value)} options={['ALL', 'POST', 'PUT', 'PATCH', 'DELETE']} />
                <button type="button" onClick={applyAuditFilters} className="inline-flex items-center gap-2 rounded-lg bg-orange-500 px-3 py-2 text-sm font-medium text-white hover:bg-orange-600">
                  <FiSearch /> Apply
                </button>
              </FilterBar>
              <Table columns={['Action', 'Admin', 'Resource', 'Status', 'IP', 'Time', 'Actions']}>
                {filteredAuditLogs.map((log) => (
                  <tr key={log.id}>
                    <td className="px-4 py-3"><p className="font-medium text-gray-900">{log.action}</p><p className="text-gray-500">{log.httpMethod} {log.endpoint}</p></td>
                    <td className="px-4 py-3"><p className="text-gray-700">{log.adminEmail}</p><p className="text-gray-500">{log.adminRole}</p></td>
                    <td className="px-4 py-3 text-gray-600">{log.resource}</td>
                    <td className="px-4 py-3"><Tooltip label={log.success ? 'Action completed successfully' : (log.errorMessage || 'Action failed')}><Badge tone={log.success ? 'green' : 'red'}>{log.success ? 'Success' : 'Failed'}</Badge></Tooltip></td>
                    <td className="px-4 py-3 text-gray-600">{log.ipAddress || 'Unknown'}</td>
                    <td className="px-4 py-3 text-gray-500">{formatDate(log.createdAt)}</td>
                    <td className="px-4 py-3 text-right"><RowButton label="View audit details" onClick={() => openDetail('Audit Log', log)}><FiEye /></RowButton></td>
                  </tr>
                ))}
              </Table>
              {filteredAuditLogs.length === 0 && <EmptyState title="No audit logs found" message="Admin action hone ke baad logs yahan show honge. Search ya filters bhi reset karke dekhein." />}
            </DataSection>
          </div>
        )}

        {activeTab === 'Create Admin' && (
          <section className="overflow-hidden rounded-2xl border border-white/40 bg-white/70 shadow-2xl shadow-orange-100/60 backdrop-blur-xl">
            <div className="border-b border-white/40 bg-linear-to-r from-orange-500 via-orange-500 to-rose-500 px-5 py-5 text-white">
              <div className="flex items-center gap-3">
                <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-white/20 shadow-sm backdrop-blur">
                  <FiShield className="h-5 w-5" />
                </span>
                <div>
                  <h2 className="text-lg font-bold">Create Admin</h2>
                  <p className="text-sm text-white/85">Provision trusted operators from a secured admin workspace.</p>
                </div>
              </div>
            </div>
            <form onSubmit={submitAdmin} className="grid grid-cols-1 gap-4 p-5 md:grid-cols-2">
              <AdminInput label="First Name" value={adminForm.firstName} onChange={(value) => setAdminForm({ ...adminForm, firstName: value })} disabled={saving || adminSaving} glass />
              <AdminInput label="Last Name" value={adminForm.lastName} onChange={(value) => setAdminForm({ ...adminForm, lastName: value })} disabled={saving || adminSaving} glass />
              <AdminInput label="Email" type="email" value={adminForm.email} onChange={(value) => setAdminForm({ ...adminForm, email: value })} disabled={saving || adminSaving} glass />
              <AdminInput label="Phone Number" value={adminForm.phoneNumber} onChange={(value) => setAdminForm({ ...adminForm, phoneNumber: value })} disabled={saving || adminSaving} glass />
              <PasswordInput label="Password" value={adminForm.password} onChange={(value) => setAdminForm({ ...adminForm, password: value })} visible={showAdminPassword} onToggle={() => setShowAdminPassword((current) => !current)} disabled={saving || adminSaving} />
              <PasswordInput label="Confirm Password" value={adminForm.confirmPassword} onChange={(value) => setAdminForm({ ...adminForm, confirmPassword: value })} visible={showAdminConfirmPassword} onToggle={() => setShowAdminConfirmPassword((current) => !current)} disabled={saving || adminSaving} />
              <div className="flex items-end md:col-span-2"><SubmitButton icon={FiUserPlus} disabled={saving || adminSaving} loading={adminSaving}>Create Admin</SubmitButton></div>
            </form>
            {adminSaving && <div className="px-5 pb-5"><ProgressNotice message="Admin account create ho raha hai..." /></div>}
          </section>
        )}

        <DetailDrawer detail={detailDrawer} onClose={() => setDetailDrawer(null)} />
        <ConfirmDialog dialog={confirmDialog} onCancel={() => setConfirmDialog(null)} onConfirm={executeConfirmAction} saving={saving} />
      </div>
    </div>
  );
}

function matchesSearch(item, search, keys) {
  const normalizedSearch = String(search || '').trim().toLowerCase();
  if (!normalizedSearch) return true;

  return keys.some((key) => {
    const value = key.split('.').reduce((current, part) => current?.[part], item);
    return String(value || '').toLowerCase().includes(normalizedSearch);
  });
}

function StatCard({ label, value, icon: Icon, tone }) {
  const tones = {
    orange: 'bg-orange-50 text-orange-600 border-orange-100',
    green: 'bg-green-50 text-green-600 border-green-100',
    blue: 'bg-blue-50 text-blue-600 border-blue-100',
    violet: 'bg-violet-50 text-violet-600 border-violet-100',
  };

  return (
    <div className={`rounded-lg border p-4 ${tones[tone]}`}>
      <div className="flex items-center justify-between gap-3">
        <p className="text-2xl font-bold">{value}</p>
        <Icon className="h-6 w-6" />
      </div>
      <p className="mt-1 text-sm text-gray-600">{label}</p>
    </div>
  );
}

function Panel({ title, description, children }) {
  return (
    <section className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
      <h2 className="font-semibold text-gray-900">{title}</h2>
      {description && <p className="mt-1 mb-4 text-sm text-gray-500">{description}</p>}
      <div className={description ? '' : 'mt-3'}>{children}</div>
    </section>
  );
}

function MetricRow({ label, value, tone = 'gray' }) {
  return (
    <div className="flex items-center justify-between py-1">
      <span className="text-sm text-gray-600">{label}</span>
      <Badge tone={tone}>{value}</Badge>
    </div>
  );
}

function DataSection({ title, description, pagination, onPageChange, children }) {
  return (
    <section className="overflow-hidden rounded-lg border border-gray-200 bg-white shadow-sm">
      <TableHeader title={title} description={description} />
      {children}
      <TablePagination meta={pagination} onChange={onPageChange} />
    </section>
  );
}

function FilterBar({ search, onSearch, onReset, children }) {
  return (
    <div className="flex flex-col gap-3 border-b border-gray-100 bg-white px-4 py-3 lg:flex-row lg:items-end lg:justify-between">
      <label className="min-w-0 flex-1">
        <span className="mb-1 block text-xs font-medium uppercase text-gray-500">Search</span>
        <div className="relative">
          <FiSearch className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
          <input
            value={search}
            onChange={(event) => onSearch(event.target.value)}
            placeholder="Search records..."
            className="w-full rounded-lg border border-gray-200 bg-gray-50 py-2 pl-9 pr-3 text-sm outline-none focus:border-orange-400 focus:bg-white focus:ring-2 focus:ring-orange-100"
          />
        </div>
      </label>
      <div className="flex flex-wrap items-end gap-2">
        {children}
        <button type="button" onClick={onReset} className="inline-flex items-center gap-2 rounded-lg border border-gray-200 px-3 py-2 text-sm font-medium text-gray-600 hover:bg-gray-50">
          <FiX /> Reset
        </button>
      </div>
    </div>
  );
}

function FilterSelect({ label, value, onChange, options, labels = {} }) {
  return (
    <label className="block">
      <span className="mb-1 block text-xs font-medium uppercase text-gray-500">{label}</span>
      <select
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm text-gray-700 outline-none focus:border-orange-400 focus:ring-2 focus:ring-orange-100"
      >
        {options.map((option) => <option key={option} value={option}>{labels[option] || option}</option>)}
      </select>
    </label>
  );
}

function EmptyState({ title, message }) {
  return (
    <div className="border-t border-gray-100 px-4 py-10 text-center">
      <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-orange-50 text-orange-500">
        <FiSearch className="h-5 w-5" />
      </div>
      <h3 className="mt-3 font-semibold text-gray-900">{title}</h3>
      <p className="mt-1 text-sm text-gray-500">{message}</p>
    </div>
  );
}

function Table({ columns, children }) {
  return (
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-gray-200 text-sm">
        <thead className="bg-gray-50 text-left text-xs uppercase text-gray-500">
          <tr>
            {columns.map((column, index) => <th key={column} className={`px-4 py-3 ${index === columns.length - 1 && column === 'Actions' ? 'text-right' : ''}`}>{column}</th>)}
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100">
          {children}
        </tbody>
      </table>
    </div>
  );
}

function TableHeader({ title, description }) {
  return (
    <div className="border-b border-gray-100 px-4 py-4">
      <h2 className="font-semibold text-gray-900">{title}</h2>
      <p className="mt-1 text-sm text-gray-500">{description}</p>
    </div>
  );
}

function Badge({ children, tone = 'gray' }) {
  const tones = {
    gray: 'bg-gray-100 text-gray-700',
    green: 'bg-green-100 text-green-700',
    red: 'bg-red-100 text-red-700',
    blue: 'bg-blue-100 text-blue-700',
    orange: 'bg-orange-100 text-orange-700',
  };
  return <span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-medium ${tones[tone]}`}>{children}</span>;
}

function PaymentBadge({ status }) {
  const tone = status === 'SUCCESS' ? 'green' : status === 'FAILED' || status === 'REFUNDED' ? 'red' : status === 'PENDING' ? 'orange' : 'blue';
  return <Tooltip label={`Payment or transaction status: ${status || 'Unknown'}`}><Badge tone={tone}>{status || 'UNKNOWN'}</Badge></Tooltip>;
}

function StateBadges({ open, verified, openText, closedText }) {
  return (
    <div className="flex flex-wrap gap-2">
      <Tooltip label={open ? 'Operationally available' : 'Currently unavailable'}>
        <Badge tone={open ? 'green' : 'gray'}>{open ? openText : closedText}</Badge>
      </Tooltip>
      <Tooltip label={verified ? 'Verified by admin' : 'Verification pending'}>
        <Badge tone={verified ? 'green' : 'orange'}>{verified ? 'Verified' : 'Pending'}</Badge>
      </Tooltip>
    </div>
  );
}

function StatusSelect({ value, options, onChange, disabled = false }) {
  return (
    <Tooltip label={disabled ? 'Final status cannot be changed' : 'Change order status'}>
      <select
        value={value}
        onChange={(event) => onChange(event.target.value)}
        disabled={disabled}
        className="rounded-md border border-gray-200 bg-white px-2 py-1 text-xs font-medium text-gray-700 disabled:cursor-not-allowed disabled:bg-gray-100 disabled:text-gray-400"
      >
        {options.map((status) => <option key={status} value={status}>{status}</option>)}
      </select>
    </Tooltip>
  );
}

function Tooltip({ children, label }) {
  return (
    <span className="group relative inline-flex">
      {children}
      <span className="pointer-events-none absolute bottom-full left-1/2 z-30 mb-2 -translate-x-1/2 whitespace-nowrap rounded-md bg-gray-900 px-2.5 py-1 text-xs font-medium text-white opacity-0 shadow-lg transition group-hover:opacity-100">
        {label}
      </span>
    </span>
  );
}

function ProgressNotice({ message }) {
  return (
    <div className="flex items-center gap-3 rounded-lg border border-orange-100 bg-orange-50 px-3 py-2 text-sm text-orange-700 shadow-sm">
      <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-white text-orange-500 shadow-sm">
        <FiRefreshCw className="h-4 w-4 animate-spin" />
      </span>
      <span>{message}</span>
    </div>
  );
}

function DetailDrawer({ detail, onClose }) {
  if (!detail) return null;
  const entries = Object.entries(detail.item || {})
    .filter(([, value]) => value !== null && value !== undefined && typeof value !== 'object')
    .slice(0, 18);

  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center bg-gray-900/40 px-4 py-6">
      <button type="button" className="absolute inset-0" onClick={onClose} aria-label="Close details" />
      <section className="relative flex max-h-[88vh] w-full max-w-3xl flex-col overflow-hidden rounded-xl border border-gray-200 bg-white shadow-2xl">
        <div className="flex items-start justify-between border-b border-gray-100 bg-linear-to-r from-orange-50 to-white px-5 py-4">
          <div className="min-w-0">
            <div className="inline-flex items-center gap-2 rounded-full bg-orange-100 px-3 py-1 text-xs font-semibold uppercase text-orange-700">
              <FiEye className="h-3.5 w-3.5" />
              {detail.type}
            </div>
            <h2 className="mt-3 wrap-break-word text-xl font-bold text-gray-900">{getDetailTitle(detail.type, detail.item)}</h2>
            <p className="mt-1 text-sm text-gray-500">Complete record snapshot for admin review.</p>
          </div>
          <button type="button" onClick={onClose} className="ml-3 rounded-lg border border-gray-200 bg-white p-2 text-gray-500 shadow-sm hover:bg-gray-50" aria-label="Close details">
            <FiX />
          </button>
        </div>

        <div className="grid gap-3 overflow-y-auto p-5 sm:grid-cols-2">
          {entries.map(([key, value]) => (
            <div key={key} className="rounded-lg border border-gray-100 bg-gray-50 px-3 py-2">
              <p className="text-xs font-medium uppercase text-gray-500">{formatLabel(key)}</p>
              <p className="mt-1 wrap-break-word text-sm font-medium text-gray-900">{formatDetailValue(value)}</p>
            </div>
          ))}
        </div>

        <div className="flex justify-end border-t border-gray-100 bg-gray-50 px-5 py-3">
          <button type="button" onClick={onClose} className="rounded-lg bg-orange-500 px-4 py-2 text-sm font-medium text-white hover:bg-orange-600">
            Close
          </button>
        </div>
      </section>
    </div>
  );
}

function ConfirmDialog({ dialog, onCancel, onConfirm, saving }) {
  if (!dialog) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-900/40 px-4">
      <div className="w-full max-w-md rounded-lg border border-gray-200 bg-white p-5 shadow-2xl">
        <div className="flex items-start gap-3">
          <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full ${dialog.danger ? 'bg-red-50 text-red-600' : 'bg-orange-50 text-orange-600'}`}>
            <FiAlertTriangle />
          </div>
          <div>
            <h2 className="text-lg font-bold text-gray-900">{dialog.title}</h2>
            <p className="mt-1 text-sm text-gray-500">{dialog.message}</p>
          </div>
        </div>
        <div className="mt-5 flex justify-end gap-2">
          <button type="button" onClick={onCancel} disabled={saving} className="rounded-lg border border-gray-200 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-60">Cancel</button>
          <button type="button" onClick={onConfirm} disabled={saving} className={`inline-flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium text-white disabled:opacity-60 ${dialog.danger ? 'bg-red-600 hover:bg-red-700' : 'bg-orange-500 hover:bg-orange-600'}`}>
            {saving && <FiRefreshCw className="animate-spin" />} Confirm
          </button>
        </div>
      </div>
    </div>
  );
}

function RowButton({ children, onClick, danger, label, disabled = false }) {
  return (
    <Tooltip label={label}>
      <button
        type="button"
        onClick={onClick}
        disabled={disabled}
        aria-label={label}
        className={`ml-2 inline-flex h-8 w-8 items-center justify-center rounded-md border ${
          danger ? 'border-red-100 text-red-600 hover:bg-red-50' : 'border-gray-200 text-gray-600 hover:bg-gray-50'
        } disabled:cursor-not-allowed disabled:opacity-50`}
      >
        {children}
      </button>
    </Tooltip>
  );
}

function TablePagination({ meta, onChange, pageSizeOptions = [4, 5, 10, 20] }) {
  const page = meta.page || 0;
  const size = meta.size || 4;
  const totalElements = meta.totalElements || 0;
  const totalPages = Math.max(meta.totalPages || 0, 1);
  const start = totalElements === 0 ? 0 : page * size + 1;
  const end = Math.min((page + 1) * size, totalElements);
  const pageNumbers = getVisiblePages(page, totalPages);

  return (
    <div className="flex flex-col gap-3 border-t border-gray-100 px-4 py-3 md:flex-row md:items-center md:justify-between">
      <div className="text-sm text-gray-500">
        Showing <span className="font-medium text-gray-700">{start}</span> to <span className="font-medium text-gray-700">{end}</span> of <span className="font-medium text-gray-700">{totalElements}</span>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <label className="flex items-center gap-2 text-sm text-gray-500">
          Rows
          <select
            value={size}
            onChange={(event) => onChange(0, Number(event.target.value))}
            className="rounded-md border border-gray-200 bg-white px-2 py-1 text-sm text-gray-700"
          >
            {pageSizeOptions.map((option) => <option key={option} value={option}>{option}</option>)}
          </select>
        </label>

        <div className="flex items-center rounded-md border border-gray-200 bg-white p-1 shadow-sm">
          <button type="button" onClick={() => onChange(Math.max(page - 1, 0), size)} disabled={page === 0 || totalElements === 0} className="inline-flex h-8 w-8 items-center justify-center rounded text-gray-600 hover:bg-gray-50 disabled:text-gray-300" aria-label="Previous page"><FiChevronLeft /></button>
          {pageNumbers.map((item, index) => item === 'ellipsis' ? (
            <span key={`${item}-${index}`} className="px-2 text-gray-400">...</span>
          ) : (
            <button type="button" key={item} onClick={() => onChange(item, size)} className={`h-8 min-w-8 rounded px-2 text-sm font-medium ${item === page ? 'bg-orange-500 text-white' : 'text-gray-600 hover:bg-gray-50'}`}>{item + 1}</button>
          ))}
          <button type="button" onClick={() => onChange(Math.min(page + 1, totalPages - 1), size)} disabled={page >= totalPages - 1 || totalElements === 0} className="inline-flex h-8 w-8 items-center justify-center rounded text-gray-600 hover:bg-gray-50 disabled:text-gray-300" aria-label="Next page"><FiChevronRight /></button>
        </div>
      </div>
    </div>
  );
}

function getVisiblePages(currentPage, totalPages) {
  if (totalPages <= 7) {
    return Array.from({ length: totalPages }, (_, index) => index);
  }
  const pages = [0];
  const start = Math.max(1, currentPage - 1);
  const end = Math.min(totalPages - 2, currentPage + 1);
  if (start > 1) pages.push('ellipsis');
  for (let index = start; index <= end; index += 1) pages.push(index);
  if (end < totalPages - 2) pages.push('ellipsis');
  pages.push(totalPages - 1);
  return pages;
}

function pageMeta(pageData, fallback) {
  return {
    page: pageData.number ?? fallback.page,
    size: pageData.size ?? fallback.size,
    totalElements: pageData.totalElements ?? fallback.totalElements,
    totalPages: pageData.totalPages ?? fallback.totalPages,
  };
}

function getDetailTitle(type, item) {
  if (type === 'User') return `${item.firstName || ''} ${item.lastName || ''}`.trim() || item.email || 'User';
  if (type === 'Restaurant') return item.name || 'Restaurant';
  if (type === 'Order') return item.orderNumber || 'Order';
  if (type === 'Menu Item') return item.name || 'Menu item';
  if (type === 'Category') return item.name || 'Category';
  if (type === 'Delivery Partner') return item.name || 'Delivery partner';
  if (type === 'Payment') return item.transactionId || item.paymentOrderId || item.orderNumber || 'Payment';
  if (type === 'Wallet Transaction') return item.transactionReference || 'Wallet transaction';
  if (type === 'Review') return `${item.rating || 0} star review`;
  if (type === 'Audit Log') return item.action || 'Audit log';
  return type;
}

function formatLabel(key) {
  return key.replace(/([A-Z])/g, ' $1').replace(/^./, (char) => char.toUpperCase());
}

function formatDetailValue(value) {
  if (typeof value === 'boolean') return value ? 'Yes' : 'No';
  if (String(value).match(/^\d{4}-\d{2}-\d{2}T/)) return formatDate(value);
  return String(value);
}

function AdminInput({ label, value, onChange, type = 'text', required = true, glass = false, disabled = false }) {
  const inputClass = glass
    ? 'w-full rounded-xl border border-white/50 bg-white/55 px-3 py-2.5 text-sm text-gray-900 shadow-sm outline-none backdrop-blur focus:border-orange-400 focus:bg-white/80 focus:ring-2 focus:ring-orange-100'
    : 'w-full rounded-lg border border-gray-200 px-3 py-2 text-sm outline-none focus:border-orange-400 focus:ring-2 focus:ring-orange-100';

  return (
    <label className="block">
      <span className="mb-1 block text-sm font-medium text-gray-700">{label}</span>
      <input
        type={type}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        required={required}
        disabled={disabled}
        className={`${inputClass} disabled:cursor-not-allowed disabled:opacity-60`}
      />
    </label>
  );
}

function PasswordInput({ label, value, onChange, visible, onToggle, disabled = false }) {
  return (
    <label className="block">
      <span className="mb-1 block text-sm font-medium text-gray-700">{label}</span>
      <div className="relative">
        <input
          type={visible ? 'text' : 'password'}
          value={value}
          onChange={(event) => onChange(event.target.value)}
          required
          disabled={disabled}
          className="w-full rounded-xl border border-white/50 bg-white/55 px-3 py-2.5 pr-11 text-sm text-gray-900 shadow-sm outline-none backdrop-blur focus:border-orange-400 focus:bg-white/80 focus:ring-2 focus:ring-orange-100 disabled:cursor-not-allowed disabled:opacity-60"
        />
        <button
          type="button"
          onClick={onToggle}
          disabled={disabled}
          className="absolute right-2 top-1/2 inline-flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-lg text-gray-500 hover:bg-orange-50 hover:text-orange-600 disabled:cursor-not-allowed disabled:opacity-50"
          aria-label={visible ? 'Hide password' : 'Show password'}
        >
          {visible ? <FiEyeOff /> : <FiEye />}
        </button>
      </div>
    </label>
  );
}

function SelectInput({ label, value, onChange, children, required = false }) {
  return (
    <label className="block">
      <span className="mb-1 block text-sm font-medium text-gray-700">{label}</span>
      <select
        value={value}
        onChange={(event) => onChange(event.target.value)}
        required={required}
        className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm outline-none focus:border-orange-400 focus:ring-2 focus:ring-orange-100"
      >
        {children}
      </select>
    </label>
  );
}

function ToggleRow({ label, checked, onChange }) {
  return (
    <label className="flex items-center justify-between rounded-lg border border-gray-100 bg-gray-50 px-3 py-2 text-sm text-gray-700">
      {label}
      <input type="checkbox" checked={checked} onChange={(event) => onChange(event.target.checked)} className="h-4 w-4 rounded border-gray-300 text-orange-500 focus:ring-orange-400" />
    </label>
  );
}

function SubmitButton({ children, icon: Icon, disabled, loading = false }) {
  return (
    <button disabled={disabled} className="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-orange-500 px-4 py-2.5 font-medium text-white hover:bg-orange-600 disabled:opacity-60">
      {loading ? <FiRefreshCw className="animate-spin" /> : <Icon />} {children}
    </button>
  );
}









