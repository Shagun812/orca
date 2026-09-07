# AIS Filtering Pipeline

**Purpose**: Processes raw, massive AIS streams into ranked attribution candidates efficiently.

## Stages
1. **Ingestion**: Raw NMEA or CSV data is received and parsed into standardized formats (MMSI, lat, lon, heading, speed).
2. **PostGIS Storage**: Data is saved to the `ais_positions` table. A GiST index on the `position` (Point geometry) ensures spatial querying is fast. B-tree index on `timestamp`.
3. **Temporal/Spatial Filter**: Before any feature extraction begins, a strict `ST_DWithin` (within probability origin zone) and time-window query filters out 99% of irrelevant vessels.
4. **Grouping & Trajectories**: The filtered points are grouped by `vessel_id` and reconstructed into contiguous tracks (`ST_MakeLine`).
5. **Feature Extraction**: Calculated per candidate:
   - Minimum distance to the spill origin.
   - Time difference from the suspected spill event.
   - Trajectory score (consistency, speed behavior).
6. **Candidate Ranking**: Ranked according to a composite score, resulting in the payload shown in the Evidence Dashboard.
