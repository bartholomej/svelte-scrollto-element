import { ScrollToOptions } from './global.interface';
import { cubicInOut } from 'svelte/easing';
import { noop, loop, now } from 'svelte/internal';
import _ from './helper';

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

const _scrollTo = (options: ScrollToOptions) => {
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

  var cumulativeOffsetContainer = _.cumulativeOffset(container);
  var cumulativeOffsetTarget = element
    ? _.cumulativeOffset(element)
    : { top: y, left: x };

  var initialX = _.scrollLeft(container);
  var initialY = _.scrollTop(container);

  var targetX =
    cumulativeOffsetTarget.left - cumulativeOffsetContainer.left + (offset as number);
  var targetY =
    cumulativeOffsetTarget.top - cumulativeOffsetContainer.top + (offset as number);

  var diffX = targetX - initialX;
  var diffY = targetY - initialY;

  let scrolling = true;
  let started = false;
  let start_time = now() + delay;
  let end_time = start_time + duration;

  function scrollToTopLeft(element: HTMLElement, top: number, left: number) {
    if (scrollX) _.scrollLeft(element, left);
    if (scrollY) _.scrollTop(element, top);
  }

  function start(delayStart: number | boolean) {
    if (!delayStart) {
      started = true;
      onStart(element, { x, y });
    }
  }

  function tick(progress: number) {
    scrollToTopLeft(
      container,
      initialY + diffY * progress,
      initialX + diffX * progress
    );
  }

  function stop() {
    scrolling = false;
  }

  loop(now => {
    if (!started && now >= start_time) {
      start(false)
    }

    if (started && now >= end_time) {
      tick(1);
      stop();
      onDone(element, { x, y });
    }

    if (!scrolling) {
      onAborting(element, { x, y });
      return false;
    }
    if (started) {
      const p = now - start_time;
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
  let opts = _.extend({}, defaultOptions, options);
  opts.container = _.$(opts.container);
  opts.element = _.$(opts.element);
  return opts;
};

const scrollContainerHeight = (containerElement: HTMLElement | any) => {
  if (
    containerElement &&
    containerElement !== document &&
    containerElement !== document.body
  ) {
    return containerElement.scrollHeight - containerElement.offsetHeight;
  } else {
    let body = document.body;
    let html = document.documentElement;

    return Math.max(
      body.scrollHeight,
      body.offsetHeight,
      html.clientHeight,
      html.scrollHeight,
      html.offsetHeight
    );
  }
};

export const setGlobalOptions = (options: ScrollToOptions) => {
  _.extend(defaultOptions, options || {});
};

export const scrollTo = (options: ScrollToOptions) => {
  return _scrollTo(proceedOptions(options));
};

export const scrollToBottom = (options: ScrollToOptions) => {
  options = proceedOptions(options);

  return _scrollTo(
    _.extend(options, {
      element: null,
      y: scrollContainerHeight(options.container)
    })
  );
};

export const scrollToTop = (options: ScrollToOptions) => {
  options = proceedOptions(options);

  return _scrollTo(
    _.extend(options, {
      element: null,
      y: 0
    })
  );
};

export const makeScrollToAction = (scrollToFunc: any) => {
  return (node: any, options: ScrollToOptions) => {
    let current = options;
    const handle = (e: any) => {
      e.preventDefault();
      scrollToFunc(
        typeof current === 'string' ? { element: current } : current
      );
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
};

export const scrollto = makeScrollToAction(scrollTo);
export const scrolltotop = makeScrollToAction(scrollToTop);
export const scrolltobottom = makeScrollToAction(scrollToBottom);
