import _superagent from 'superagent';
import superagentPromise from 'superagent-promise';
import tokenService from '../token';

// eslint-disable-next-line no-undef
const http = superagentPromise(_superagent, global.Promise);

const handleErrors = () => {
  // console.log(error)
  // console.log(error.rawResponse)
};

const handleCatch = (url, err) => {
  console.log(err);
  if(err.status >= 400 && err.status < 500) {
    console.log('!!!!!!!!!session error!!!!!!!!!!');
    tokenService.clear();
    if(! url.indexOf('/login')+1) {
      window.location.href = '/login';
      console.log('!!!!!!!!!session expired!!!!!!!!!!');
    }
  }
};

const responseBody = res => res.body || res.text;

const tokenPlugin = request => {
  const token = tokenService.get();
  if(token)
    request.set('Authorization', `Bearer ${token}`);
    // request.set('Access-Control-Allow-Origin', `*`);
  // request.set('X-Requested-With', 'XMLHttpRequest');
  // request.set('X-NX-Origin', 'SG');

};

export default {
  get: (url, query = {}) =>
    http
      .get(`${url}`)
      .query(query)
      .use(tokenPlugin)
      .end(handleErrors)
      .then(responseBody)
      .catch(err => handleCatch(url, err)),
  post: (url, query = {}, body = {}) =>
    http
      .post(`${url}`, body)
      .query(query)
      .use(tokenPlugin)
      .end(handleErrors)
      .then(responseBody)
      .catch(err => handleCatch(url, err)),
  fileUpload: (url, query = {}, files = [], fields = []) => {
    let req = http.post(`${url}`);
    files.forEach((file)=> {
      req.attach(file.name, file);
    });
    fields.forEach( (field)=> {
      req.field(field);
    });

    return req
      .query(query)
      .use(tokenPlugin)
      .end(handleErrors)
      .then(responseBody)
      .catch(err => handleCatch(url, err));
  },
};
