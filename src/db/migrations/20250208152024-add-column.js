'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    /**
     * Add altering commands here.
     *
     * Example:
     * await queryInterface.createTable('users', { id: Sequelize.INTEGER });
     */
    await queryInterface.addColumn('games', 'bets', {
      type: Sequelize.ARRAY(Sequelize.INTEGER),
      allowNull: true,
      defaultValue: [0],
    });
    await queryInterface.addColumn('rooms', 'bet', {
      type: Sequelize.INTEGER,
      allowNull: false,
      defaultValue: [0],
    });
    await queryInterface.addColumn('rooms', 'winAmount', {
      type: Sequelize.INTEGER,
      allowNull: false,
      defaultValue: [0],
    });
  },

  async down (queryInterface, Sequelize) {
    /**
     * Add reverting commands here.
     *
     * Example:
     * await queryInterface.dropTable('users');
     */
  }
};
