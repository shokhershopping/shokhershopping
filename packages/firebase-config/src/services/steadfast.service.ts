const STEADFAST_BASE_URL = 'https://portal.packzy.com/api/v1';

function getHeaders(apiKey: string, secretKey: string): Record<string, string> {
  return {
    'Api-Key': apiKey,
    'Secret-Key': secretKey,
    'Content-Type': 'application/json',
  };
}

export interface SteadfastOrderData {
  invoice: string;
  recipient_name: string;
  recipient_phone: string;
  recipient_address: string;
  cod_amount: number;
  note?: string;
  item_description?: string;
}

export interface SteadfastConsignment {
  consignment_id: number;
  invoice: string;
  tracking_code: string;
  status: string;
  note: string;
  created_at: string;
  updated_at: string;
}

export interface SteadfastCreateResponse {
  status: number;
  message: string;
  consignment: SteadfastConsignment;
}

export interface SteadfastStatusResponse {
  status: number;
  delivery_status: string;
}

/**
 * Create an order/consignment with Steadfast Courier.
 */
export async function createSteadfastOrder(
  apiKey: string,
  secretKey: string,
  data: SteadfastOrderData
): Promise<SteadfastCreateResponse> {
  const response = await fetch(`${STEADFAST_BASE_URL}/create_order`, {
    method: 'POST',
    headers: getHeaders(apiKey, secretKey),
    body: JSON.stringify(data),
  });

  const result = await response.json();

  if (!response.ok || result.status !== 200) {
    throw new Error(result.message || `Steadfast API error: ${response.status}`);
  }

  return result;
}

/**
 * Check delivery status by consignment ID.
 */
export async function getSteadfastStatus(
  apiKey: string,
  secretKey: string,
  consignmentId: number
): Promise<SteadfastStatusResponse> {
  const response = await fetch(`${STEADFAST_BASE_URL}/status_by_cid/${consignmentId}`, {
    method: 'GET',
    headers: getHeaders(apiKey, secretKey),
  });

  const result = await response.json();

  if (!response.ok) {
    throw new Error(result.message || `Steadfast API error: ${response.status}`);
  }

  return result;
}

/**
 * Check delivery status by tracking code.
 */
export async function getSteadfastStatusByTracking(
  apiKey: string,
  secretKey: string,
  trackingCode: string
): Promise<SteadfastStatusResponse> {
  const response = await fetch(`${STEADFAST_BASE_URL}/status_by_trackingcode/${trackingCode}`, {
    method: 'GET',
    headers: getHeaders(apiKey, secretKey),
  });

  const result = await response.json();

  if (!response.ok) {
    throw new Error(result.message || `Steadfast API error: ${response.status}`);
  }

  return result;
}
