import React from 'react';

export * from './ProfileDetails';

export const LazyProfileDetails = React.lazy(() => import('./ProfileDetails'));
