'use strict';
import { DataTypes } from 'sequelize';
import sequelize from '../dbConnect';

const Games = sequelize.define('games', {
  id: {
    allowNull: false,
    autoIncrement: true,
    primaryKey: true,
    unique: true,
    type: DataTypes.INTEGER
  },
  gameId: {
    type: DataTypes.STRING,
    unique: true,
    allowNull: false,
  },
  image: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  description: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  duration: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  maxPlayers: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
}, {
  modelName: 'games',
  timestamps: true,
});

export default Games;
