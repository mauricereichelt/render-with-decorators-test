import { ReactElement } from 'react'
import { queries, Queries, RenderResult } from '@testing-library/react'

export type Decorator = (ui: ReactElement) => ReactElement;

export function decorate(ui: ReactElement, ...decorators: Decorator[]): ReactElement

export function render<
  Q extends Queries = typeof queries,
  Container extends Element | DocumentFragment = HTMLElement,
  BaseElement extends Element | DocumentFragment = Container,
  >(
  ui: ReactElement,
  ...decorators: Decorator[],
): RenderResult<Q, Container, BaseElement>
