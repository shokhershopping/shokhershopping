import { CreateOrderInput } from '@/validators/create-order.schema';

export function defaultValues(order?: any) {
  // For edit mode: use formBillingAddress/formShippingAddress if available
  // For create mode: use billingAddress/shippingAddress
  const billingSource = order?.formBillingAddress || order?.billingAddress;
  const shippingSource = order?.formShippingAddress || order?.shippingAddress;

  return {
    billingAddress: {
      firstName: billingSource?.firstName,
      lastName: billingSource?.lastName,
      phoneNumber: billingSource?.phoneNumber,
      country: billingSource?.country,
      state: billingSource?.state,
      city: billingSource?.city,
      zip: billingSource?.zip,
      street: billingSource?.street,
    },
    sameShippingAddress: order?.sameShippingAddress ?? true,
    shippingAddress: {
      firstName: shippingSource?.firstName,
      lastName: shippingSource?.lastName,
      phoneNumber: shippingSource?.phoneNumber,
      country: shippingSource?.country,
      state: shippingSource?.state,
      city: shippingSource?.city,
      zip: shippingSource?.zip,
      street: shippingSource?.street,
    },
    note: order?.note,
    paymentMethod: order?.paymentMethod,
    shippingMethod: order?.shippingMethod,
    shippingSpeed: order?.shippingSpeed,
    cardPayment: {
      cardNumber: order?.cardPayment?.cardNumber,
      expireMonth: order?.cardPayment?.expireMonth,
      expireYear: order?.cardPayment?.expireYear,
      cardCVC: order?.cardPayment?.cardCVC,
      cardUserName: order?.cardPayment?.cardUserName,
      isSaveCard: order?.cardPayment?.isSaveCard,
    },
    orderStatus: order?.orderStatus || 'PENDING',
  };
}

export const orderData = {
  billingAddress: {
    customerName: 'Smith Row',
    phoneNumber: '',
    country: 'Bangladesh',
    state: 'Dhaka',
    city: 'Dhaka',
    zip: '1216',
    street: 'Mirpur Road No #10',
  },
  sameShippingAddress: true,
  shippingAddress: {
    customerName: 'Smith Row',
    phoneNumber: '',
    country: 'Bangladesh',
    state: 'Dhaka',
    city: 'Dhaka',
    zip: '1216',
    street: 'Mirpur Road No #10',
  },
  note: '',
  paymentMethod: 'PayPal',
  shippingMethod: 'USPS',
  shippingSpeed: '',
};
