import { create } from 'zustand';

const useStockStore = create((set) => ({
    liveData: {
        open: 0,
        close: 0,
        high: 0,
        low: 0,
        volume: 0,
        timestamp: 0,
    },
    updateLiveData: (data) => set({ liveData: data }),
}));

export default useStockStore;
