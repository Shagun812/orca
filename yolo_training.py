from ultralytics import YOLO

# Load pretrained YOLO model
model = YOLO("yolo11n.pt")

# Train
results = model.train(
    data="DARTIS_YOLO/data.yaml",
    epochs=30,
    imgsz=640,
    batch=8,
    project="runs/orca",
    name="oil_detector"
)

print("Training completed!")
print("Best model saved at:")
print("runs/orca/oil_detector/weights/best.pt")