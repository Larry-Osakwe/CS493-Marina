const express = require('express');
const app = express();

const {Datastore} = require('@google-cloud/datastore');
const bodyParser = require('body-parser');

const datastore = new Datastore();

const BOAT = "Boat";
const SLIP = "Slip";

//const router = express.Router();
app.use(bodyParser.json());
//app.use(bodyParser.json());

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

function patch_boat(id, name, type, length){
    const key = datastore.key([BOAT, parseInt(id,10)]);
    const boat = {"name": name, "type": type, "length": length};
    return datastore.save({"key":key, "data":boat});
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

/* ------------- Begin Boat Controller Functions ------------- */

app.get('/boats', function(req, res){
    const boats = get_boats()
	.then( (boats) => {
        res.status(200).json(boats);
    });
});

app.get('/boats/:id', function(req, res) {
    const boat = get_boat(req.params.id)
    .then( (boat) => {
        res.status(200).json(boat);
    });
});

app.post('/boats', function(req, res){
    post_boat(req.body.name, req.body.type, req.body.length)
    .then( key => {res.status(201).send('{ "id": ' + key.id + ', "name": ' + req.body.name + ', "type": ' + req.body.type + ', "length": ' + req.body.length + ' }')} );
});

app.patch('/boats/:id', function(req, res){
    patch_boat(req.params.id, req.body.name, req.body.type, req.body.length)
    .then(res.status(200).end());
});

app.put('/boats/:id', function(req, res){
    put_boat(req.params.id, req.body.name, req.body.type, req.body.length)
    .then(res.status(200).end());
});

app.delete('/boats/:id', function(req, res){
    delete_boat(req.params.id).then(res.status(200).end())
});

/* ------------- End Boat Controller Functions ------------- */

//app.use('/boats', router);

/* ------------- Begin Slip Model Functions ------------- */
function post_slip(number){
    var key = datastore.key(SLIP);
	const new_slip = {"number": number, "current_boat": null};
	return datastore.save({"key":key, "data":new_slip}).then(() => {return key});
}

function get_slips(){
	const q = datastore.createQuery(SLIP);
	return datastore.runQuery(q).then( (entities) => {
			return entities[0].map(fromDatastore);
		});
}

function get_slip(id){
    const key = datastore.key([SLIP, parseInt(id,10)]);
    return datastore.get(key);
}

function patch_slip(id, name, type, length){
    const key = datastore.key([SLIP, parseInt(id,10)]);
    const slip = {"name": name, "type": type, "length": length};
    return datastore.save({"key":key, "data":slip});
}

function put_slip(id, boat_id, number){
    const key = datastore.key([SLIP, parseInt(id,10)]);
    // const slip = {"id": id, "current_boat": boat_id};
    const slip = {"id": id, "number": number, "current_boat": boat_id};
    return datastore.upsert({"key":key, "data":slip});
}

function delete_slip(id){
    const key = datastore.key([SLIP, parseInt(id,10)]);
    return datastore.delete(key);
}

/* ------------- End Slip Functions ------------- */

/* ------------- Begin Slip Controller Functions ------------- */

app.get('/slips', function(req, res){
    const slips = get_slips()
	.then( (slips) => {
        res.status(200).json(slips);
    });
});

app.get('/slips/:id', function(req, res) {
    const slip = get_slip(req.params.id)
    .then( (slip) => {
        res.status(200).json(slip);
    });
});

app.post('/slips', function(req, res){
    post_slip(req.body.number)
    .then( key => {res.status(201).send('{ "id": ' + key.id + ', "number": ' + req.body.number + ', "current_boat": null }')} );
});

app.patch('/slips/:id', function(req, res){
    patch_slip(req.params.id, req.body.name, req.body.type, req.body.length)
    .then(res.status(200).end());
});

// app.put('/slips/:id', function(req, res){
//     put_slip(req.params.id, req.body.name, req.body.type, req.body.length)
//     .then(res.status(200).end());
// });

app.put('/slips/:slip_id/:boat_id', function(req, res){
    put_slip(req.params.slip_id, req.params.boat_id, req.body.number)
    .then(res.status(200).end());
});

app.delete('/slips/:id', function(req, res){
    delete_slip(req.params.id).then(res.status(200).end())
});

/* ------------- End Slip Controller Functions ------------- */

//app.use('/slips', router);

// Listen to the App Engine-specified port, or 8080 otherwise
const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}...`);
});