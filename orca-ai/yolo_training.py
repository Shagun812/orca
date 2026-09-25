from ultralytics import YOLO

def main():
    # Load pretrained YOLO model
    model = YOLO("yolo11n.pt")

    # Train
    results = model.train(
        data="DARTIS_YOLO/data.yaml",
        epochs=30,
        imgsz=640,
        batch=8,
        project="runs/orca",
        name="orca"
    )

    print("Training completed!")
    print("Best model saved at:")
    print("runs/orca/oil_detector/weights/best.pt")

if __name__ == "__main__":
    main()