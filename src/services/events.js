import requests from './helpers/requests';

export default {
  getEventsOfUser: ({page = 1, size = 20, sortField = 'id', direction = 'asc'}, filterParams) =>
    requests.get(
      'https://spb.bilego.ru/wp-json/bilego/v2/user/events',
      {sort: `${sortField},${direction}`, page, size, ...filterParams}
      ),
}
