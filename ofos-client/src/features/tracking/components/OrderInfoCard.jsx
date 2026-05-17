import { formatCurrency, formatDate } from '../utils/trackingHelpers';

const formatPaymentMethod = (method) => {
  if (!method) return 'Payment details pending';
  const labels = {
    UPI: 'UPI',
    SBI_NET_BANKING: 'SBI Net Banking',
    OTHER_BANK_NET_BANKING: 'Other Bank Net Banking',
    NET_BANKING: 'Net Banking',
    DEBIT_CARD: 'Debit Card',
    CREDIT_CARD: 'Credit Card',
    CASH_ON_DELIVERY: 'Cash on Delivery',
    WALLET: 'Wallet',
  };
  if (labels[method]) return labels[method];
  return method
    .toString()
    .replace(/_/g, ' ')
    .toLowerCase()
    .replace(/\b\w/g, (char) => char.toUpperCase());
};

const getItemName = (item) => (
  item?.itemName || item?.name || item?.menuItemName || 'Menu item'
);

const getItemTotal = (item) => {
  const subtotal = Number(item?.subtotal);
  if (Number.isFinite(subtotal) && subtotal > 0) return subtotal;

  const unitPrice = Number(item?.unitPrice ?? item?.price);
  const quantity = Number(item?.quantity ?? 1);
  return Number.isFinite(unitPrice) ? unitPrice * (Number.isFinite(quantity) ? quantity : 1) : 0;
};

export default function OrderInfoCard({ order }) {
  return (
    <div className="bg-white rounded-2xl shadow-md p-6">
      <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
        <span>📦</span> Order Details
      </h3>
      
      <div className="space-y-3">
        <div className="flex justify-between">
          <span className="text-gray-500">Order Number</span>
          <span className="font-medium text-gray-800">{order?.orderNumber}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-500">Order Date</span>
          <span className="text-gray-700">{formatDate(order?.createdAt)}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-500">Payment Method</span>
          <span className="text-gray-700 text-right">{formatPaymentMethod(order?.paymentMethod || order?.payment?.paymentMethod)}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-500">Total Amount</span>
          <span className="font-bold text-orange-500">{formatCurrency(order?.totalAmount)}</span>
        </div>
      </div>
      
      {/* Items List */}
      <div className="mt-4 pt-4 border-t border-gray-100">
        <h4 className="font-medium text-gray-700 mb-2">Items Ordered</h4>
        <div className="space-y-2">
          {order?.items?.map((item, idx) => (
            <div key={idx} className="flex justify-between text-sm">
              <span className="text-gray-600">
                {item.quantity}x {getItemName(item)}
              </span>
              <span className="text-gray-700">{formatCurrency(getItemTotal(item))}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
