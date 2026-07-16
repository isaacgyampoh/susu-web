import Link from 'next/link'

export default function NotFound() {
  return (
    <div className="wrap py-24 max-w-[480px]">
      <h1 className="t-h2">Page not found</h1>
      <p className="t-lead mt-3">That page does not exist, or the group has closed.</p>
      <div className="flex gap-3 mt-8">
        <Link href="/" className="btn-dark">Home</Link>
        <Link href="/plans" className="btn-line">Open groups</Link>
      </div>
    </div>
  )
}
