# Async Job Pattern

**Purpose**: Ensures expensive, long-running ML or Geospatial tasks (detection, drift, AIS correlation, attribution) do not block HTTP handlers. 

## Flow
1. **Trigger**: User calls a `POST /analysis` endpoint.
2. **State Creation**: A row is inserted into the `jobs` table with `status = pending`, generating a UUID `job_id`. The endpoint returns `202 Accepted` with the `job_id` immediately.
3. **Queue**: The job is optionally pushed to a Redis queue.
4. **Worker**: A background `tokio` task (see `src/jobs/worker.rs`) pops the job from Redis or polls the DB.
5. **Execution**: The worker executes the heavy logic (calling ML endpoints or running heavy PostGIS queries).
6. **Result Handling**:
   - On success: `status = completed`, result JSON is updated in DB.
   - On failure: `status = failed`, error stored, retry logic engaged if appropriate.
7. **Client Notification**: The frontend receives realtime progress/completion updates via the `/api/v1/ws` WebSocket channel. 

## Fallback
If WebSockets drop, the frontend can always poll `GET /jobs/{id}` for the current status.
