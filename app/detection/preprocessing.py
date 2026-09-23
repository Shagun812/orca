
from pathlib import Path
import numpy as np


def load_grayscale_npy(path: str) -> np.ndarray:
    """Load a simple .npy raster for experiments.

    Real Sentinel-1 preprocessing can replace this function later.
    """
    arr = np.load(Path(path))
    if arr.ndim != 2:
        raise ValueError("Expected a 2D raster")
    return arr.astype(float)


def normalize(arr: np.ndarray) -> np.ndarray:
    arr = np.asarray(arr, dtype=float)
    lo, hi = np.nanpercentile(arr, [2, 98])
    if hi <= lo:
        return np.zeros_like(arr)
    return np.clip((arr - lo) / (hi - lo), 0.0, 1.0)
