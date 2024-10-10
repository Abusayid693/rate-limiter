"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.logSmsRequest = exports.createTables = exports.SmsLog = void 0;
const sequelize_1 = require("sequelize");
const sequelize = new sequelize_1.Sequelize(process.env.POSTGRES_DB, process.env.POSTGRES_USER, process.env.POSTGRES_PASSWORD, {
    host: process.env.POSTGRES_HOST,
    dialect: "postgres",
});
exports.SmsLog = sequelize.define("SmsLog", {
    ip_address: {
        type: sequelize_1.DataTypes.STRING,
        allowNull: true, // Set to false if this field is required
    },
    phone_number: {
        type: sequelize_1.DataTypes.STRING,
        allowNull: false, // Phone number is required
    },
    timestamp: {
        type: sequelize_1.DataTypes.DATE,
        allowNull: true,
    },
    status: {
        type: sequelize_1.DataTypes.STRING,
        allowNull: true, // Set to false if this field is required
    },
    message: {
        type: sequelize_1.DataTypes.TEXT,
        allowNull: true, // Set to false if this field is required
    },
});
const createTables = async () => {
    try {
        await sequelize.authenticate(); // Check connection
        console.log("Connection has been established successfully.");
        await sequelize.sync(); // Create tables if they don't exist
        console.log('Tables "SmsLog" are ready');
    }
    catch (err) {
        console.error("Unable to connect to the database:", err);
    }
};
exports.createTables = createTables;
const logSmsRequest = async (ip, phoneNumber, status, message) => {
    await exports.SmsLog.create({
        ip_address: ip,
        phone_number: phoneNumber,
        status,
        message,
    });
};
exports.logSmsRequest = logSmsRequest;
