export interface ScrollToOptions {
  offset?: number | Function;
  duration?: number;
  delay?: number;
  easing?: any;
  x?: number;
  y?: number;
  scrollX?: number;
  scrollY?: number;
  onStart?: any;
  onDone?: any;
  container?: any;
  onAborting?: any;
  element?: string | HTMLElement;
}
