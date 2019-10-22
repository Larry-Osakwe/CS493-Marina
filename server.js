const express = require('express');
const app = express();

const {Datastore} = require('@google-cloud/datastore');
const bodyParser = require('body-parser');

const datastore = new Datastore();

const BOAT = "Boat";

const router = express.Router();

app.use(bodyParser.json());

function fromDatastore(item){
    item.id = item[Datastore.KEY].id;
    return item;
}

/* ------------- Begin Boat Model Functions ------------- */
function post_boat(name, type, length){
    var key = datastore.key(BOAT);
	const new_boat = {"name": name, "type": type, "length": length};
	return datastore.save({"key":key, "data":new_boat}).then(() => {return key});
}

function get_boats(){
	const q = datastore.createQuery(BOAT);
	return datastore.runQuery(q).then( (entities) => {
			return entities[0].map(fromDatastore);
		});
}

function get_boat(id){
    const key = datastore.key([BOAT, parseInt(id,10)]);
    return datastore.get(key);
}


function put_boat(id, name, description, price){
    const key = datastore.key([BOAT, parseInt(id,10)]);
    const boat = {"name": name, "description": description, "price": price};
    return datastore.save({"key":key, "data":boat});
}

function delete_boat(id){
    const key = datastore.key([BOAT, parseInt(id,10)]);
    return datastore.delete(key);
}

/* ------------- End Model Functions ------------- */

/* ------------- Begin Controller Functions ------------- */

router.get('/', function(req, res){
    const boats = get_boats()
	.then( (boats) => {
        res.status(200).json(boats);
    });
});

router.get('/:id', function(req, res) {
    const boat = get_boat(req.params.id)
    .then( (boat) => {
        res.status(200).json(boat);
    });
});

router.post('/', function(req, res){
    post_boat(req.body.name, req.body.type, req.body.length)
    .then( key => {res.status(201).send('{ "id": ' + key.id + ', "name": ' + req.body.name + ', "type": ' + req.body.type + ', "length": ' + req.body.length + ' }')} );
});

router.put('/:id', function(req, res){
    put_boat(req.params.id, req.body.name, req.body.type, req.body.length)
    .then(res.status(200).end());
});

router.delete('/:id', function(req, res){
    delete_boat(req.params.id).then(res.status(200).end())
});

/* ------------- End Controller Functions ------------- */

app.use('/boats', router);

// Listen to the App Engine-specified port, or 8080 otherwise
const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}...`);
});