import {configure, observable, action, flow, makeObservable} from 'mobx';
import { eventsService } from '../services';

configure({
  enforceActions: 'always'
});

class Events{
  constructor() {
    this.getEventsOfUser = this.getEventsOfUser.bind(this);
    makeObservable(this, {
      isLoading: observable,
      events: observable,
      response: observable,
      sortOrder: observable,
      pagination: observable,
      filters: observable,
      setFilter: action,
      clearFilters: action,
      initState: action,
      getEventsOfUser: flow,
    })
  }
  isLoading = false;
  events = false;
  response = false;

  sortOrder = {columnKey: 'id', order: 'ascend'};
  pagination = {current: 1, pageSize: 20, total: 1};

  filters = {
    events: undefined,
    startDate: undefined,
    endDate: undefined,
    all: false,
  };

  setFilter = (filters) => {
    this.filters = { ...this.filters, ...filters };
    this.getEventsOfUser();
  };

  clearFilters = () => {
    this.filters = {
      events: undefined,
      startDate: undefined,
      endDate: undefined,
      all: false,
    };
    this.cache = {};
    this.getEventsOfUser();
  };

  initState = () => {
    this.events = [];
    this.response = [];
    this.isLoading = false;
  };

  *getEventsOfUser() {
    this.isLoading = true;
    try {
      let response;
      const key = this.getKey();
      if(this.searchCache.exist(key)) {
        response = this.searchCache.get(key);
      }else {
        const {events, startDate, endDate, all} = this.filters;
        response = yield eventsService.getEventsOfUser(
          {
            page: this.pagination.current,
            size: this.pagination.pageSize,
            sortField: this.sortOrder.columnKey,
            direction: this.sortOrder.order
              ? this.sortOrder.order === 'descend'
                ? 'desc'
                : 'asc'
              : null,
          },
          {
            events: events,
            startDate: startDate ? startDate.format('DD-MM-YYYY') : undefined,
            endDate: endDate ? endDate.format('DD-MM-YYYY') : undefined,
            all: all,
          }
        );
        this.searchCache.set(key, response)
      }

      this.response = response;
      this.events = response.map(event => {
        return {
          key: event.id,
          event: event.title,
          date: event.date2,
          totalCur: event.total_cur,
          totalQuantity: event.total_quantity,
          totalCurCompleted: event.total_cur_completed,
          totalQuantityCompleted: event.total_quantity_completed,
          ordersInfo: event.orders_info,
          ticketLink: event.ticket_link,
        }
      });
    } catch (e) {
      // return errorHandleStore.handleError('load learnings error. ' + e);
    } finally {
      this.isLoading = false;
    }
  }

  // events cache
  cache = {};
  searchCache = {
    remove: (resource) => {
      delete this.cache[resource];
    },
    exist: (resource) => {
      // eslint-disable-next-line no-prototype-builtins
      return this.cache.hasOwnProperty(resource) && this.cache[resource] !== null;
    },
    get: (resource) => {
      return this.cache[resource];
    },
    set: (resource, cachedData) => {
      this.searchCache.remove(resource);
      this.cache[resource] = cachedData;
    },
  };
  getKey = () => {
    const { events, startDate, endDate, all } = this.filters;
    let key = '';

    all ? key = 'true' : key = 'false';
    events !== undefined ? key += events.toString() : key += '';
    startDate !== undefined ? key += startDate.format('DDMMYYYY') : key += '';
    endDate !== undefined ? key += endDate.format('DDMMYYYY') : key += '';

    return key;
  };
}

export default new Events();
