'use client';

import { useEffect } from 'react';

export default function GlobalPickerBehavior() {
    useEffect(() => {
        const handleInputClick = (e) => {
            if (e.target.tagName === 'INPUT' && (e.target.type === 'date' || e.target.type === 'time')) {
                try {
                    e.target.showPicker();
                } catch (error) {
                    // showPicker might not be supported in all browsers or contexts
                    console.log('showPicker not supported or failed', error);
                }
            }
        };

        document.addEventListener('click', handleInputClick);

        return () => {
            document.removeEventListener('click', handleInputClick);
        };
    }, []);

    return null;
}
