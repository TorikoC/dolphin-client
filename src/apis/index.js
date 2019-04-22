import Axios from 'axios';

const production = process.env.NODE_ENV === 'production';

let baseURL = 'http://localhost:3000';
if (production) {
  baseURL = 'http://202.144.193.225:3000';
}

const axios = Axios.create({
  baseURL,
});

function getCards(id) {
  return axios.get(`/decks/${id}/cards`);
}
function getRandomCards(size = 10) {
  return axios.get(`/random-cards?size=${size}`);
}

function createCard(id, body) {
  return axios.post(`/decks/${id}/cards`, body);
}

function updateCard(deckId, cardId, body) {
  return axios.put(`/decks/${deckId}/cards/${cardId}`, body);
}

function removeCard(deckId, cardId) {
  return axios.delete(`/decks/${deckId}/cards/${cardId}`);
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
function updateDeck(id, data) {
  return axios.put('/decks/' + id, data);
}
function deleteDeck(id) {
  return axios.delete('/decks/' + id);
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
  updateDeck,
  deleteDeck,
};
