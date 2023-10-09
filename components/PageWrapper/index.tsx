export default function PageWrapper({
  hasGradient,
  children,
}: {
  hasGradient?: boolean
  children: React.ReactNode
}) {
  return (
    <div className={hasGradient ? 'bg-linear-page' : undefined}>
      <div className="flex flex-col min-h-screen mx-16 max-w-[1200px] xl:m-auto">
        {children}
        <footer className="text-s p-8">
          Copyright © {new Date().getFullYear()} PostIt. All rights reserved.
        </footer>
      </div>
    </div>
  )
}
