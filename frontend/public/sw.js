self.addEventListener('push', function (event) {
    if (event.data) {
        const data = event.data.json();
        const options = {
            body: data.body,
            icon: '/icon-192x192.png', // Ensure you have an icon or use a placeholder
            badge: '/badge-72x72.png', // Optional
            vibrate: [100, 50, 100],
            data: {
                dateOfArrival: Date.now(),
                primaryKey: '2',
                url: data.data?.url || '/'
            },
            actions: [
                {
                    action: 'explore',
                    title: 'Xem chi tiết',
                    icon: '/checkmark.png'
                },
                {
                    action: 'close',
                    title: 'Đóng',
                    icon: '/xmark.png'
                },
            ]
        };
        event.waitUntil(
            self.registration.showNotification(data.title, options)
        );
    }
});

self.addEventListener('notificationclick', function (event) {
    event.notification.close();
    if (event.action === 'explore') {
        event.waitUntil(
            clients.openWindow(event.notification.data.url)
        );
    }
});
