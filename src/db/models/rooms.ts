'use strict';
import { DataTypes } from 'sequelize';
import sequelize from '../dbConnect';

const Rooms = sequelize.define('rooms', {
  id: {
    allowNull: false,
    autoIncrement: true,
    unique: true,
    type: DataTypes.INTEGER
  },
  gameId: {
    type: DataTypes.STRING,
    primaryKey: true,
    allowNull: false,
  },
  roomId: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true
  },
  userIds: {
    type: DataTypes.ARRAY(DataTypes.STRING),
    allowNull: false,
  },
  scores: {
    type: DataTypes.ARRAY(DataTypes.INTEGER),
    allowNull: false,
  },
  joinedAt: {
    type: DataTypes.ARRAY(DataTypes.DATE),
    allowNull: false,
  },
  disconnectedAt: {
    type: DataTypes.ARRAY(DataTypes.DATE),
    allowNull: false,
  },
  status: {
    type: DataTypes.ENUM("active", "finished"),
    allowNull: false,
  },
  startTime: {
    type: DataTypes.DATE,
    allowNull: false,
  },
  endTime: {
    type: DataTypes.DATE,
    allowNull: true,
  },
  aiPlay: {
    type: DataTypes.BOOLEAN,
    allowNull: true,
  },
  winnerUserId: {
    type: DataTypes.STRING,
    allowNull: true,
  },
}, {
  modelName: 'rooms',
  timestamps: true,
});

export default Rooms;
