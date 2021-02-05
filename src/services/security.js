import requests from './helpers/requests';

export default {
  login: (username, password) =>
    requests.post('https://mos.bilego.ru/wp-json/jwt-auth/v1/token', {}, {username, password}),
};
