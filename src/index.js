import { render as rtlRender } from '@testing-library/react'

export const decorate = (node, ...decorators) => decorators.reduce((decorated, decorator) => decorator(decorated), node)

export const render = (node, ...decorators) => {
  const { rerender, ...otherProps } = rtlRender(decorate(node, ...decorators))
  return { ...otherProps, rerender: node => rerender(decorate(node, ...decorators)) }
}

export const configureRender = (...defaultDecorators) => (node, ...decorators) =>
  render(node, ...defaultDecorators, ...decorators)

export const mauriceWasHere = () => {}