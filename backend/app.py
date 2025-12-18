from flask import Flask, request, jsonify, send_from_directory
from flask_cors import CORS
from werkzeug.utils import secure_filename
import os
from datetime import datetime
from dotenv import load_dotenv
from functools import wraps

from database import db
from user_service import UserService
from otp_service import OTPService
from disease_detection import DiseaseDetectionService

load_dotenv()

# Initialize Flask app
app = Flask(__name__)
CORS(app)  # Enable CORS for all routes

# Configuration
app.config['UPLOAD_FOLDER'] = os.getenv('UPLOAD_FOLDER', 'uploads')
app.config['MAX_CONTENT_LENGTH'] = 16 * 1024 * 1024  # 16MB max file size

# Create uploads directory if it doesn't exist
os.makedirs(app.config['UPLOAD_FOLDER'], exist_ok=True)

# Allowed extensions for image upload
ALLOWED_EXTENSIONS = {'png', 'jpg', 'jpeg', 'gif'}

def allowed_file(filename):
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

def token_required(f):
    """Decorator to require authentication token"""
    @wraps(f)
    def decorated(*args, **kwargs):
        token = request.headers.get('Authorization')
        
        if not token:
            return jsonify({'success': False, 'message': 'Token is missing'}), 401
        
        try:
            # Remove 'Bearer ' prefix if present
            if token.startswith('Bearer '):
                token = token[7:]
            
            result = UserService.verify_token(token)
            if not result['success']:
                return jsonify(result), 401
            
            # Add user_id to request context
            request.user_id = result['user_id']
            
        except Exception as e:
            return jsonify({'success': False, 'message': 'Invalid token'}), 401
        
        return f(*args, **kwargs)
    
    return decorated

# ==================== Health Check ====================

@app.route('/api/health', methods=['GET'])
def health_check():
    """Health check endpoint"""
    return jsonify({
        'success': True,
        'message': 'GrowGuardians Backend is running',
        'database': 'connected' if db.connection and db.connection.is_connected() else 'disconnected'
    }), 200

# ==================== Authentication Routes ====================

@app.route('/api/auth/send-registration-otp', methods=['POST'])
def send_registration_otp():
    """Send OTP for registration"""
    try:
        data = request.get_json()
        mobile_number = data.get('mobileNumber')
        
        if not mobile_number:
            return jsonify({'success': False, 'message': 'Mobile number is required'}), 400
        
        result = UserService.send_registration_otp(mobile_number)
        return jsonify(result), 200 if result['success'] else 400
        
    except Exception as e:
        return jsonify({'success': False, 'message': str(e)}), 500

@app.route('/api/auth/register', methods=['POST'])
def register():
    """Register new user"""
    try:
        data = request.get_json()
        otp_code = data.get('otpCode')
        
        # Extract user data
        user_data = {
            'name': data.get('name'),
            'surname': data.get('surname'),
            'mobileNumber': data.get('mobileNumber'),
            'email': data.get('email', ''),
            'province': data.get('province', ''),
            'district': data.get('district', ''),
            'tehsil': data.get('tehsil'),
            'village': data.get('village', ''),
            'address': data.get('address', '')
        }
        
        # Validate required fields
        if not all([user_data['name'], user_data['surname'], user_data['mobileNumber'], user_data['tehsil']]):
            return jsonify({'success': False, 'message': 'Required fields are missing'}), 400
        
        if not otp_code:
            return jsonify({'success': False, 'message': 'OTP code is required'}), 400
        
        result = UserService.register_user(user_data, otp_code)
        return jsonify(result), 201 if result['success'] else 400
        
    except Exception as e:
        return jsonify({'success': False, 'message': str(e)}), 500

@app.route('/api/auth/resend-otp', methods=['POST'])
def resend_otp():
    """Resend OTP"""
    try:
        data = request.get_json()
        mobile_number = data.get('mobileNumber')
        purpose = data.get('purpose', 'registration')  # 'registration' or 'login'
        
        if not mobile_number:
            return jsonify({'success': False, 'message': 'Mobile number is required'}), 400
        
        result = OTPService.send_otp(mobile_number, purpose)
        return jsonify(result), 200 if result['success'] else 400
        
    except Exception as e:
        return jsonify({'success': False, 'message': str(e)}), 500

@app.route('/api/auth/send-login-otp', methods=['POST'])
def send_login_otp():
    """Send OTP for login"""
    try:
        data = request.get_json()
        mobile_number = data.get('mobileNumber')
        
        if not mobile_number:
            return jsonify({'success': False, 'message': 'Mobile number is required'}), 400
        
        result = UserService.send_login_otp(mobile_number)
        return jsonify(result), 200 if result['success'] else 400
        
    except Exception as e:
        return jsonify({'success': False, 'message': str(e)}), 500

@app.route('/api/auth/login', methods=['POST'])
def login():
    """Login user with OTP"""
    try:
        data = request.get_json()
        mobile_number = data.get('mobileNumber')
        otp_code = data.get('otpCode')
        
        if not mobile_number or not otp_code:
            return jsonify({'success': False, 'message': 'Mobile number and OTP are required'}), 400
        
        result = UserService.login_user(mobile_number, otp_code)
        return jsonify(result), 200 if result['success'] else 400
        
    except Exception as e:
        return jsonify({'success': False, 'message': str(e)}), 500

# ==================== User Profile Routes ====================

@app.route('/api/user/profile', methods=['GET'])
@token_required
def get_profile():
    """Get user profile"""
    try:
        result = UserService.get_user_profile(request.user_id)
        return jsonify(result), 200 if result['success'] else 404
        
    except Exception as e:
        return jsonify({'success': False, 'message': str(e)}), 500

@app.route('/api/user/profile', methods=['PUT'])
@token_required
def update_profile():
    """Update user profile"""
    try:
        data = request.get_json()
        otp_code = data.get('otpCode')  # Required if changing mobile number
        
        update_data = {
            'mobileNumber': data.get('mobileNumber'),
            'email': data.get('email', ''),
            'address': data.get('address', '')
        }
        
        result = UserService.update_user_profile(request.user_id, update_data, otp_code)
        return jsonify(result), 200 if result['success'] else 400
        
    except Exception as e:
        return jsonify({'success': False, 'message': str(e)}), 500

# ==================== Disease Detection Routes ====================

@app.route('/api/scan/upload', methods=['POST'])
@token_required
def upload_scan():
    """Upload plant image for disease detection (without saving to database)"""
    try:
        if 'image' not in request.files:
            return jsonify({'success': False, 'message': 'No image file provided'}), 400
        
        file = request.files['image']
        
        if file.filename == '':
            return jsonify({'success': False, 'message': 'No selected file'}), 400
        
        if file and allowed_file(file.filename):
            # Create unique filename
            filename = secure_filename(file.filename)
            timestamp = datetime.now().strftime('%Y%m%d_%H%M%S')
            filename = f"{request.user_id}_{timestamp}_{filename}"
            filepath = os.path.join(app.config['UPLOAD_FOLDER'], filename)
            
            # Save file
            file.save(filepath)
            
            # Predict disease
            prediction = DiseaseDetectionService.predict_disease(filepath)
            
            # Get disease information
            from disease_detection import DISEASE_INFO
            disease_data = DISEASE_INFO.get(prediction['disease_key'], DISEASE_INFO['healthy'])
            
            # Return diagnosis data WITHOUT saving to database
            diagnosis_data = {
                'image': f"/uploads/{os.path.basename(filepath)}",
                'imagePath': filepath,
                'isHealthy': prediction['is_healthy'],
                'diseaseName': disease_data['name'],
                'confidence': prediction['confidence'],
                'diagnosisPoints': disease_data['diagnosis'],
                'tipsPoints': disease_data['tips'],
                'date': datetime.now().isoformat()
            }
            
            return jsonify({
                'success': True,
                'diagnosisData': diagnosis_data
            }), 200
        else:
            return jsonify({'success': False, 'message': 'Invalid file type'}), 400
        
    except Exception as e:
        return jsonify({'success': False, 'message': str(e)}), 500

@app.route('/api/reports', methods=['GET'])
@token_required
def get_reports():
    """Get all reports for the authenticated user"""
    try:
        result = DiseaseDetectionService.get_user_reports(request.user_id)
        return jsonify(result), 200 if result['success'] else 500
        
    except Exception as e:
        return jsonify({'success': False, 'message': str(e)}), 500

@app.route('/api/reports/save', methods=['POST'])
@token_required
def save_report():
    """Manually save a diagnosis report to database"""
    try:
        data = request.get_json()
        
        if not data or 'imagePath' not in data:
            return jsonify({'success': False, 'message': 'Missing image path'}), 400
        
        # Create prediction object from diagnosis data
        prediction = {
            'is_healthy': data.get('isHealthy', False),
            'disease_key': data.get('diseaseKey', ''),
            'confidence': data.get('confidence', 0)
        }
        
        # Save report to database
        report_result = DiseaseDetectionService.save_report(
            request.user_id,
            data['imagePath'],
            prediction
        )
        
        if not report_result['success']:
            return jsonify(report_result), 500
        
        # Get saved report details
        report_details = DiseaseDetectionService.get_report_details(
            report_result['report_id'],
            request.user_id
        )
        
        return jsonify(report_details), 200
        
    except Exception as e:
        return jsonify({'success': False, 'message': str(e)}), 500

@app.route('/api/reports/<report_id>', methods=['GET'])
@token_required
def get_report(report_id):
    """Get specific report details"""
    try:
        result = DiseaseDetectionService.get_report_details(report_id, request.user_id)
        return jsonify(result), 200 if result['success'] else 404
        
    except Exception as e:
        return jsonify({'success': False, 'message': str(e)}), 500

@app.route('/api/reports/<report_id>', methods=['DELETE'])
@token_required
def delete_report(report_id):
    """Delete a specific report"""
    try:
        result = DiseaseDetectionService.delete_report(report_id, request.user_id)
        return jsonify(result), 200 if result['success'] else 404
        
    except Exception as e:
        return jsonify({'success': False, 'message': str(e)}), 500

@app.route('/api/reports', methods=['DELETE'])
@token_required
def delete_all_reports():
    """Delete all reports for the authenticated user"""
    try:
        result = DiseaseDetectionService.delete_all_reports(request.user_id)
        return jsonify(result), 200 if result['success'] else 500
        
    except Exception as e:
        return jsonify({'success': False, 'message': str(e)}), 500

# ==================== Ratings Routes ====================

@app.route('/api/ratings', methods=['POST'])
@token_required
def submit_rating():
    """Submit user rating and feedback"""
    try:
        data = request.get_json()
        rating = data.get('rating')
        feedback = data.get('feedback', '')
        
        # Validate rating
        if not rating or not isinstance(rating, int) or rating < 1 or rating > 5:
            return jsonify({'success': False, 'message': 'Rating must be between 1 and 5'}), 400
        
        # Insert rating into database
        cursor = db.connection.cursor()
        cursor.execute("""
            INSERT INTO ratings (user_id, rating, feedback)
            VALUES (%s, %s, %s)
        """, (request.user_id, rating, feedback))
        
        db.connection.commit()
        rating_id = cursor.lastrowid
        cursor.close()
        
        return jsonify({
            'success': True,
            'message': 'Rating submitted successfully',
            'rating_id': rating_id
        }), 201
        
    except Exception as e:
        print(f"❌ Error submitting rating: {e}")
        return jsonify({'success': False, 'message': str(e)}), 500

@app.route('/api/ratings', methods=['GET'])
@token_required
def get_ratings():
    """Get all ratings (can be filtered by user)"""
    try:
        cursor = db.connection.cursor()
        
        # Get ratings with user information
        cursor.execute("""
            SELECT r.id, r.rating, r.feedback, r.created_at,
                   u.name, u.surname
            FROM ratings r
            JOIN users u ON r.user_id = u.id
            ORDER BY r.created_at DESC
        """)
        
        ratings_rows = cursor.fetchall()
        cursor.close()
        
        # Format ratings
        ratings = []
        for row in ratings_rows:
            rating_dict = {
                'id': row[0],
                'rating': row[1],
                'feedback': row[2],
                'created_at': row[3].isoformat() if row[3] else None,
                'name': row[4],
                'surname': row[5]
            }
            ratings.append(rating_dict)
        
        return jsonify({
            'success': True,
            'ratings': ratings,
            'count': len(ratings)
        }), 200
        
    except Exception as e:
        print(f"❌ Error fetching ratings: {e}")
        return jsonify({'success': False, 'message': str(e)}), 500

# ==================== File Serving ====================

@app.route('/uploads/<filename>', methods=['GET'])
def serve_upload(filename):
    """Serve uploaded files"""
    try:
        return send_from_directory(app.config['UPLOAD_FOLDER'], filename)
    except Exception as e:
        return jsonify({'success': False, 'message': 'File not found'}), 404

# ==================== Run Server ====================

if __name__ == '__main__':
    # Get port from environment variable (Render) or default to 5000
    port = int(os.environ.get('PORT', 5000))
    debug_mode = os.environ.get('FLASK_DEBUG', 'False').lower() == 'true'
    
    print("\n" + "="*50)
    print("GrowGuardians Backend Server")
    print("="*50)
    print(f"Server running on: http://0.0.0.0:{port}")
    print(f"Database: {os.getenv('DB_NAME', 'growguardians')}")
    print(f"Model path: {os.getenv('MODEL_PATH')}")
    print("="*50 + "\n")
    
    # Bind to 0.0.0.0 to make it accessible from outside Docker container
    app.run(host='0.0.0.0', port=port, debug=debug_mode)
