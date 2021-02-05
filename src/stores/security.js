import {configure, observable, action, flow, computed, makeObservable} from 'mobx';
import { errorsStore } from './';
import {
  securityService,
  tokenService,
  userService,
} from '../services';

configure({
  enforceActions: 'always'
});

class Security{
  constructor() {
    this.login = this.login.bind(this);
    makeObservable(this, {
      token: observable,
      user: observable,
      updatingUser: observable,
      baseNameForRouting: computed,
      login: flow,
      logout: action,
    })
  }
  token = tokenService.get() || null;
  user = userService.get() || null;
  updatingUser = false;
  get baseNameForRouting(){
    return this.user && this.user.nicename ? this.user.nicename : '';
  }

  *login(email, password) {
    try {
      yield tokenService.clear();
      this.updatingUser = true;
      const {token, user_email, user_nicename, user_display_name} = yield securityService.login(email, password),
        userDetail = {email: user_email, nicename: user_nicename, displayname: user_display_name};
      this.token = token;
      this.user = userDetail;
      tokenService.set(token);
      userService.set(userDetail);
      return true;
    } catch(e) {
      return errorsStore.handleError('login error. ' + e);
    } finally {
      this.updatingUser = false;
    }
  }

  logout = () => {
    try {
      this.updatingUser = true;
      tokenService.clear();
      userService.clear();
      this.user = null;
      this.token = null;
      return true;
    } catch (e) {
      return errorsStore.handleError('logout error. ' + e);
    } finally {
      this.updatingUser = false;
    }
  }
}

export default new Security();
