declare module 'react-katex' {
  import type { FC, ReactNode } from 'react'
  export const InlineMath: FC<{
    math: string
    errorColor?: string
    renderError?: (error: Error) => ReactNode
  }>
  export const BlockMath: FC<{
    math: string
    errorColor?: string
    renderError?: (error: Error) => ReactNode
  }>
}
