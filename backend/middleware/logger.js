const AppLog = require('../models/appLog');

const logAction = async (username, action, role, details) => {
  try {
    await AppLog.create({
      username,
      role,
      action,
      details
    });
  } catch (error) { 
    console.error('Failed to log action:', error);
  }
};

const loggerMiddleware = (req, res, next) => {
  const oldSend = res.send;
  res.send = function (data) {
    // Log the action
    const { username, role } = req.session; // Assuming username is stored in session
    const action = req.method + ' ' + req.originalUrl;
    logAction(username || 'Anonymous', role, action, data);
    oldSend.apply(res, arguments);
  };
  next();
};

module.exports = loggerMiddleware;
