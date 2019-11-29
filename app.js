var express = require('express');
var bodyParser = require('body-parser'); // Charge le middleware de gestion des paramètres
var urlencodedParser = bodyParser.urlencoded({ extended: false });

var app = express();
var server = require('http').createServer(app);
//todolists
var dblist= new Array();


/* On utilise les sessions 
app.use(session({secret: 'todotopsecret'}))*/
app.use('/js', express.static(__dirname+'/js'));

var io = require('socket.io')(server, {origins: "*:*"});


/* On affiche la todolist et le formulaire */
app.get('/todo', function(req, res) { 
    res.render('todo.ejs', {todolist: dblist});
})

io.sockets.on('connection', function(socket){
    /* On ajoute un élément à la todolist */
    socket.on('add-todolist', function(data){
        dblist.push(data.todo)
        socket.emit('lastindex', { lastindex: dblist.indexOf(data.todo), todo: data.todo })
        socket.broadcast.emit('newtodo', { todo:  data.todo, todoindex: dblist.indexOf(data.todo) })
        console.log(data)
    })
    /* Supprime un élément de la todolist */
    socket.on('del-todolist', (data)=>{
        dblist.splice(data.index, 1)
        socket.broadcast.emit('deltodo', { todoindex: data.index })
    })

})


/* On redirige vers la todolist si la page demandée n'est pas trouvée */
app.use(function(req, res, next){
    res.redirect('/todo');
})


server.listen(8080);   