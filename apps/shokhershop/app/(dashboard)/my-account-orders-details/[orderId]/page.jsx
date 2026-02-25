"use client";
import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import Footer1 from "@/components/footers/Footer1";
import Header1 from "@/components/headers/Header1";
import DashboardNav from "@/components/othersPages/dashboard/DashboardNav";
import OrderDetails from "@/components/othersPages/dashboard/OrderDetails";

export default function OrderDetailPage() {
  const params = useParams();
  const orderId = params.orderId;
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const baseUrl = '/api';

  useEffect(() => {
    const fetchOrder = async () => {
      if (!orderId) return;

      setLoading(true);
      try {
        const response = await fetch(`${baseUrl}/orders/${orderId}`);
        if (!response.ok) {
          throw new Error("Failed to fetch order details");
        }
        const data = await response.json();
        setOrder(data.data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchOrder();
  }, [orderId, baseUrl]);

  return (
    <>
      <Header1 />
      <div className="tf-page-title">
        <div className="container-full">
          <div className="heading text-center">Order Details</div>
        </div>
      </div>
      <section className="flat-spacing-11">
        <div className="container">
          <div className="row">
            <div className="col-lg-3">
              <DashboardNav />
            </div>
            <div className="col-lg-9">
              {loading && (
                <div className="text-center py-5">
                  <div className="spinner-border" role="status">
                    <span className="visually-hidden">Loading...</span>
                  </div>
                  <p className="mt-3">Loading order details...</p>
                </div>
              )}
              {error && (
                <div className="alert alert-danger" role="alert">
                  {error}
                </div>
              )}
              {!loading && !error && order && <OrderDetails order={order} />}
              {!loading && !error && !order && (
                <div className="alert alert-warning" role="alert">
                  Order not found.
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      <Footer1 />
    </>
  );
}
