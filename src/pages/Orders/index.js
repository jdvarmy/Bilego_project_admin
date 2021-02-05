import React, {useEffect, useRef} from 'react';
import { inject, observer } from 'mobx-react';
import { Table, Input, DatePicker, Button, Typography, Badge, Tooltip, Checkbox, Row, Col, PageHeader } from 'antd';
import { round } from '../../components/functions';
import Tickets from '../../components/Table/Tickets';
import { SearchOutlined, FilterOutlined, CloseCircleOutlined } from '@ant-design/icons';
import Highlighter from 'react-highlight-words';
import { ExportCSV } from '../../components/ExportCSV';
import moment from 'moment';
import locale from 'antd/es/date-picker/locale/ru_RU';
import { createStyles, makeStyles, useTheme } from '@material-ui/styles';

const useStyles = makeStyles(theme =>
  createStyles({
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
  }),
);

const { Paragraph, Text } = Typography;
const { RangePicker } = DatePicker;

const Orders = inject('ordersStore', 'securityStore')(observer(props => {
  const classes = useStyles();
  const theme = useTheme();
  const { ordersStore: { orders, isLoading, filters, clearFilters } } = props;
  const searchInput = useRef(null);
  const f = 'DD.MM.YYYY';
  let timeout;

  const statuses = [
    {value: 'completed', name: 'Выполнен'},
    {value: 'cancelled', name: 'Отменен'},
    {value: 'pending', name: 'В ожидании оплаты'},
    {value: 'refunded', name: 'Возращён'},
    {value: 'failed', name: 'Неудачно'},
    {value: 'processing', name: 'Обработка'},
    {value: 'on-hold', name: 'На удержании'},
  ];

  useEffect(() => {
    const { ordersStore:{ getOrders, initState } } = props;
    initState();
    getOrders();
    return clearTimeout(timeout);
  }, []);

  const handleSearchBase = selectedKeys => {
    const { setFilter } = props.ordersStore;
    timeout = setTimeout(function(){
      setFilter(selectedKeys);
    }, 100);
  };

  const xlsxFileName = () => {
    const { filters: {startDate, endDate} } = props.ordersStore,
      format = 'DD/MM/YYYY';

    return startDate && endDate
      ? `Заказы с ${startDate.format(format)} по ${endDate.format(format)}-bilego`
      : !startDate && endDate
        ? `Заказы по ${endDate.format(format)}-bilego`
        : startDate && !endDate
          ? `Заказы с ${startDate.format(format)}-bilego`
          : `Заказы bilego`
  };
  const xlsxFileData = () => {
    const { response } = props.ordersStore;
    let csvData = [];

    Object.keys(response).map( key =>{
      const items = response[key].line_items,
        order = {
          id: response[key].id,
          orderKey: response[key].order_key,
          status: response[key].status,
          date: response[key].date,
          customerEmail: response[key].billing_address.email,
          customerIp: response[key].customer_ip,
          totalOrderCur: response[key].total_cur,
          totalOrderQua: response[key].total_quantity,
          currency: response[key].currency,
          eventTitle: response[key].event.title
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
    });
    return csvData;
  };

  const columns = [
    {
      title: <div className={classes.flex}>
        <div>Заказ</div>
        {filters.orderId !== undefined && <CloseCircleOutlined onClick={() => handleSearchBase({orderId: undefined})} />}
      </div>,
      dataIndex: 'id',
      key: 'id',
      render: text => filters.orderId !== undefined
        ? <>#<Highlighter
          highlightStyle={{ backgroundColor: '#ffc069', padding: 0 }}
          searchWords={[filters.orderId.toString()]}
          autoEscape
          textToHighlight={text && text.toString()}
        /></>
        : '#'+text,
      // eslint-disable-next-line react/prop-types
      filterDropdown: ({ setSelectedKeys, selectedKeys, confirm }) => {
        return(
          <div className={classes.filter}>
            <Input
              className={classes.input}
              ref={searchInput}
              placeholder="Номер заказа"
              value={selectedKeys[0]}
              onChange={ e => {
                const {target:{value}} = e;
                setSelectedKeys(value ? [value] : []);
                value && value.length > 1
                  ? handleSearchBase( {orderId: value} )
                  : filters.orderId !== undefined && handleSearchBase( {orderId: undefined} )
              }}
              onPressEnter={ () => confirm() }
            />
          </div>
        )},
      filterIcon: () => <SearchOutlined style={{ color: filters.orderId ? 'rgb(246, 37, 90)' : undefined }} />,
      onFilterDropdownVisibleChange: visible => {
        // visible && searchInput.current.select()
        console.log(visible, searchInput)
      },
    },
    {
      title: <div className={classes.flex}>
        <div>
          Дата
          <div>
            <span className={classes.span}>
              {
                `${filters.startDate && filters.endDate
                  ? `с ${filters.startDate.format(f)} по ${filters.endDate.format(f)}`
                  : filters.startDate && filters.endDate === undefined
                    ? `с ${filters.startDate.format(f)}`
                    : filters.startDate === undefined && filters.endDate
                      ? `по ${filters.endDate.format(f)}`
                      : ''
                }`
              }
            </span>
          </div>
        </div>
        {(filters.startDate !== undefined || filters.endDate !== undefined) && <CloseCircleOutlined onClick={() => handleSearchBase({startDate: undefined, endDate: undefined})} />}
      </div>,
      dataIndex: 'date',
      key: 'date',
      filterDropdown: () => {
        const { startDate, endDate  } = filters;
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
                if(dates[0] === startDate && dates[1] === endDate) return;
                handleSearchBase(dates ? {startDate: dates[0], endDate: dates[1]} : [])}
              }
              value={[startDate, endDate]}
              allowClear={false}
            />
          </div>
        )},
      filterIcon: () => <FilterOutlined style={{ color: filters.startDate || filters.endDate ? 'rgb(246, 37, 90)' : undefined }} />,
      render: text => text,
    },
    {
      title: <div className={classes.flex}>
        <div>
          Статус
          <div>
            <span className={classes.span}>{
              filters.status !== undefined && statuses.filter(el=>{
                return filters.status.indexOf(el.value)+1
              }).map(el=>{
                return <div key={el.value}>{el.name}</div>
              })
            }</span>
          </div>
        </div>
        {(filters.status !== undefined) && <CloseCircleOutlined onClick={() => handleSearchBase({status: undefined})} />}
      </div>,
      dataIndex: 'status',
      key: 'status',
      render: text => <Paragraph>
        <Badge status={
          text === 'Выполнен'
            ? 'success'
            : text === 'Отменен'
            ? 'error'
            : text === 'В ожидании оплаты'
              ? 'processing'
              : 'default'
        } />
        {text}
      </Paragraph>,
      filterDropdown: () => {
        const { status } = filters;
        return(
          <div className={classes.filter}>
            <Checkbox.Group style={{ width: '100%' }} onChange={e => handleSearchBase({status: e.length !== 0 ? e : undefined})}>
              <Row gutter={[theme.spacing(1, 1)]}>
                {statuses.map(s => (
                  <Col key={s.value} span={24}>
                    <Checkbox checked={status && !!status.indexOf(s.value)} value={s.value}>{s.name}</Checkbox>
                  </Col>
                ))}
              </Row>
            </Checkbox.Group>
          </div>
        )
      },
      filterIcon: () => <FilterOutlined style={{ color: filters.status ? 'rgb(246, 37, 90)' : undefined }} />,
    },
    {
      title: <div className={classes.flex}><div>Сумма</div></div>,
      dataIndex: 'totalCur',
      key: 'totalCur',
      render: text => text+'p',
    },
    {
      title: <div className={classes.flex}><div>Количество</div></div>,
      dataIndex: 'totalQuantity',
      key: 'totalQuantity',
      render: text => text,
    },
    {
      title: <div className={classes.flex}>
        <div>Покупатель</div>
        {filters.customer !== undefined && <CloseCircleOutlined onClick={() => handleSearchBase({customer: undefined})} />}
      </div>,
      dataIndex: 'customer',
      key: 'customer',
      render: text => filters.customer !== undefined
        ?<Tooltip title={`Билеты куплены через: ${text.userAgent}`}>
          <Paragraph>
            <Highlighter
              highlightStyle={{ backgroundColor: '#ffc069', padding: 0 }}
              searchWords={[filters.customer.toString()]}
              autoEscape
              textToHighlight={text && text.email.toString()}
            />
          </Paragraph>
          <Paragraph>
            ip: <Highlighter
            highlightStyle={{ backgroundColor: '#ffc069', padding: 0 }}
            searchWords={[filters.customer.toString()]}
            autoEscape
            textToHighlight={text && text.ip.toString()}
          />
          </Paragraph>
        </Tooltip>
        : <Tooltip title={`Билеты куплены через: ${text.userAgent}`}>
          <Paragraph>
            {text.email}
          </Paragraph>
          <Paragraph>
            ip: {text.ip}
          </Paragraph>
        </Tooltip>,
      // eslint-disable-next-line react/prop-types
      filterDropdown: ({ setSelectedKeys, selectedKeys, confirm }) => {
        return(
          <div className={classes.filter}>
            <Input
              className={classes.input}
              ref={searchInput}
              placeholder="Поиск по email или ip"
              value={selectedKeys[0]}
              onChange={ e => {
                const {target:{value}} = e;
                setSelectedKeys(value ? [value] : []);
                value && value.length > 1
                  ? handleSearchBase( {customer: value})
                  : filters.customer !== undefined && handleSearchBase({customer: undefined})
              }}
              onPressEnter={ () => confirm() }
            />
          </div>
        )},
      filterIcon: () => <SearchOutlined style={{ color: filters.customer ? 'rgb(246, 37, 90)' : undefined }} />,
      onFilterDropdownVisibleChange: visible => {
        // visible && searchInput.current.select()
        console.log(visible, searchInput)
      },
    },
    {
      title: <div className={classes.flex}>
        <div>Событие</div>
        {filters.event !== undefined && <CloseCircleOutlined onClick={() => handleSearchBase({event: undefined})} />}
      </div>,
      dataIndex: 'event',
      key: 'event',
      render: text => filters.event !== undefined
        ? <Highlighter
          highlightStyle={{ backgroundColor: '#ffc069', padding: 0 }}
          searchWords={[filters.event.toString()]}
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
                  ? handleSearchBase( {event: value} )
                  : filters.event !== undefined && handleSearchBase( {event: undefined} )
              }}
              onPressEnter={ () => confirm() }
            />
          </div>
        )},
      filterIcon: () => <SearchOutlined style={{ color: filters.event ? 'rgb(246, 37, 90)' : undefined }} />,
      onFilterDropdownVisibleChange: visible => {
        // visible && searchInput.current.select()
        console.log(visible, searchInput)
      },
    },
  ];

  return (
    <div>
      <PageHeader
        title="Отчет по заказам"
        className="site-page-header"
        subTitle="просмотр заказов ваших клиентов"
        extra={[
          <Button key="2" onClick={clearFilters}>Очистить фильтры</Button>,
          <Button key="1" type="primary" onClick={() => ExportCSV(xlsxFileData(), xlsxFileName())}>Скачать отчет</Button>,
        ]}
      />
      <Table
        columns={columns}
        dataSource={orders}
        expandRowByClick={false}
        loading={isLoading}
        bordered={true}
        pagination={false}
        expandable={{expandedRowRender: orders => <Tickets tickets={orders.tickets} />}}
        summary={data => {
          let money = 0,
            tickets = 0,
            complitedMoney = 0,
            complitedTickets = 0;

          data.map(el => {
            const sum = parseFloat(el.totalCur), count = el.totalQuantity;

            if(el.status === 'Выполнен'){
              complitedMoney = round(sum + complitedMoney);
              complitedTickets += count;
            }
            money = round(sum + money);
            // eslint-disable-next-line no-unused-vars
            tickets += count;
          });

          return (
            <>
              <tr>
                <th colSpan={4}>Выполненые заказы</th>
                <th colSpan={1}>
                  <Text type="success">{complitedMoney}p</Text>
                </th>
                <th colSpan={1}>
                  <Text>x{complitedTickets}</Text>
                </th>
                <td colSpan={2}/>
              </tr>
              {/*<tr>*/}
              {/*  <th colSpan={4}>Всего</th>*/}
              {/*  <th colSpan={1}>*/}
              {/*    <Text type="success">{money}p</Text>*/}
              {/*  </th>*/}
              {/*  <th colSpan={1}>*/}
              {/*    <Text>x{tickets}</Text>*/}
              {/*  </th>*/}
              {/*  <td colSpan={2}/>*/}
              {/*</tr>*/}
            </>
          );
        }}
      />
    </div>
  );
}));

export default Orders;
