import React, { Suspense } from 'react';
import {
  HashRouter as Router,
  Redirect,
  Route,
  Switch,
} from 'react-router-dom';
import NoMatch from '../pages/NoMatch/NoMatch';
import { CreateName } from '../pages/CreateName';
import { AddPermissions } from '../pages/AddPermissions';
import {
  StyledLoader,
  StyledLoadingHolder,
} from '../pages/AssetDetails/styles';
import { Footer, Header } from '../components';
import { EmbedMarket } from '../pages/Embed/EmbedMarket';
import { EmbedSetPrice } from '../pages/Embed/EmbedSetPrice';

const LazyProfiles = React.lazy(() => import('../pages/Profiles/Profiles'));
const LazyProfileDetails = React.lazy(
  () => import('../pages/ProfileDetails/ProfileDetails'),
);
const LazyAssetDetails = React.lazy(
  () => import('../pages/AssetDetails/AssetDetails'),
);
const FanzoneClub = React.lazy(
  () => import('../pages/FanzoneClub/FanzoneClub'),
);

const Routes: React.FC = () => {
  return (
    <Router>
      <Suspense
        fallback={
          <StyledLoadingHolder>
            <StyledLoader color="#ed7a2d" />
          </StyledLoadingHolder>
        }
      >
        <Switch>
          <Route exact path="/">
            <Redirect to="/up/polygon" />
          </Route>
          <Route path="/up">
            <Header />
            <Switch>
              <Route exact path="/up/fanzoneSportsClub">
                <FanzoneClub />
              </Route>
              <Route exact path="/up/test/fanzoneSportsClub">
                <FanzoneClub />
              </Route>
              <Route exact path="/up/:network">
                <LazyProfiles />
              </Route>
              <Route exact path="/up/:network/profile/:add">
                <LazyProfileDetails />
              </Route>
              <Route exact path="/up/:network/asset/:add">
                <LazyAssetDetails />
              </Route>
              <Route exact path="/up/:network/asset/:add/:id">
                <LazyAssetDetails />
              </Route>
              <Route exact path="/up/:network/create-name">
                <CreateName />
              </Route>
              <Route path="/*">
                <NoMatch />
              </Route>
            </Switch>
            <Footer />
          </Route>
          <Route path="/embed">
            <Switch>
              <Route exact path="/embed/:network/assetmarket/:add">
                <EmbedMarket />
              </Route>
              <Route exact path="/embed/:network/assetItem/:add/:id">
                <EmbedSetPrice />
              </Route>
              <Route path="/*">
                <NoMatch />
              </Route>
            </Switch>
          </Route>
        </Switch>
      </Suspense>
    </Router>
  );
};

export default Routes;
