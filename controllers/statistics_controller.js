var models = require('../models/models.js');


exports.show = function(req, res) {
models.Quiz.count().then(function(numPreg){
    models.Comment.count().then(function(numCom){
        models.Quiz.findAll({ include: [{ model: models.Comment }] }).then(function(quizes){
            var preguntasConComentarios=0;
            for(preg in quizes){
                if(quizes[preg].Comments.length) preguntasConComentarios++;
            }
            
            res.render('quizes/statistics', {
                numPreg: numPreg,
                numCom: numCom,
                media: numCom/numPreg,
                preguntasConComentarios: preguntasConComentarios,
                preguntasSinComentarios: numPreg - preguntasConComentarios,
                errors: []});
        })
    })
});
}