import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

/**
 * ScrollToTop component
 * Automatically scrolls to top of page when route changes
 */
export default function ScrollToTop() {
    const { pathname, search } = useLocation();

    useEffect(() => {
        // Scroll to top on route change
        window.scrollTo({
            top: 0,
            left: 0,
            behavior: 'instant' as ScrollBehavior
        });
    }, [pathname, search]);

    return null;
}
