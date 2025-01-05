import { ScrollToElementOptions, ScrollToElementPosition } from './../global.interface';

export const $ = (selector: HTMLElement | string): HTMLElement => {
  if (typeof selector === 'string') {
    return document.querySelector(selector);
  }
  return selector;
};

export const extend = (...args: ScrollToElementOptions[]): ScrollToElementOptions => Object.assign({}, ...args);

export const cumulativeOffset = (element: HTMLElement | any): ScrollToElementPosition => {
  let el = element;
  let top = 0;
  let left = 0;

  do {
    top += el.offsetTop || 0;
    left += el.offsetLeft || 0;
    el = el.offsetParent;
  } while (el);

  return {
    top,
    left
  };
};

export const directScroll = (element: HTMLElement | any): boolean => element && element !== document && element !== document.body;

export const scrollTop = (el: HTMLElement | string, value?: number): number => {
  const element = $(el);
  const inSetter = value !== undefined;
  if (directScroll(element)) {
    const result = inSetter ? (element.scrollTop = value) : element.scrollTop;
    return result;
  }
  const res = inSetter
    ? (document.documentElement.scrollTop = document.body.scrollTop = value)
    : window.pageYOffset || document.documentElement.scrollTop || document.body.scrollTop || 0;
  return res;
};

export const scrollLeft = (el: HTMLElement | string, value?: number): number => {
  const element = $(el);
  const inSetter = value !== undefined;
  if (directScroll(element)) {
    const res = inSetter ? (element.scrollLeft = value) : element.scrollLeft;
    return res;
  }
  const res = inSetter
    ? (document.documentElement.scrollLeft = document.body.scrollLeft = value)
    : window.pageXOffset || document.documentElement.scrollLeft || document.body.scrollLeft || 0;
  return res;
};

export const noop = () => {};

// Custom animation loop
export const startAnimationLoop = (callback: (time: number) => boolean): (() => void) => {
  let running = true;

  const loop = (time: number) => {
    if (!running) return;
    if (callback(time)) {
      requestAnimationFrame(loop);
    }
  };

  requestAnimationFrame(loop);

  // Return function to stop the loop
  return () => {
    running = false;
  };
};

export const now = () => performance.now();
