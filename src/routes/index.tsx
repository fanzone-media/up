import React, { Suspense } from 'react';
import { HashRouter as Router, Route, Switch } from 'react-router-dom';
import NoMatch from '../pages/NoMatch/NoMatch';
import { CreateName } from '../pages/CreateName';
import { AddPermissions } from '../pages/AddPermissions';
import { LazyProfiles } from '../pages/Profiles';
import { LazyProfileDetails } from '../pages/ProfileDetails';
import { LazyAssetDetails } from '../pages/AssetDetails';

const Routes: React.FC = () => {
  return (
    <Suspense fallback={<h1>Loading....</h1>}>
      <Router>
        <Switch>
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
          <Route exact path="/:network/create-name">
            <CreateName />
          </Route>
          <Route path="*">
            <NoMatch />
          </Route>
        </Switch>
      </Router>
    </Suspense>
  );
};

export default Routes;
