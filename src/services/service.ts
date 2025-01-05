// animateScroll.ts
import { cubicInOut } from 'svelte/easing';
import { $, cumulativeOffset, extend, noop, scrollLeft, scrollTop, startAnimationLoop } from '../helpers/helper.js';
import { ScrollToElementOptions } from './../global.interface.js';

// Default options
const defaultOptions: ScrollToElementOptions = {
  container: 'body',
  duration: 500,
  delay: 0,
  offset: 0,
  easing: cubicInOut,
  onStart: noop,
  onDone: noop,
  onAborting: noop,
  scrollX: false,
  scrollY: true
};

// Scroll to internal implementation
const scrollToInternal = (options: ScrollToElementOptions): (() => void) => {
  const { duration, delay, easing, x = 0, y = 0, scrollX, scrollY, onStart, onDone, container, onAborting, element } = options;

  let { offset } = options;

  if (typeof offset === 'function') {
    offset = offset() as number;
  }

  const cumulativeOffsetContainer = cumulativeOffset(container);
  const cumulativeOffsetTarget = element ? cumulativeOffset(element) : { top: y, left: x };

  const initialX = scrollLeft(container);
  const initialY = scrollTop(container);

  const targetX = cumulativeOffsetTarget.left - cumulativeOffsetContainer.left + (offset as number);
  const targetY = cumulativeOffsetTarget.top - cumulativeOffsetContainer.top + (offset as number);

  const diffX = targetX - initialX;
  const diffY = targetY - initialY;

  let scrolling = true;
  let started = false;
  const startTime = performance.now() + delay;
  const endTime = startTime + duration;

  const scrollToTopLeft = (el: HTMLElement | string, top: number, left: number): void => {
    if (scrollX) scrollLeft(el, left);
    if (scrollY) scrollTop(el, top);
  };

  const start = () => {
    if (!started) {
      started = true;
      onStart(element, { x, y });
    }
  };

  const tick = (progress: number) => {
    scrollToTopLeft(container, initialY + diffY * progress, initialX + diffX * progress);
  };

  const stop = () => {
    scrolling = false;
  };

  startAnimationLoop((now) => {
    if (!started && now >= startTime) {
      start();
    }

    if (started && now >= endTime) {
      tick(1);
      stop();
      onDone(element, { x, y });
    }

    if (!scrolling) {
      onAborting(element, { x, y });
      return false;
    }

    if (started) {
      const p = (now - startTime) / duration;
      const t = easing(p);
      tick(t);
    }

    return scrolling;
  });

  tick(0); // Initial tick

  return stop;
};

const proceedOptions = (options: ScrollToElementOptions | string): ScrollToElementOptions => {
  const opts = extend({}, defaultOptions, options as ScrollToElementOptions);
  opts.container = $(opts.container);
  opts.element = $(opts.element);
  return opts;
};

const scrollContainerHeight = (containerElement: HTMLElement | Document): number => {
  if (containerElement && containerElement !== document && containerElement !== document.body) {
    return (containerElement as HTMLElement).scrollHeight - (containerElement as HTMLElement).offsetHeight;
  }
  const { body } = document;
  const html = document.documentElement;

  return Math.max(body.scrollHeight, body.offsetHeight, html.clientHeight, html.scrollHeight, html.offsetHeight);
};

const setGlobalOptions = (options: ScrollToElementOptions): void => {
  extend(defaultOptions, options || {});
};

// Scroll functions
const scrollTo = (options: ScrollToElementOptions): (() => void) => scrollToInternal(proceedOptions(options));

const scrollToBottom = (options?: ScrollToElementOptions): (() => void) => {
  const opts = proceedOptions(options);

  return scrollToInternal(
    extend(opts, {
      element: null,
      y: scrollContainerHeight(opts.container)
    })
  );
};

const scrollToTop = (options?: ScrollToElementOptions): (() => void) => {
  const opts = proceedOptions(options);

  return scrollToInternal(
    extend(opts, {
      element: null,
      y: 0
    })
  );
};

const makeScrollToAction = (scrollToFunc: Function) => (node: Node, options: ScrollToElementOptions) => {
  let current = options;
  const handle: EventListenerOrEventListenerObject = (e: Event) => {
    e.preventDefault();
    scrollToFunc(typeof current === 'string' ? { element: current } : current);
  };
  node.addEventListener('click', handle);
  node.addEventListener('touchstart', handle);
  return {
    update(opts: ScrollToElementOptions): void {
      current = opts;
    },
    destroy(): void {
      node.removeEventListener('click', handle);
      node.removeEventListener('touchstart', handle);
    }
  };
};

// Actions
export const scrollto = makeScrollToAction(scrollTo);
export const scrolltotop = makeScrollToAction(scrollToTop);
export const scrolltobottom = makeScrollToAction(scrollToBottom);

// Methods
export const animateScroll = {
  scrollTo,
  scrollToTop,
  scrollToBottom,
  setGlobalOptions
};
