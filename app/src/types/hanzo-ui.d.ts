declare module '@hanzo/ui' {
  import { ComponentProps } from 'react'

  export const Button: React.FC<ComponentProps<'button'> & {
    variant?: 'default' | 'outline' | 'ghost' | 'link'
    size?: 'sm' | 'md' | 'lg'
  }>

  export const Input: React.FC<ComponentProps<'input'>>
}
