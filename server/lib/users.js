/* eslint-disable no-await-in-loop */
const { setTimeout } = require('node:timers/promises');
const haiku = require('./haiku');

const MAX_TRIES = 10;

const users = {};

// Random ID until the ID is not in used or max tries is reached
async function randomID(counter = 0) {
  if (counter > MAX_TRIES) {
    return null;
  }
  await setTimeout(10);
  const id = haiku();
  return id in users ? randomID(counter + 1) : id;
}

exports.create = async (socket) => {
  const id = await randomID();
  if (id) {
    users[id] = socket;
  }
  return id;
};

exports.get = (id) => users[id];

exports.remove = (id) => delete users[id];
