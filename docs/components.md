# UI Components Guide

This document provides comprehensive documentation of SehatScan's UI component library, design system, and styling patterns.

---

## Table of Contents

1. [Design System Overview](#design-system-overview)
2. [Color Palette](#color-palette)
3. [Typography](#typography)
4. [Layout Components](#layout-components)
5. [Navigation Components](#navigation-components)
6. [Form Components](#form-components)
7. [Data Display Components](#data-display-components)
8. [Feedback Components](#feedback-components)
9. [Dashboard Components](#dashboard-components)
10. [Utility Components](#utility-components)
11. [Styling Patterns](#styling-patterns)

---

## Design System Overview

### Technology Stack

| Technology | Version | Purpose |
|------------|---------|---------|
| Tailwind CSS | 4.x | Utility-first CSS framework |
| Heroicons | 2.2.0 | Icon library |
| Headless UI | 2.2.9 | Accessible UI primitives |
| Recharts | 3.5.1 | Chart components |
| React Hot Toast | Latest | Toast notifications |

### Design Principles

1. **Consistency**: Unified visual language across all pages
2. **Accessibility**: WCAG 2.1 AA compliant components
3. **Responsiveness**: Mobile-first approach
4. **Performance**: Optimized for fast load times
5. **Dark Mode**: Full support for light and dark themes

---

## Color Palette

### CSS Custom Properties

```css
/* globals.css */

:root {
  /* Background Colors */
  --color-bg: #f8fafc;
  --color-surface: #ffffff;
  --color-card: #ffffff;

  /* Primary Colors */
  --color-primary: #3b82f6;
  --color-primary-soft: #93c5fd;
  --color-primary-dark: #1e40af;

  /* Text Colors */
  --color-foreground: #1e293b;
  --color-heading: #0f172a;
  --color-subtle: #64748b;
  --color-muted: #94a3b8;

  /* Status Colors */
  --color-success: #22c55e;
  --color-warning: #eab308;
  --color-danger: #ef4444;
  --color-info: #3b82f6;

  /* Border Colors */
  --color-border: #e2e8f0;
  --color-border-light: #f1f5f9;
}

.dark {
  /* Dark Mode Overrides */
  --color-bg: #0f172a;
  --color-surface: #1e293b;
  --color-card: #1e293b;

  --color-foreground: #f1f5f9;
  --color-heading: #ffffff;
  --color-subtle: #94a3b8;
  --color-muted: #64748b;

  --color-border: #334155;
  --color-border-light: #1e293b;
}
```

### Semantic Color Usage

| Color | CSS Variable | Usage |
|-------|--------------|-------|
| Primary | `--color-primary` | Buttons, links, accents |
| Success | `--color-success` | Normal status, success messages |
| Warning | `--color-warning` | Low/moderate status, warnings |
| Danger | `--color-danger` | High/critical status, errors |
| Info | `--color-info` | Information, tips |

### Status Color Mapping

```typescript
const statusColors = {
  normal: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
  low: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
  high: 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200',
  critical: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
}
```

---

## Typography

### Font Families

```css
/* globals.css */

:root {
  --font-sans: 'Inter', system-ui, sans-serif;
  --font-heading: 'Poppins', system-ui, sans-serif;
  --font-urdu: 'Noto Nastaliq Urdu', serif;
  --font-mono: 'Fira Code', monospace;
}
```

### Font Loading

```typescript
// app/layout.tsx
import { Inter, Poppins } from 'next/font/google'

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter'
})

const poppins = Poppins({
  weight: ['400', '500', '600', '700'],
  subsets: ['latin'],
  variable: '--font-poppins'
})
```

### Typography Scale

```css
/* Heading sizes */
.heading-1 { @apply text-4xl font-bold font-heading; }
.heading-2 { @apply text-3xl font-semibold font-heading; }
.heading-3 { @apply text-2xl font-semibold font-heading; }
.heading-4 { @apply text-xl font-medium font-heading; }

/* Body text */
.body-large { @apply text-lg; }
.body { @apply text-base; }
.body-small { @apply text-sm; }
.caption { @apply text-xs text-subtle; }
```

---

## Layout Components

### PageContainer

Wrapper for page content with consistent spacing.

```typescript
// Usage
function DashboardPage() {
  return (
    <div className={dashboardStyles.pageContainer}>
      <div className={dashboardStyles.contentWidth}>
        {/* Page content */}
      </div>
    </div>
  )
}

// Style definition
const dashboardStyles = {
  pageContainer: 'min-h-screen bg-gray-50 dark:bg-gray-900 py-8',
  contentWidth: 'max-w-7xl mx-auto px-4 sm:px-6 lg:px-8'
}
```

### Card

Container component for grouped content.

```typescript
interface CardProps {
  children: React.ReactNode
  className?: string
  padding?: 'none' | 'sm' | 'md' | 'lg'
}

function Card({ children, className = '', padding = 'md' }: CardProps) {
  const paddingClasses = {
    none: '',
    sm: 'p-4',
    md: 'p-6',
    lg: 'p-8'
  }

  return (
    <div className={`
      bg-white dark:bg-gray-800
      rounded-xl shadow-sm
      border border-gray-200 dark:border-gray-700
      ${paddingClasses[padding]}
      ${className}
    `}>
      {children}
    </div>
  )
}
```

### Grid Layouts

```typescript
// Two column layout
<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
  <Card>Left content</Card>
  <Card>Right content</Card>
</div>

// Three column layout
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
  <Card>Column 1</Card>
  <Card>Column 2</Card>
  <Card>Column 3</Card>
</div>

// Stats grid (4 columns)
<div className="grid grid-cols-2 md:grid-cols-4 gap-4">
  <StatCard title="Total" value={42} />
  <StatCard title="Reports" value={15} />
  <StatCard title="Faces" value={20} />
  <StatCard title="Risks" value={7} />
</div>
```

---

## Navigation Components

### Navbar

Main navigation bar for the landing page.

```typescript
// app/components/Navbar.tsx
'use client'

import Link from 'next/link'
import { useState } from 'react'
import { Bars3Icon, XMarkIcon } from '@heroicons/react/24/outline'

export function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)

  return (
    <nav className="bg-white dark:bg-gray-900 shadow-sm sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          {/* Logo */}
          <div className="flex items-center">
            <Link href="/" className="text-xl font-bold text-primary">
              SehatScan
            </Link>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            <Link href="#features" className="nav-link">Features</Link>
            <Link href="#how-it-works" className="nav-link">How It Works</Link>
            <Link href="/dashboard" className="btn-primary">Get Started</Link>
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden flex items-center">
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="p-2 rounded-md"
            >
              {isMenuOpen ? (
                <XMarkIcon className="h-6 w-6" />
              ) : (
                <Bars3Icon className="h-6 w-6" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {isMenuOpen && (
        <div className="md:hidden bg-white dark:bg-gray-900 border-t">
          <div className="px-4 py-4 space-y-4">
            <Link href="#features" className="block nav-link">Features</Link>
            <Link href="#how-it-works" className="block nav-link">How It Works</Link>
            <Link href="/dashboard" className="block btn-primary text-center">
              Get Started
            </Link>
          </div>
        </div>
      )}
    </nav>
  )
}
```

### Dashboard Sidebar

Navigation sidebar for the dashboard.

```typescript
// Sidebar navigation items
const sidebarItems = [
  { name: 'Dashboard', href: '/dashboard', icon: HomeIcon },
  { name: 'Scan Report', href: '/dashboard/scan-report', icon: DocumentTextIcon },
  { name: 'Scan Face', href: '/dashboard/scan-face', icon: UserCircleIcon },
  { name: 'Risk Assessment', href: '/dashboard/risk-assessment', icon: ShieldExclamationIcon },
  { name: 'AI Assistant', href: '/dashboard/chatbot', icon: ChatBubbleLeftRightIcon },
  { name: 'History', href: '/dashboard/history', icon: ClockIcon },
  { name: 'Settings', href: '/dashboard/settings', icon: Cog6ToothIcon },
]

function DashboardSidebar() {
  const pathname = usePathname()

  return (
    <aside className="w-64 bg-white dark:bg-gray-800 border-r h-screen sticky top-0">
      <div className="p-4">
        <Link href="/dashboard" className="text-xl font-bold">
          SehatScan
        </Link>
      </div>

      <nav className="mt-4">
        {sidebarItems.map((item) => {
          const isActive = pathname === item.href

          return (
            <Link
              key={item.name}
              href={item.href}
              className={`
                flex items-center px-4 py-3 text-sm
                ${isActive
                  ? 'bg-primary/10 text-primary border-r-2 border-primary'
                  : 'text-gray-600 hover:bg-gray-50'
                }
              `}
            >
              <item.icon className="h-5 w-5 mr-3" />
              {item.name}
            </Link>
          )
        })}
      </nav>
    </aside>
  )
}
```

---

## Form Components

### FileUpload

Drag-and-drop file upload component.

```typescript
interface FileUploadProps {
  accept: string
  maxSize: number
  onFileSelect: (file: File) => void
  label?: string
  description?: string
}

function FileUpload({
  accept,
  maxSize,
  onFileSelect,
  label = 'Upload a file',
  description = 'Drag and drop or click to browse'
}: FileUploadProps) {
  const [isDragging, setIsDragging] = useState(false)
  const [preview, setPreview] = useState<string | null>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)

    const file = e.dataTransfer.files[0]
    if (file) handleFile(file)
  }

  const handleFile = (file: File) => {
    // Validate file
    if (file.size > maxSize) {
      toast.error(`File too large. Maximum size is ${maxSize / 1024 / 1024}MB`)
      return
    }

    // Create preview for images
    if (file.type.startsWith('image/')) {
      const reader = new FileReader()
      reader.onload = () => setPreview(reader.result as string)
      reader.readAsDataURL(file)
    }

    onFileSelect(file)
  }

  return (
    <div
      onDragOver={(e) => { e.preventDefault(); setIsDragging(true) }}
      onDragLeave={() => setIsDragging(false)}
      onDrop={handleDrop}
      onClick={() => inputRef.current?.click()}
      className={`
        border-2 border-dashed rounded-xl p-8
        cursor-pointer transition-all
        ${isDragging
          ? 'border-primary bg-primary/5'
          : 'border-gray-300 hover:border-primary/50'
        }
      `}
    >
      <input
        ref={inputRef}
        type="file"
        accept={accept}
        onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])}
        className="hidden"
      />

      {preview ? (
        <div className="relative">
          <img src={preview} alt="Preview" className="max-h-64 mx-auto rounded" />
          <button
            onClick={(e) => { e.stopPropagation(); setPreview(null) }}
            className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-full"
          >
            <XMarkIcon className="h-4 w-4" />
          </button>
        </div>
      ) : (
        <div className="text-center">
          <CloudArrowUpIcon className="h-12 w-12 mx-auto text-gray-400" />
          <p className="mt-2 font-medium">{label}</p>
          <p className="text-sm text-gray-500">{description}</p>
        </div>
      )}
    </div>
  )
}
```

### Button

Button component with variants.

```typescript
interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger'
  size?: 'sm' | 'md' | 'lg'
  isLoading?: boolean
  leftIcon?: React.ReactNode
  rightIcon?: React.ReactNode
}

function Button({
  children,
  variant = 'primary',
  size = 'md',
  isLoading = false,
  leftIcon,
  rightIcon,
  className = '',
  disabled,
  ...props
}: ButtonProps) {
  const baseStyles = 'inline-flex items-center justify-center font-medium rounded-lg transition-all'

  const variants = {
    primary: 'bg-primary text-white hover:bg-primary-dark',
    secondary: 'bg-gray-100 text-gray-900 hover:bg-gray-200',
    outline: 'border border-gray-300 text-gray-700 hover:bg-gray-50',
    ghost: 'text-gray-600 hover:bg-gray-100',
    danger: 'bg-red-500 text-white hover:bg-red-600'
  }

  const sizes = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-4 py-2 text-sm',
    lg: 'px-6 py-3 text-base'
  }

  return (
    <button
      className={`
        ${baseStyles}
        ${variants[variant]}
        ${sizes[size]}
        ${disabled || isLoading ? 'opacity-50 cursor-not-allowed' : ''}
        ${className}
      `}
      disabled={disabled || isLoading}
      {...props}
    >
      {isLoading && <Spinner className="mr-2 h-4 w-4" />}
      {!isLoading && leftIcon && <span className="mr-2">{leftIcon}</span>}
      {children}
      {rightIcon && <span className="ml-2">{rightIcon}</span>}
    </button>
  )
}
```

### Input

Text input component.

```typescript
interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string
  error?: string
  helperText?: string
}

function Input({
  label,
  error,
  helperText,
  className = '',
  ...props
}: InputProps) {
  return (
    <div className="space-y-1">
      {label && (
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
          {label}
        </label>
      )}

      <input
        className={`
          w-full px-3 py-2 rounded-lg
          border border-gray-300 dark:border-gray-600
          bg-white dark:bg-gray-800
          text-gray-900 dark:text-white
          focus:ring-2 focus:ring-primary focus:border-transparent
          ${error ? 'border-red-500 focus:ring-red-500' : ''}
          ${className}
        `}
        {...props}
      />

      {error && (
        <p className="text-sm text-red-500">{error}</p>
      )}
      {helperText && !error && (
        <p className="text-sm text-gray-500">{helperText}</p>
      )}
    </div>
  )
}
```

---

## Data Display Components

### StatCard

Statistics display card.

```typescript
interface StatCardProps {
  title: string
  value: number | string
  icon?: React.ReactNode
  change?: number
  changeLabel?: string
}

function StatCard({ title, value, icon, change, changeLabel }: StatCardProps) {
  return (
    <Card className="flex items-center justify-between">
      <div>
        <p className="text-sm text-gray-500 dark:text-gray-400">{title}</p>
        <p className="text-2xl font-bold mt-1">{value}</p>
        {change !== undefined && (
          <p className={`text-sm mt-1 ${change >= 0 ? 'text-green-500' : 'text-red-500'}`}>
            {change >= 0 ? '+' : ''}{change}% {changeLabel}
          </p>
        )}
      </div>
      {icon && (
        <div className="p-3 bg-primary/10 rounded-full">
          {icon}
        </div>
      )}
    </Card>
  )
}
```

### StatusBadge

Status indicator badge.

```typescript
interface StatusBadgeProps {
  status: 'normal' | 'low' | 'high' | 'critical'
  label?: string
}

function StatusBadge({ status, label }: StatusBadgeProps) {
  const styles = {
    normal: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
    low: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
    high: 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200',
    critical: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
  }

  const defaultLabels = {
    normal: 'Normal',
    low: 'Low',
    high: 'High',
    critical: 'Critical'
  }

  return (
    <span className={`
      inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium
      ${styles[status]}
    `}>
      {label || defaultLabels[status]}
    </span>
  )
}
```

### MetricRow

Display row for health metrics.

```typescript
interface MetricRowProps {
  name: string
  value: string
  unit: string
  status: 'normal' | 'low' | 'high' | 'critical'
  referenceRange?: string
}

function MetricRow({ name, value, unit, status, referenceRange }: MetricRowProps) {
  return (
    <div className="flex items-center justify-between py-3 border-b last:border-0">
      <div>
        <p className="font-medium">{name}</p>
        {referenceRange && (
          <p className="text-xs text-gray-500">Reference: {referenceRange}</p>
        )}
      </div>
      <div className="flex items-center space-x-3">
        <span className="font-mono">
          {value} <span className="text-gray-500">{unit}</span>
        </span>
        <StatusBadge status={status} />
      </div>
    </div>
  )
}
```

### ProgressBar

Visual progress indicator.

```typescript
interface ProgressBarProps {
  value: number
  max?: number
  label?: string
  showPercentage?: boolean
  color?: 'primary' | 'success' | 'warning' | 'danger'
}

function ProgressBar({
  value,
  max = 100,
  label,
  showPercentage = true,
  color = 'primary'
}: ProgressBarProps) {
  const percentage = Math.min(100, (value / max) * 100)

  const colors = {
    primary: 'bg-primary',
    success: 'bg-green-500',
    warning: 'bg-yellow-500',
    danger: 'bg-red-500'
  }

  return (
    <div>
      {(label || showPercentage) && (
        <div className="flex justify-between text-sm mb-1">
          {label && <span>{label}</span>}
          {showPercentage && <span>{percentage.toFixed(0)}%</span>}
        </div>
      )}
      <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
        <div
          className={`h-full ${colors[color]} transition-all duration-300`}
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  )
}
```

---

## Feedback Components

### Toast Notifications

Using React Hot Toast for notifications.

```typescript
// lib/toast.ts
import toast from 'react-hot-toast'

export const showToast = {
  success: (message: string) => toast.success(message),
  error: (message: string) => toast.error(message),
  loading: (message: string) => toast.loading(message),
  custom: (message: string) => toast(message)
}

// Usage
showToast.success('Analysis complete!')
showToast.error('Upload failed. Please try again.')
```

### Loading Spinner

```typescript
interface SpinnerProps {
  size?: 'sm' | 'md' | 'lg'
  className?: string
}

function Spinner({ size = 'md', className = '' }: SpinnerProps) {
  const sizes = {
    sm: 'h-4 w-4',
    md: 'h-6 w-6',
    lg: 'h-8 w-8'
  }

  return (
    <svg
      className={`animate-spin ${sizes[size]} ${className}`}
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
    >
      <circle
        className="opacity-25"
        cx="12"
        cy="12"
        r="10"
        stroke="currentColor"
        strokeWidth="4"
      />
      <path
        className="opacity-75"
        fill="currentColor"
        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
      />
    </svg>
  )
}
```

### Alert

Alert/notification box.

```typescript
interface AlertProps {
  type: 'info' | 'success' | 'warning' | 'error'
  title?: string
  children: React.ReactNode
  onClose?: () => void
}

function Alert({ type, title, children, onClose }: AlertProps) {
  const styles = {
    info: 'bg-blue-50 text-blue-800 border-blue-200',
    success: 'bg-green-50 text-green-800 border-green-200',
    warning: 'bg-yellow-50 text-yellow-800 border-yellow-200',
    error: 'bg-red-50 text-red-800 border-red-200'
  }

  const icons = {
    info: InformationCircleIcon,
    success: CheckCircleIcon,
    warning: ExclamationTriangleIcon,
    error: XCircleIcon
  }

  const Icon = icons[type]

  return (
    <div className={`rounded-lg border p-4 ${styles[type]}`}>
      <div className="flex">
        <Icon className="h-5 w-5 mr-3 flex-shrink-0" />
        <div className="flex-1">
          {title && <p className="font-medium">{title}</p>}
          <div className={title ? 'mt-1' : ''}>{children}</div>
        </div>
        {onClose && (
          <button onClick={onClose} className="ml-3">
            <XMarkIcon className="h-5 w-5" />
          </button>
        )}
      </div>
    </div>
  )
}
```

---

## Dashboard Components

### Dashboard Styles

Centralized style definitions.

```typescript
// app/dashboard/dashboardStyles.ts

export const dashboardStyles = {
  // Layout
  pageContainer: 'min-h-screen bg-gray-50 dark:bg-gray-900',
  contentWidth: 'max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8',
  fullWidthSection: 'w-full',

  // Typography
  heading: 'text-2xl font-bold text-gray-900 dark:text-white',
  subheading: 'text-lg font-medium text-gray-700 dark:text-gray-300',
  sectionTitle: 'text-xl font-semibold text-gray-800 dark:text-gray-200',

  // Buttons
  primaryButton: `
    inline-flex items-center justify-center
    px-4 py-2 rounded-lg
    bg-primary text-white
    hover:bg-primary-dark
    transition-colors
  `,
  secondaryButton: `
    inline-flex items-center justify-center
    px-4 py-2 rounded-lg
    bg-gray-100 text-gray-700
    hover:bg-gray-200
    dark:bg-gray-800 dark:text-gray-300
    transition-colors
  `,

  // Cards
  card: `
    bg-white dark:bg-gray-800
    rounded-xl shadow-sm
    border border-gray-200 dark:border-gray-700
    p-6
  `,

  // Pills/Chips
  pill: 'inline-flex items-center px-3 py-1 rounded-full text-sm',
  chip: 'inline-flex items-center px-2 py-0.5 rounded text-xs',

  // Text
  mutedText: 'text-gray-500 dark:text-gray-400',

  // Status colors
  statusNormal: 'text-green-600 bg-green-100',
  statusLow: 'text-yellow-600 bg-yellow-100',
  statusHigh: 'text-orange-600 bg-orange-100',
  statusCritical: 'text-red-600 bg-red-100',
}
```

---

## Utility Components

### ThemeToggle

Dark/light mode toggle.

```typescript
'use client'

import { useTheme } from 'next-themes'
import { SunIcon, MoonIcon } from '@heroicons/react/24/outline'

export function ThemeToggle() {
  const { theme, setTheme } = useTheme()

  return (
    <button
      onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
      className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800"
      aria-label="Toggle theme"
    >
      {theme === 'dark' ? (
        <SunIcon className="h-5 w-5" />
      ) : (
        <MoonIcon className="h-5 w-5" />
      )}
    </button>
  )
}
```

### LanguageSelector

Multi-language support selector.

```typescript
'use client'

import { useLanguage } from '@/app/components/SimpleLanguageContext'

const languages = [
  { code: 'en', name: 'English' },
  { code: 'ur', name: 'اردو' }
]

export function LanguageSelector() {
  const { language, setLanguage } = useLanguage()

  return (
    <select
      value={language}
      onChange={(e) => setLanguage(e.target.value)}
      className="px-3 py-2 rounded-lg border bg-white dark:bg-gray-800"
    >
      {languages.map((lang) => (
        <option key={lang.code} value={lang.code}>
          {lang.name}
        </option>
      ))}
    </select>
  )
}
```

---

## Styling Patterns

### Responsive Design

```typescript
// Mobile-first approach
<div className="
  px-4              // Mobile: 16px padding
  sm:px-6           // Tablet: 24px padding
  lg:px-8           // Desktop: 32px padding
">

// Responsive grid
<div className="
  grid
  grid-cols-1       // Mobile: single column
  md:grid-cols-2    // Tablet: two columns
  lg:grid-cols-3    // Desktop: three columns
  gap-6
">
```

### Dark Mode

```typescript
// Dark mode classes
<div className="
  bg-white          // Light mode
  dark:bg-gray-800  // Dark mode
  text-gray-900
  dark:text-white
">

// Conditional dark mode
<div className={isDark ? 'bg-gray-800' : 'bg-white'}>
```

### Animation

```typescript
// Transition utilities
<button className="
  transition-colors
  duration-200
  hover:bg-primary-dark
">

// Custom animations in globals.css
@keyframes fadeIn {
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
}

.animate-fadeIn {
  animation: fadeIn 0.3s ease-out;
}
```

### Focus States

```typescript
// Accessible focus states
<button className="
  focus:outline-none
  focus:ring-2
  focus:ring-primary
  focus:ring-offset-2
">

<input className="
  focus:ring-2
  focus:ring-primary
  focus:border-transparent
">
```

---

## Best Practices

### 1. Use Semantic HTML

```typescript
// Good
<nav>...</nav>
<main>...</main>
<article>...</article>
<section>...</section>

// Avoid
<div className="nav">...</div>
<div className="main">...</div>
```

### 2. Accessible Components

```typescript
// Include ARIA attributes
<button aria-label="Close menu" aria-expanded={isOpen}>

// Use proper heading hierarchy
<h1>Page Title</h1>
<h2>Section Title</h2>
<h3>Subsection Title</h3>
```

### 3. Consistent Spacing

```typescript
// Use Tailwind's spacing scale consistently
// 4 = 16px, 6 = 24px, 8 = 32px
<div className="p-4 md:p-6 lg:p-8">
<div className="space-y-4">
<div className="gap-6">
```

### 4. Component Composition

```typescript
// Compose smaller components
<Card>
  <CardHeader>
    <CardTitle>Title</CardTitle>
  </CardHeader>
  <CardContent>
    Content here
  </CardContent>
  <CardFooter>
    <Button>Action</Button>
  </CardFooter>
</Card>
```
