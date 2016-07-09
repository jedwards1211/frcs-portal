/* @flow */

/**
 * When a component supporting leave hooks is about to leave, it should call its leave hooks one by one.
 *
 * If a hook returns false, the component should cancel the transition that would cause it to leave, and not call
 * any subsequent leave hooks.
 *
 * The leave hook owner may display its own confirmation UI or perform some other action, and later call the
 * leave function when it is ready to leave.
 * The leave function merely retries the transition that was cancelled, which may cause an infinite loop if the
 * leave hook owner doesn't remove its leave hook.
 * The leave function does nothing if called before the hook returns or the transition is not canceled, or the
 * component that called the hook is no longer mounted.
 *
 * Components supporting leave hooks should have addLeaveHook(hook: LeaveHook) and removeLeaveHook(hook: LeaveHook)
 * methods, and additionally put these methods into its child context, with the same names.  Additionally, if these
 * methods are present in the context it receives, it should register a leave hook through its context so that all of
 * the proper hooks are called when a high-level component will leave.
 */
export type LeaveHook = (leave: Function) => ?boolean;
