import React from 'react';

export * from './AssetDetails';

export const LazyAssetDetails = React.lazy(() => import('./AssetDetails'));
