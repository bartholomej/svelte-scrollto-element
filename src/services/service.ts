import { cubicInOut } from 'svelte/easing';
import { loop, noop, now } from 'svelte/internal';
import { ScrollToElementOptions } from '../global.interface';
import { $, cumulativeOffset, extend, scrollLeft, scrollTop } from '../helpers/helper.js';

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

const scrollToInternal = (options: ScrollToElementOptions): (() => void) => {
  let {
    duration,
    delay,
    easing,
    x = 0,
    y = 0,
    scrollX,
    scrollY,
    onStart,
    onDone,
    container,
    onAborting,
    element,
    offset
  } = options;

  offset = typeof offset === 'function' ? offset() : offset;

  const { top: containerTop, left: containerLeft } = cumulativeOffset(container);
  const { top: targetTop, left: targetLeft } = element ? cumulativeOffset(element) : { top: y, left: x };

  const [initialX, initialY] = [scrollLeft(container), scrollTop(container)];
  const [targetX, targetY] = [targetLeft - containerLeft, targetTop - containerTop].map(t => t + offset);
  const [diffX, diffY] = [targetX - initialX, targetY - initialY];

  let scrolling = true;
  let started = false;
  const startTime = now() + delay;
  const endTime = startTime + duration;

  function scrollToTopLeft(top: number, left: number): void {
    if (scrollX) scrollLeft(container, left);
    if (scrollY) scrollTop(container, top);
  }

  function start(delayStart: number | boolean): void {
    if (!delayStart) {
      started = true;
      onStart(element, { x, y });
    }
  }

  function tick(progress: number): void {
    scrollToTopLeft(initialY + diffY * progress, initialX + diffX * progress);
  }

  function stop(): void {
    scrolling = false;
  }

  loop((now): boolean => {
    if (!started && now >= startTime) {
      start(false);
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
      const t = easing((now - startTime) / duration);
      tick(t);
    }

    return true;
  });

  start(delay);
  tick(0);

  return stop;
};

const proceedOptions = (options: ScrollToElementOptions): ScrollToElementOptions => {
  const opts = extend({}, defaultOptions, options);
  opts.container = $(opts.container);
  opts.element = $(opts.element);
  return opts;
};

const scrollContainerHeight = (containerElement: HTMLElement | Document): number => {
  if (containerElement && containerElement !== document && containerElement !== document.body) {
    return (
      (containerElement as HTMLElement).scrollHeight -
      (containerElement as HTMLElement).offsetHeight
    );
  }
  const { body } = document;
  const html = document.documentElement;

  return Math.max(
    body.scrollHeight,
    body.offsetHeight,
    html.clientHeight,
    html.scrollHeight,
    html.offsetHeight
  );
};

const setGlobalOptions = (options: ScrollToElementOptions): void => {
  extend(defaultOptions, options || {});
};

const scrollTo = (options: ScrollToElementOptions): (() => void) =>
  scrollToInternal(proceedOptions(options));

const scrollToY = (y: number, options?: ScrollToElementOptions): (() => void) => {
  options = proceedOptions(options);
  return scrollToInternal(extend(options, { element: null, y }));
};

const scrollToBottom = (options?: ScrollToElementOptions): (() => void) => 
  scrollToY(scrollContainerHeight(proceedOptions(options).container), options);

const scrollToTop = (options?: ScrollToElementOptions): (() => void) => 
  scrollToY(0, options);

const makeScrollToAction =
  (scrollToFunc: Function) => (node: Node, options: ScrollToElementOptions) => {
    let current = options;
    const handle: EventListenerOrEventListenerObject = (e: Event) => {
      e.preventDefault();
      scrollToFunc(typeof current === 'string' ? { element: current } : current);
    };
    node.addEventListener('click', handle);
    node.addEventListener('touchstart', handle);
    return {
      update(options: ScrollToElementOptions): void {
        current = options;
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
export const animateScroll = { scrollTo, scrollToTop, scrollToBottom, setGlobalOptions };