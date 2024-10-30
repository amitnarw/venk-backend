'use strict';
import { DataTypes } from 'sequelize';
import sequelize from '../dbConnect';

const GamesHistory = sequelize.define('games-history', {
  id: {
    allowNull: false,
    autoIncrement: true,
    primaryKey: true,
    type: DataTypes.INTEGER
  },
  gameId: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  userIds: {
    type: DataTypes.ARRAY(DataTypes.STRING),
    allowNull: false,
  },
  finalScores: {
    type: DataTypes.ARRAY(DataTypes.STRING),
    allowNull: false,
  },
  startTime: {
    allowNull: false,
    type: DataTypes.DATE
  },
  endTime: {
    allowNull: false,
    type: DataTypes.DATE
  },
}, {
  modelName: 'games-history',
  timestamps: true,
});

export default GamesHistory;
