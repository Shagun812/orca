
import numpy as np


class DemoSpillModel:
    """Deterministic baseline used until a trained segmentation model is connected."""

    def predict(self, image: np.ndarray) -> np.ndarray:
        image = np.asarray(image, dtype=float)
        threshold = float(np.nanpercentile(image, 20))
        return image <= threshold
