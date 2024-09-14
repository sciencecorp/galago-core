from os.path import join
from PIL import Image, ImageDraw, ImageFont
import numpy as np
import re
import time 
import os
from pathlib import Path 
from landingai.predict import Predictor# type: ignore
from landingai.pipeline.frameset import Frame # type: ignore


class OT2ImageProcessor:
    def __init__(self, endpoint_id:str, api_key:str) -> None:
        self.predictor = Predictor(
            endpoint_id=endpoint_id,
            api_key=api_key
        )
        self.font_path = "arial.ttf"
        self.frame : Frame 

    def load_frame(self, image_path:str) -> None:
        self.frame = Frame.from_image(image_path)

    def parse_predictions(self, prediction: str) -> dict:
        prediction = prediction.replace("Predictions score", "prediction_score")
        predictions_parsed = re.findall(r"(\w+)=('.*?'|\(.*?\)|\S+)", prediction)
        prediction_dict = {}
        for key, value in predictions_parsed:
            value = value.strip("'")
            if value.isdigit():
                value = int(value)
            elif value.replace('.', '', 1).isdigit():
                value = float(value)
            elif value.startswith('(') and value.endswith(')'):
                value = tuple(map(int, value[1:-1].split(', ')))
            prediction_dict[key] = value
        return prediction_dict

    def overlay_text_and_boxes_on_array(self, image_array:np.ndarray,predictions:list, box_color:str='red', text_color:str='blue', text_size:int=18) -> np.ndarray:
        image = Image.fromarray(image_array.astype('uint8'), 'RGB')
        draw = ImageDraw.Draw(image)
        font = ImageFont.load_default(size=text_size)
        
        for label in predictions:
            prediction_dict  = self.parse_predictions(str(label))
            box = prediction_dict["bboxes"]
            print("Box is" + str(box))
            draw.rectangle(box, outline=box_color, width=2 )
            #label text
            text = prediction_dict["label_name"]
            box_height = box[1]-box[3]
            #box around text
            text_box = (box[0]-5,box[1]-23,(box[0]+len(text)*(text_size+2)/2),(box[3]+box_height))
            draw.rectangle(text_box, outline="white", width=2, fill="blue")
            draw.text((box[0], box[1] - text_size - 4), text, fill="white", font=font)


        image_with_overlays = np.array(image)
        return image_with_overlays

    def process_images_by_directory(self, directory:str) -> None:
        if os.path.exists(directory):
            all_images = [x for x in os.listdir(directory) if x.endswith(".jpg") and "predicted" not in x]
            print(f"Images are {all_images}")
            for img in all_images:
                self.process_image(join(directory, img))
                time.sleep(20)
        return None

    def process_image(self, image_path:str) -> None:
        print(f"processing image {image_path}")
        if os.path.isfile(image_path):
            img_name = Path(image_path).name.replace(".jpg","")
            img_folder = os.path.dirname(os.path.abspath(image_path))
            frame = Frame.from_image(image_path)
            frame.resize(width=512, height=512)
            frame.run_predict(predictor=self.predictor)
            predictions = frame.predictions
            image_array = frame.to_numpy_array()
            image_with_overlays = self.overlay_text_and_boxes_on_array(image_array, predictions)
            output_image = Image.fromarray(image_with_overlays)
            output_image = output_image.resize((640,480))
            new_img_name = join(img_folder,f"{img_name}_predicted.jpg")
            print(f"Saving new image to {new_img_name}")
            output_image.save(new_img_name)

