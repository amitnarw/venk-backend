'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('games-history', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        unique: true,
        type: Sequelize.INTEGER
      },
      gameId: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      userIds: {
        type: Sequelize.ARRAY(Sequelize.STRING),
        allowNull: false,
      },
      finalScores: {
        type: Sequelize.ARRAY(Sequelize.STRING),
        allowNull: false,
      },
      startTime: {
        allowNull: false,
        type: Sequelize.DATE
      },
      endTime: {
        allowNull: false,
        type: Sequelize.DATE
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE
      }
    });
  },
  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('games-history');
  }
};