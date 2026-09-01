import { Order, ClientInfo, BiometricMeasurements, EyebrowCustomParams } from '@/types';
import { DEFAULT_BIOMETRICS, DEFAULT_CUSTOM_PARAMS } from './biometrics';

const ORDERS_KEY = 'artistiq_orders_db_v1';

// Initial sample orders for demonstration/testing in admin panel
const INITIAL_DEMO_ORDERS: Order[] = [
  {
    id: 'ARTISTIQ-2026-A891',
    createdAt: new Date(Date.now() - 3600000 * 4).toISOString(),
    clientInfo: {
      fullName: 'Yasmine Benali',
      phone: '+213 550 12 34 56',
      address: '14 Rue Didouche Mourad',
      city: 'Alger',
      notes: 'Privilégier un silicone extra-souple pour peaux sensibles',
    },
    biometrics: {
      ...DEFAULT_BIOMETRICS,
      interEyebrowGapMm: 21.0,
      leftEyebrowLengthMm: 51.5,
      rightEyebrowLengthMm: 51.8,
      facialSymmetryIndex: 99.1,
    },
    customParams: {
      ...DEFAULT_CUSTOM_PARAMS,
      styleId: 'marque' as any,
      thicknessMm: 7.2,
      archHeightMm: 15.0,
    },
    status: 'pending_print',
  },
  {
    id: 'ARTISTIQ-2026-B102',
    createdAt: new Date(Date.now() - 3600000 * 28).toISOString(),
    clientInfo: {
      fullName: 'Amel Mansouri',
      phone: '+213 661 98 76 54',
      address: 'Res. Les Pins, Hydra',
      city: 'Alger',
      notes: 'Style très naturel',
    },
    biometrics: {
      ...DEFAULT_BIOMETRICS,
      interEyebrowGapMm: 23.5,
      leftEyebrowLengthMm: 54.0,
      rightEyebrowLengthMm: 54.2,
      facialSymmetryIndex: 97.8,
    },
    customParams: {
      ...DEFAULT_CUSTOM_PARAMS,
      styleId: 'naturel',
      thicknessMm: 6.2,
    },
    status: 'in_molding',
  },
];

export function getStoredOrders(): Order[] {
  if (typeof window === 'undefined') return INITIAL_DEMO_ORDERS;
  try {
    const raw = localStorage.getItem(ORDERS_KEY);
    if (!raw) {
      localStorage.setItem(ORDERS_KEY, JSON.stringify(INITIAL_DEMO_ORDERS));
      return INITIAL_DEMO_ORDERS;
    }
    return JSON.parse(raw);
  } catch (e) {
    console.error('Failed to parse orders from localStorage:', e);
    return INITIAL_DEMO_ORDERS;
  }
}

export function saveNewOrder(order: Order): void {
  if (typeof window === 'undefined') return;
  const existing = getStoredOrders();
  const updated = [order, ...existing];
  localStorage.setItem(ORDERS_KEY, JSON.stringify(updated));
}

export function updateOrderStatus(orderId: string, newStatus: Order['status']): void {
  if (typeof window === 'undefined') return;
  const existing = getStoredOrders();
  const updated = existing.map(o => o.id === orderId ? { ...o, status: newStatus } : o);
  localStorage.setItem(ORDERS_KEY, JSON.stringify(updated));
}

export function deleteOrder(orderId: string): void {
  if (typeof window === 'undefined') return;
  const existing = getStoredOrders();
  const updated = existing.filter(o => o.id !== orderId);
  localStorage.setItem(ORDERS_KEY, JSON.stringify(updated));
}
