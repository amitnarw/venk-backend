'use strict';
import { DataTypes } from 'sequelize';
import sequelize from '../dbConnect';

const PaymentMethods = sequelize.define('payment-methods', {
  id: {
    allowNull: false,
    autoIncrement: true,
    primaryKey: true,
    type: DataTypes.INTEGER
  },
  userId: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  method: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  details: {
    type: DataTypes.JSON,
    allowNull: false,
  },
  default: {
    type: DataTypes.BOOLEAN,
    allowNull: true,
  },
}, {
  modelName: 'payment-methods',
  timestamps: true,
});

export default PaymentMethods;
