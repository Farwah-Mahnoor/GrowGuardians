# 📱 Twilio SMS Setup Guide for GrowGuardians

## ✅ SMS Service Integrated!

Your backend now supports **real SMS delivery** using Twilio for OTP verification.

---

## 🚀 Quick Setup (3 Steps)

### **Step 1: Install Twilio Package**

```powershell
cd backend
.\venv310\Scripts\Activate.ps1
pip install twilio==8.10.0
```

Or simply:
```powershell
cd backend
.\venv310\Scripts\Activate.ps1
pip install -r requirements.txt
```

---

### **Step 2: Create Twilio Account (FREE)**

1. **Go to:** https://www.twilio.com/try-twilio
2. **Sign up** with your email
3. **Verify** your email address
4. **Verify** your phone number
5. **Get free trial credits** ($15.50 credit - enough for ~500 SMS!)

---

### **Step 3: Get Twilio Credentials**

After signing up, you'll see your **Dashboard**:

1. **Account SID** - Copy this (looks like: `ACxxxxxxxxxxxxxxxxxxxxxxxxxxxxx`)
2. **Auth Token** - Click "Show" and copy (looks like: `your_auth_token_here`)
3. **Get a Phone Number:**
   - Click "Get a Trial Number"
   - Accept the suggested number
   - Copy this number (looks like: `+1234567890`)

---

## 🔧 Configuration

### **Update `.env` File**

Open: `backend/.env`

Replace these lines:
```env
# Twilio SMS Configuration
TWILIO_ACCOUNT_SID=your_account_sid_here
TWILIO_AUTH_TOKEN=your_auth_token_here
TWILIO_PHONE_NUMBER=+1234567890
ENABLE_SMS=False
```

With your actual credentials:
```env
# Twilio SMS Configuration
TWILIO_ACCOUNT_SID=your_account_sid_here
TWILIO_AUTH_TOKEN=your_auth_token_here
TWILIO_PHONE_NUMBER=your_twilio_phone_number
ENABLE_SMS=False
```

**Important:**
- Set `ENABLE_SMS=True` to activate SMS sending
- Set `ENABLE_SMS=False` to use console display (for testing)

---

## 📱 Phone Number Format

The system automatically handles Pakistani phone numbers:

**Input formats supported:**
- `3001234567` → Converts to `+923001234567`
- `03001234567` → Converts to `+923001234567`
- `923001234567` → Converts to `+923001234567`
- `+923001234567` → Uses as-is

**For other countries:**
The system adds `+92` by default. To support other countries, modify `otp_service.py`.

---

## 🎯 How It Works

### **With SMS Enabled (`ENABLE_SMS=True`):**

1. User requests OTP
2. Backend generates 4-digit code
3. **Twilio sends SMS** to mobile number
4. OTP also displayed in console (for debugging)
5. User receives SMS and enters OTP

**SMS Message Format:**
```
Your GrowGuardians OTP is: 1234. Valid for 3 minutes. Do not share this code.
```

### **With SMS Disabled (`ENABLE_SMS=False`):**

1. User requests OTP
2. Backend generates 4-digit code
3. **OTP displayed in console only** (no SMS sent)
4. Developer copies OTP from console for testing

---

## 💰 Twilio Trial Limitations

### **Free Trial Includes:**
- ✅ $15.50 in credits
- ✅ ~500 SMS messages
- ✅ Full API access
- ✅ No credit card required initially

### **Trial Restrictions:**
- ⚠️ Can only send to **verified phone numbers**
- ⚠️ SMS includes "Sent from your Twilio trial account" prefix
- ⚠️ Limited to verified numbers only

### **To Send to Any Number:**
1. Upgrade account (add credit card)
2. Or verify each test number in Twilio Console:
   - Go to: Phone Numbers → Verified Caller IDs
   - Add new number
   - Verify via SMS/Call

---

## 🧪 Testing SMS

### **Test 1: Console Mode (Development)**

1. Ensure `.env` has: `ENABLE_SMS=False`
2. Start backend: `.\start_backend.ps1`
3. Register a user
4. Check console for OTP:
   ```
   ============================================================
   📱 OTP CODE FOR MOBILE: 3001234567
   🔑 OTP: 1234
   ⏰ Expires in: 3 minutes
   📋 Purpose: registration
   📨 SMS Status: OTP displayed in console
   ============================================================
   ```

### **Test 2: Real SMS (Production)**

1. Update `.env`:
   ```env
   ENABLE_SMS=True
   TWILIO_ACCOUNT_SID=your_real_sid
   TWILIO_AUTH_TOKEN=your_real_token
   TWILIO_PHONE_NUMBER=your_twilio_number
   ```

2. **Verify your test phone number** in Twilio Console

3. Start backend: `.\start_backend.ps1`

4. Register with verified number

5. **Check your phone for SMS!** 📱

6. Backend console shows:
   ```
   ✅ SMS sent successfully to +923001234567
   📨 Message SID: SM1234567890abcdef
   ```

---

## 🔍 Troubleshooting

### **Error: "Twilio credentials not configured"**
**Solution:** Check `.env` file has all three values:
- TWILIO_ACCOUNT_SID
- TWILIO_AUTH_TOKEN
- TWILIO_PHONE_NUMBER

### **Error: "Unable to create record: The number is unverified"**
**Solution:** 
- Trial accounts can only send to verified numbers
- Verify your number at: https://console.twilio.com/us1/develop/phone-numbers/manage/verified
- Or upgrade to paid account

### **Error: "Authentication failed"**
**Solution:**
- Double-check Account SID and Auth Token
- Make sure no extra spaces in `.env`
- Restart backend after updating `.env`

### **SMS not received**
**Checklist:**
1. ✅ ENABLE_SMS=True in `.env`
2. ✅ Valid Twilio credentials
3. ✅ Phone number is verified (trial account)
4. ✅ Phone number format is correct
5. ✅ Check backend console for error messages
6. ✅ Check Twilio Console → Logs → Messages

---

## 📊 Backend Console Output

### **When SMS is Disabled:**
```
============================================================
⚠️  SMS DISABLED - Using Console Display Mode
📱 Mobile Number: 3001234567
🔑 OTP Code: 1234
💡 To enable SMS: Set ENABLE_SMS=True in .env
============================================================
```

### **When SMS Succeeds:**
```
✅ SMS sent successfully to +923001234567
📨 Message SID: SM1234567890abcdef

============================================================
📱 OTP CODE FOR MOBILE: 3001234567
🔑 OTP: 1234
⏰ Expires in: 3 minutes
📋 Purpose: registration
📨 SMS Status: SMS sent successfully
============================================================
```

### **When SMS Fails:**
```
❌ SMS Error: [Error details]

============================================================
⚠️  SMS FAILED - Displaying OTP in Console
📱 Mobile Number: 3001234567
🔑 OTP Code: 1234
❌ Error: Unable to create record
============================================================
```

---

## 🌍 Supporting Multiple Countries

To support countries other than Pakistan, modify `otp_service.py`:

```python
# Current (Pakistan only):
if not mobile_number.startswith('+'):
    if mobile_number.startswith('0'):
        mobile_number = '+92' + mobile_number[1:]

# For multiple countries, pass country code from frontend:
def format_number(mobile_number, country_code='+92'):
    if not mobile_number.startswith('+'):
        if mobile_number.startswith('0'):
            mobile_number = country_code + mobile_number[1:]
    return mobile_number
```

---

## 💳 Upgrading from Trial

When ready for production:

1. **Add Payment Method:**
   - Twilio Console → Billing
   - Add credit card
   - Auto-recharge recommended

2. **Remove "Trial" Prefix:**
   - Automatically removed after upgrade
   - SMS will be clean without trial message

3. **Send to Any Number:**
   - No verification needed
   - Global SMS delivery

**Pricing:**
- Pakistan: ~$0.045 per SMS
- Most countries: $0.03-$0.10 per SMS
- Check: https://www.twilio.com/sms/pricing

---

## 🔐 Security Best Practices

### **For `.env` File:**
- ✅ Never commit to Git
- ✅ Add to `.gitignore`
- ✅ Use different credentials for dev/production
- ✅ Rotate tokens periodically

### **For Production:**
- ✅ Use environment variables
- ✅ Enable Twilio webhook authentication
- ✅ Monitor usage in Twilio Console
- ✅ Set up spending limits
- ✅ Enable fraud detection

---

## 📞 Twilio Support

**Free Resources:**
- Documentation: https://www.twilio.com/docs/sms
- API Reference: https://www.twilio.com/docs/sms/api
- Community: https://www.twilio.com/community
- Console: https://console.twilio.com

**Support Channels:**
- Help Center: https://support.twilio.com
- Email: help@twilio.com
- Phone: Available for paid accounts

---

## ✅ Quick Start Commands

```powershell
# Install Twilio
cd backend
.\venv310\Scripts\Activate.ps1
pip install twilio==8.10.0

# Update .env with your credentials
# Set ENABLE_SMS=True

# Restart backend
deactivate
.\start_backend.ps1

# Test SMS by registering a new user!
```

---

## 🎉 Current Status

- ✅ Twilio SDK installed
- ✅ SMS sending code integrated
- ✅ Automatic phone number formatting
- ✅ Fallback to console display
- ✅ Error handling
- ✅ Pakistan number support
- ✅ Development/Production modes

**Next Steps:**
1. Create Twilio account (free)
2. Get credentials
3. Update `.env` file
4. Set `ENABLE_SMS=True`
5. Verify your test phone number
6. Test SMS delivery!

---

**Ready to send real SMS!** 📱🚀
