'use client';

import { useEffect } from 'react';

export default function GlobalPickerBehavior() {
    useEffect(() => {
        const handlePickerOpen = (e) => {
            const target = e.target;
            if (target.tagName === 'INPUT' && (target.type === 'date' || target.type === 'time')) {
                try {
                    // Must call showPicker() synchronously within user gesture
                    target.showPicker();
                } catch (error) {
                    // showPicker might not be supported in all browsers
                    console.log('showPicker not available', error);
                }
            }
        };

        // Listen to click events in capture phase to work with modals
        document.addEventListener('click', handlePickerOpen, true);

        return () => {
            document.removeEventListener('click', handlePickerOpen, true);
        };
    }, []);

    return null;
}
