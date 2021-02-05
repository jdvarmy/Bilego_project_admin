import React from 'react';
import { inject, observer } from 'mobx-react';
import { Table, Typography } from 'antd';
import { CheckCircleOutlined, CloseCircleOutlined } from '@ant-design/icons/es/icons';

const { Paragraph, Text } = Typography;

const Tickets = inject('ordersStore')(observer(props => {
  const { tickets } = props;

  const columns = [
    {
      title: <Text type="warning">Checkin</Text>,
      dataIndex: 'check_in',
      key: 'checkin',
      render: text => (
        <Paragraph>
          {text
            ? <CheckCircleOutlined style={{fontSize: 26, color: '#52c41a'}} />
            : <CloseCircleOutlined style={{fontSize: 26, color: '#ff4d4f'}} /> }
        </Paragraph>
      )
    },
    {
      title: <Text type="warning">Билет</Text>,
      dataIndex: 'id',
      key: 'id',
      render: text => <Paragraph>#{text}</Paragraph>
    },
    {
      title: <Text type="warning">Название</Text>,
      dataIndex: 'title',
      key: 'title',
      render: text => <Paragraph>{text}</Paragraph>
    },
    {
      title: <Text type="warning">Цена</Text>,
      dataIndex: 'price',
      key: 'price',
      render: text => <Paragraph>{text}p</Paragraph>
    },
  ];

  return (tickets.length > 0
      ? <Table
        bordered
        columns={columns}
        dataSource={tickets}
        expandRowByClick={false}
        pagination={false}
      />
      : null
  );
}));

export default Tickets;
