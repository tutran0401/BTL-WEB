import { useState, useEffect } from 'react';
import { notificationService } from '../services/notificationService';
import { useAuthStore } from '../store/authStore';

const VAPID_PUBLIC_KEY = 'YOUR_VAPID_PUBLIC_KEY'; // TODO: Get this from env or API

export function usePushNotification() {
    const { isAuthenticated } = useAuthStore();
    const [permission, setPermission] = useState<NotificationPermission>('default');

    useEffect(() => {
        if (isAuthenticated) {
            checkPermission();
        }
    }, [isAuthenticated]);

    const checkPermission = () => {
        if (!('Notification' in window)) {
            console.log('This browser does not support desktop notification');
            return;
        }
        setPermission(Notification.permission);
    };

    const requestPermission = async () => {
        if (!('Notification' in window)) return;

        try {
            const permission = await Notification.requestPermission();
            setPermission(permission);

            if (permission === 'granted') {
                await subscribeToPush();
            }
        } catch (error) {
            console.error('Error requesting permission:', error);
        }
    };

    const subscribeToPush = async () => {
        try {
            const registration = await navigator.serviceWorker.ready;

            // Check if already subscribed
            const existingSubscription = await registration.pushManager.getSubscription();
            if (existingSubscription) {
                // Send to backend to ensure it's synced
                await notificationService.subscribeToPush(existingSubscription);
                return;
            }

            // Get VAPID key from backend if needed, for now assuming we have it
            // In a real app, you should fetch this from an API endpoint
            // const { publicKey } = await notificationService.getVapidKey();

            // Convert VAPID key
            const convertedVapidKey = urlBase64ToUint8Array(import.meta.env.VITE_VAPID_PUBLIC_KEY || '');

            const subscription = await registration.pushManager.subscribe({
                userVisibleOnly: true,
                applicationServerKey: convertedVapidKey
            });

            await notificationService.subscribeToPush(subscription);
            console.log('Subscribed to push notifications');
        } catch (error) {
            console.error('Error subscribing to push:', error);
        }
    };

    return {
        permission,
        requestPermission
    };
}

function urlBase64ToUint8Array(base64String: string) {
    const padding = '='.repeat((4 - base64String.length % 4) % 4);
    const base64 = (base64String + padding)
        .replace(/\-/g, '+')
        .replace(/_/g, '/');

    const rawData = window.atob(base64);
    const outputArray = new Uint8Array(rawData.length);

    for (let i = 0; i < rawData.length; ++i) {
        outputArray[i] = rawData.charCodeAt(i);
    }
    return outputArray;
}
