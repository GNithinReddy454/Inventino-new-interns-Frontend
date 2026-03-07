import apiClient from "@/lib/api";

export interface ContactData {
    fullName: string;
    email: string;
    subject: string;
    message: string;
}

export const contactService = {
    // Create Contact
    createContact: async (data: ContactData) => {
        const response = await apiClient.post("/contacts", data);
        return response.data;
    },

    // Get contacts
    getContacts: async () => {
        const response = await apiClient.get("/contacts");
        return response.data;
    },

    // Get contact by id
    getContactById: async (id: string) => {
        const response = await apiClient.get(`/contacts/${id}`);
        return response.data;
    },

    // Mark contact as read
    markAsRead: async (id: string) => {
        const response = await apiClient.patch(`/contacts/${id}/read`);
        return response.data;
    },

    // Mark all contacts as read
    markAllAsRead: async () => {
        const response = await apiClient.patch("/contacts/read-all");
        return response.data;
    },

    // Delete contact
    deleteContact: async (id: string) => {
        const response = await apiClient.delete(`/contacts/${id}`);
        return response.data;
    }
};
