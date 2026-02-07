import { create } from "zustand";

const useAuthStore = create((set) => ({
    user: null,
    updateUser: (userData) => {
        set((state) => (state.user?.id !== userData?.id ? { user: userData } : state));
    },
    clearUser: () => set({ user: null }),
}));

export default useAuthStore;
