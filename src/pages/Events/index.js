import React, { useEffect, useState, useRef } from 'react';
import { inject, observer } from 'mobx-react';
import { createStyles, makeStyles } from '@material-ui/styles';
import { round } from '../../components/functions';
import { Table, Input, DatePicker, Button, Typography, PageHeader, Menu, Dropdown, Modal } from 'antd';
import { OrderDetails } from '../../components/Table/Order';
import { SolutionOutlined, SearchOutlined, FilterOutlined, CloseCircleOutlined } from '@ant-design/icons';
import Highlighter from 'react-highlight-words';
import { ExportCSV } from '../../components/ExportCSV';
import moment from 'moment';
import locale from 'antd/es/date-picker/locale/ru_RU';

const useStyles = makeStyles(theme =>
  createStyles({
    orders: {
      margin: theme.spacing(1, 0),
      verticalAlign: 'middle',
      textAlign: 'center',
      cursor: 'pointer',
    },
    filter: {
      padding: theme.spacing(1),
      '& .ant-picker-suffix': {
        display: 'none',
      }
    },
    flex: {
      display: 'flex',
      flexWrap: 'nowrap',
      justifyContent: 'space-between',
      alignItems: 'center',
      '& .anticon': {
        fontSize: '12px',
        color: 'rgb(246, 37, 90)',
        cursor: 'pointer',
        marginRight: theme.spacing(1),
      },
    },
    input: {
      width: '188px',
      marginBottom: theme.spacing(2),
      display: 'block',
    },
    span: {
      color: 'rgba(0, 0, 0, 0.5)',
      fontWeight: 100,
    },
    textarea: {
      height: '90px',
    },
  }),
);

const { RangePicker } = DatePicker;
const { Text } = Typography;

const Events = inject('eventsStore', 'securityStore')(observer(props => {
  const classes = useStyles();
  const { eventsStore: { filters, events, isLoading, clearFilters } } = props;
  const [modal, setModal] = useState({
    title: null,
    link: null,
    visible: null,
  });
  const searchInput = useRef(null);
  const f = 'DD.MM.YYYY';
  let timeout;

  useEffect(() => {
    const { eventsStore:{ getEventsOfUser, initState } } = props;
    initState();
    getEventsOfUser();
    return clearTimeout(timeout);
  }, []);

  const columns = [
    {
      title: <div className={classes.flex}>
        <div>Название</div>
        {filters.events !== undefined && <CloseCircleOutlined onClick={() => handleSearchBase({events: undefined})} />}
      </div>,
      width: '43%',
      dataIndex: 'event',
      key: 'event',
      // eslint-disable-next-line
      render: text => filters.events !== undefined
        ? <Highlighter
          highlightStyle={{ backgroundColor: '#ffc069', padding: 0 }}
          searchWords={[filters.events.toString()]}
          autoEscape
          textToHighlight={text && text.toString()}
        />
        : text,
      // eslint-disable-next-line react/prop-types
      filterDropdown: ({ setSelectedKeys, selectedKeys, confirm }) => {
        return(
          <div className={classes.filter}>
            <Input
              className={classes.input}
              ref={searchInput}
              placeholder="Название события"
              value={selectedKeys[0]}
              onChange={ e => {
                const {target:{value}} = e;
                setSelectedKeys(value ? [value] : []);
                value && value.length > 1
                  ? handleSearchBase( {events: value} )
                  : filters.events !== undefined && handleSearchBase( {events: undefined} )
              }}
              onPressEnter={ () => confirm() }
            />
          </div>
        )},
      filterIcon: () => <SearchOutlined style={{ color: filters.events ? 'rgb(246, 37, 90)' : undefined }} />,
      onFilterDropdownVisibleChange: visible => {
        // visible && searchInput.current.select()
        console.log(visible, searchInput)
      },
    },
    {
      title: <div className={classes.flex}>
        <div>
          Дата концерта
          <div>
            <span className={classes.span}>
              {
                `${filters.startDate && filters.endDate
                  ? `с ${filters.startDate.format(f)} по ${filters.endDate.format(f)}`
                  : filters.startDate && filters.endDate === undefined
                    ? `с ${filters.startDate.format(f)}`
                    : filters.startDate === undefined && filters.endDate
                      ? `по ${filters.endDate.format(f)}`
                      : `c ` + moment().format(f)
                }`
              }
            </span>
          </div>
        </div>
        {(filters.startDate !== undefined || filters.endDate !== undefined) && <CloseCircleOutlined onClick={() => handleSearchBase({startDate: undefined, endDate: undefined})} />}
      </div>,
      width: '24%',
      dataIndex: 'date',
      key: 'date',
      filterDropdown: () => {
        return (
          <div className={classes.filter}>
            <RangePicker
              bordered={false}
              locale={locale}
              ranges={{
                'Сегодня': [moment(), moment()],
                'Этот месяц': [moment().startOf('month'), moment().endOf('month')],
                'Этот год': [moment().startOf('year'), moment().endOf('year')],
              }}
              onCalendarChange={dates => {
                if(dates[0] === filters.startDate && dates[1] === filters.endDate) return;
                handleSearchBase(dates ? {startDate: dates[0], endDate: dates[1]} : [])}
              }
              value={[filters.startDate, filters.endDate]}
              allowClear={false}
            />
          </div>
        )},
      filterIcon: () => <FilterOutlined
        style={{
          color:
            filters.startDate || filters.endDate
              ? 'rgb(246, 37, 90)'
              : undefined
        }}
      />,
      render: date => date,
    },
    {
      title: 'Билеты',
      width: '13%',
      children: [
        {
          title: 'Выполненые',
          dataIndex: 'totalQuantityCompleted',
          key: 'totalQuantityCompleted',
          render: text => 'x'+text
        },
        // {
        //   title: 'Всего',
        //   dataIndex: 'totalQuantity',
        //   key: 'totalQuantity',
        //   render: text => 'x'+text
        // }
      ]
    },
    {
      title: 'На сумму',
      width: '13%',
      children: [
        {
          title: 'Выполненые',
          dataIndex: 'totalCurCompleted',
          key: 'totalCurCompleted',
          render: text => text + 'p'
        },
        // {
        //   title: 'Всего',
        //   dataIndex: 'totalCur',
        //   key: 'totalCur',
        //   render: text => text + 'p'
        // }
      ],
    },
    {
      title: 'Управление',
      key: 'orders',
      width: '5%',
      render: data => {
        const { ordersInfo } = data;
        let csvData = [];

        Object.keys(ordersInfo).map( key =>{
          const items = ordersInfo[key].line_items,
            order = {
              id: ordersInfo[key].id,
              orderKey: ordersInfo[key].order_key,
              status: ordersInfo[key].status,
              date: ordersInfo[key].date,
              customerEmail: ordersInfo[key].billing_address.email,
              customerIp: ordersInfo[key].customer_ip,
              totalOrderCur: ordersInfo[key].total_cur,
              totalOrderQua: ordersInfo[key].total_quantity,
              currency: ordersInfo[key].currency,
              eventTitle: ordersInfo[key].event.title
            };

          items.map(el => {
            const { attendees } = el,
              ticket = {
                name: el.name,
                price: el.price,
                quantity: el.quantity,
                total: el.total
              };

            attendees && attendees.length > 0
              ? attendees.map(a => {
                csvData.push({
                  'ID заказа': order.id,
                  'Дата покупки': order.date,
                  'Статус': order.status,
                  'Сумма заказа': order.totalOrderCur,
                  'Валюта': order.currency,
                  'Кол-во билетов в заказе': order.totalOrderQua,
                  'Событие': order.eventTitle,
                  'ID билета': a.ticket_id,
                  'Билет': ticket.name,
                  'Цена': ticket.price,
                  'Количество': 1,
                  'Сумма': ticket.price,
                  'Код безопасности': a.security,
                  'Покупатель': order.customerEmail,
                  'IP покупателя': order.customerIp,
                  'Check in': a.check_in ? 'yes' : 'no'
                });
              })
              : csvData.push({
                'ID заказа': order.id,
                'Дата покупки': order.date,
                'Статус': order.status,
                'Сумма заказа': order.totalOrderCur,
                'Валюта': order.currency,
                'Кол-во билетов в заказе': order.totalOrderQua,
                'Событие': order.eventTitle,
                'ID билета': '',
                'Билет': ticket.name,
                'Цена': ticket.price,
                'Количество': ticket.quantity,
                'Сумма': ticket.total,
                'Код безопасности': '',
                'Покупатель': order.customerEmail,
                'IP покупателя': order.customerIp,
                'Check in': 'no',
              });
          });
        } );

        const menu = (
          <Menu>
            <Menu.Item key="1" onClick={() => ExportCSV(csvData, `Отчет по билетам ${data.event} bilego`)}>
              Скачать отчет по билетам
            </Menu.Item>
            <Menu.Item key="2" onClick={
              () => setModal({
                  title: `Iframe для продажи билетов события ${data.event}`,
                  link: data.ticketLink,
                  visible: true
                })}>Сформировать Iframe билетов</Menu.Item>
          </Menu>
        );
        return (
          <Dropdown overlay={menu} trigger={['click']}>
            <div className={classes.orders}><SolutionOutlined /></div>
          </Dropdown>
        )
      }
    }
  ];

  const handleSearchBase = selectedKeys => {
    const { eventsStore: { setFilter } } = props;
    timeout = setTimeout(function(){
      setFilter(selectedKeys);
    }, 100);
  };

  const xlsxFileName = () => {
    const { filters: { startDate, endDate } } = props.eventsStore,
      format = 'DD/MM/YYYY';

    return startDate && endDate
      ? `События с ${startDate.format(format)} по ${endDate.format(format)}-bilego`
      : !startDate && endDate
        ? `События по ${endDate.format(format)}-bilego`
        : startDate && !endDate
          ? `События с ${startDate.format(format)}-bilego`
          : `События с ${moment().format(format)}-bilego`
  };
  const xlsxFileData = () => {
    const { response } = props.eventsStore.response;

    return response.map(event => ({
      'ID события': event.id,
      'Название': event.title,
      'Сумма всех заказов': event.total_cur,
      'Кол-во всех заказов': event.total_quantity,
      'Сумма выполненых заказов': event.total_cur_completed,
      'Кол-во выполненых заказов': event.total_quantity_completed,
      'Сумма возмещения': 0,
      'Комиссия': 0,
      'Место': event.item_title,
      'Дата': event.date2,
      'Время': event.time,
      'Возраст': event.age,
    }));
  };

  return (
    <div>
      <PageHeader
        title="Отчет по событиям"
        className="site-page-header"
        subTitle="просмотр ваших событий"
        extra={[
          <Button key="2" onClick={clearFilters}>Очистить фильтры</Button>,
          <Button key="1" type="primary" onClick={() => ExportCSV(xlsxFileData(), xlsxFileName())}>Скачать отчет</Button>
        ]}
      />
      <Table
        columns={columns}
        dataSource={events}
        expandRowByClick={false}
        loading={isLoading}
        expandable={{expandedRowRender: orders => <OrderDetails orders={orders.ordersInfo}/>}}
        bordered={true}
        pagination={false}
        summary={data => {
          let money = 0,
            tickets = 0,
            complitedMoney = 0,
            complitedTickets = 0;

          data.map(el => {
            const sum = parseFloat(el.totalCur),
              count = el.totalQuantity,
              sumC = parseFloat(el.totalCurCompleted),
              countC = el.totalQuantityCompleted;

            money = round(sum + money);
            // eslint-disable-next-line no-unused-vars
            tickets += count;
            complitedMoney = round(sumC + complitedMoney);
            complitedTickets += countC;
          });

          return (
            <>
              <tr>
                <th colSpan={3}>Всего</th>
                <th>
                  <Text>x{complitedTickets}</Text>
                </th>
                {/*<th>*/}
                {/*  <Text>x{tickets}</Text>*/}
                {/*</th>*/}
                <th>
                  <Text type="success">{complitedMoney}p</Text>
                </th>
                {/*<th>*/}
                {/*  <Text>{money}p</Text>*/}
                {/*</th>*/}
                <td/>
              </tr>
            </>
          );
        }}
      />
      <Modal
        title={modal.title}
        visible={modal.visible}
        footer={null}
        onCancel={() => setModal({title: null, link: null, visible: null})}
      >
        <Typography>Скопируйте ссылку ниже и вставьте в любое место Вашего сайта:</Typography>
        <Input.TextArea className={classes.textarea} value={'<iframe src="' + modal.link + '" width="100%" height="645px"></iframe>'} />
      </Modal>
    </div>
  )
}));

export default Events;
