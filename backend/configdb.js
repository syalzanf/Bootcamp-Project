const { Sequelize } = require('sequelize');

const sequelize = new Sequelize('my_project', 'postgres', '123', {
    host: 'localhost',
    dialect: 'postgres'
});

module.exports = sequelize;
