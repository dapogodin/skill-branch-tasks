import express from 'express';
import fetch from 'node-fetch';
import mongoose from 'mongoose';
import Promise from 'bluebird';

let isDb3aInit = false;
const router = express.Router();
const pcUrl = 'https://gist.githubusercontent.com/isuvorov/ce6b8d87983611482aac89f6d7bc0037/raw/pc.json';
let db, pc;

function db_init() {
    if (isDb3aInit)
        return;
    console.log('db 3a init');
    isDb3aInit = true;

    mongoose.Promise = Promise;
    mongoose.connect('mongodb://localhost:27017/skill-branch-task3a');
    mongoose.connection.on('error', (err) => {
        console.error(`Database Connection Error: ${err}`);
    });
    mongoose.connection.on('connected', () => {
        console.info('Succesfully connected to MongoDB Database');
    });

    db = mongoose.connection.db;
    pc = db.collection('pc');

    fetch(pcUrl)
        .then(async(res) => {
            const pcdata = await res.json();
            pc.remove({}).then(() => {
                console.log('clear pc collection');
                pc.insert(pcdata).then(() => { console.log('add new pc'); });
            });
        })
        .catch((err) => {
            console.log('Что-то пошло не так:', err);
        });
}

router.get('/volumes', (req, res) => {
    db_init();

    pc.aggregate(
        [{ $unwind: '$hdd' }, { $group: { _id: '$hdd.volume', total: { $sum: '$hdd.size' } } }],
        (err, r) => {
            if (err) {
                console.error(err);
                res.sendStatus(404);
            }
            const result = {};
            for (const item of r) {
                result[item._id] = `${item.total.toString()}B`;
            }
            res.send(result);
        });
});

router.get('/*', (req, res) => {
    db_init();

    const path = req.params[0];
    console.log(path);

    const query = {};
    const opt = { _id: 0 };
    if (path) {
        query[path.replace(new RegExp('/', 'g'), '.').replace(new RegExp('\\.$'), '')] = { $exists: true };
        // opt[path.replace(new RegExp('/', 'g'), '.')] = 1;
    }
    pc.findOne(query, opt)
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

module.exports = router;