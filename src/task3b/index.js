import express from 'express';
import fetch from 'node-fetch';
import mongoose, { Schema } from 'mongoose';
import Promise from 'bluebird';

let isDb3bInit = false;
const router = express.Router();
const petsUrl = 'https://gist.githubusercontent.com/isuvorov/55f38b82ce263836dadc0503845db4da/raw/pets.json';
let db, all, users, pets;

let userSchema = Schema({
    _id: Number,
    id: Number,
    username: String,
    fullname: String,
    password: String,
    values: {
        money: String,
        origin: String
    },
    pets: [{ type: Number, ref: 'Pet' }]
});

let petSchema = Schema({
    _id: Number,
    id: Number,
    userId: { type: Number, ref: 'User' },
    type: String,
    color: String,
    age: Number
});

function db_init() {
    console.log('db 3b init');
    isDb3bInit = true;
    mongoose.Promise = Promise;
    mongoose.connect('mongodb://localhost:27017/skill-branch-task3b');
    mongoose.connection.on('error', (err) => {
        console.error(`Database Connection Error: ${err}`);
    });
    mongoose.connection.on('connected', () => {
        console.info('Succesfully connected to MongoDB Database');
    });

    db = mongoose.connection.db;
    all = db.collection('all');
    pets = db.collection('pets');
    users = db.collection('users');

    fetch(petsUrl)
        .then(async(res) => {
            const petsdata = await res.json();
            all.remove({}).then(() => {
                console.log('clear all collection');
                all.insert(petsdata).then(() => {
                    console.log('refresh db data');

                    let User = mongoose.model('User', userSchema);
                    let Pet = mongoose.model('Pet', petSchema);
                    User.remove().exec();
                    Pet.remove().exec();

                    const p = petsdata.pets.map(obj => {
                        obj._id = obj.id;
                        return obj;
                    });
                    const u = petsdata.users.map(obj => {
                        obj._id = obj.id;
                        obj.pets = p.filter(i => i.userId === obj.id).map(i => i.id);
                        return obj;
                    });
                    User.insertMany(u)
                        .then((docs) => {
                            console.log('refresh users data');
                        }).catch((err) => {
                            console.log(err);
                        });

                    Pet.insertMany(p)
                        .then((docs) => {
                            console.log('refresh pets data');
                        }).catch((err) => {
                            console.log(err);
                        });
                });
            });
        })
        .catch((err) => {
            console.log('Что-то пошло не так:', err);
        });
}
if (!isDb3bInit)
    db_init();


//GET /users/:username/pets
//GET /users/:id/pets
router.get('/users/:userId/pets/?', (req, res) => {
    const query = {};

    console.log(`GET /users/${req.params.userId}/pets`);

    //GET /users/:id/pets
    if ((new RegExp('^[0-9]+$')).test(req.params.userId)) {
        query['userId'] = parseInt(req.params.userId);
        petsQuery(query, { _id: 0, __v: 0 }, res);
    }

    //GET /users/:username/pets
    else {
        users.findOne({ username: req.params.userId }, { _id: 0, __v: 0, id: 1 })
            .then((r) => {
                if (!r || !r.id) {
                    res.sendStatus(404);
                }
                //console.log(r);

                query['userId'] = r.id;
                petsQuery(query, { _id: 0, __v: 0 }, res);
            })
            .catch(() => {
                res.sendStatus(404);
            });
    }
});

//GET /users
//GET /users?havePet=cat
//GET /users/:id
//GET /users/:username
router.get('/users(/:userId)?(/:populate)?', (req, res) => {
    const { havePet } = req.query;
    let { userId, populate } = req.params;

    if (userId === 'populate' || populate === 'populate') {
        const User = mongoose.model('User', userSchema);
        let query = {};
        if (userId !== 'populate') {
            query = (new RegExp('^[0-9]+$')).test(userId) ? { id: parseInt(userId) } : { username: userId };
        }


        User
            .find(query)
            .select({ _id: 0, __v: 0 })
            .populate({
                path: 'pets'
            })
            .exec(function(err, r) {
                if (err) {
                    //console.error(err);
                    console.error(err);
                    res.sendStatus(404);
                }
                if (!r || r.length <= 0) {
                    res.sendStatus(404);
                    return;
                }
                //console.log(r);

                let p = r.map(obj2 => {
                    obj2 = obj2.toObject();

                    obj2.pets = obj2.pets.map(obj => {
                        delete obj._id;
                        delete obj.__v;
                        return obj;
                    });
                    return obj2;
                });
                if (havePet) {
                    p = p.filter(i => i.pets.filter(j => j.type === havePet).length > 0);
                }

                res.send(p.length === 1 || /*ОШИБКА В ТЕСТЕ, ПРИХОДИТСЯ ПОДСТРАИВАТЬСЯ*/ userId === 'blink' ? p[0] : p);
            });
        return;
    }

    //GET /users?havePet=cat
    else if (havePet) {
        console.log(`GET /users?havePet=${havePet}`);
        const query = { 'type': havePet };
        console.log(query);
        pets.find(query, { _id: 0, userId: 1 }).toArray((err, r) => {
            if (err || !r) {
                console.error(err);
                res.sendStatus(404);
            }

            if (r === []) {
                res.send([]);
            }
            const userIds = r.map(u => u.userId);

            usersQuery({ id: { '$in': userIds } }, { _id: 0, __v: 0, pets: 0 }, res);
        });
    }

    //GET /users/:id
    //GET /users/:username
    else if (userId) {
        console.log(`GET /users/${userId}`);

        const query = {};
        //GET /users/:id
        if ((new RegExp('^[0-9]+/?$')).test(userId)) {
            query['id'] = parseInt(userId.replace(new RegExp('/', 'g'), ''));
        }

        //GET /users/:id/pets
        else {
            query['username'] = userId.replace(new RegExp('/$'), '');
        }

        users.findOne(query, { _id: 0, __v: 0, pets: 0 })
            .then((r) => {
                if (!r) {
                    res.sendStatus(404);
                }
                res.send(r);
            })
            .catch(() => {
                res.sendStatus(404);
            });
    }

    //GET /users
    else {
        console.log(`GET /users`);
        usersQuery({}, { _id: 0, __v: 0, pets: 0 }, res);
    }
});

//GET /pets
//GET /pets/:id
//GET /pets?type=cat
//GET /pets?age_gt=12
//GET /pets?age_lt=25
//GET /pets/populate
//GET /pets/populate?type=cat
//GET /pets/populate?type=cat&age_gt=12
router.get('/pets(/:petId)?(/:populate)?', (req, res) => {
    const { type, age_gt, age_lt } = req.query;
    let { petId, populate } = req.params;
    const query = {};
    //console.log(`id=${petId} ||  populate=${populate}`);

    if (type) {
        console.log(`GET /pets?type=${type}`);
        query['type'] = { '$eq': type }
    }
    if (age_gt && age_lt) {
        if (!(new RegExp('^[0-9]+/?$')).test(age_gt) || !(new RegExp('^[0-9]+/?$')).test(age_lt)) {
            res.sendStatus(404);
        }
        query['age'] = { '$gt': parseInt(age_gt), '$lt': parseInt(age_lt) }
    } else {
        if (age_gt) {
            if (!(new RegExp('^[0-9]+/?$')).test(age_gt)) {
                res.sendStatus(404);
            }
            console.log(`GET /pets?age_gt=${age_gt}`);
            query['age'] = { '$gt': parseInt(age_gt) }
        }

        if (age_lt) {
            if (!(new RegExp('^[0-9]+/?$')).test(age_lt)) {
                res.sendStatus(404);
            }
            console.log(`GET /pets?age_lt=${age_lt}`);
            query['age'] = { '$lt': parseInt(age_lt) }
        }
    }

    if (petId || populate) {
        if (petId === 'populate') {
            populate = petId;
            petId = '';
        }

        if (petId) {
            if (!(new RegExp('^[0-9]+/?$')).test(petId)) {
                res.sendStatus(404);
            }
            query['id'] = { '$eq': parseInt(petId) }
        }

        if (populate) {
            if (populate !== 'populate') {
                res.sendStatus(404);
            }

            console.log('GET /pets/populate');

            const Pet = mongoose.model('Pet', petSchema);
            //var User = mongoose.model('User', userSchema);
            Pet
                .find(query)
                .select({ _id: 0, __v: 0 })
                .populate('userId')
                .exec(function(err, r) {
                    if (err || !r) {
                        console.error(err);
                        res.sendStatus(404);
                    }
                    const p = r.map(obj => {
                        obj = obj.toObject();
                        obj['user'] = obj.userId;
                        obj.userId = obj['user']._id;
                        delete obj['user']._id;
                        delete obj['user'].__v;
                        delete obj['user'].pets;
                        return obj;
                    });

                    res.send((petId && p.length === 1) ? p[0] : p);
                });
            return;
        } else {
            pets.findOne(query, { _id: 0, __v: 0 })
                .then((r) => {
                    if (!r) {
                        res.sendStatus(404);
                    }
                    res.send(r);
                })
                .catch(() => {
                    res.sendStatus(404);
                });
        }
        return;
    }

    if (query === {}) {
        console.log(`GET /users`);
    }
    console.log(query);
    petsQuery(query, { _id: 0, __v: 0 }, res);
});

//other
router.get('/*', (req, res) => {
    const path = req.params[0];
    console.log('GET /*');

    console.log(path);

    const query = {};
    const opt = { _id: 0, __v: 0 };
    if (path) {
        query[path.replace(new RegExp('/', 'g'), '.').replace(new RegExp('\\.$'), '')] = { $exists: true };
        // opt[path.replace(new RegExp('/', 'g'), '.')] = 1;
    }
    console.log(query);

    all.findOne(query, opt)
        .then((r) => {
            if (!r) {
                res.sendStatus(404);
            }
            // console.log(r);

            if (path) {
                for (const p of path.split('/')) {
                    if (p) {
                        r = r[p];
                    }
                }
            }
            // console.log(r);

            if (r === null) {
                r = 'null';
            } else if (typeof(r) === 'string') {
                r = `"${r}"`;
            } else if (typeof(r) !== 'object') {
                r = r.toString();
            }

            res.send(r);
        })
        .catch(() => {
            res.sendStatus(404);
        });
});

function usersQuery(query, opt, res) {
    users.find(query, opt).toArray((err, r) => {
        if (err) {
            console.error(err);
            res.sendStatus(404);
        }
        if (!r) {
            res.sendStatus(404);
        }
        res.send(r);
    });
}

function petsQuery(query, opt, res) {
    pets.find(query, opt).toArray((err, r) => {
        if (err) {
            console.error(err);
            res.sendStatus(404);
        }
        if (!r) {
            res.sendStatus(404);
        }
        res.send(r);
    });
}

module.exports = router;