const mongoose = require('mongoose');
const Transport = require('winston-transport');
const os = require('os');
const { v4: uuidv4 } = require('uuid');

// Schema for logs in MongoDB (compatible with status-backend logger.js)
const logSchema = new mongoose.Schema(
  {
    timestamp: Date,
    level: String,
    message: String,
    service: String,
    environment: String,
    host: String,
    pid: Number,
    requestId: String,
    userId: String,
    ip: String,
    url: String,
    method: String,
    statusCode: Number,
    stack: String,
    functionName: String,
    lineNumber: Number,
    metadata: Object,
  },
  { timestamps: true }
);

// MongoDB transport class
class MongoTransport extends Transport {
  constructor(opts) {
    super(opts);
    this.name = 'mongodb';
    this.level = opts.level || 'info';
    this.serviceName = opts.serviceName || 'governify-service';
  }

  async log(info, callback) {
    try {
      if (MongoTransport.LogModel) {
        // Extract information from the message
        let tags = info.labels || [];
        let stack = '';
        let url = '';
        let statusCode = info.statusCode || null;
        let message = info.message || '';
        
        // If there are tags, use the last tag as stack (usually the component name)
        if (Array.isArray(tags) && tags.length > 0) {
          stack = tags[tags.length - 1];
        }
        
        // Extract URL from HTTP error messages
        if (typeof message === 'string' && message.includes('Failed when calling service from Governify:')) {
          const urlMatch = message.match(/https?:\/\/[^\s]+/);
          if (urlMatch) {
            url = urlMatch[0].trim();
            
            // Try to extract status code if present in the message
            const statusMatch = message.match(/status(?:Code)?[:\s]+(\d+)/i);
            if (statusMatch && statusMatch[1]) {
              statusCode = parseInt(statusMatch[1], 10);
            }
          }
        }
        
        // Convert governify format to status-backend format
        await MongoTransport.LogModel.create({
          timestamp: new Date(),
          level: info.level,
          message: message,
          service: this.serviceName,
          environment: process.env.NODE_ENV || 'development',
          host: os.hostname(),
          pid: process.pid,
          requestId: info.trace || uuidv4(),
          userId: 'anonymous',
          statusCode: statusCode,
          stack: stack,
          url: url,
          metadata: {
            tags: tags,
            originalFormat: info
          },
        });
      }
    } catch (error) {
      console.error('[MongoDB Logger] Error saving log:', error);
    }

    if (callback) {
      callback();
    }
  }
}

// Static variables for connection and model
MongoTransport.connection = null;
MongoTransport.LogModel = null;

// Initialize MongoDB connection for logs
MongoTransport.initialize = async (config, serviceName) => {
  if (!config.active) return false;

  try {
    // Close previous connection if exists
    if (MongoTransport.connection) {
      await MongoTransport.shutDown();
    }

    MongoTransport.connection = mongoose.createConnection(config.uri);
    MongoTransport.LogModel = MongoTransport.connection.model('Log', logSchema);

    console.info(`[MongoDB Logger] Initialized successfully for service ${serviceName}`);
    return true;
  } catch (error) {
    console.error('[MongoDB Logger] Failed to initialize:', error);
    return false;
  }
};

// Properly close the MongoDB connection
MongoTransport.shutDown = async () => {
  if (MongoTransport.connection) {
    try {
      await MongoTransport.connection.close();
      MongoTransport.connection = null;
      MongoTransport.LogModel = null;
      console.info('[MongoDB Logger] Connection closed successfully');
      return true;
    } catch (error) {
      console.error('[MongoDB Logger] Error closing connection:', error);
      return false;
    }
  }
  return true;
};

// Create a transport instance for winston
MongoTransport.createTransport = (serviceName) => {
  return new MongoTransport({
    level: 'debug',
    serviceName
  });
};

module.exports = MongoTransport;
