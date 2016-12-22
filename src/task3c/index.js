import express from 'express';
import fetch from 'node-fetch';
import Promise from 'bluebird';
import _ from 'lodash';
import mongoose, { Schema } from 'mongoose';

const router = express.Router();
const pokemonApiUrl = 'https://pokeapi.co/api/v2/';
let isAll = false;

let pokemonSchema = Schema({
    name: String,
    url: String,
    weight: Number,
    height: Number
});

fetch.Promise = Promise;

mongoose.Promise = Promise;
mongoose.connect('mongodb://localhost:27017/skill-branch-task3c');
mongoose.connection.on('error', (err) => {
    console.error(`Database Connection Error: ${err}`);
});
mongoose.connection.on('connected', () => {
    console.info('Succesfully connected to MongoDB Database');
});

const Pokemon = mongoose.model('pokemon', pokemonSchema);

//Все покемоны
let pokemonsWithoutInfo = [];
let pokemons = [];
GetAllPokemons();

function GetAllPokemons(limit = 1000, offset = 0) {
    console.log('запрашиваем всех покемонов');
    Pokemon.find({}, (err, res) => {
        if (!res || res.length === 0) {
            console.log('в базе пусто, берем из апи...');
            fetch(`${pokemonApiUrl}pokemon/?limit=${limit}&offset=${offset}`)
                .then(async(res) => {
                    const data = await res.json();
                    pokemonsWithoutInfo = [...pokemons, ...data.results];
                    if (data.next) {
                        offset = limit;
                        limit *= 2;
                        GetAllPokemons(limit, offset);
                    } else {
                        console.log('сохраняем покемонов в базу');
                        Pokemon.insertMany(pokemonsWithoutInfo)
                            .then((docs) => {
                                console.log('в базу сохранили');
                            }).catch((err) => {
                                console.log(err);
                            });

                        GetPokemonsInfo();
                    }
                })
                .catch((err) => {
                    console.log('Ошибка: API не отвечает!');
                });
        } else {
            console.log('список покемонов есть в базе');
            pokemonsWithoutInfo = res;
            pokemons = pokemonsWithoutInfo.filter(p => p.weight);

            if (pokemonsWithoutInfo.length === pokemons.length) {
                console.log('покемоны готовы');
                isAll = true;
            } else {
                GetPokemonsInfo();
            }
        }
    });
}

function GetPokemonsInfo() {
    console.log('запрашиваем доп. параметры покемонов');
    // Promise.all(pokemonsWithoutInfo.filter(p => !p.weight).map(p => GetPokemon(p.url))).then(() => {
    //     console.log('покемоны готовы');
    //     //console.log(pokemonsWithInfo);
    //     isAll = true;
    // });

    pokemonsWithoutInfo.filter(p => !p.weight).forEach(
        (p, i) => setTimeout(function() { GetPokemon(p.url) }, i * 1500, function() {})
    );
}

function GetPokemon(url) {
    return fetch(url)
        .then(async(res) => {
            const data = await res.json();
            if (!data.id) {
                //console.log(data);
                throw (err);
            }
            const p = _.pick(data, ['name', 'weight', 'height', 'url', 'id']);
            pokemons.push(p);
            Pokemon.update({ url: url }, p, () => console.log('update pokenon', p.id));
        })
        .catch((err) => {
            console.log('Ош', url.replace('https://pokeapi.co/api/v2/pokemon/', '')); //, err);

            //GetPokemon(url);
            setTimeout(function() { GetPokemon(url) }, 10000, function() {});
        });
}

router.get('/(:type)?', async(req, res) => {
    const { limit = 20, offset = 0 } = req.query;
    const { type } = req.params;

    if (!isAll) {
        res.send('Service is not ready. Try later.')
    }

    //сортируем по имени
    pokemons = _.sortBy(pokemons, p => p.name);

    //сортируем покемонов
    if (type === "fat") {
        pokemons = _.sortBy(pokemons, p => -p.weight / p.height);
    } else if (type === "angular") {
        pokemons = _.sortBy(pokemons, p => p.weight / p.height);
    } else if (type === "heavy") {
        pokemons = _.sortBy(pokemons, p => -p.weight);
    } else if (type === "light") {
        pokemons = _.sortBy(pokemons, p => p.weight);
    } else if (type === "huge") {
        pokemons = _.sortBy(pokemons, p => -p.height);
    } else if (type === "micro") {
        pokemons = _.sortBy(pokemons, p => p.height);
    } else if (type) {
        res.sendStatus(404);
    }
    res.send(_.slice(pokemons.map(p => p.name), parseInt(offset), parseInt(offset) + parseInt(limit)));
});

module.exports = router;