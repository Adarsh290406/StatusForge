'use client';

import { useEffect } from 'react';

export function ReticleDev() {
  useEffect(() => {
    if (process.env.NODE_ENV !== 'development') return;
    
    void import('@reticlehq/core').then((mod: any) => {
      const { reticle, install, registerCapabilities } = mod;
      install();
      const token = process.env.NEXT_PUBLIC_RETICLE_TOKEN;
      reticle.connect(token ? { token } : {});
      registerCapabilities({
        testids: [
          'name',
          'email',
          'password',
          'orgName',
          'submit-btn'
        ],
        signals: ['auth:signup', 'auth:login', 'auth:logout'],
        stores: []
      });
    });
  }, []);

  return null;
}
