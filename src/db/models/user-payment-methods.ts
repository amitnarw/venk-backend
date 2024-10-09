'use strict';
import { DataTypes } from 'sequelize';
import sequelize from '../dbConnect';

const UserPaymentMethods = sequelize.define('user-payment-methods', {
  id: {
    allowNull: false,
    autoIncrement: true,
    primaryKey: true,
    type: DataTypes.INTEGER
  },
  userId: {
    type: DataTypes.NUMBER,
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
  modelName: 'user-payment-methods',
  timestamps: true,
});

export default UserPaymentMethods;
