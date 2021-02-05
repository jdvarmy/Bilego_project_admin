export default {
  set: (key, item) => {
    window.localStorage.setItem(key, JSON.stringify(item));
  },
  get: item => {
    const storedItem = window.localStorage.getItem(item);
    if (storedItem) {
      return JSON.parse(storedItem);
    }
  },
  remove: window.localStorage.removeItem.bind(window.localStorage),
};
