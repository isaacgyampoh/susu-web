'use client'
import Link from 'next/link'
import { useCart } from '@/lib/cart'

/** The basket count in the header. Renders nothing until the stored basket has
 *  been read, so the server and the browser agree on the first paint. */
export default function CartLink({ className }: { className?: string }) {
  const { count, ready } = useCart()
  return (
    <Link href="/cart" className={className} aria-label={`Basket, ${ready ? count : 0} items`}>
      Basket{ready && count > 0 ? ` (${count})` : ''}
    </Link>
  )
}
