import requests from './helpers/requests';

export default {
  getOrders: ({page = 1, size = 20, sortField = 'id', direction = 'asc'}, filterParams) =>
    requests.get(
      'https://mos.bilego.ru/wp-json/bilego/v2/user/orders',
      {sort: `${sortField},${direction}`, page, size, ...filterParams}
      ),
}
