import { metaObject } from '@/config/site.config';
import EcommerceDashboard from './shared/ecommerce/dashboard';

export const metadata = {
  ...metaObject(),
};

export default function FileDashboardPage() {
  // return <>Hello</>;
  return <EcommerceDashboard />;
}
