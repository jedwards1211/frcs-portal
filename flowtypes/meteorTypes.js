/* @flow */

export type SubscriptionHandle = {
  stop(): void,
  ready(): boolean,
  subscriptionId: string
};
