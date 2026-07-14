from fastapi import APIRouter

from app.schemas import DealsResponse, SearchRequest, SearchResponse
from app.services_search import mock_search


router = APIRouter(prefix="/api", tags=["tripzy"])


@router.post("/search", response_model=SearchResponse)
def search(req: SearchRequest) -> SearchResponse:
    results = mock_search(req)
    # cheapest by final_price
    sorted_by_final = sorted(results, key=lambda x: x.final_price)
    cheapest = sorted_by_final[0] if sorted_by_final else None

    highest_price = max(r.final_price for r in results) if results else 0
    cheapest_price = cheapest.final_price if cheapest else 0
    savings = highest_price - cheapest_price if results else 0

    return SearchResponse(
        query=req,
        results=sorted_by_final,
        cheapest=cheapest,
        highest_price=highest_price,
        cheapest_price=cheapest_price,
        savings=savings,
    )


@router.get("/deals", response_model=DealsResponse)
def deals() -> DealsResponse:
    # Reuse mock offers as "deals" items
    # (In real build: pull from integrations + internal promotions)
    dummy_req = SearchRequest(from_city="Mumbai", to_city="Delhi", travel_date="2026-01-01", travel_type="flight")
    results = mock_search(dummy_req)[:3]
    return DealsResponse(title="Latest travel offers", items=results)

