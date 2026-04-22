'use client';

import { useState, useEffect } from 'react';

export function useDevice() {
  const [device, setDevice] = useState<'mobile' | 'desktop'>('desktop');

  useEffect(() => {
    const checkDevice = () => {
      setDevice(window.innerWidth < 768 ? 'mobile' : 'desktop');
    };

    checkDevice();
    window.addEventListener('resize', checkDevice);

    return () => window.removeEventListener('resize', checkDevice);
  }, []);

  return device;
}