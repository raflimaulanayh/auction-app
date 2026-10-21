import { buttonVariants, type ButtonVariants } from '@heroui/react'
import { createLink, type LinkComponent } from '@tanstack/react-router'
import { forwardRef } from 'react'

type AnchorButtonProps = React.AnchorHTMLAttributes<HTMLAnchorElement> &
  Pick<ButtonVariants, 'size' | 'variant' | 'fullWidth'>

const AnchorButton = forwardRef<HTMLAnchorElement, AnchorButtonProps>(
  ({ size, variant, fullWidth, className, ...props }, ref) => (
    <a ref={ref} {...props} className={buttonVariants({ size, variant, fullWidth, className })} />
  ),
)

const CreatedLinkButton = createLink(AnchorButton)

/**
 * Router link styled as a HeroUI button. Use this instead of nesting a <Button> inside
 * a <Link>: a button inside an anchor is invalid HTML and its press handling makes the
 * browser do a full page load instead of client-side routing.
 */
export const LinkButton: LinkComponent<typeof AnchorButton> = (props) => (
  <CreatedLinkButton preload="intent" {...props} />
)
