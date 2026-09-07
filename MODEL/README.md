
# PART B — Intelligence Layer

ORCA / Oil-spill Response & Correlation Analytics

Part B owns the intelligence pipeline:

Satellite observation
→ spill detection
→ spill geometry
→ drift / hindcast
→ origin probability zone + time window
→ AIS filtering
→ trajectory reconstruction
→ feature extraction
→ candidate scoring / ranking
→ evidence output

The service is deliberately mock-first for V1. The interfaces are stable so a real
segmentation model, ocean-current product, or production AIS feed can be substituted
without changing the frontend/backend contract.

## Run

```bash
python -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
uvicorn app.main:app --reload
```

Windows:

```powershell
python -m venv .venv
.venv\Scripts\activate
pip install -r requirements.txt
uvicorn app.main:app --reload
```

Open:

- http://127.0.0.1:8000/docs
- http://127.0.0.1:8000/health

## V1 demo order

1. POST `/detect`
2. POST `/drift/hindcast`
3. POST `/attribution/rank`
4. Send the returned GeoJSON / JSON to Part A.

The service does not write directly to PostGIS. Part A remains responsible for
application orchestration and persistence.
