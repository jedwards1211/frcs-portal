type FunctionalComponent<Props> = (props?: Props, context?: any) => ReactElement<any, any, any>;

// anything that can be passed to React.createElement (despite that the current flow/lib/react.js doesn't
// acknowledge it; see https://github.com/facebook/flow/issues/1082
type ReactTag<Props> = string | ReactClass<any, Props, any> | FunctionalComponent<Props>;
