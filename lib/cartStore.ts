
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type CartItemType = 'flight' | 'package' | 'transfer' | 'tour' | 'hotel' | 'health';

export type CartItem = {
  id: string;
  type: CartItemType;
  name: string;
  detail: string;
  image?: string;
  unitPrice: number;
  quantity: number;
  lineTotal: number;
};

export type Passengers = {
  adult: number;
  child: number;
};

type CartStore = {
  items: CartItem[];
  passengers: Passengers;
  addItem: (item: Omit<CartItem, 'lineTotal'>) => void;
  removeItem: (id: string) => void;
  updateQuantity: (id: string, quantity: number) => void;
  incrementQuantity: (id: string) => void;
  decrementQuantity: (id: string) => void;
  clearCart: () => void;
  setPassengers: (p: Passengers) => void;
  totalPrice: () => number;
  totalItems: () => number;
};

export const useCartStore = create<CartStore>()(
  persist(
    (set, get) => ({
      items: [],
      passengers: { adult: 1, child: 0 },

      addItem: (item) => {
        const existing = get().items.find(i => i.id === item.id);
        if (existing) {
          set(state => ({
            items: state.items.map(i =>
              i.id === item.id
                ? { ...i, quantity: i.quantity + item.quantity, lineTotal: (i.quantity + item.quantity) * i.unitPrice }
                : i
            )
          }));
        } else {
          set(state => ({
            items: [...state.items, { ...item, lineTotal: item.unitPrice * item.quantity }]
          }));
        }
      },

      removeItem: (id) => set(state => ({ items: state.items.filter(i => i.id !== id) })),

      updateQuantity: (id, quantity) => set(state => ({
        items: state.items.map(i =>
          i.id === id ? { ...i, quantity, lineTotal: i.unitPrice * quantity } : i
        )
      })),

      incrementQuantity: (id) => {
        const item = get().items.find(i => i.id === id);
        if (item) get().updateQuantity(id, item.quantity + 1);
      },

      decrementQuantity: (id) => {
        const item = get().items.find(i => i.id === id);
        if (item && item.quantity > 1) get().updateQuantity(id, item.quantity - 1);
      },

      clearCart: () => set({ items: [] }),

      setPassengers: (p) => set({ passengers: p }),

      totalPrice: () => get().items.reduce((sum, i) => sum + i.lineTotal, 0),

      totalItems: () => get().items.reduce((sum, i) => sum + i.quantity, 0),
    }),
    { name: 'healthtour-cart' }
  )
);