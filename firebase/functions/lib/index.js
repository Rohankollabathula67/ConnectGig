"use strict";
/**
* ConnectGig — Cloud Functions Entry Point (§4.0)
* Exports all triggers and callable functions for deployment.
*/
Object.defineProperty(exports, "__esModule", { value: true });
exports.seedRealProviders = exports.getUsersList = exports.verifyPaymentSignature = exports.createPaymentOrder = exports.buildWorkerDailyAnalytics = exports.aggregateProviderRatings = exports.onServiceRequestUpdated = exports.expandRadiusQuery = exports.broadcastOnRequestCreation = exports.acceptRequestAtomic = void 0;
// Export Matching functions
var matching_1 = require("./matching");
Object.defineProperty(exports, "acceptRequestAtomic", { enumerable: true, get: function () { return matching_1.acceptRequestAtomic; } });
Object.defineProperty(exports, "broadcastOnRequestCreation", { enumerable: true, get: function () { return matching_1.broadcastOnRequestCreation; } });
Object.defineProperty(exports, "expandRadiusQuery", { enumerable: true, get: function () { return matching_1.expandRadiusQuery; } });
// Export Notification functions
var notifications_1 = require("./notifications");
Object.defineProperty(exports, "onServiceRequestUpdated", { enumerable: true, get: function () { return notifications_1.onServiceRequestUpdated; } });
// Export Ratings aggregation functions
var ratings_1 = require("./ratings");
Object.defineProperty(exports, "aggregateProviderRatings", { enumerable: true, get: function () { return ratings_1.aggregateProviderRatings; } });
// Export Analytics functions
var analytics_1 = require("./analytics");
Object.defineProperty(exports, "buildWorkerDailyAnalytics", { enumerable: true, get: function () { return analytics_1.buildWorkerDailyAnalytics; } });
// Export Payments functions
var payments_1 = require("./payments");
Object.defineProperty(exports, "createPaymentOrder", { enumerable: true, get: function () { return payments_1.createPaymentOrder; } });
Object.defineProperty(exports, "verifyPaymentSignature", { enumerable: true, get: function () { return payments_1.verifyPaymentSignature; } });
// Export Users & Seeder HTTP API
var api_1 = require("./api");
Object.defineProperty(exports, "getUsersList", { enumerable: true, get: function () { return api_1.getUsersList; } });
Object.defineProperty(exports, "seedRealProviders", { enumerable: true, get: function () { return api_1.seedRealProviders; } });
//# sourceMappingURL=index.js.map