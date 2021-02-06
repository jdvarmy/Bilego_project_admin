import React from 'react';
import { observer } from 'mobx-react';
import { Table, Badge, Typography, Tooltip } from 'antd';
import { createStyles, makeStyles } from '@material-ui/styles';
import { round } from '../../functions';

const { Paragraph, Text } = Typography;
const useStyles = makeStyles(theme =>
  createStyles({
    dot: {
      '&::before': {
        content: "•",
        display: 'inline-block',
        margin: theme.spacing(0, 1),
      },
    },
  }),
);

const OrderDetails = observer(props => {
  const classes = useStyles();
  const { orders } = props;

  const data = [];

  const columns = [
    {
      title: <Text type="warning">Заказ</Text>,
      dataIndex: 'id',
      key: 'id',
      render: text => <Paragraph>#{text}</Paragraph>
    },
    {
      title: <Text type="warning">Дата заказа</Text>,
      dataIndex: 'date',
      key: 'date',
      render: text => <Paragraph>{text}</Paragraph>
    },
    {
      title: <Text type="warning">Статус</Text>,
      dataIndex: 'status',
      key: 'status',
      render: text => (
        <Paragraph>
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
        </Paragraph>
      )
    },
    {
      title: <Text type="warning">На сумму</Text>,
      dataIndex: 'totalCur',
      key: 'totalCur',
      render: text => <Paragraph>{text}p</Paragraph>
    },
    {
      title: <Text type="warning">Покупатель</Text>,
      dataIndex: 'customer',
      key: 'customer',
      render: data => (
        <Tooltip title={`Билеты куплены через: ${data.user_agent}`}>
          <Paragraph>
            {data.email}
          </Paragraph>
          <Paragraph>
            ip: {data.ip}
          </Paragraph>
        </Tooltip>
      )
    },
    {
      title: <Text type="warning">Билеты</Text>,
      dataIndex: 'tickets',
      key: 'tickets',
      render: data => {
        return data.map((el, k)=>(
          <Paragraph key={k}>
            {el.name} <span className={classes.dot}/> <Text type="secondary">/</Text> {el.quantity} <Text type="secondary">/</Text> {el.price}p
          </Paragraph>
        ))
      },
    },
  ];

  Object.keys(orders).map(key => {
    data.push({
      id: orders[key].id,
      key: key,
      status: orders[key].status,
      date: orders[key].date,
      totalCur: orders[key].total_cur,
      totalQuantity: orders[key].total_quantity,
      customer: {
        email: orders[key].billing_address.email,
        ip: orders[key].customer_ip,
        user_agent: orders[key].customer_user_agent,
      },
      tickets: orders[key].line_items
    })
  });

  return (
    data.length > 0
      ? <Table
        bordered
        columns={columns}
        dataSource={data}
        expandRowByClick={false}
        pagination={false}
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
                <th colSpan={2}>Выполненые заказы</th>
                <th colSpan={2}>
                  <Text type="success">{complitedMoney}p</Text>
                </th>
                <th colSpan={2}>
                  <Text>x{complitedTickets}</Text>
                </th>
              </tr>
              {/*<tr>*/}
              {/*  <th colSpan={2}>Всего</th>*/}
              {/*  <th colSpan={2}>*/}
              {/*    <Text type="danger">{money}p</Text>*/}
              {/*  </th>*/}
              {/*  <th colSpan={2}>*/}
              {/*    <Text>x{tickets}</Text>*/}
              {/*  </th>*/}
              {/*</tr>*/}
            </>
          );
        }}
      />
      : null
  )
});

export default OrderDetails;
