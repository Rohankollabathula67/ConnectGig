"use strict";
/**
 * ConnectGig — Cloud Functions Entry Point (§4.0)
 * Exports all triggers and callable functions for deployment.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.buildWorkerDailyAnalytics = exports.aggregateProviderRatings = exports.onServiceRequestUpdated = exports.acceptRequestAtomic = exports.expandRadiusQuery = exports.broadcastOnRequestCreation = void 0;
// Export Matching functions
var matching_1 = require("./matching");
Object.defineProperty(exports, "broadcastOnRequestCreation", { enumerable: true, get: function () { return matching_1.broadcastOnRequestCreation; } });
Object.defineProperty(exports, "expandRadiusQuery", { enumerable: true, get: function () { return matching_1.expandRadiusQuery; } });
Object.defineProperty(exports, "acceptRequestAtomic", { enumerable: true, get: function () { return matching_1.acceptRequestAtomic; } });
// Export Notification functions
var notifications_1 = require("./notifications");
Object.defineProperty(exports, "onServiceRequestUpdated", { enumerable: true, get: function () { return notifications_1.onServiceRequestUpdated; } });
// Export Ratings aggregation functions
var ratings_1 = require("./ratings");
Object.defineProperty(exports, "aggregateProviderRatings", { enumerable: true, get: function () { return ratings_1.aggregateProviderRatings; } });
// Export Analytics functions
var analytics_1 = require("./analytics");
Object.defineProperty(exports, "buildWorkerDailyAnalytics", { enumerable: true, get: function () { return analytics_1.buildWorkerDailyAnalytics; } });
//# sourceMappingURL=index.js.map