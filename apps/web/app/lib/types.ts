export type TravelType = "flight" | "train";

export type SearchRequest = {
  from_city: string;
  to_city: string;
  travel_date: string; // YYYY-MM-DD
  travel_type: TravelType;
  passengers: number;
};

export type Offer = {
  platform_name: string;
  // Ticket price before discounts
  price: number;

  // Discount components
  discount: number; // coupon-like discount
  cashback: number; // cashback amount

  // Derived
  final_price: number;

  // Optional metadata
  currency: string;
};


export type SearchResponse = {
  query: SearchRequest;
  results: Offer[];
  cheapest?: Offer | null;
  highest_price: number;
  lowest_price: number;
  savings: number; // highest - lowest
};


export type DealsResponse = {
  title: string;
  items: Offer[];
};

export type AuthUser = {
  id: string;
  email: string;
  name: string;
};

export type BookingRequest = {
  from_city: string;
  to_city: string;
  travel_date: string;
  travel_type: TravelType;
  platform_name: string;
  final_price: number;
  passengers: number;
  traveller_name: string;
  traveller_id: string;
  payment_method: "card";
  payment_token: string;
};

export type BookingRecord = {
  booking_ref: string;
  user_id: string;
  from_city: string;
  to_city: string;
  travel_date: string;
  travel_type: TravelType;
  platform_name: string;
  final_price: number;
  passengers: number;
  traveller_name: string;
  masked_traveller_id: string;
  payment_method: "card";
  payment_provider: "stripe";
  payment_intent_id: string;
  masked_payment_value: string;
  created_at: string;
};

