import React from 'react';
import { withRouter } from 'react-router-dom';
import styled from 'styled-components';

import css from '../../../theme';

const Event = styled.div`
  display: flex;
  justify-content: space-between;
  min-height: ${css.sizes.xl};
  margin: 0 -${css.sizes.base};
`;

@withRouter
class Concert extends React.Component {
  render() {
    const {concert} = this.props;
    return <Event>
      {concert}
    </Event>;
  }
}

export default Concert;
