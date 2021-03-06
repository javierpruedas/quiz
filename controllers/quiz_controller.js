var models = require('../models/models.js');
var sequelize = require('sequelize');

// MW que permite acciones solamente si el quiz objeto pertenece al usuario logeado o si es cuenta admin
exports.ownershipRequired = function(req, res, next) {
  var objQuizOwner = req.quiz.UserId;
  var logUser = req.session.user.id;
  var isAdmin = req.session.user.isAdmin;

  if (isAdmin || objQuizOwner === logUser) {
    next();
  } else {
    res.redirect('/');
  }
};

// Autoload - factoriza del código si ruta incluye :quizId
exports.load = function(req, res, next, quizId) {
  models.Quiz.find({
    where: { id: Number(quizId)},
    include: [{model: models.Comment }]
  }).then(
    function(quiz){
      if (quiz) {
        req.quiz = quiz;
        next();
      } else{ next (new Error('No existe quizId=' + quizId));}
    }
  ).catch(function(error) {next(error);});
};
// GET /quizes
exports.index = function(req, res, next) {
  var options = {};
  var busca = req.query.search || '';
  var cambia = "%" + busca.replace(/ +/g, "%") + "%";
  if(req.user){
    options.where = {UserId: req.user.id}
  }
  models.Quiz.findAll({where: sequelize.and(["pregunta like ?", cambia], options.where), include: [{model: models.User, as: 'Favs'}]}).then(function(quizes, busca) {
    //Ordena alfabéticamente las preguntas antes de ser mostradas
    function compare(a, b){
      if (a.pregunta < b.pregunta) return -1;
      if (a.pregunta > b.pregunta) return 1;
      return 0;
    }
    quizes.sort(compare);
    if ( req.session.user){
      quizes.forEach(function(quiz){
        quiz.fav = quiz.Favs.some(function(user){
          return (user.id === req.session.user.id);
        });
      });
    }
    res.render('quizes/index.ejs', { quizes: quizes, busca: busca, errors: []});
  }).catch(function(error) { next(error);});
};
// GET /quizes/:id
exports.show = function(req, res, next) {
  if(req.session.user){
    req.quiz.getFavs().then(function(users){
      req.quiz.fav = users.some(function(user){
        return (user.id === req.session.user.id);
      });
      res.render('quizes/show',{quiz: req.quiz, errors: []});
    }).catch(function(error){next(error)});
  } else {
    res.render('quizes/show', { quiz: req.quiz,errors: []});
  }
};
// GET /quizes/:id/answer
exports.answer = function(req, res) {
  var resultado = 'Incorrecto';
  if (req.query.respuesta === req.quiz.respuesta) {
    resultado = 'Correcto';
  }
  res.render('quizes/answer', {quiz: req.quiz, respuesta: resultado,errors: []});
};
// GET /quizes/new
exports.new = function(req, res) {
  var quiz = models.Quiz.build(   // crea objeto quiz
    {pregunta: "Pregunta", respuesta: "Respuesta"}
    );
  res.render('quizes/new', {quiz: quiz,errors: []});
};
// POST /quizes/create
exports.create = function(req, res) {
  req.body.quiz.UserId = req.session.user.id;
  if(req.files.image) {
    req.body.quiz.image = req.files.image.name;
  }
  var quiz = models.Quiz.build( req.body.quiz );

  quiz
  .validate()
  .then(
    function(err){
      if (err) {
        res.render('quizes/new', {quiz: quiz, errors: err.errors});
      } else {
        quiz // save: guarda en DB campos pregunta y respuesta de quiz, usuario e imagen
        .save({fields: ["pregunta", "respuesta", "UserId", "image"]})
        .then( function(){ res.redirect('/quizes')}) 
      }      // res.redirect: Redirección HTTP a lista de preguntas
    }
  ).catch(function(error){next(error)});
};
// GET /quizes/:id/edit
exports.edit = function(req, res) {
  var quiz = req.quiz;  // autoload de instancia de quiz

  res.render('quizes/edit', {quiz: quiz, errors: []});
};
// PUT /quizes/:id
exports.update = function(req, res) {
  if(req.files.image) {
    req.quiz.image = req.files.image.name;
  }
  req.quiz.pregunta = req.body.quiz.pregunta;
  req.quiz.respuesta = req.body.quiz.respuesta;

  req.quiz
  .validate()
  .then(
    function(err){
      if (err) {
        res.render('quizes/edit', {quiz: req.quiz, errors: err.errors});
      } else {
        req.quiz      //save: guarda campos pregunta y respuesta en DB
        .save({fields:["pregunta", "respuesta", "image"]})
        .then( function(){res.redirect('/quizes');});
      }       // Redirección HTTP a lista de preguntas (URL relativo)
    }
  );
};
// DELETE /quizes/:id
exports.destroy = function(req, res){
  req.quiz.destroy().then( function() {
    res.redirect('/quizes');
  }).catch(function(error){next(error)});
};