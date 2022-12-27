import { within, screen } from '@testing-library/react'
import { render, configureRender } from './index'

const withNav = () => node => <nav>{node}</nav>
const withList = () => node => <ul>{node}</ul>

describe('render', () => {
  it('renders component without decorators', () => {
    render(<li>Item</li>)
    expect(screen.getByRole('listitem')).toBeInTheDocument()
  })

  it('renders decorator around component', () => {
    render(<li>Item</li>, withList())
    const list = screen.getByRole('list')
    expect(within(list).getByRole('listitem')).toBeInTheDocument()
  })

  it('nests component within multiple decorators', () => {
    render(<li>Item</li>, withList(), withNav())
    const nav = screen.getByRole('navigation')
    const list = within(nav).getByRole('list')
    expect(within(list).getByRole('listitem')).toBeInTheDocument()
  })

  it('re-renders decorator around component', () => {
    const { rerender } = render(<li>Item</li>, withList())
    rerender(<li>Item</li>)
    const list = screen.getByRole('list')
    expect(within(list).getByRole('listitem')).toBeInTheDocument()
  })
})

describe('configureRender', () => {
  it('creates render function with default decorators', () => {
    const render = configureRender(withList()) // eslint-disable-line testing-library/render-result-naming-convention
    render(<li>Item</li>, withNav())
    const nav = screen.getByRole('navigation')
    const list = within(nav).getByRole('list')
    expect(within(list).getByRole('listitem')).toBeInTheDocument()
  })
})