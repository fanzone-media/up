import React from 'react';

export * from './Profiles';

export const LazyProfiles = React.lazy(() => import('./Profiles'));
