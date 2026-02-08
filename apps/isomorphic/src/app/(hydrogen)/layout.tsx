import { notFound } from 'next/navigation';

type LayoutProps = {
  children: React.ReactNode;
};

export default function DefaultLayout({ children }: LayoutProps) {
  // return notFound();
  return <>{children}</>;
}
