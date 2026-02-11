'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useFirebaseAuth } from '@/lib/firebase-auth-provider';
import { routes } from '@/config/routes';
import { Button } from 'rizzui/button';
import WelcomeBanner from '@core/components/banners/welcome';
import StatCards from '@/app/shared/ecommerce/dashboard/stat-cards';
import SalesReport from '@/app/shared/ecommerce/dashboard/sales-report';
import BestSellers from '@/app/shared/ecommerce/dashboard/best-sellers';
import RepeatCustomerRate from '@/app/shared/ecommerce/dashboard/repeat-customer-rate';
import UserLocation from '@/app/shared/ecommerce/dashboard/user-location';
import RecentOrder from '@/app/shared/ecommerce/dashboard/recent-order';
import StockReport from '@/app/shared/ecommerce/dashboard/stock-report';
import { PiPlusBold, PiArrowClockwiseBold } from 'react-icons/pi';
import welcomeImg from '@public/shop-illustration.png';
import HandWaveIcon from '@core/components/icons/hand-wave';

export default function EcommerceDashboard() {
  const { user } = useFirebaseAuth();
  const [refreshKey, setRefreshKey] = useState(0);

  const userName = user?.firstName || user?.fullName || 'Admin';

  const handleRefresh = () => {
    setRefreshKey(prev => prev + 1);
  };

  return (
    <div className="@container">
      <div className="grid grid-cols-1 gap-6 @4xl:grid-cols-2 @7xl:grid-cols-12 3xl:gap-8">
        <WelcomeBanner
          title={
            <>
              Good Morning, <br /> {userName}{' '}
              <HandWaveIcon className="inline-flex h-8 w-8" />
            </>
          }
          description={
            "Here's What happening on your store today. See the statistics at once."
          }
          media={
            <div className="absolute -bottom-6 end-4 hidden w-[300px] @2xl:block lg:w-[320px] 2xl:-bottom-7 2xl:w-[330px]">
              <div className="relative">
                <Image
                  src={welcomeImg}
                  alt="Welcome shop image form freepik"
                  className="dark:brightness-95 dark:drop-shadow-md"
                />
              </div>
            </div>
          }
          contentClassName="@2xl:max-w-[calc(100%-340px)]"
          className="border border-muted bg-gray-0 pb-8 @4xl:col-span-2 @7xl:col-span-12 dark:bg-gray-100/30 lg:pb-9"
        >
          <div className="flex items-center gap-3">
            <Link href={routes.eCommerce.createProduct} className="inline-flex">
              <Button as="span" className="h-[38px] shadow md:h-10">
                <PiPlusBold className="me-1 h-4 w-4" /> Add Product
              </Button>
            </Link>
            <Button
              variant="outline"
              className="h-[38px] shadow md:h-10"
              onClick={handleRefresh}
            >
              <PiArrowClockwiseBold className="me-1 h-4 w-4" /> Refresh
            </Button>
          </div>
        </WelcomeBanner>

        <StatCards
          key={`stats-${refreshKey}`}
          className="@2xl:grid-cols-3 @3xl:gap-6 @4xl:col-span-2 @7xl:col-span-12"
        />

        <SalesReport
          key={`sales-${refreshKey}`}
          className="@4xl:col-span-2 @7xl:col-span-12"
        />

        <RecentOrder
          key={`orders-${refreshKey}`}
          className="relative @4xl:col-span-2 @7xl:col-span-12"
        />

        <RepeatCustomerRate
          key={`customers-${refreshKey}`}
          className="@4xl:col-span-2 @7xl:col-span-12 @[90rem]:col-span-8"
        />

        <BestSellers
          key={`sellers-${refreshKey}`}
          className="@7xl:col-span-6 @[90rem]:col-span-4"
        />

        <UserLocation
          key={`location-${refreshKey}`}
          className="@7xl:col-span-6 @[90rem]:col-span-5 @[112rem]:col-span-4"
        />

        <StockReport
          key={`stock-${refreshKey}`}
          className="@4xl:col-span-2 @7xl:col-span-12 @[90rem]:col-span-7 @[112rem]:col-span-8"
        />
      </div>
    </div>
  );
}
