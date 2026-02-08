import { routes } from '@/config/routes';
import TransactionHistoryTable from '../shared/financial/dashboard/transaction-history-table';
import PageHeader from '../shared/page-header';
import { metaObject } from '@/config/site.config';

export const metadata = {
  ...metaObject('Create Product'),
};

export default function TransactionHistory() {
  const pageHeader = {
    title: 'Transactions',
    breadcrumb: [
      {
        href: routes.eCommerce.dashboard,
        name: 'Home',
      },
      {
        name: 'Transactions',
      },
    ],
  };
  return (
    <>
      <PageHeader title={pageHeader.title} breadcrumb={pageHeader.breadcrumb} />
      <TransactionHistoryTable />
    </>
  );
}
