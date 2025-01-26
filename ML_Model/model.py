import torch
from transformers import SegformerForSemanticSegmentation, SegformerImageProcessor
from PIL import Image
import numpy as np
import matplotlib.pyplot as plt

# Paths to model and image
model_dir = "./segformer_model"
image_path = "./honey3.jpg"

# Load model and processor
processor = SegformerImageProcessor.from_pretrained(model_dir, local_files_only=True)
model = SegformerForSemanticSegmentation.from_pretrained(model_dir, local_files_only=True)

# Load and preprocess the image
image = Image.open(image_path).convert("RGB")
inputs = processor(images=image, return_tensors="pt")

# Perform inference
with torch.no_grad():
    outputs = model(**inputs)

# Extract predictions
logits = outputs.logits  # Shape: [batch_size, num_classes, height, width]
predicted_segmentation = torch.argmax(logits, dim=1).squeeze(0).cpu().numpy()

# Resize segmentation mask to match original image size
original_width, original_height = image.size
resized_segmentation = np.array(Image.fromarray(predicted_segmentation.astype(np.uint8)).resize(
    (original_width, original_height), resample=Image.NEAREST))

# Identify the wall class (class 0 for 'wall')
wall_class_id = 0
wall_mask = resized_segmentation == wall_class_id

# Convert the image to a NumPy array
image_array = np.array(image)

# Apply new color to wall mask (e.g., light green)
new_color = [69,69,69]  # RGB for light green
image_array[wall_mask] = new_color

# Convert back to an image
output_image = Image.fromarray(image_array)

# Wall code output: Visualize the wall segmentation mask
plt.figure(figsize=(10, 10))
plt.imshow(wall_mask, cmap='gray')  # Wall mask in grayscale
plt.title("Wall Segmentation Mask")
plt.axis("off")
plt.show()

# Wall cover code: Show the result with the wall color changed
plt.figure(figsize=(10, 10))
plt.imshow(output_image)
plt.title("Wall Color Changed")
plt.axis("off")
plt.show()

# Save the result with wall color changed
output_image.save("output_with_wall_color_changed.jpg")
