import { DataTypes, Sequelize } from "sequelize";

const sequelize = new Sequelize(
    process.env.POSTGRES_DB as string,
    process.env.POSTGRES_USER as string,
    process.env.POSTGRES_PASSWORD as string,
    {
      host: process.env.POSTGRES_HOST,
      dialect: "postgres",
    }
  );
  
  export const SmsLog = sequelize.define("SmsLog", {
    ip_address: {
      type: DataTypes.STRING,
      allowNull: true, // Set to false if this field is required
    },
    phone_number: {
      type: DataTypes.STRING,
      allowNull: false, // Phone number is required
    },
    timestamp: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    status: {
      type: DataTypes.STRING,
      allowNull: true, // Set to false if this field is required
    },
    message: {
      type: DataTypes.TEXT,
      allowNull: true, // Set to false if this field is required
    },
  });

  export const createTables = async () => {
    try {
      await sequelize.authenticate(); // Check connection
      console.log("Connection has been established successfully.");
      await sequelize.sync(); // Create tables if they don't exist
      console.log('Tables "SmsLog" are ready');
    } catch (err) {
      console.error("Unable to connect to the database:", err);
    }
  };


  export const logSmsRequest = async (
    ip: string,
    phoneNumber: string,
    status: string,
    message: string
  ) => {
    await SmsLog.create({
      ip_address: ip,
      phone_number: phoneNumber,
      status,
      message,
    });
  };