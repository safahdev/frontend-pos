import { create } from 'zustand';

export const useCartStore = create((set, get) => ({
    items: [],
    orderType: 'dine_in',
    tableNumber: '',
    customerName: '',
    note: '',

    // Add item dengan support note
    addItem: ({ product, note = '' }) => {
        const items = get().items;

        // Cari item dengan productId DAN note yang sama
        const existingItem = items.find(
            item => item.productId === product.id && item.note === note
        );

        if (existingItem) {
            // Kalau udah ada, tambah qty
            set({
                items: items.map(item =>
                    item.productId === product.id && item.note === note
                        ? { ...item, qty: item.qty + 1 }
                        : item
                ),
            });
        } else {
            // Kalau belum ada, tambah item baru
            set({
                items: [...items, {
                    productId: product.id,
                    name: product.name,
                    price: product.price,
                    qty: 1,
                    note: note || '',
                }],
            });
        }
    },

    // Remove item by productId dan note
    removeItem: (productId, note = '') => {
        set({
            items: get().items.filter(
                item => !(item.productId === productId && item.note === note)
            )
        });
    },

    // Update qty by productId dan note
    updateQty: (productId, note = '', qty) => {
        if (qty <= 0) {
            get().removeItem(productId, note);
            return;
        }
        set({
            items: get().items.map(item =>
                item.productId === productId && item.note === note
                    ? { ...item, qty }
                    : item
            ),
        });
    },

    setOrderType: (type) => set({ orderType: type }),
    setTableNumber: (number) => set({ tableNumber: number }),
    setCustomerName: (name) => set({ customerName: name }),
    setNote: (note) => set({ note }),

    getTotal: () => {
        return get().items.reduce((total, item) => total + (item.price * item.qty), 0);
    },

    clearCart: () => set({
        items: [],
        orderType: 'dine_in',
        tableNumber: '',
        customerName: '',
        note: '',
    }),
}));