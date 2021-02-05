import React from 'react';
import { Layout } from 'antd';
import { isMobile } from 'mobile-device-detect';
import { createStyles, makeStyles } from '@material-ui/styles';

const useStyles = makeStyles((theme) =>
  createStyles({
    content: {
      display: `${isMobile ? 'none' : 'block'}`,
      textAlign: 'right',
      position: 'fixed',
      width: '100%',
      bottom: theme.spacing(1),
      right: theme.spacing(1),
      '&.ant-layout-footer': {
        padding: 0,
        color: 'rgba(0, 0, 0, 0.55)',
        fontSize: '10px',
        background: 'none',
      }
    },
  }),
);

function GetYear(){
  return new Date().getFullYear();
}

export default function Footer(){
  const classes = useStyles();
  return (
    <Layout.Footer className={classes.content}>Bilego event admin ©<GetYear /></Layout.Footer>
  )
}
