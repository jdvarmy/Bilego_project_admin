import React, { useState } from 'react';
import { inject, observer } from 'mobx-react';
import { withRouter, NavLink } from 'react-router-dom';
import { Layout, Menu } from 'antd';
import { RiseOutlined } from '@ant-design/icons';
import { createStyles, makeStyles } from '@material-ui/styles';

const useStyles = makeStyles((theme) =>
  createStyles({
    logo: {
      height: theme.spacing(3),
      background: 'rgba(255, 255, 255, 0.2)',
      margin: theme.spacing(2),
    },
  }),
);

const Sider = withRouter(inject( 'securityStore')(observer(props => {
  const classes = useStyles();
  const { securityStore: { baseNameForRouting } } = props;
  const [collapsed, setCollapsed] = useState(true);

  const selected = props.history.location.pathname.indexOf('orders') !== -1
    ? 'orders'
    : 'events';

  return (
    <Layout.Sider collapsible collapsed={collapsed} onCollapse={setCollapsed}>
      <div className={classes.logo} />
      <Menu
        theme="dark"
        selectedKeys={[selected]}
        mode="inline">
        <Menu.Item key="events">
          <NavLink to={`/${baseNameForRouting}/events`} exact>
            <RiseOutlined />
            <span>События</span>
          </NavLink>
        </Menu.Item>
        {/*<Menu.Item key="orders">*/}
        {/*  <NavLink to={`/${baseNameForRouting}/orders`} exact>*/}
        {/*    <PieChartOutlined/>*/}
        {/*    <span>Заказы</span>*/}
        {/*  </NavLink>*/}
        {/*</Menu.Item>*/}
      </Menu>
    </Layout.Sider>
  )
})));

export default Sider;
