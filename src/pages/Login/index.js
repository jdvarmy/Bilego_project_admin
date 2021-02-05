import React, { useCallback, useState } from 'react';
import { inject, observer } from 'mobx-react';
import { withRouter } from 'react-router-dom';
import { createStyles, makeStyles } from '@material-ui/styles';
import { UserOutlined, LockOutlined, LoadingOutlined, RightCircleOutlined } from '@ant-design/icons';
import Form from 'react-bootstrap/Form';
import Button from 'react-bootstrap/Button';
import InputGroup from 'react-bootstrap/InputGroup';
import image from './img/image.jpg';

const useStyles = makeStyles((theme) =>
  createStyles({
    wrapper: {
      width: '100%',
      height: '100%',
      '& .bg-img-holder.section-image': {
        backgroundImage: `url(${image})`,
        zIndex: 1,
      },
      '& .btn.btn-primary.btn-block svg': {
        verticalAlign: 'baseline',
        marginRight: theme.spacing(2),
      }
    },
  }),
);

const Login = withRouter(inject('securityStore')(observer(props => {
  const classes = useStyles();
  const [email, setEmail] = useState('');
  const [pass, setPass] = useState('');
  // eslint-disable-next-line no-unused-vars
  const [message, setMessage] = useState(null);
  const [invalidEmail, setInvalidEmail] = useState(false);
  const [invalidPass, setInvalidPass] = useState(false);

  const handleChange = useCallback(event => {
    if (event.target.name === 'email') { setEmail(event.target.value) }
    if (event.target.name === 'pass') { setPass(event.target.value) }
  }, [email, pass]);

  const handleSubmit = async e => {
    e.preventDefault();
    const { securityStore, history } = props;

    email === '' ? setInvalidEmail(true) : setInvalidEmail(false);
    pass === '' ? setInvalidPass(true) : setInvalidPass(false);
    if (email === '' || pass === '') {
      return false;
    }

    if (!securityStore.updatingUser) {
      try {
        await securityStore.login(email, pass);
        history.push(`/${securityStore.user.nicename}`);
      } catch (error) {
        handleErrors(error, {email: email, password: pass});
      }
    }
  };
  const handleErrors = (error) => {
    const message = error.message || "Проверьте правильность ввода Email и Пароля";
    setMessage(message);
  };

  const { securityStore: { updatingUser } } = props;

  return (
    <div className={classes.wrapper}>
      <div className="login__form-container">
        <section className="min-vh-100 d-flex align-items-center">
          <div className="bg-img-holder section-image top-0 left-0 col-lg-6 col-xl-7 z-10 vh-100 d-none d-lg-block" />
          <div className="container-fluid py-5">
            <div className="row align-items-center">
              <div className="col-sm-10 col-lg-6 col-xl-5 mx-auto">
                <div className="px-1 px-xl-6">
                  <div>
                    <div className="text-left text-sm-center">
                      <h1>Вход</h1>
                    </div>
                    <Form>
                      <Form.Group controlId="formBasicEmail">
                        <InputGroup>
                          <InputGroup.Prepend>
                            <InputGroup.Text>
                              <UserOutlined />
                            </InputGroup.Text>
                          </InputGroup.Prepend>
                          <Form.Control
                            name="email"
                            type="email"
                            placeholder="Введите email"
                            onChange={handleChange}
                            value={email}
                            isInvalid={invalidEmail}
                          />
                        </InputGroup>
                      </Form.Group>
                      <Form.Group controlId="formBasicPassword">
                        <InputGroup>
                          <InputGroup.Prepend>
                            <InputGroup.Text>
                              <LockOutlined />
                            </InputGroup.Text>
                          </InputGroup.Prepend>
                          <Form.Control
                            name="pass"
                            type="password"
                            placeholder="Пароль"
                            onChange={handleChange}
                            value={pass}
                            isInvalid={invalidPass}
                          />
                        </InputGroup>
                      </Form.Group>
                      <Button variant="primary" block type="submit" onClick={handleSubmit}>
                        {updatingUser ? <LoadingOutlined /> : <RightCircleOutlined />}
                        Войти
                      </Button>
                    </Form>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  )
})))

export default Login;
