import Axios from 'axios';

const production = process.env.NODE_ENV === 'production';

let baseURL = 'http://localhost:3000';
if (production) {
  baseURL = 'http://202.144.193.225:3000';
}

const axios = Axios.create({
  baseURL,
});

function getCards() {
  return axios.get('/cards');
}
function getRandomCards(size = 10) {
  return axios.get(`/random-cards?size=${size}`);
}

function createCard(body) {
  return axios.post('/cards', body);
}

function updateCard(id, body) {
  return axios.put(`/cards/${id}`, body);
}

function removeCard(id) {
  return axios.delete(`/cards/${id}`);
}

function removeCards(option) {
  return axios.delete('/cards', option);
}
function getDecks() {
  return axios.get('/decks');
}
function createDeck(data) {
  return axios.post('/decks', data);
}

export default {
  getCards,
  getRandomCards,
  createCard,
  updateCard,
  removeCard,
  removeCards,

  getDecks,
  createDeck,
};
