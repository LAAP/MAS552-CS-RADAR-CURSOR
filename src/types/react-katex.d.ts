declare module 'react-katex' {
  import type { FC, ReactNode } from 'react'
  
  type KaTeXOptions = {
    displayMode?: boolean
    throwOnError?: boolean
    errorColor?: string
    strict?: boolean | 'ignore' | 'warn' | 'error'
    macros?: Record<string, string>
    minRuleThickness?: number
    maxSize?: number
    maxExpand?: number
  }

  export const InlineMath: FC<{
    math: string
    errorColor?: string
    renderError?: (error: Error) => ReactNode
    options?: KaTeXOptions
  }>
  export const BlockMath: FC<{
    math: string
    errorColor?: string
    renderError?: (error: Error) => ReactNode
    options?: KaTeXOptions
  }>
}
