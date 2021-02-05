import React from 'react';
import { ThemeProvider } from '@material-ui/core/styles';
import CssBaseline from '@material-ui/core/CssBaseline';
import { inject, observer, Provider } from 'mobx-react';
import * as stores from './stores';
import { BrowserRouter as Router, Route, Switch, withRouter } from 'react-router-dom';
import { Layout } from 'antd';
import Box from '@material-ui/core/Box';
import { isMobile } from 'mobile-device-detect';
import routes from './routes';
import { makeStyles, createStyles } from '@material-ui/styles';
import theme from './theme';
import Footer from './components/Footer';
import Sider from './components/Sider';
import Header from './components/Header';
import 'antd/dist/antd.css';

const useStyles = makeStyles(() =>
  createStyles({
    box: {
      minHeight: '100vh',
      display: 'flex',
      flexDirection: 'row',
    },
  }),
);

const App = () =>
  <Provider {...stores}>
    <Router>
      <BilegoAdminApp />
    </Router>
  </Provider>

const BilegoAdminApp = withRouter(inject('securityStore')(observer(props => {
  const classes = useStyles();
  const { securityStore: {user, token}, history } = props;
  const routs = routes(user && user.nicename ? user.nicename : '');

  !user || !token
    ? history.push(`/login`)
    : history.location.pathname.indexOf('/login') + 1
    ? history.push(`/${user.nicename}`)
    : null;

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Box className={classes.box}>
        {(user && token && !isMobile) && <Sider />}
        <Layout className="site-layout">
          {(user && token) && <Header />}
          <Layout.Content>
            <Switch>
              {routs.map(props => (
                // eslint-disable-next-line react/jsx-key
                <Route {...props} />
              ))}
            </Switch>
          </Layout.Content>
          <Footer />
        </Layout>
      </Box>
    </ThemeProvider>
  )
})));


export default App;
