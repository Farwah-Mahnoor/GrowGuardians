import random
import string
import os
from datetime import datetime, timedelta
from database import db
from twilio.rest import Client

class OTPService:
    @staticmethod
    def send_sms(mobile_number, otp_code):
        """Send SMS using Twilio"""
        try:
            # Check if SMS is enabled
            enable_sms = os.getenv('ENABLE_SMS', 'False').lower() == 'true'
            
            if not enable_sms:
                print("\n" + "="*60)
                print("⚠️  SMS DISABLED - Using Console Display Mode")
                print(f"📱 Mobile Number: {mobile_number}")
                print(f"🔑 OTP Code: {otp_code}")
                print("💡 To enable SMS: Set ENABLE_SMS=True in .env")
                print("="*60 + "\n")
                return {'success': True, 'message': 'OTP displayed in console'}
            
            # Get Twilio credentials from environment
            account_sid = os.getenv('TWILIO_ACCOUNT_SID')
            auth_token = os.getenv('TWILIO_AUTH_TOKEN')
            twilio_number = os.getenv('TWILIO_PHONE_NUMBER')
            
            # Validate credentials
            if not all([account_sid, auth_token, twilio_number]):
                print("❌ Twilio credentials not configured properly")
                return {'success': False, 'message': 'SMS service not configured'}
            
            # Initialize Twilio client
            client = Client(account_sid, auth_token)
            
            # Format mobile number (add +92 for Pakistan if not present)
            if not mobile_number.startswith('+'):
                if mobile_number.startswith('0'):
                    mobile_number = '+92' + mobile_number[1:]  # Remove leading 0, add +92
                elif mobile_number.startswith('92'):
                    mobile_number = '+' + mobile_number
                else:
                    mobile_number = '+92' + mobile_number
            
            # Send SMS
            message = client.messages.create(
                body=f"Your GrowGuardians OTP is: {otp_code}. Valid for 3 minutes. Do not share this code.",
                from_=twilio_number,
                to=mobile_number
            )
            
            print(f"✅ SMS sent successfully to {mobile_number}")
            print(f"📨 Message SID: {message.sid}")
            
            return {
                'success': True,
                'message': 'SMS sent successfully',
                'message_sid': message.sid
            }
            
        except Exception as e:
            error_msg = str(e)
            print(f"❌ SMS Error: {error_msg}")
            
            # Fallback to console display
            print("\n" + "="*60)
            print("⚠️  SMS FAILED - Displaying OTP in Console")
            print(f"📱 Mobile Number: {mobile_number}")
            print(f"🔑 OTP Code: {otp_code}")
            print(f"❌ Error: {error_msg}")
            print("="*60 + "\n")
            
            return {
                'success': True,  # Still return success for development
                'message': f'SMS failed, OTP displayed in console: {error_msg}'
            }
    @staticmethod
    def generate_otp():
        """Generate a 4-digit OTP"""
        return ''.join(random.choices(string.digits, k=4))

    @staticmethod
    def send_otp(mobile_number, purpose='registration'):
        """Generate and save OTP for a mobile number"""
        try:
            otp_code = OTPService.generate_otp()
            expires_at = datetime.now() + timedelta(minutes=3)  # 3 minutes expiry
            
            cursor = db.connection.cursor()
            
            # Invalidate previous OTPs for this mobile number and purpose
            cursor.execute("""
                UPDATE otp_codes 
                SET is_used = TRUE 
                WHERE mobile_number = %s AND purpose = %s AND is_used = FALSE
            """, (mobile_number, purpose))
            
            # Insert new OTP
            cursor.execute("""
                INSERT INTO otp_codes (mobile_number, otp_code, purpose, expires_at)
                VALUES (%s, %s, %s, %s)
            """, (mobile_number, otp_code, purpose, expires_at))
            
            db.connection.commit()
            cursor.close()
            
            # Send SMS with OTP
            sms_result = OTPService.send_sms(mobile_number, otp_code)
            
            # Also display in console for development
            print("\n" + "="*60)
            print(f"📱 OTP CODE FOR MOBILE: {mobile_number}")
            print(f"🔑 OTP: {otp_code}")
            print(f"⏰ Expires in: 3 minutes")
            print(f"📋 Purpose: {purpose}")
            print(f"📨 SMS Status: {sms_result.get('message', 'Unknown')}")
            print("="*60 + "\n")
            
            return {
                'success': True,
                'message': 'OTP sent successfully',
                'otp': otp_code,  # For development only - remove in production
                'expiresIn': 180,  # seconds
                'sms_sent': sms_result.get('success', False)
            }
            
        except Exception as e:
            print(f"Error sending OTP: {e}")
            return {
                'success': False,
                'message': f'Failed to send OTP: {str(e)}'
            }

    @staticmethod
    def verify_otp(mobile_number, otp_code, purpose='registration'):
        """Verify OTP code"""
        try:
            cursor = db.connection.cursor(dictionary=True)
            
            # Find valid OTP
            cursor.execute("""
                SELECT * FROM otp_codes
                WHERE mobile_number = %s 
                AND otp_code = %s 
                AND purpose = %s 
                AND is_used = FALSE
                AND expires_at > NOW()
                ORDER BY created_at DESC
                LIMIT 1
            """, (mobile_number, otp_code, purpose))
            
            otp_record = cursor.fetchone()
            
            if otp_record:
                # Mark OTP as used
                cursor.execute("""
                    UPDATE otp_codes 
                    SET is_used = TRUE 
                    WHERE id = %s
                """, (otp_record['id'],))
                
                db.connection.commit()
                cursor.close()
                
                return {
                    'success': True,
                    'message': 'OTP verified successfully'
                }
            else:
                cursor.close()
                return {
                    'success': False,
                    'message': 'Invalid or expired OTP'
                }
                
        except Exception as e:
            print(f"Error verifying OTP: {e}")
            return {
                'success': False,
                'message': f'OTP verification failed: {str(e)}'
            }

    @staticmethod
    def cleanup_expired_otps():
        """Clean up expired and used OTPs"""
        try:
            cursor = db.connection.cursor()
            cursor.execute("""
                DELETE FROM otp_codes 
                WHERE expires_at < NOW() OR is_used = TRUE
            """)
            db.connection.commit()
            deleted_count = cursor.rowcount
            cursor.close()
            print(f"Cleaned up {deleted_count} expired/used OTPs")
        except Exception as e:
            print(f"Error cleaning up OTPs: {e}")
