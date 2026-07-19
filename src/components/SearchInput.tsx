interface SearchInputProps {
  value?: string
  onChange?: (value: string) => void
  onSearch?: (query: string) => void
  placeholder?: string
  className?: string
}

export function SearchInput({
  value = '',
  onChange,
  onSearch,
  placeholder = 'Search models...',
  className = '',
}: SearchInputProps) {
  const handleChange = (newValue: string) => {
    onChange?.(newValue)
    onSearch?.(newValue)
  }

  const currentValue = value

  return (
    <div className={`relative w-full ${className}`}>
      <div className="relative">
        <input
          type="text"
          value={currentValue}
          onChange={(e) => handleChange(e.target.value)}
          placeholder={placeholder}
          className="w-full rounded-lg border border-line bg-surface px-4 py-2.5 text-fg placeholder-fg-muted transition-colors duration-150 focus:border-line-strong focus:outline-none focus:ring-2 focus:ring-accent-deep/20"
          aria-label="Search models"
        />
        {currentValue && (
          <button
            type="button"
            onClick={() => handleChange('')}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-fg-muted hover:text-fg transition-colors duration-150 p-1"
            aria-label="Clear search"
            title="Clear search"
          >
            <svg
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        )}
      </div>
    </div>
  )
}
