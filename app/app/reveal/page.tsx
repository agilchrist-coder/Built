'use client';
import { useEffect } from 'react';
export default function RevealPage() {
  useEffect(() => { window.location.href = 'https://app.stipum.com'; }, []);
  return null;
}
