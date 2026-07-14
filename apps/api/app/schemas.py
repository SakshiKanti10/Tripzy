from pydantic import BaseModel, Field
from typing import List, Optional, Literal
from datetime import date


class SearchRequest(BaseModel):
    from_city: str = Field(..., min_length=1)
    to_city: str = Field(..., min_length=1)
    travel_date: date
    travel_type: Literal["flight", "train"]
    passengers: int = Field(default=1, ge=1, le=9)


class Offer(BaseModel):
    platform_name: str
    listing_price: int  # in INR, pre-discount
    discount_total: int = 0  # coupons/cashback/bank discounts/etc
    final_price: int  # listing_price - discount_total + fees
    currency: str = "INR"

    # Breakup
    coupon_off: int = 0
    cashback_off: int = 0
    bank_offer_off: int = 0
    platform_fee: int = 0

    # Messaging for UI
    discount_labels: List[str] = []

    # Link only; Tripzy does not sell tickets
    booking_url: str


class SearchResponse(BaseModel):
    query: SearchRequest
    results: List[Offer]
    cheapest: Optional[Offer] = None
    highest_price: int
    cheapest_price: int
    savings: int


class DealsResponse(BaseModel):
    title: str = "Latest deals"
    items: List[Offer]

