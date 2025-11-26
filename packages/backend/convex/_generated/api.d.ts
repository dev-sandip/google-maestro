/* eslint-disable */
/**
 * Generated `api` utility.
 *
 * THIS CODE IS AUTOMATICALLY GENERATED.
 *
 * To regenerate, run `npx convex dev`.
 * @module
 */

import type * as actions_judgeSubmission from "../actions/judgeSubmission.js";
import type * as healthCheck from "../healthCheck.js";
import type * as http from "../http.js";
import type * as internals from "../internals.js";
import type * as leaderboard from "../leaderboard.js";
import type * as privateData from "../privateData.js";
import type * as questions from "../questions.js";
import type * as rounds from "../rounds.js";
import type * as submission from "../submission.js";
import type * as todos from "../todos.js";
import type * as users from "../users.js";

import type {
  ApiFromModules,
  FilterApi,
  FunctionReference,
} from "convex/server";

declare const fullApi: ApiFromModules<{
  "actions/judgeSubmission": typeof actions_judgeSubmission;
  healthCheck: typeof healthCheck;
  http: typeof http;
  internals: typeof internals;
  leaderboard: typeof leaderboard;
  privateData: typeof privateData;
  questions: typeof questions;
  rounds: typeof rounds;
  submission: typeof submission;
  todos: typeof todos;
  users: typeof users;
}>;

/**
 * A utility for referencing Convex functions in your app's public API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = api.myModule.myFunction;
 * ```
 */
export declare const api: FilterApi<
  typeof fullApi,
  FunctionReference<any, "public">
>;

/**
 * A utility for referencing Convex functions in your app's internal API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = internal.myModule.myFunction;
 * ```
 */
export declare const internal: FilterApi<
  typeof fullApi,
  FunctionReference<any, "internal">
>;

export declare const components: {};
