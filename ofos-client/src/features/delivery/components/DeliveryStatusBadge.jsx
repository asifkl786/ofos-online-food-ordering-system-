import { getDeliveryStatusConfig } from '../utils/deliveryHelpers';

export default function DeliveryStatusBadge({ status, size = 'md' }) {
  const config = getDeliveryStatusConfig(status);
  
  const sizeClasses = {
    sm: 'px-2 py-0.5 text-xs',
    md: 'px-3 py-1 text-sm',
    lg: 'px-4 py-1.5 text-base',
  };

  return (
    <span className={`inline-flex items-center gap-1 rounded-full font-medium ${sizeClasses[size]} ${config.color}`}>
      <span>{config.icon}</span>
      {config.label}
    </span>
  );
}