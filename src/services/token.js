import storage from './helpers/storage';
const key = '_bilego_token';

export default {
  set: storage.set.bind(null, key),
  get: storage.get.bind(null, key),
  clear: storage.remove.bind(null, key),
};
