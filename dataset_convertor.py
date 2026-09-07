import random
import shutil
import xml.etree.ElementTree as ET
from pathlib import Path

# ============================================================
# CONFIGURATION
# ============================================================

SOURCE_DIR = Path("data/satellite/DARTIS_2019_allfiles")
OUTPUT_DIR = Path("DARTIS_YOLO")

TRAIN_RATIO = 0.80
RANDOM_SEED = 42

CLASS_NAME = "oil"
CLASS_ID = 0

# ============================================================
# OUTPUT DIRECTORIES
# ============================================================

train_images = OUTPUT_DIR / "images" / "train"
val_images = OUTPUT_DIR / "images" / "val"

train_labels = OUTPUT_DIR / "labels" / "train"
val_labels = OUTPUT_DIR / "labels" / "val"

for directory in [
    train_images,
    val_images,
    train_labels,
    val_labels
]:
    directory.mkdir(parents=True, exist_ok=True)

# ============================================================
# FIND ALL IMAGES
# ============================================================

image_files = {}

for file in SOURCE_DIR.rglob("*"):
    if file.suffix.lower() in [".jpg", ".jpeg"]:
        image_files[file.stem.lower()] = file

print(f"Found {len(image_files)} images")

# ============================================================
# FIND ALL XML FILES
# ============================================================

xml_files = list(SOURCE_DIR.rglob("*.xml"))

print(f"Found {len(xml_files)} XML files")

# ============================================================
# MATCH XML → IMAGE
# ============================================================

pairs = []

for xml_file in xml_files:

    image_file = image_files.get(xml_file.stem.lower())

    # Fallback: use <filename> inside XML
    if image_file is None:

        try:
            tree = ET.parse(xml_file)
            root = tree.getroot()

            xml_filename = root.findtext("filename")

            if xml_filename:
                image_stem = Path(xml_filename).stem.lower()
                image_file = image_files.get(image_stem)

        except Exception:
            pass

    if image_file is None:
        print(f"[WARNING] No image found for {xml_file.name}")
        continue

    pairs.append((image_file, xml_file))


print(f"Matched image/XML pairs: {len(pairs)}")

# ============================================================
# SHUFFLE + TRAIN/VAL SPLIT
# ============================================================

random.seed(RANDOM_SEED)

random.shuffle(pairs)

split_index = int(len(pairs) * TRAIN_RATIO)

train_pairs = pairs[:split_index]
val_pairs = pairs[split_index:]

print()
print("Dataset split:")
print(f"Train: {len(train_pairs)}")
print(f"Val:   {len(val_pairs)}")

# ============================================================
# CONVERSION FUNCTION
# ============================================================

def convert_xml_to_yolo(xml_file):

    tree = ET.parse(xml_file)
    root = tree.getroot()

    width = int(root.findtext("size/width"))
    height = int(root.findtext("size/height"))

    annotations = []

    for obj in root.findall("object"):

        class_name = obj.findtext("name")

        if class_name is None:
            continue

        class_name = class_name.strip().lower()

        # Only keep oil objects
        if class_name != CLASS_NAME:
            continue

        bbox = obj.find("bndbox")

        if bbox is None:
            continue

        xmin = float(bbox.findtext("xmin"))
        ymin = float(bbox.findtext("ymin"))
        xmax = float(bbox.findtext("xmax"))
        ymax = float(bbox.findtext("ymax"))

        # Clamp coordinates to image boundaries
        xmin = max(0, min(xmin, width))
        xmax = max(0, min(xmax, width))

        ymin = max(0, min(ymin, height))
        ymax = max(0, min(ymax, height))

        # Ignore invalid boxes
        if xmax <= xmin or ymax <= ymin:
            continue

        # Pascal VOC → YOLO
        x_center = ((xmin + xmax) / 2) / width
        y_center = ((ymin + ymax) / 2) / height

        box_width = (xmax - xmin) / width
        box_height = (ymax - ymin) / height

        annotation = (
            f"{CLASS_ID} "
            f"{x_center:.6f} "
            f"{y_center:.6f} "
            f"{box_width:.6f} "
            f"{box_height:.6f}"
        )

        annotations.append(annotation)

    return annotations

# ============================================================
# PROCESS DATASET
# ============================================================

total_oil_objects = 0
train_images_count = 0
val_images_count = 0

# ------------------------------------------------------------
# TRAIN
# ------------------------------------------------------------

print("\nProcessing training set...")

for image_file, xml_file in train_pairs:

    try:

        annotations = convert_xml_to_yolo(xml_file)

        destination_image = train_images / image_file.name
        destination_label = train_labels / f"{image_file.stem}.txt"

        shutil.copy2(image_file, destination_image)

        with open(destination_label, "w") as f:

            for annotation in annotations:
                f.write(annotation + "\n")

        total_oil_objects += len(annotations)
        train_images_count += 1

    except Exception as error:

        print(
            f"[ERROR] Training file {xml_file.name}: {error}"
        )

# ------------------------------------------------------------
# VALIDATION
# ------------------------------------------------------------

print("Processing validation set...")

for image_file, xml_file in val_pairs:

    try:

        annotations = convert_xml_to_yolo(xml_file)

        destination_image = val_images / image_file.name
        destination_label = val_labels / f"{image_file.stem}.txt"

        shutil.copy2(image_file, destination_image)

        with open(destination_label, "w") as f:

            for annotation in annotations:
                f.write(annotation + "\n")

        total_oil_objects += len(annotations)
        val_images_count += 1

    except Exception as error:

        print(
            f"[ERROR] Validation file {xml_file.name}: {error}"
        )

# ============================================================
# CREATE data.yaml
# ============================================================

yaml_content = f"""path: {OUTPUT_DIR.resolve()}
train: images/train
val: images/val

names:
  0: oil
"""

with open(OUTPUT_DIR / "data.yaml", "w") as f:
    f.write(yaml_content)

# ============================================================
# FINAL REPORT
# ============================================================

print()
print("=" * 60)
print("DARTIS → YOLO DATASET COMPLETE")
print("=" * 60)

print(f"Images found        : {len(image_files)}")
print(f"XML files found     : {len(xml_files)}")
print(f"Matched pairs       : {len(pairs)}")

print()
print(f"Training images     : {train_images_count}")
print(f"Validation images   : {val_images_count}")

print()
print(f"Oil objects         : {total_oil_objects}")

print()
print(f"Output directory    : {OUTPUT_DIR.resolve()}")
print(f"Dataset YAML        : {(OUTPUT_DIR / 'data.yaml').resolve()}")

print("=" * 60)