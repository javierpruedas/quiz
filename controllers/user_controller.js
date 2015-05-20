var models = require('../models/models.js');

// MW que permite acciones solamente si el quiz objeto pertenece al usuario logeado o si es cuenta admin
exports.ownershipRequired = function(req, res, next) {
  var objUser = req.user.id;
  var logUser = req.session.user.id;
  var isAdmin = req.session.user.isAdmin;

  if (isAdmin || objUser === logUser) {
    next();
  } else {
    res.redirect('/');
  }
};

//Autoload :userId
exports.load = function(req, res, next, userId) {
	models.User.find({where: {id: Number(userId)}})
		.then(function(user){
			if(user){
				req.user = user;
				next();
			} else {next(new Error('No existe userId = ' + userId))}
		}
	).catch(function(error){next(error)});
};

// COmprueba si el usuario esta registrado en users
// Si autenticación falla o hay errores se ejecuta callback(error)
exports.autenticar = function(login, password, callback) {
	models.User.find({
		where: {
			username: login
		}
	}).then(function(user){
		if(user){
			if(user.verifyPassword(password)){
				callback(null, user);
			}
			else {callback(new Error('Contraseña errónea.')); }
		} else {callback(new Error('No existe usuario = ' + login))}
	}).catch(function(error){callback(error)});
};

// GET /user/:id/edit
exports.edit = function(req, res) {
	res.render ('user/edit', {user: req.user, errors: []});
};

// GET /user
exports.new = function (req, res) {
	var user = models.User.build({username: "", password: ""});

	res.render('user/new', {user: user, errors: []});
};

// POST /user
exports.create = function(req, res) {
	var user = models.User.build(req.body.user);

	user
	.validate()
	.then(
		function(err){
			if(err){
				res.render('user/new', {user: user, errors: err.errors});
			} else {
				user
				.save({fields: ["username", "password"]})
				.then(function(){
					req.session.user = {id:user.id, username: user.username};
					res.redirect('/');
				});
			}
		}).catch(function(error){next(error)});
};

// PUT /user/:id
exports.update = function(req, res, next) {
	req.user.username = req.body.user.username;
	req.user.password = req.body.user.password;

	req.user
	.validate()
	.then(
		function(err){
			if(err){
				res.render('user/' + req.user.id, {user: req.user, errors:err.errors});
			} else {
				req.user
				.save({fields: ["username", "password"]})
				.then(function(){res.redirect('/');});
			}
		}
	).catch(function(error){next(error)});
};

// DELETE /user/:id
exports.destroy = function(req, res) {
	req.user.destroy().then(function(){
		delete req.session.user;
		res.redirect('/');
	}).catch(function(error){next(error)});
};