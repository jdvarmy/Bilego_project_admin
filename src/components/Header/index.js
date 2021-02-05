import React from 'react';
import { inject, observer } from 'mobx-react';
import { withRouter, NavLink } from 'react-router-dom';
import { isMobile } from 'mobile-device-detect';
import Navbar from 'react-bootstrap/Navbar';
import Nav from 'react-bootstrap/Nav';
import { Menu, Dropdown, Button } from 'antd';
import { createStyles, makeStyles } from '@material-ui/styles';
import { RiseOutlined, PieChartOutlined } from '@ant-design/icons';
import logo from './Bilego-logo_inverted.png';

const useStyles = makeStyles((theme) =>
  createStyles({
    content: {
      background: '#001529',
      color: '#fff',
      height: '60px',
    },
    logo: {
      backgroundImage: `url(${logo})`,
      backgroundPosition: 'center center',
      backgroundRepeat: 'no-repeat',
      backgroundSize: 'contain',
      width: `${isMobile ? '58px' : '146px'}`,
      marginLeft: `${isMobile ? theme.spacing(4) : 0}px`,
      height: '100%',
    },
    logout: {
      marginLeft: theme.spacing(2),
      cursor: 'pointer',
    },
    link: {
      display: 'flex!important',
      justifyContent: 'center',
      alignItems: 'center',
      '& > span:last-child': {
        marginLeft: theme.spacing(2),
      }
    },
  }),
);

const Header = withRouter(inject('securityStore')(observer(props => {
  const classes = useStyles();
  const { securityStore: { baseNameForRouting, user } } = props;

  const menu = (
    <Menu>
      <Menu.Item key="events">
        <NavLink className={classes.link} to={`/${baseNameForRouting}/events`} exact>
          <RiseOutlined />
          <span>События</span>
        </NavLink>
      </Menu.Item>
      <Menu.Divider />
      <Menu.Item key="orders">
        <NavLink className={classes.link} to={`/${baseNameForRouting}/orders`} exact>
          <PieChartOutlined/>
          <span>Заказы</span>
        </NavLink>
      </Menu.Item>
    </Menu>
  );

  const logout = () => {
    const { securityStore: { logout }, history } = props;
    logout();
    history.push('/login');
  };

  return (
    <Navbar className={classes.content}>
      {isMobile && (
        <Dropdown overlay={menu} trigger={['click']}>
          <a className="ant-dropdown-link" onClick={e => e.preventDefault()}>
            <Button key="1" type="primary">Меню</Button>
          </a>
        </Dropdown>
      )}
      <div className={classes.logo} />
      <Nav className="mr-auto"/>
      <div>
        <div>{user.displayname}</div>
      </div>
      <div className={classes.logout} onClick={logout}>выйти</div>
    </Navbar>
  )

})));

export default Header;
