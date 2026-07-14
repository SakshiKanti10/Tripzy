"""Pricing breakdown logic.

Tripzy does NOT sell tickets. This module only models/estimates the true final
price after discount components.

At scaffold stage we use deterministic mock data.
"""

from typing import Dict


def compute_final_price(
    listing_price: int,
    coupon_off: int = 0,
    cashback_off: int = 0,
    bank_offer_off: int = 0,
    platform_fee: int = 0,
) -> int:
    total_discounts = coupon_off + cashback_off + bank_offer_off
    return max(0, listing_price - total_discounts + platform_fee)


def normalize_breakup(breakup: Dict[str, int]) -> Dict[str, int]:
    # ensure all keys exist
    return {
        "coupon_off": int(breakup.get("coupon_off", 0) or 0),
        "cashback_off": int(breakup.get("cashback_off", 0) or 0),
        "bank_offer_off": int(breakup.get("bank_offer_off", 0) or 0),
        "platform_fee": int(breakup.get("platform_fee", 0) or 0),
    }

