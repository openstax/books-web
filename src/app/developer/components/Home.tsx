import React from 'react';
import styled from 'styled-components';
import Layout from '../../components/Layout';
import { bodyCopyRegularStyle, H1 } from '../../components/Typography';
import { contentWrapperMaxWidth } from '../../content/components/constants';
import DisplayNotifications from '../../notifications/components/Notifications';
import Books from './Books';
import Notifications from './Notifications';
import Routes from './Routes';

// tslint:disable-next-line:variable-name
const HomeStyle = styled.div`
  ${bodyCopyRegularStyle}
  max-width: ${contentWrapperMaxWidth}rem;
  margin: 0 auto;
  padding: 2rem 0;
`;

// tslint:disable-next-line:variable-name
const Home: React.SFC = () => <Layout>
  <DisplayNotifications />
  <HomeStyle>
    <H1>REX Developer Homepage</H1>
    <Books />
    <Notifications />
    <Routes />
  </HomeStyle>
</Layout>;

export default Home;
