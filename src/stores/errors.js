import { observable, action, makeObservable } from 'mobx';

export class errors {
  constructor() {
    makeObservable(this, {
      errors: observable,
      handleError: action,
      deleteError: action,
    })
  }
  errors = [];

  handleError (text, errorCode, type = 'error') {
    this.errors.push({
      text: errorCode ? text + '. HTTP code: ' + errorCode : text,
      type: type
    });
  }

  deleteError (ind) {
    this.errors.splice(ind, 1);
  }
}

export default new errors();
