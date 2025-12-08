import axios from '../lib/api';

export interface Notification {
    id: string;
    title: string;
    message: string;
    type: string;
    isRead: boolean;
    data?: any;
    createdAt: string;
}

export const notificationService = {
    getMyNotifications: async (page = 1, limit = 10) => {
        const response = await axios.get(`/notifications?page=${page}&limit=${limit}`);
        return response.data;
    },

    markAsRead: async (id: string) => {
        const response = await axios.patch(`/notifications/${id}/read`);
        return response.data;
    },

    markAllAsRead: async () => {
        const response = await axios.patch('/notifications/read-all');
        return response.data;
    },

    subscribe: async (subscriptionData: { endpoint: string; keys: { p256dh: string; auth: string } }) => {
        const response = await axios.post('/notifications/subscribe', subscriptionData);
        return response.data;
    },

    // Deprecated: use subscribe instead
    subscribeToPush: async (subscription: PushSubscription) => {
        const response = await axios.post('/notifications/subscribe', {
            endpoint: subscription.endpoint,
            keys: subscription.toJSON().keys
        });
        return response.data;
    }
};
