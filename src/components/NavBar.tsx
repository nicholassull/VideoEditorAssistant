const navItems = [
    { label: 'Home', href: '#' },
    { label: 'Projects', href: '#' },
    { label: 'Timeline', href: '#' },
    { label: 'Settings', href: '#' },
]

export default function NavBar() {
    return (
        <nav className="w-[200px] shrink-0 min-h-svh border-r border-border bg-background flex flex-col p-6 box-border">
            <div className="font-heading text-lg font-semibold text-text-heading px-2 pb-6 border-b border-border mb-4">
                Video Editor
            </div>
            <ul className="list-none m-0 p-0 flex flex-col gap-1">
                {navItems.map((item) => (
                    <li key={item.label}>
                        <a
                            href={item.href}
                            className="block px-3 py-2 rounded-md text-text no-underline text-[15px] transition-colors duration-150 hover:bg-accent-bg hover:text-accent"
                        >
                            {item.label}
                        </a>
                    </li>
                ))}
            </ul>
        </nav>
    )
}
