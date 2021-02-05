import {configure, observable, action, flow, makeObservable} from 'mobx';
import { ordersService } from '../services';

configure({
  enforceActions: 'always'
});

class Orders{
  constructor() {
    this.getOrders = this.getOrders.bind(this);
    makeObservable(this, {
      isLoading: observable,
      orders: observable,
      response: observable,
      sortOrder: observable,
      pagination: observable,
      filters: observable,
      setFilter: action,
      clearFilters: action,
      initState: action,
      getOrders: flow,
    })
  }
  isLoading = false;
  orders = false;
  response = false;

  sortOrder = {columnKey: 'id', order: 'ascend'};
  pagination = {current: 1, pageSize: 20, total: 1};

  filters = {
    orderId: undefined,
    startDate: undefined,
    endDate: undefined,
    status: undefined,
    customer: undefined,
    event: undefined,
    all: false,
  };

  setFilter = (filters) => {
    this.filters = { ...this.filters, ...filters };
    this.getOrders();
  };

  clearFilters = () => {
    this.filters = {
      orderId: undefined,
      startDate: undefined,
      endDate: undefined,
      status: undefined,
      customer: undefined,
      event: undefined,
      all: false,
    };
    this.cache = {};
    this.getOrders();
  };

  initState = () => {
    this.isLoading = false;
    this.orders = [];
    this.response = [];
  };

  *getOrders() {
    this.isLoading = true;
    try {
      let response;
      const key = this.getKey();
      if(this.searchCache.exist(key)) {
        response = this.searchCache.get(key);
      }else {
        const {orderId, startDate, endDate, status, customer, event, all} = this.filters;
        response = yield ordersService.getOrders(
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
            orderId: orderId,
            startDate: startDate ? startDate.format('DD-MM-YYYY') : undefined,
            endDate: endDate ? endDate.format('DD-MM-YYYY') : undefined,
            status: status ? status.join(',') : undefined,
            customer: customer,
            event: event,
            all: all,
          }
        );
        this.searchCache.set(key, response)
      }

      this.response = response;
      this.orders = Object.keys(response).map(order => {
        let ticket = [];
        const line_items = response[order].line_items;
        line_items.map(item => {
          const { name, price, attendees } = item;
          attendees.map( t => {
            ticket.push({
              id: t.ticket_id,
              key: t.ticket_id,
              title: name,
              price: price,
              check_in: t.check_in,
              security: t.security
            })
          })
        });

        return {
          id: response[order].id,
          key: response[order].id,
          date: response[order].date,
          status: response[order].status,
          totalCur: response[order].total_cur,
          totalQuantity: response[order].total_quantity,
          customer:{
            email: response[order].billing_address.email,
            ip: response[order].customer_ip,
            userAgent: response[order].customer_user_agent,
          },
          event: response[order].event.title,
          tickets: ticket
        }
      });

    } catch (e) {
      // return errorHandleStore.handleError('load learnings error. ' + e);
      console.log('orders error: ', e)
    } finally {
      this.isLoading = false;
    }
  }

  // orders cache
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
    const { orderId, startDate, endDate, status, customer, event, all } = this.filters;
    let key = '';

    all ? key = 'true' : key = 'false';
    orderId !== undefined ? key += orderId.toString() : key += '';
    startDate !== undefined ? key += startDate.format('DDMMYYYY') : key += '';
    endDate !== undefined ? key += endDate.format('DDMMYYYY') : key += '';
    status !== undefined ? key += status.join() : key += '';
    customer !== undefined ? key += customer.toString() : key += '';
    event !== undefined ? key += event.toString() : key += '';

    return key;
  };
}

export default new Orders();
