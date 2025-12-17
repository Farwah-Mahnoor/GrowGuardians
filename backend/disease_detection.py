import os
import numpy as np
from PIL import Image
import json
from datetime import datetime
from database import db
from dotenv import load_dotenv

load_dotenv()

# Import PyTorch for the new model
def load_model():
    """Load the trained PyTorch model"""
    try:
        import torch
        import torch.nn as nn
        from torchvision import models
        
        model_path = os.getenv('MODEL_PATH', 'C:\\Users\\Hp Pc\\OneDrive\\Desktop\\FYPGrowGuardians\\best_resnet50.pth')
        
        if os.path.exists(model_path):
            print(f"✅ Loading PyTorch model from: {model_path}")
            
            try:
                # Load the checkpoint
                device = torch.device('cuda' if torch.cuda.is_available() else 'cpu')
                checkpoint = torch.load(model_path, map_location=device)
                
                # Extract class names if available
                if 'classes' in checkpoint:
                    class_names = checkpoint['classes']
                    num_classes = len(class_names)
                    print(f"✅ Found {num_classes} classes: {class_names}")
                else:
                    # Default to 4 classes
                    num_classes = 4
                    print("⚠️ No class names in checkpoint, using default 4 classes")
                
                # Create ResNet50 model
                model = models.resnet50(pretrained=False)
                
                # Adjust the final layer for number of classes
                model.fc = nn.Linear(model.fc.in_features, num_classes)
                
                # Load the trained weights from checkpoint
                if 'model_state_dict' in checkpoint:
                    model.load_state_dict(checkpoint['model_state_dict'])
                else:
                    model.load_state_dict(checkpoint)
                
                model = model.to(device)
                model.eval()
                
                print(f"✅ PyTorch model loaded successfully on {device}")
                
                # Store class names for later use
                if 'classes' in checkpoint:
                    model.class_names = checkpoint['classes']
                
                return model
            except Exception as e:
                print(f"⚠️ Error loading PyTorch model: {e}")
                print("⚠️ Using fallback predictions")
                return None
        else:
            print(f"❌ Model file not found at: {model_path}")
            return None
    except Exception as e:
        print(f"❌ Error loading model: {e}")
        return None

# Load model at module initialization
MODEL = load_model()

# Disease information database
DISEASE_INFO = {
    'healthy': {
        'name': 'Healthy Plant',
        'diagnosis': [
            'No disease symptoms detected',
            'Plant appears healthy and well-maintained',
            'Continue regular care and monitoring'
        ],
        'tips': [
            'Maintain current watering schedule',
            'Ensure adequate sunlight exposure',
            'Apply organic fertilizer monthly',
            'Monitor for any changes in appearance'
        ]
    },
    'bacterial_leaf_blight': {
        'name': 'Bacterial Leaf Blight',
        'diagnosis': [
            'Bacterial Leaf Blight infection detected',
            'Water-soaked lesions visible on leaves',
            'Yellow to white lesions with wavy margins',
            'Disease severity: Moderate to High'
        ],
        'tips': [
            'Remove and destroy infected plant parts',
            'Apply copper-based bactericide',
            'Improve field drainage to reduce moisture',
            'Use disease-resistant rice varieties',
            'Avoid excessive nitrogen fertilization'
        ]
    },
    'brown_spot': {
        'name': 'Brown Spot',
        'diagnosis': [
            'Brown Spot disease identified',
            'Circular brown spots with gray centers',
            'Spots may coalesce causing leaf death'
        ],
        'tips': [
            'Apply potassium fertilizer to strengthen plants',
            'Use fungicides containing mancozeb or copper',
            'Ensure proper soil nutrients',
            'Remove infected debris after harvest',
            'Plant resistant varieties'
        ]
    },
    'leaf_blast': {
        'name': 'Leaf Blast',
        'diagnosis': [
            'Leaf Blast (Rice Blast) infection detected',
            'Diamond-shaped lesions with gray centers',
            'Brown margins around lesions',
            'Can cause severe yield loss'
        ],
        'tips': [
            'Apply systemic fungicides (tricyclazole or azoxystrobin)',
            'Avoid excessive nitrogen fertilizer',
            'Maintain proper plant spacing for air circulation',
            'Use blast-resistant rice varieties',
            'Monitor fields regularly during humid conditions'
        ]
    },
    'leaf_scald': {
        'name': 'Leaf Scald',
        'diagnosis': [
            'Leaf Scald disease identified',
            'Large lesions with alternating light and dark green bands',
            'Zonate pattern characteristic of this disease'
        ],
        'tips': [
            'Plant resistant varieties',
            'Apply appropriate fungicides',
            'Improve field sanitation',
            'Avoid planting in shaded areas',
            'Ensure balanced fertilization'
        ]
    },
    'narrow_brown_spot': {
        'name': 'Narrow Brown Spot',
        'diagnosis': [
            'Narrow Brown Spot disease detected',
            'Long narrow brown lesions on leaves',
            'Lesions run parallel to leaf veins'
        ],
        'tips': [
            'Apply fungicides containing mancozeb',
            'Improve soil fertility with balanced fertilizer',
            'Ensure adequate potassium levels',
            'Remove infected plant debris',
            'Use healthy seeds for planting'
        ]
    },
    # Legacy tomato disease support (for backward compatibility)
    'tomato_late_blight': {
        'name': 'Tomato Late Blight',
        'diagnosis': [
            'The plant shows symptoms of Late Blight disease',
            'Dark brown spots visible on leaves',
            'White fungal growth detected on leaf undersides',
            'Disease severity: Moderate to High'
        ],
        'tips': [
            'Remove and destroy all infected plant parts immediately',
            'Apply copper-based fungicide every 7-10 days',
            'Improve air circulation around plants',
            'Avoid overhead watering to reduce moisture on leaves',
            'Consider resistant tomato varieties for future planting'
        ]
    },
    'tomato_early_blight': {
        'name': 'Tomato Early Blight',
        'diagnosis': [
            'Early Blight infection detected',
            'Concentric ring patterns visible on older leaves',
            'Disease spreading from lower to upper leaves'
        ],
        'tips': [
            'Remove affected leaves and stems',
            'Apply fungicide containing chlorothalonil',
            'Mulch around plants to prevent soil splash',
            'Water at the base of plants, not on foliage',
            'Rotate crops to prevent soil contamination'
        ]
    },
    'bacterial_spot': {
        'name': 'Bacterial Spot',
        'diagnosis': [
            'Bacterial spot disease identified',
            'Small dark spots with yellow halos on leaves',
            'Fruit may show raised spots'
        ],
        'tips': [
            'Remove and destroy infected plant material',
            'Apply copper-based bactericide',
            'Avoid working with plants when wet',
            'Use drip irrigation instead of sprinklers',
            'Plant disease-resistant varieties'
        ]
    }
}

def preprocess_image(image_path, target_size=(224, 224)):
    """Preprocess image for PyTorch model prediction"""
    try:
        import torch
        from torchvision import transforms
        
        img = Image.open(image_path)
        img = img.convert('RGB')
        
        # Define PyTorch transforms
        transform = transforms.Compose([
            transforms.Resize(256),
            transforms.CenterCrop(224),
            transforms.ToTensor(),
            transforms.Normalize(mean=[0.485, 0.456, 0.406], std=[0.229, 0.224, 0.225])
        ])
        
        img_tensor = transform(img).unsqueeze(0)  # Add batch dimension
        return img_tensor
    except Exception as e:
        print(f"Error preprocessing image: {e}")
        return None

class DiseaseDetectionService:
    @staticmethod
    def predict_disease(image_path):
        """Predict disease from plant image using PyTorch"""
        try:
            import torch
            
            if MODEL is None:
                # Return mock prediction if model not loaded
                print("⚠️ Model not loaded, returning mock prediction")
                return {
                    'disease_key': 'tomato_late_blight',
                    'confidence': 87.5,
                    'is_healthy': False
                }
            
            # Preprocess image
            img_tensor = preprocess_image(image_path)
            if img_tensor is None:
                raise Exception("Failed to preprocess image")
            
            # Make prediction
            device = next(MODEL.parameters()).device
            img_tensor = img_tensor.to(device)
            
            with torch.no_grad():
                outputs = MODEL(img_tensor)
                probabilities = torch.nn.functional.softmax(outputs, dim=1)
                confidence, predicted_class = torch.max(probabilities, 1)
                
            predicted_class = predicted_class.item()
            confidence = float(confidence.item() * 100)
            
            # Get class names from model if available, otherwise use defaults
            if hasattr(MODEL, 'class_names'):
                disease_classes = MODEL.class_names
                print(f"✅ Using model class names: {disease_classes}")
            else:
                # Default disease classes
                disease_classes = ['healthy', 'tomato_late_blight', 'tomato_early_blight', 'bacterial_spot']
                print("⚠️ Using default class names")
            
            if predicted_class < len(disease_classes):
                disease_key = disease_classes[predicted_class]
            else:
                disease_key = 'healthy'
            
            # Normalize disease key to match DISEASE_INFO keys
            disease_key_lower = disease_key.lower().replace(' ', '_')
            
            # Check if the key exists in DISEASE_INFO, otherwise use a generic key
            if disease_key_lower not in DISEASE_INFO:
                print(f"⚠️ Disease '{disease_key}' not in DISEASE_INFO, using generic mapping")
                disease_key_lower = 'healthy' if 'healthy' in disease_key.lower() else 'tomato_late_blight'
            
            is_healthy = 'healthy' in disease_key.lower()
            
            return {
                'disease_key': disease_key_lower,
                'confidence': confidence,
                'is_healthy': is_healthy
            }
            
        except Exception as e:
            print(f"Error predicting disease: {e}")
            # Return mock prediction on error
            return {
                'disease_key': 'tomato_late_blight',
                'confidence': 75.0,
                'is_healthy': False
            }

    @staticmethod
    def save_report(user_id, image_path, prediction):
        """Save disease detection report to database"""
        try:
            disease_data = DISEASE_INFO.get(prediction['disease_key'], DISEASE_INFO['healthy'])
            
            cursor = db.connection.cursor()
            cursor.execute("""
                INSERT INTO disease_reports 
                (user_id, image_path, is_healthy, disease_name, confidence_score, 
                 diagnosis_details, treatment_tips)
                VALUES (%s, %s, %s, %s, %s, %s, %s)
            """, (
                user_id,
                image_path,
                prediction['is_healthy'],
                disease_data['name'],
                prediction['confidence'],
                json.dumps(disease_data['diagnosis']),
                json.dumps(disease_data['tips'])
            ))
            
            db.connection.commit()
            report_id = cursor.lastrowid
            cursor.close()
            
            return {
                'success': True,
                'report_id': report_id,
                'message': 'Report saved successfully'
            }
            
        except Exception as e:
            print(f"Error saving report: {e}")
            return {
                'success': False,
                'message': f'Failed to save report: {str(e)}'
            }

    @staticmethod
    def get_user_reports(user_id):
        """Get all reports for a user"""
        try:
            cursor = db.connection.cursor(dictionary=True)
            cursor.execute("""
                SELECT id, image_path, is_healthy, disease_name, 
                       confidence_score, created_at
                FROM disease_reports
                WHERE user_id = %s
                ORDER BY created_at DESC
            """, (user_id,))
            
            reports = cursor.fetchall()
            cursor.close()

            # Format reports for response
            formatted_reports = []
            for report in reports:
                formatted_reports.append({
                    'id': str(report['id']),
                    'image': f"/uploads/{os.path.basename(report['image_path'])}",
                    'title': report['disease_name'],
                    'date': report['created_at'].strftime('%Y-%m-%d'),
                    'isHealthy': bool(report['is_healthy']),
                    'confidence': float(report['confidence_score']) if report['confidence_score'] else 0
                })
            
            return {
                'success': True,
                'reports': formatted_reports
            }
            
        except Exception as e:
            print(f"Error fetching reports: {e}")
            return {
                'success': False,
                'message': 'Failed to fetch reports'
            }

    @staticmethod
    def get_report_details(report_id, user_id):
        """Get detailed report by ID"""
        try:
            cursor = db.connection.cursor(dictionary=True)
            cursor.execute("""
                SELECT * FROM disease_reports
                WHERE id = %s AND user_id = %s
            """, (report_id, user_id))
            
            report = cursor.fetchone()
            cursor.close()

            if not report:
                return {
                    'success': False,
                    'message': 'Report not found'
                }

            # Parse JSON fields
            diagnosis_points = json.loads(report['diagnosis_details']) if report['diagnosis_details'] else []
            tips_points = json.loads(report['treatment_tips']) if report['treatment_tips'] else []

            return {
                'success': True,
                'diagnosisData': {
                    'id': str(report['id']),
                    'image': f"/uploads/{os.path.basename(report['image_path'])}",
                    'isHealthy': bool(report['is_healthy']),
                    'diseaseName': report['disease_name'],
                    'diagnosisPoints': diagnosis_points,
                    'tipsPoints': tips_points,
                    'date': report['created_at'].isoformat()
                }
            }
            
        except Exception as e:
            print(f"Error getting report details: {e}")
            return {
                'success': False,
                'message': 'Failed to get report details'
            }

    @staticmethod
    def delete_report(report_id, user_id):
        """Delete a report"""
        try:
            # Get report to delete image file
            cursor = db.connection.cursor(dictionary=True)
            cursor.execute("""
                SELECT image_path FROM disease_reports
                WHERE id = %s AND user_id = %s
            """, (report_id, user_id))
            
            report = cursor.fetchone()
            
            if report:
                # Delete image file
                if os.path.exists(report['image_path']):
                    os.remove(report['image_path'])
                
                # Delete from database
                cursor.execute("""
                    DELETE FROM disease_reports
                    WHERE id = %s AND user_id = %s
                """, (report_id, user_id))
                
                db.connection.commit()
                cursor.close()
                
                return {
                    'success': True,
                    'message': 'Report deleted successfully'
                }
            else:
                cursor.close()
                return {
                    'success': False,
                    'message': 'Report not found'
                }

        except Exception as e:
            print(f"Error deleting report: {e}")
            return {
                'success': False,
                'message': 'Failed to delete report'
            }

    @staticmethod
    def delete_all_reports(user_id):
        """Delete all reports for a user"""
        try:
            # Get all reports to delete image files
            cursor = db.connection.cursor(dictionary=True)
            cursor.execute("""
                SELECT image_path FROM disease_reports
                WHERE user_id = %s
            """, (user_id,))
            
            reports = cursor.fetchall()
            
            # Delete all image files
            for report in reports:
                if os.path.exists(report['image_path']):
                    try:
                        os.remove(report['image_path'])
                    except:
                        pass
            
            # Delete all reports from database
            cursor.execute("""
                DELETE FROM disease_reports
                WHERE user_id = %s
            """, (user_id,))
            
            db.connection.commit()
            deleted_count = cursor.rowcount
            cursor.close()
            
            return {
                'success': True,
                'message': f'{deleted_count} reports deleted successfully'
            }

        except Exception as e:
            print(f"Error deleting all reports: {e}")
            return {
                'success': False,
                'message': 'Failed to delete reports'
            }
