import os
import cv2
import uuid
import numpy as np
from fastapi import UploadFile

STATIC_DIR = "static/cctv_output"
os.makedirs(STATIC_DIR, exist_ok=True)

class CCTVService:
    def __init__(self):
        self.model = None
        self.model_path = "models/best_box_detector.pt"

    def _get_model(self):
        if self.model is None:
            if os.path.exists(self.model_path):
                from ultralytics import YOLO
                print(f"Lazy loading YOLO model from {self.model_path}...")
                self.model = YOLO(self.model_path)
            else:
                raise Exception(f"YOLO model not found at {self.model_path}")
        return self.model

    async def analyze_image(self, file: UploadFile):
        model = self._get_model()
        
        contents = await file.read()
        nparr = np.frombuffer(contents, np.uint8)
        img = cv2.imdecode(nparr, cv2.IMREAD_COLOR)

        results = model(img)
        result = results[0]

        total_boxes = len(result.boxes)
        confidence = float(result.boxes.conf.mean()) if total_boxes > 0 else 0.0

        output_filename = f"{uuid.uuid4()}.jpg"
        output_path = os.path.join(STATIC_DIR, output_filename)
        
        annotated_img = result.plot()
        cv2.imwrite(output_path, annotated_img)

        return {
            "total_boxes": total_boxes,
            "confidence": round(confidence, 2),
            "status": "completed",
            "output_preview_path": f"/static/cctv_output/{output_filename}"
        }

    async def analyze_video(self, file: UploadFile):
        model = self._get_model()
        
        temp_filename = f"temp_{uuid.uuid4()}_{file.filename}"
        with open(temp_filename, "wb") as f:
            f.write(await file.read())

        output_filename = f"{uuid.uuid4()}.mp4"
        output_path = os.path.join(STATIC_DIR, output_filename)

        cap = cv2.VideoCapture(temp_filename)
        width = int(cap.get(cv2.CAP_PROP_FRAME_WIDTH))
        height = int(cap.get(cv2.CAP_PROP_FRAME_HEIGHT))
        fps = int(cap.get(cv2.CAP_PROP_FPS))
        if fps == 0:
            fps = 30
            
        fourcc = cv2.VideoWriter_fourcc(*'mp4v')
        out = cv2.VideoWriter(output_path, fourcc, fps, (width, height))
        
        total_boxes_list = []
        confidences = []
        
        # To avoid blocking too long, we might limit frames or just process them.
        # For a simple demo, we process all frames.
        frame_count = 0
        max_frames = 300 # Limit to 10 seconds at 30fps to avoid timeout
        
        while cap.isOpened() and frame_count < max_frames:
            ret, frame = cap.read()
            if not ret:
                break
            
            res = model(frame, verbose=False)[0]
            boxes_count = len(res.boxes)
            conf = float(res.boxes.conf.mean()) if boxes_count > 0 else 0.0
            
            total_boxes_list.append(boxes_count)
            if boxes_count > 0:
                confidences.append(conf)
                
            annotated_frame = res.plot()
            out.write(annotated_frame)
            frame_count += 1
            
        cap.release()
        out.release()
        
        if os.path.exists(temp_filename):
            os.remove(temp_filename)
        
        avg_boxes = int(sum(total_boxes_list) / len(total_boxes_list)) if total_boxes_list else 0
        avg_conf = float(sum(confidences) / len(confidences)) if confidences else 0.0
        
        return {
            "total_boxes": avg_boxes,
            "confidence": round(avg_conf, 2),
            "status": "completed",
            "output_preview_path": f"/static/cctv_output/{output_filename}"
        }

cctv_service = CCTVService()
