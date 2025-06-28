// src/store/useTenderStore.js
import { create } from 'zustand';

const useTenderStore = create((set) => ({
    service: null,
    contractors: [],
    requirements: [],
    formData: {
        location: '',
        start_time: '',
        end_time: '',
        supervisor_id: '',
        customer_limit: 1
    },
    setService: (service) => set({ service }),
    setContractors: (contractors) => set({ contractors }),
    addRequirement: (req) => set((state) => ({ requirements: [...state.requirements, req] })),
    removeRequirement: (index) => set((state) => ({
        requirements: state.requirements.filter((_, i) => i !== index)
    })),
    updateFormData: (key, value) => set((state) => ({
        formData: { ...state.formData, [key]: value }
    })),
    reset: () => set({
        service: null,
        contractors: [],
        requirements: [],
        formData: {
            location: '',
            start_time: '',
            end_time: '',
            supervisor_id: '',
            customer_limit: 1
        }
    })
}));

export default useTenderStore;
