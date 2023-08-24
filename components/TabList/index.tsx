type TabListProps = Omit<
  React.ComponentPropsWithoutRef<'div'>,
  'role' | 'onKeyDown'
>

export default function TabList({ children, ...props }: TabListProps) {
  return (
    <div
      {...props}
      role="tablist"
      onKeyDown={(e) => {
        if (e.key !== 'ArrowLeft' && e.key !== 'ArrowRight') return

        const tabs = e.currentTarget.children
        let currentTab = 0

        for (let i = 0; i < tabs.length; i++) {
          if (tabs[i].getAttribute('tabindex') !== '0') continue
          currentTab = i
          break
        }

        tabs[currentTab].setAttribute('tabindex', '-1')

        if (e.key === 'ArrowLeft') {
          currentTab--
          if (currentTab < 0) currentTab = tabs.length - 1
        } else {
          currentTab++
          if (currentTab >= tabs.length) currentTab = 0
        }

        tabs[currentTab].setAttribute('tabindex', '0')
        ;(tabs[currentTab] as HTMLButtonElement).focus()
      }}
    >
      {children}
    </div>
  )
}
