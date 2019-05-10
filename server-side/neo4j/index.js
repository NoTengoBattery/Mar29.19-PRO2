var express = require('express');
var app = express();
var port = 10000;
const router = express.Router();

app.use('/api/v1', router);
app.listen(port);

console.log('Listening on port ' + port);

router.get('/', function(req, res) {
    res.json({ message: 'API is Online!' });
});

router.use(function(req, res, next) {
   console.log('Weve got something.');
   next() //calls next middleware in the application.
});

router.route('/numbers/:number').get((req, res) => {
     res.json({result: req.params.number + 1})
});

router.route('/letters/:letter').get((req, res) => {
     res.json({result: req.params.letter.toUpperCase()})
});
