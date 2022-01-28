import React from 'react';
import { HashRouter as Router, Route, Switch } from 'react-router-dom';
import NoMatch from '../pages/NoMatch/NoMatch';
import ProfileDetails from '../pages/ProfileDetails/ProfileDetails';
import Profiles from '../pages/Profiles/Profiles';
import AssetDetails from '../pages/AssetDetails/AssetDetails';
import { CreateName } from '../pages/CreateName';

const Routes: React.FC = () => {
  return (
    <Router>
      <Switch>
        <Route exact path="/" render={() => <Profiles />} />
        <Route exact path="/:network" render={() => <Profiles />} />
        <Route
          exact
          path="/:network/profile/:add"
          render={() => <ProfileDetails />}
        />
        <Route
          exact
          path="/:network/asset/:add"
          render={() => <AssetDetails />}
        />
        <Route
          exact
          path="/:network/create-name"
          render={() => <CreateName />}
        />
        <Route path="*" render={() => <NoMatch />} />
      </Switch>
    </Router>
  );
};

export default Routes;
