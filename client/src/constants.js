export const ORDER_STATUS_LABELS = {
  pending: 'Chờ xử lý',
  processing: 'Đang xử lý',
  shipped: 'Đang giao',
  delivered: 'Đã giao',
  cancelled: 'Đã hủy',
};

export const ORDER_STATUS_COLORS = {
  pending: 'bg-yellow-400/10 text-yellow-400',
  processing: 'bg-blue-400/10 text-blue-400',
  shipped: 'bg-purple-400/10 text-purple-400',
  delivered: 'bg-mint/10 text-mint',
  cancelled: 'bg-coral/10 text-coral',
};

export const CATEGORIES = [
  { value: 'laptop', label: 'Laptop' },
  { value: 'desktop', label: 'Desktop' },
  { value: 'monitor', label: 'Màn hình' },
  { value: 'accessory', label: 'Phụ kiện' },
];