// Definición del modelo de favourites
module.exports = function(sequelize, DataTypes) {
	return sequelize.define(
		'Favourites',
		{UserId:{
			type: DataTypes.INTEGER
		}});
}