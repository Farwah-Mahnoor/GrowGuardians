from database import db
from otp_service import OTPService
import jwt
import os
from datetime import datetime, timedelta
from dotenv import load_dotenv

load_dotenv()

SECRET_KEY = os.getenv('SECRET_KEY', 'your-secret-key-change-in-production')

class UserService:
    @staticmethod
    def send_registration_otp(mobile_number):
        """Send OTP for registration"""
        try:
            # Check if user already exists
            cursor = db.connection.cursor(dictionary=True)
            cursor.execute("SELECT id FROM users WHERE mobile_number = %s", (mobile_number,))
            existing_user = cursor.fetchone()
            cursor.close()
            
            if existing_user:
                return {
                    'success': False,
                    'message': 'Mobile number already registered'
                }
            
            # Send OTP
            return OTPService.send_otp(mobile_number, 'registration')
            
        except Exception as e:
            print(f"Error sending registration OTP: {e}")
            return {
                'success': False,
                'message': f'Failed to send OTP: {str(e)}'
            }

    @staticmethod
    def register_user(user_data, otp_code):
        """Register a new user after OTP verification"""
        try:
            mobile_number = user_data.get('mobileNumber')
            
            # Verify OTP
            otp_result = OTPService.verify_otp(mobile_number, otp_code, 'registration')
            if not otp_result['success']:
                return otp_result
            
            # Check if user already exists
            cursor = db.connection.cursor(dictionary=True)
            cursor.execute("SELECT id FROM users WHERE mobile_number = %s", (mobile_number,))
            existing_user = cursor.fetchone()
            
            if existing_user:
                cursor.close()
                return {
                    'success': False,
                    'message': 'User already registered'
                }
            
            # Insert new user
            cursor.execute("""
                INSERT INTO users (name, surname, mobile_number, email, province, 
                                  district, tehsil, village, address)
                VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s)
            """, (
                user_data.get('name'),
                user_data.get('surname'),
                mobile_number,
                user_data.get('email', ''),
                user_data.get('province', ''),
                user_data.get('district', ''),
                user_data.get('tehsil'),
                user_data.get('village', ''),
                user_data.get('address', '')
            ))
            
            db.connection.commit()
            user_id = cursor.lastrowid
            cursor.close()
            
            # Generate JWT token
            token = UserService.generate_token(user_id, mobile_number)
            
            return {
                'success': True,
                'message': 'User registered successfully',
                'token': token,
                'user_id': user_id
            }
            
        except Exception as e:
            print(f"Error registering user: {e}")
            return {
                'success': False,
                'message': f'Registration failed: {str(e)}'
            }

    @staticmethod
    def send_login_otp(mobile_number):
        """Send OTP for login"""
        try:
            # Check if user exists
            cursor = db.connection.cursor(dictionary=True)
            cursor.execute("SELECT id FROM users WHERE mobile_number = %s", (mobile_number,))
            user = cursor.fetchone()
            cursor.close()
            
            if not user:
                return {
                    'success': False,
                    'message': 'Mobile number not registered'
                }
            
            # Send OTP
            return OTPService.send_otp(mobile_number, 'login')
            
        except Exception as e:
            print(f"Error sending login OTP: {e}")
            return {
                'success': False,
                'message': f'Failed to send OTP: {str(e)}'
            }

    @staticmethod
    def login_user(mobile_number, otp_code):
        """Login user with OTP verification"""
        try:
            # Verify OTP
            otp_result = OTPService.verify_otp(mobile_number, otp_code, 'login')
            if not otp_result['success']:
                return otp_result
            
            # Get user data
            cursor = db.connection.cursor(dictionary=True)
            cursor.execute("""
                SELECT id, name, surname, mobile_number, email, province, 
                       district, tehsil, village, address
                FROM users 
                WHERE mobile_number = %s
            """, (mobile_number,))
            
            user = cursor.fetchone()
            cursor.close()

            if not user:
                return {
                    'success': False,
                    'message': 'User not found'
                }

            # Generate JWT token
            token = UserService.generate_token(user['id'], mobile_number)
            
            return {
                'success': True,
                'message': 'Login successful',
                'token': token,
                'user': {
                    'id': user['id'],
                    'name': user['name'],
                    'surname': user['surname'],
                    'mobileNumber': user['mobile_number'],
                    'email': user['email'] or '',
                    'province': user['province'] or '',
                    'district': user['district'] or '',
                    'tehsil': user['tehsil'] or '',
                    'village': user['village'] or '',
                    'address': user['address'] or ''
                }
            }
            
        except Exception as e:
            print(f"Error logging in user: {e}")
            return {
                'success': False,
                'message': f'Login failed: {str(e)}'
            }

    @staticmethod
    def get_user_profile(user_id):
        """Get user profile by ID"""
        try:
            cursor = db.connection.cursor(dictionary=True)
            cursor.execute("""
                SELECT id, name, surname, mobile_number, email, province, 
                       district, tehsil, village, address
                FROM users 
                WHERE id = %s
            """, (user_id,))
            
            user = cursor.fetchone()
            cursor.close()

            if user:
                return {
                    'success': True,
                    'user': {
                        'id': user['id'],
                        'name': user['name'],
                        'surname': user['surname'],
                        'mobileNumber': user['mobile_number'],
                        'email': user['email'] or '',
                        'province': user['province'] or '',
                        'district': user['district'] or '',
                        'tehsil': user['tehsil'] or '',
                        'village': user['village'] or '',
                        'address': user['address'] or ''
                    }
                }
            else:
                return {
                    'success': False,
                    'message': 'User not found'
                }
                
        except Exception as e:
            print(f"Error fetching profile: {e}")
            return {
                'success': False,
                'message': 'Failed to fetch profile'
            }

    @staticmethod
    def update_user_profile(user_id, update_data, otp_code=None):
        """Update user profile"""
        try:
            new_mobile = update_data.get('mobileNumber')
            
            # Get current mobile number
            cursor = db.connection.cursor(dictionary=True)
            cursor.execute("SELECT mobile_number FROM users WHERE id = %s", (user_id,))
            current_user = cursor.fetchone()
            
            if not current_user:
                cursor.close()
                return {'success': False, 'message': 'User not found'}
            
            # If mobile number is changing, verify OTP
            if new_mobile and new_mobile != current_user['mobile_number']:
                if not otp_code:
                    cursor.close()
                    return {'success': False, 'message': 'OTP required for mobile number change'}
                
                otp_result = OTPService.verify_otp(new_mobile, otp_code, 'login')
                if not otp_result['success']:
                    cursor.close()
                    return otp_result

            # Update user data
            cursor.execute("""
                UPDATE users 
                SET mobile_number = %s, email = %s, address = %s
                WHERE id = %s
            """, (
                new_mobile or current_user['mobile_number'],
                update_data.get('email', ''),
                update_data.get('address', ''),
                user_id
            ))
            
            db.connection.commit()
            cursor.close()

            return {
                'success': True,
                'message': 'Profile updated successfully'
            }

        except Exception as e:
            print(f"Error updating profile: {e}")
            return {
                'success': False,
                'message': f'Failed to update profile: {str(e)}'
            }

    @staticmethod
    def generate_token(user_id, mobile_number):
        """Generate JWT token"""
        payload = {
            'user_id': user_id,
            'mobile_number': mobile_number,
            'exp': datetime.utcnow() + timedelta(days=7)
        }
        token = jwt.encode(payload, SECRET_KEY, algorithm='HS256')
        return token

    @staticmethod
    def verify_token(token):
        """Verify JWT token"""
        try:
            payload = jwt.decode(token, SECRET_KEY, algorithms=['HS256'])
            return {'success': True, 'user_id': payload['user_id']}
        except jwt.ExpiredSignatureError:
            return {'success': False, 'message': 'Token expired'}
        except jwt.InvalidTokenError:
            return {'success': False, 'message': 'Invalid token'}
