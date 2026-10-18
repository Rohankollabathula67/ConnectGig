/**
* ConnectGig — Cloud Functions Entry Point (§4.0)
* Exports all triggers and callable functions for deployment.
*/

// Export Matching functions
export {
  acceptRequestAtomic, broadcastOnRequestCreation,
  expandRadiusQuery
} from './matching';

// Export Notification functions
export {
  onServiceRequestUpdated
} from './notifications';

// Export Ratings aggregation functions
export {
  aggregateProviderRatings
} from './ratings';

// Export Analytics functions
export {
  buildWorkerDailyAnalytics
} from './analytics';

// Export Payments functions
export {
  createPaymentOrder,
  verifyPaymentSignature
} from './payments';

