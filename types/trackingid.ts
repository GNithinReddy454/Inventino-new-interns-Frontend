export type TrackingStep = {
  label: string;
  date: string;
  done: boolean;
  active: boolean;
};

export type TrackingData = {
  orderId: string;
  product: string;
  estimatedDelivery: string;
  carrier: string;
  trackingNumber: string;
  steps: TrackingStep[];
};

export type TrackingDataRecord = Record<string, TrackingData>;