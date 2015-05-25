var models = require('../models/models.js');

// GET /user/:userId/favourites
exports.index = function(req, res, next){
  req.user.getFavs().then(function(quizes){
    quizes.forEach(function(quiz){
      quiz.fav = true;
    });
    req.session.redir = "/user/"+req.user.id+"/favourites";
    res.render('quizes/favourites', {quizes: quizes, errors: []});
  }).catch(function(error){next(error)});
};

// PUT /user/:userId/favourites/:quizId
exports.update = function(req, res){
  req.user.addFavs(req.quiz).then(function(){
        res.redirect(req.session.redir.toString());
  });
};

// DELETE /user/:userId/favourites/:quizId
exports.destroy = function(req, res, next){
  req.user.removeFavs(req.quiz).then(function(){
    res.redirect(req.session.redir.toString());
  });
};