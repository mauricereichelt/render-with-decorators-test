# Render decorators 🪆 for React Testing Library

![GitHub Workflow Status](https://img.shields.io/github/actions/workflow/status/cultivate-software/render-with-decorators/release.yml?branch=main)
![Code Coverage](docs/coverage-badge.svg)
![npm (scoped)](https://img.shields.io/npm/v/@render-with/decorators)
![NPM](https://img.shields.io/npm/l/@render-with/decorators)
![PRs welcome](https://img.shields.io/badge/PRs-welcome-bright%20green)

A render function that enables the use of decorators which elegantly wrap a component under test in providers:

```jsx
render(<LoginForm />, withStore({ user: 'john.doe' }), withLocation('/login'), withTheme())
```

## Table of Contents

- [Installation](#installation)
- [Setup](#setup)
- [The problem](#the-problem)
- [The solution](#the-solution)
- [Wrapping Order](#wrapping-order)
- [Decorators](#decorators)
- [API](#api)
- [Issues](#issues)
- [Contributors](#contributors)
- [LICENSE](#license)

## Installation

This library is distributed via [npm](https://www.npmjs.com/), which is bundled with [node](https://nodejs.org/) and should be installed as one of your project's `devDependencies`:

```shell
npm install --save-dev @render-with/decorators
```

or

for installation via [yarn](https://classic.yarnpkg.com/):

```shell
yarn add --dev @render-with/decorators
```

This library has the following `peerDependencies`:

![npm peer dependency version](https://img.shields.io/npm/dependency-version/@render-with/decorators/peer/@testing-library/react)

and supports the following `node` versions:

![node-current (scoped)](https://img.shields.io/node/v/@render-with/decorators)

## Setup

In your test-utils file, re-export the render function that supports decorators and the Redux decorators:

```javascript
// test-utils.js
// ...
export * from '@testing-library/react'  // makes all React Testing Library's exports available
export * from '@render-with/decorators' // overrides React Testing Library's render function
```

Then, install some decorators for the libraries used in your project:

```shell
npm install --save-dev @render-with/react-router @render-with/redux
```

_Note: You can find an (incomplete) list of libraries with render decorators  [here](#providers)._

Next, configure the decorators in your test-utils file (please refer to the individual decorator library's documentation for a complete setup guide):

```javascript
// test-utils.js
// ...
export * from '@render-with/react-router' // makes decorators like withLocation(..) available
export * from '@render-with/redux'        // makes decorators like withState(..) available
```

And finally, use the decorators in your tests:

```jsx
import { render, withState, withLocation } from './test-utils'

it('shows home page when logged in already', async () => {
  render(<LoginForm />, withStore({ user: 'john.doe' }), withLocation('/login'), withTheme())
  // ...
})
```


## The problem

Rendering React components in tests often require wrapping them in all kinds of providers. Some apps require dozens of providers to function correctly. For instance:

- React Router `MemoryRouter`
- Redux `StoreProvider`
- Material UI `ThemeProvider`
- Format.JS `IntlProvicer`
- ...

And there are, of course, all the custom `Context.Provider`s.

[React Testing Library](https://testing-library.com/docs/react-testing-library/intro) recommends creating a [custom render](https://testing-library.com/docs/react-testing-library/setup#custom-render) function:

```jsx
// test-utils.js
const AllTheProviders = ({ children }) => (
  <ProviderA {/* ... */}>
    <ProviderB {/* ... */}>
      <!-- ... -->
        <ProviderZ {/* ... */}>
          {children}
        </ProviderZ>
      <!-- ... -->
    </ProviderB>
  </ProviderA>
)

const customRender = (ui, options) =>
  render(ui, {wrapper: AllTheProviders, ...options})

export { customRender as render }
```

But a custom render function is not always the best solution.

Some larger projects require a lot of providers and rendering all providers is not always possible.

Some tests need a little more control over the providers being rendered.

Defining a custom render function on a test-file-basis is possible, but it can introduce a lot of boilerplate code:

```jsx
import { configureStore } from '@reduxjs/toolkit'

const renderComponent = () => render(
  <ThemeProvier theme='light'>
    <MemoryRouter initialEntries={[ '/login' ]} initialIndex={0}>
      <StoreProvider store={configureStore({ reducer, preloadedState: { user: 'john.doe' }, middleware })}>
        <LoginForm />
      </StoreProvider>
    </MemoryRouter> 
  </ThemeProvier>
)

// ...

it('shows home page when logged in already', async () => {
  renderComponent()
  await userEvent.click(screen.getByRole('button', { name: /login/i }))
  expect(screen.getByRole('heading', { name: /home/i })).toBeInTheDocument()
})
```

Another downside of the `renderComponent()` test helper function above is: The test becomes harder to read.

It is unclear what component is actually rendered by just looking at the test itself. What component is the test testing?

## The solution

This library provides a customized `render` function that accepts the component under test and a set of elegant decorators that can be used to wrap a rendered component:

```jsx
it('shows home page when logged in already', async () => {
  render(<LoginForm />, withStore({ user: 'john.doe' }), withLocation('/login'), withTheme())
  await userEvent.click(screen.getByRole('button', { name: /login/i }))
  expect(screen.getByRole('heading', { name: /home/i })).toBeInTheDocument()
})
```

Here are some benefits of using render decorators:

- **more maintainable code** (one line vs. many lines of boilerplate code; easier to read)
- **autocompletion** (just type `with` and pick a decorator)
- **flexibility** (pick only the providers needed for the test case at hand)
- **less mocking** (decorators mock what needs to be mocked)
- **simplicity** (some providers make non-trivial testing aspects, like navigation, easy to test)
- **customization** (decorators can often be configured further with additional arguments)
- **improved performance** (no need to render providers that are not needed)

_Note: This solution is partly inspired by [Storybook Decorators](https://storybook.js.org/docs/react/writing-stories/decorators)._

## Wrapping Order

The order of the decorators determines how the rendered component will be wrapped with providers.

![Providers](TODO)

The decorator listed first (closest to the component) will be first to wrap a provider around the component. The decorator listed last will be responsible for the outermost provider.

For instance:

```jsx
render(<LoginForm />, withStore({ user: 'john.doe' }), withLocation('/login'), withTheme())
```

will result in:

```jsx
<ThemeProvier theme='light'>
  <MemoryRouter initialEntries={[ '/login' ]} initialIndex={0}>
    <StoreProvider store={configureStore({ reducer, preloadedState: { user: 'john.doe' }, middleware })}>
      <LoginForm />
    </StoreProvider>
  </MemoryRouter>
</ThemeProvier>
```

_Note: It works a bit like [Matrjoschka](https://de.wikipedia.org/wiki/Matrjoschka) puppets._

## Decorators

Here's an (incomplete) list of libraries that provide decorators for some known libraries: 

- [`@render-with/react-router`](https://www.npmjs.com/package/@render-with/react-router)
- [`@render-with/react-intl`](https://www.npmjs.com/package/@render-with/react-intl)
- [`@render-with/redux`](https://www.npmjs.com/package/@render-with/redux)
- `@render-with/material-ui` (coming soon)
- `@render-with/backstage` (coming soon)

## API

_Note: This API reference uses simplified types. You can find the full type specification [here](https://github.com/cultivate-software/render-with-decorators/blob/main/types/index.d.ts)._

```
function render(ui: ReactElement, ...decorators: Decorator[]): RenderResult
```

Wraps the element (usually the component under test) in providers using the given list of decorators and renders the final result. Providing no decorators will simply render the element. 

```
function decorate(ui: ReactElement, ...decorators: Decorator[]): ReactElement
```

Wraps the given element in providers using the given list of decorators. Providing no decorators will simply return the element.

```
type Decorator = (ui: ReactElement) => ReactElement;
```

A `Decorator` wraps an element in a provider and returns the resulting element.

## Issues

Looking to contribute? PRs are welcome. Checkout this project's [Issues](https://github.com/cultivate-software/render-with-decorators/issues?q=is%3Aissue+is%3Aopen) on GitHub for existing issues.

### 🐛 Bugs

Please file an issue for bugs, missing documentation, or unexpected behavior.

[See Bugs](https://github.com/cultivate-software/render-with-decorators/issues?q=is%3Aissue+label%3Abug+is%3Aopen+sort%3Acreated-desc)

### 💡 Feature Requests

Please file an issue to suggest new features. Vote on feature requests by adding a 👍. This helps maintainers prioritize what to work on.

[See Feature Requests](https://github.com/cultivate-software/render-with-decorators/issues?q=is%3Aissue+label%3Aenhancement+sort%3Areactions-%2B1-desc+is%3Aopen)

### 📚 More Libraries

Please file an issue on the core project to suggest additional libraries that would benefit from decorators. Vote on library support adding a 👍. This helps maintainers prioritize what to work on.

[See Library Requests](https://github.com/cultivate-software/render-with-decorators/issues?q=is%3Aissue+label%3Alibrary+sort%3Areactions-%2B1-desc+is%3Aopen)

### ❓ Questions

For questions related to using the library, file an issue on GitHub.

[See Questions](https://github.com/cultivate-software/render-with-decorators/issues?q=is%3Aissue+label%3Aquestion+sort%3Areactions-%2B1-desc)

## Contributors

<table>
<tbody>
<tr>
  <td align="center">
    <a href="https://cultivate.software">
    <img alt="David Bieder" src="https://avatars.githubusercontent.com/u/9366720?v=4&s=100" />
    <br />
    <sub><b>David Bieder</b></sub>
    </a>
  </td>
  <td align="center">
    <a href="https://cultivate.software">
    <img alt="cultivate(software)" src="https://avatars.githubusercontent.com/u/31018345?v=4&s=100" />
    <br />
    <sub><b>cultivate(software)</b></sub>
    </a>
  </td>
</tr>
</tbody>
</table>

## LICENSE

[MIT](LICENSE)