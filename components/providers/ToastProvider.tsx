'use client';

import { Toaster } from 'react-hot-toast';

export function ToastProvider() {
  return (
    <Toaster
      position="top-right"
      reverseOrder={false}
      gutter={8}
      toastOptions={{
        // Default options
        duration: 4000,
        style: {
          background: '#dfe5ff',
          color: '#1a1a2e',
          border: '2px solid #e8e8e8',
          borderRadius: '12px',
          padding: '16px',
          fontSize: '14px',
          fontWeight: '600',
        },
        // Success toast style
        success: {
          duration: 3000,
          iconTheme: {
            primary: '#10b981',
            secondary: '#C7D2FE',
          },
          style: {
            border: '2px solid #FBD430',
          },
        },
        // Error toast style
        error: {
          duration: 4000,
          iconTheme: {
            primary: '#ef4444',
            secondary: '#EBEBF0',
          },
          style: {
            border: '2px solid #ef4444',
          },
        },
        // Loading toast style
        loading: {
          iconTheme: {
            primary: '#3b82f6',
            secondary: '#EBEBF0',
          },
        },
      }}
    />
  );
}