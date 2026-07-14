from typing import List

from app.pricing import compute_final_price
from app.schemas import Offer, SearchRequest


def mock_search(request: SearchRequest) -> List[Offer]:
    # Deterministic mock so UI/backend always run without integrations.
    platforms = [
        ("MakeMyTrip", 5200, {"coupon_off": 0, "cashback_off": 0, "bank_offer_off": 0, "platform_fee": 0}),
        ("Goibibo", 4950, {"coupon_off": 200, "cashback_off": 50, "bank_offer_off": 0, "platform_fee": 0}),
        ("EaseMyTrip", 5100, {"coupon_off": 0, "cashback_off": 0, "bank_offer_off": 0, "platform_fee": 100}),
    ]

    results: List[Offer] = []
    for name, listing_price, breakup in platforms:
        final_price = compute_final_price(listing_price, **breakup)
        discount_total = (breakup.get("coupon_off", 0) + breakup.get("cashback_off", 0) + breakup.get("bank_offer_off", 0))

        labels = []
        if breakup.get("coupon_off", 0) > 0:
            labels.append(f"Coupon: ₹{breakup['coupon_off']} OFF")
        if breakup.get("cashback_off", 0) > 0:
            labels.append(f"Cashback: ₹{breakup['cashback_off']} OFF")
        if breakup.get("bank_offer_off", 0) > 0:
            labels.append(f"Bank offer: ₹{breakup['bank_offer_off']} OFF")
        if breakup.get("platform_fee", 0) > 0:
            labels.append(f"Platform fee: ₹{breakup['platform_fee']}")

        results.append(
            Offer(
                platform_name=name,
                listing_price=listing_price,
                discount_total=discount_total,
                final_price=final_price,
                currency="INR",
                coupon_off=breakup.get("coupon_off", 0),
                cashback_off=breakup.get("cashback_off", 0),
                bank_offer_off=breakup.get("bank_offer_off", 0),
                platform_fee=breakup.get("platform_fee", 0),
                discount_labels=labels,
                booking_url=f"https://example.com/book/{name.replace(' ', '').lower()}?from={request.from_city}&to={request.to_city}&date={request.travel_date.isoformat()}&type={request.travel_type}",
            )
        )

    # Add a 4th option only for diversity
    if request.travel_type == "train":
        results.append(
            Offer(
                platform_name="Yatra",
                listing_price=5000,
                discount_total=150,
                final_price=4850,
                currency="INR",
                coupon_off=100,
                cashback_off=50,
                bank_offer_off=0,
                platform_fee=0,
                discount_labels=["Coupon: ₹100 OFF", "Cashback: ₹50 OFF"],
                booking_url=f"https://example.com/book/yatra?from={request.from_city}&to={request.to_city}&date={request.travel_date.isoformat()}&type={request.travel_type}",
            )
        )

    return results

