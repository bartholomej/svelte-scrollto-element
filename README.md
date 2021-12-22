# svelte-scrollto-element

> Animating vertical and horizontal scrolling (for Svelte)
>
> - TypeScript / JavaScript
> - Useful options
> - Compatible with `SvelteKit`, `SSR` and `adapter-static`

## Install

```bash
npm install svelte-scrollto-element --save
# yarn add svelte-scrollto-element
```

## Usage

### Using programmatically

```html
<script>
  import { animateScroll } from 'svelte-scrollto-element';
</script>

<a on:click={() => animateScroll.scrollToBottom()}> Scroll to bottom </a>
<a on:click={() => animateScroll.scrollToTop()}> Scroll to top </a>
<a on:click={() => animateScroll.scrollTo({element: '#my-anchor'})}> Scroll to element with id="my-anchor"  </a>
<a on:click={() => animateScroll.scrollTo({element: '.my-element-class', offset: 200})}> Scroll to below element 200px </a>
<a on:click={() => animateScroll.scrollTo({element: 'footer', duration: 2000})}> Scroll to footer element over 2000ms </a>
```

### Using as a action

```html
<script>
  import { scrollto } from 'svelte-scrollto-element';
</script>
<!-- Parameter is element selector or options -->
<a use:scrollto={'#scroll-element'}> Scroll to element </a>
```

## API

### Global Options

|    Option    | Required |                                         Default value                                          |                                                                                   Description                                                                                   |
| :----------: | :------: | :--------------------------------------------------------------------------------------------: | :-----------------------------------------------------------------------------------------------------------------------------------------------------------------------------: |
| `container`  |    ✔     |                                            `"body"`                                            |                                                                                Scroll container                                                                                 |
|  `duration`  |    ✔     |                                             `500`                                              |                                                           The duration (in milliseconds) of the scrolling animation.                                                            |
|   `delay`    |          |                                              `0`                                               |
|   `offset`   |          |                                              `0`                                               |                                            The offset that should be applied when scrolling. This option accepts a callback function                                            |
|   `easing`   |          | [`cubicInOut`](https://github.com/sveltejs/svelte/blob/master/src/runtime/easing/index.ts#L67) |        The easing function to be used when animating. Can pass any easing from [`svelte/easing`](https://svelte.dev/docs#svelte_easing) or pass custom easing function.         |
|  `onStart`   |          |                                             `noop`                                             |                        A callback function that should be called when scrolling has started. Receives the target element and page offset as a parameter.                        |
|   `onDone`   |          |                                             `noop`                                             |                         A callback function that should be called when scrolling has ended. Receives the target element and page offset as a parameter.                         |
| `onAborting` |          |                                             `noop`                                             | A callback function that should be called when scrolling has been aborted by the user (user scrolled, clicked etc.). Receives the target element and page offset as parameters. |
|  `scrollX`   |          |                                            `false`                                             |                                                                Whether or not we want scrolling on the `x` axis                                                                 |
|  `scrollY`   |          |                                             `true`                                             |                                                                Whether or not we want scrolling on the `y` axis                                                                 |

Override global options:

```typescript
import { animateScroll } from 'svelte-scrollto-element';

animateScroll.setGlobalOptions({
  offset: 200,
  onStart: (element, offset) => {
    if (element) {
      console.log('Start scrolling to element:', element);
    } else if (offset) {
      console.log('Start scrolling to page offset: (${offset.x}, ${offset.y})');
    }
  }
});
```

### Functions

#### `scrollTo(options)`

Accepts all global options and:

- `element`: The element you want scroll to
- `x`: The offset we want to scrolling on the x axis
- `y`: The offset we want to scrolling on the y axis

#### `scrollToTop(options)`

Shortcut of use scrollTo with `x` equal to `0`.

#### `scrollToBottom(options)`

Shortcut of use scrollTo with `x` equal to _`containerHeight`_

### Actions

Svelte action that listens for `click` (`touchstart`) events and scrolls to elements with animation.

- `scrollto`

- `scrolltotop`

- `scrolltobottom`

### Troubleshooting

If you want to use Lazy and want to scroll to elements, you need to give your lazy components (images, v.v..) fixed dimensions, so the browser known the size of the not loaded elements before scrolling.

[easing]: https://github.com/sveltejs/svelte/blob/master/src/runtime/easing/index.ts

## Credits

Initially forked from [langbamit/svelte-scrollto](https://github.com/langbamit/svelte-scrollto) which is archived now. Uses some of its code and functionality!

## Privacy Policy

I DO NOT STORE ANY DATA. PERIOD.

I physically can't. I have nowhere to store it. I don't even have a server database to store it. So even if Justin Bieber asked nicely to see your data, I wouldn't have anything to show him.

That's why, with this library, what happens on your device stays on your device till disappear.

## License

> Initially forked from [langbamit/svelte-scrollto](https://github.com/langbamit/svelte-scrollto) which is archived now.

Proudly powered by nature 🗻, wind 💨, tea 🍵 and beer 🍺 ;)

All contents are licensed under the [MIT license].

[mit license]: LICENSE
