import { configure } from 'mobx';

configure({
  enforceActions: 'always'
});

class User{}

export default new User();
