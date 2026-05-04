import { render, type RenderOptions } from '@testing-library/react'
import type { ReactElement } from 'react'

/**
 * Custom render function that can be extended with providers
 */
function customRender(ui: ReactElement, options?: Omit<RenderOptions, 'wrapper'>) {
  return render(ui, {
    ...options,
  })
}

export { customRender as render }
// eslint-disable-next-line react-refresh/only-export-components
export * from '@testing-library/react'
