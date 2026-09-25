
from app.ais.features import calculate_features
from app.ais.filtering import filter_positions
from app.ais.ingestion import ingest
from app.ais.trajectories import group_by_vessel
from app.attribution.scoring import score_candidate
from app.schemas.attribution import AttributionRequest, AttributionResponse


def rank_candidates(request: AttributionRequest) -> AttributionResponse:
    positions = ingest(request.ais_positions)
    start = request.time_window.get("start", request.time_window.get("window_start"))
    end = request.time_window.get("end", request.time_window.get("window_end"))

    filtered = filter_positions(
        positions,
        request.origin_zone.get("polygon", request.origin_zone),
        start,
        end,
        request.search_buffer_km,
    )
    grouped = group_by_vessel(filtered)

    center = request.origin_zone["center"]
    candidates = []

    for mmsi, vessel_positions in grouped.items():
        features = calculate_features(
            vessel_positions,
            center.get("latitude", 0),
            center.get("longitude", 0),
            request.event_time,
        )
        score, evidence = score_candidate(features)

        candidates.append({
            "vessel_id": mmsi,
            "rank": 0,
            "score": score,
            "evidence": evidence,
            "features": features,
            "positions_used": len(vessel_positions),
            # This is source AIS data, preserved for the mapâ€”not an inferred route.
            "trajectory": [position.model_dump() for position in vessel_positions],
        })

    candidates.sort(key=lambda x: x["score"], reverse=True)

    for rank, candidate in enumerate(candidates, start=1):
        candidate["rank"] = rank

    return AttributionResponse(
        candidate_count=len(candidates),
        candidates=candidates,
        filtered_position_count=len(filtered),
    )




