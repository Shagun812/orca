# 00 — Project Overview

## Problem
Build an automated platform that detects marine oil slicks from satellite imagery, characterizes them, estimates movement and probable origin using environmental data, then correlates the origin/time window with historical AIS data to rank potentially responsible vessels.

## MVP
1. Create an investigation.
2. Select/register a satellite observation.
3. Run spill detection.
4. Store spill polygon, area, centroid and confidence.
5. Run drift/hindcast.
6. Display probable origin zone and time window.
7. Query AIS around that zone/time.
8. Generate candidate vessels.
9. Calculate spatial, temporal and trajectory features.
10. Rank candidates.
11. Display evidence on an interactive map.
12. Export a report.

## Important framing
Candidate-vessel output is an evidence-based investigative ranking, not definitive legal proof.
