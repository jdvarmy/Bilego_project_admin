import {
  LoginPage,
  EventsPage,
  EventPage,
  // OrdersPage,
  Page404
} from '../pages';


export default function (baseRouter) {
  return(
    [
      {
        path: `/login`,
        key: 'login',
        component: LoginPage,
        exact: true,
      },
      {
        path: ['/', `/${baseRouter}`, `/${baseRouter}/events`],
        key: 'front',
        component: EventsPage,
        exact: true,
      },
      // {
      //   path: `/${baseRouter}/orders`,
      //   key: 'OrdersPage',
      //   component: OrdersPage,
      //   exact: true,
      // },
      {
        path: `/${baseRouter}/event/:eventSlug`,
        key: 'event',
        component: EventPage,
        exact: true,
      },
      {
        path: ['/404', `/${baseRouter}/404`, '*'],
        key: 'page404',
        component: Page404,
      },
    ]
  )
}
