import { cubicInOut } from 'svelte/easing';
import { loop, noop, now } from 'svelte/internal';
import { ScrollToOptions } from './global.interface';
import { $, cumulativeOffset, extend, scrollLeft, scrollTop } from './helper';

const defaultOptions = {
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

const scrollToInternal = (options: ScrollToOptions) => {
  let {
    offset,
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
    element
  } = options;

  if (typeof offset === 'function') {
    offset = offset() as Function;
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
  const startTime = now() + delay;
  const endTime = startTime + duration;

  function scrollToTopLeft(element: HTMLElement, top: number, left: number) {
    if (scrollX) scrollLeft(element, left);
    if (scrollY) scrollTop(element, top);
  }

  function start(delayStart: number | boolean) {
    if (!delayStart) {
      started = true;
      onStart(element, { x, y });
    }
  }

  function tick(progress: number) {
    scrollToTopLeft(container, initialY + diffY * progress, initialX + diffX * progress);
  }

  function stop() {
    scrolling = false;
  }

  loop((now) => {
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
      const p = now - startTime;
      const t = 0 + 1 * easing(p / duration);
      tick(t);
    }

    return true;
  });

  start(delay);

  tick(0);

  return stop;
};

const proceedOptions = (options: ScrollToOptions) => {
  const opts = extend({}, defaultOptions, options);
  opts.container = $(opts.container);
  opts.element = $(opts.element);
  return opts;
};

const scrollContainerHeight = (containerElement: HTMLElement | any) => {
  if (containerElement && containerElement !== document && containerElement !== document.body) {
    return containerElement.scrollHeight - containerElement.offsetHeight;
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

export const setGlobalOptions = (options: ScrollToOptions) => {
  extend(defaultOptions, options || {});
};

export const scrollTo = (options: ScrollToOptions) => scrollToInternal(proceedOptions(options));

export const scrollToBottom = (options: ScrollToOptions) => {
  options = proceedOptions(options);

  return scrollToInternal(
    extend(options, {
      element: null,
      y: scrollContainerHeight(options.container)
    })
  );
};

export const scrollToTop = (options: ScrollToOptions) => {
  options = proceedOptions(options);

  return scrollToInternal(
    extend(options, {
      element: null,
      y: 0
    })
  );
};

export const makeScrollToAction = (scrollToFunc: any) => (node: any, options: ScrollToOptions) => {
  let current = options;
  const handle = (e: any) => {
    e.preventDefault();
    scrollToFunc(typeof current === 'string' ? { element: current } : current);
  };
  node.addEventListener('click', handle);
  node.addEventListener('touchstart', handle);
  return {
    update(options: ScrollToOptions) {
      current = options;
    },
    destroy() {
      node.removeEventListener('click', handle);
      node.removeEventListener('touchstart', handle);
    }
  };
};

export const scrollto = makeScrollToAction(scrollTo);
export const scrolltotop = makeScrollToAction(scrollToTop);
export const scrolltobottom = makeScrollToAction(scrollToBottom);
