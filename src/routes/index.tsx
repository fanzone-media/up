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

const FanzoneClubTest = React.lazy(
  () => import('../pages/FanzoneClubTest/FanzoneClubTest'),
);

const Routes: React.FC = () => {
  return (
    <Router>
      <Suspense fallback={<h1>Loading....</h1>}>
        <Switch>
          <Route exact path="/">
            <Redirect to="/polygon" />
          </Route>
          <Route exact path="/fanzoneSportsClub">
            <FanzoneClub />
          </Route>
          <Route exact path="/test/fanzoneSportsClub">
            <FanzoneClubTest />
          </Route>
          <Route exact path="/addpermissions">
            <AddPermissions />
          </Route>
          <Route exact path="/:network">
            <LazyProfiles />
          </Route>
          <Route exact path="/:network/profile/:add">
            <LazyProfileDetails />
          </Route>
          <Route exact path="/:network/asset/:add">
            <LazyAssetDetails />
          </Route>
          <Route exact path="/:network/asset/:add/:id">
            <LazyAssetDetails />
          </Route>
          <Route exact path="/:network/create-name">
            <CreateName />
          </Route>
          <Route path="*">
            <NoMatch />
          </Route>
        </Switch>
      </Suspense>
    </Router>
  );
};

export default Routes;
