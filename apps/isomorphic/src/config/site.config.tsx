import { Metadata } from 'next';
import logoImg from '@public/logo.png';
import { LAYOUT_OPTIONS } from '@/config/enums';
import { OpenGraph } from 'next/dist/lib/metadata/types/opengraph-types';

enum MODE {
  DARK = 'dark',
  LIGHT = 'light',
}

export const siteConfig = {
  title: 'Shokher Shopping - Admin Dashboard',
  description: 'Shokher Shopping admin dashboard for managing products, orders, customers, and store operations.',
  logo: logoImg,
  icon: logoImg,
  mode: MODE.LIGHT,
  layout: LAYOUT_OPTIONS.HYDROGEN,
  // TODO: favicon
};

export const metaObject = (
  title?: string,
  openGraph?: OpenGraph,
  description: string = siteConfig.description
): Metadata => {
  return {
    title: title ? `${title} - Shokher Shopping` : siteConfig.title,
    description,
    openGraph: openGraph ?? {
      title: title ? `${title} - Shokher Shopping` : title,
      description,
      url: 'https://shokhershopping.com',
      siteName: 'Shokher Shopping',
      images: {
        url: 'https://shokhershopping.com/images/logo/logo.png',
        width: 1200,
        height: 630,
      },
      locale: 'en_US',
      type: 'website',
    },
  };
};
