import { useEffect, useRef } from 'react';
import { useSocket } from '../contexts/SocketContext';

interface UseRealtimeEventsOptions {
  onEventUpdated?: (data: any) => void;
  onEventApproved?: (data: any) => void;
}

export function useRealtimeEvents(options: UseRealtimeEventsOptions = {}) {
  const { onEventUpdated, onEventApproved, isConnected } = useSocket();

  // Use refs to store latest callbacks without triggering re-subscriptions
  const eventUpdatedRef = useRef(options.onEventUpdated);
  const eventApprovedRef = useRef(options.onEventApproved);

  useEffect(() => {
    eventUpdatedRef.current = options.onEventUpdated;
    eventApprovedRef.current = options.onEventApproved;
  });

  useEffect(() => {
    if (!isConnected) {
      console.log('❌ Socket not connected, skipping event listeners');
      return;
    }

    console.log('✅ Setting up event listeners');
    const unsubscribers: (() => void)[] = [];

    if (eventUpdatedRef.current) {
      const unsubscribe = onEventUpdated((data: any) => eventUpdatedRef.current?.(data));
      unsubscribers.push(unsubscribe);
    }

    if (eventApprovedRef.current) {
      const unsubscribe = onEventApproved((data: any) => eventApprovedRef.current?.(data));
      unsubscribers.push(unsubscribe);
    }

    return () => {
      console.log('🧹 Cleaning up event listeners');
      unsubscribers.forEach(unsub => unsub());
    };
  }, [isConnected, onEventUpdated, onEventApproved]);
}

interface UseRealtimeRegistrationsOptions {
  onRegistrationUpdated?: (data: any) => void;
}

export function useRealtimeRegistrations(options: UseRealtimeRegistrationsOptions = {}) {
  const { onRegistrationUpdated, isConnected } = useSocket();

  const registrationUpdatedRef = useRef(options.onRegistrationUpdated);

  useEffect(() => {
    registrationUpdatedRef.current = options.onRegistrationUpdated;
  });

  useEffect(() => {
    if (!isConnected) {
      console.log('❌ Socket not connected, skipping registration listeners');
      return;
    }

    console.log('✅ Setting up registration listeners');
    const unsubscribers: (() => void)[] = [];

    if (registrationUpdatedRef.current) {
      const unsubscribe = onRegistrationUpdated((data: any) => registrationUpdatedRef.current?.(data));
      unsubscribers.push(unsubscribe);
    }

    return () => {
      console.log('🧹 Cleaning up registration listeners');
      unsubscribers.forEach(unsub => unsub());
    };
  }, [isConnected, onRegistrationUpdated]);
}

interface UseRealtimeNotificationsOptions {
  onNotification?: (data: any) => void;
}

export function useRealtimeNotifications(options: UseRealtimeNotificationsOptions = {}) {
  const { onUserNotification, isConnected } = useSocket();

  const notificationRef = useRef(options.onNotification);

  useEffect(() => {
    notificationRef.current = options.onNotification;
  });

  useEffect(() => {
    if (!isConnected) {
      console.log('❌ Socket not connected, skipping notification listeners');
      return;
    }

    console.log('✅ Setting up notification listeners');

    if (notificationRef.current) {
      const unsubscribe = onUserNotification((data: any) => notificationRef.current?.(data));
      return unsubscribe;
    }
  }, [isConnected, onUserNotification]);
}

// Combined hook for convenience
interface UseRealtimeUpdatesOptions {
  onEventUpdated?: (data: any) => void;
  onEventApproved?: (data: any) => void;
  onEventDeleted?: (data: any) => void;
  onEventRejected?: (data: any) => void;
  onRegistrationUpdated?: (data: any) => void;
  onNotification?: (data: any) => void;
}

export function useRealtimeUpdates(options: UseRealtimeUpdatesOptions = {}) {
  const {
    onEventUpdated,
    onEventApproved,
    onEventDeleted,
    onEventRejected,
    onRegistrationUpdated,
    onUserNotification,
    isConnected,
  } = useSocket();

  // Use refs to store latest callbacks without triggering re-subscriptions
  const eventUpdatedRef = useRef(options.onEventUpdated);
  const eventApprovedRef = useRef(options.onEventApproved);
  const eventDeletedRef = useRef(options.onEventDeleted);
  const eventRejectedRef = useRef(options.onEventRejected);
  const registrationUpdatedRef = useRef(options.onRegistrationUpdated);
  const notificationRef = useRef(options.onNotification);

  useEffect(() => {
    eventUpdatedRef.current = options.onEventUpdated;
    eventApprovedRef.current = options.onEventApproved;
    eventDeletedRef.current = options.onEventDeleted;
    eventRejectedRef.current = options.onEventRejected;
    registrationUpdatedRef.current = options.onRegistrationUpdated;
    notificationRef.current = options.onNotification;
  });

  useEffect(() => {
    if (!isConnected) {
      console.log('❌ Socket not connected, skipping real-time updates');
      return;
    }

    console.log('✅ Setting up real-time updates');
    const unsubscribers: (() => void)[] = [];

    if (eventUpdatedRef.current) {
      const unsubscribe = onEventUpdated((data: any) => eventUpdatedRef.current?.(data));
      unsubscribers.push(unsubscribe);
    }

    if (eventApprovedRef.current) {
      const unsubscribe = onEventApproved((data: any) => eventApprovedRef.current?.(data));
      unsubscribers.push(unsubscribe);
    }

    if (eventDeletedRef.current) {
      const unsubscribe = onEventDeleted((data: any) => eventDeletedRef.current?.(data));
      unsubscribers.push(unsubscribe);
    }

    if (eventRejectedRef.current) {
      const unsubscribe = onEventRejected((data: any) => eventRejectedRef.current?.(data));
      unsubscribers.push(unsubscribe);
    }

    if (registrationUpdatedRef.current) {
      const unsubscribe = onRegistrationUpdated((data: any) => {
        console.log('🔥 Registration update received in hook:', data);
        registrationUpdatedRef.current?.(data);
      });
      unsubscribers.push(unsubscribe);
    }

    if (notificationRef.current) {
      const unsubscribe = onUserNotification((data: any) => notificationRef.current?.(data));
      unsubscribers.push(unsubscribe);
    }

    return () => {
      console.log('🧹 Cleaning up real-time updates');
      unsubscribers.forEach(unsub => unsub());
    };
  }, [
    isConnected,
    onEventUpdated,
    onEventApproved,
    onEventDeleted,
    onEventRejected,
    onRegistrationUpdated,
    onUserNotification,
  ]);
}

