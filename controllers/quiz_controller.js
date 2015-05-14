var models = require('../models/models.js');
// Autoload - factoriza del código si ruta incluye :quizId
exports.load = function(req, res, next, quizId) {
  models.Quiz.find(quizId).then(
    function(quiz){
      if (quiz) {
        req.quiz = quiz;
        next();
      } else{ next (new Error('No existe quizId=' + quizId));}
    }
  ).catch(function(error) {next(error);});
};
// GET /quizes
exports.index = function(req, res) {
  var busca = req.query.search || '';
  var cambia = "%" + busca.replace(/ +/g, "%") + "%";
  models.Quiz.findAll({where: ["pregunta like ?", cambia]}).then(function(quizes, busca) {
    //Ordena alfabéticamente las preguntas antes de ser mostradas
    function compare(a, b){
      if (a.pregunta < b.pregunta) return -1;
      if (a.pregunta > b.pregunta) return 1;
      return 0;
    }
    quizes.sort(compare);
    res.render('quizes/index.ejs', { quizes: quizes, busca: busca});
  }).catch(function(error) { next(error);});
};
// GET /quizes/:id
exports.show = function(req, res) {
  res.render('quizes/show', { quiz: req.quiz});
};
// GET /quizes/:id/answer
exports.answer = function(req, res) {
  var resultado = 'Incorrecto';
  if (req.query.respuesta === req.quiz.respuesta) {
    resultado = 'Correcto';
  }
  res.render('quizes/answer', {quiz: req.quiz, respuesta: resultado});
};
// GET /quizes/new
exports.new = function(req, res) {
  var quiz = models.Quiz.build(   // crea objeto quiz
    {pregunta: "Pregunta", respuesta: "Respuesta"}
    );
  res.render('quizes/new', {quiz: quiz});
};
// POST /quizes/create
exports.create = function(req, res) {
  var quiz = models.Quiz.build( req.body.quiz );

// guarda en DB los campos pregunta y respuesta de quiz
  quiz.save({fields: ["pregunta", "respuesta"]}).then(function(){
    res.redirect('/quizes');  
  })   // res.redirect: Redirección HTTP a lista de preguntas
};