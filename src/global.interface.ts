export interface ScrollToElementOptions {
  offset?: number | Function;
  duration?: number;
  delay?: number;
  easing?: any;
  x?: number;
  y?: number;
  scrollX?: boolean;
  scrollY?: boolean;
  onStart?: any;
  onDone?: any;
  container?: any;
  onAborting?: any;
  element?: HTMLElement | string;
}

export interface ScrollToElementPosition {
  top: number;
  left: number;
}
