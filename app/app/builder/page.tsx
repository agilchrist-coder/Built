import type { Metadata } from 'next';
import { FormBuilder } from '@/components/FormBuilder';

export const metadata: Metadata = {
  title: 'Form Builder',
};

export default function BuilderPage() {
  return <FormBuilder />;
}
