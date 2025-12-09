# SehatScan AI - Component Documentation

This document describes all the modular components used in the landing page.

## Component Architecture

The landing page is built using a modular component architecture, making it easy to maintain, update, and reuse components across the application.

## Components Overview

### 1. Navbar (`components/Navbar.tsx`)

**Purpose**: Fixed navigation bar with responsive mobile menu

**Features**:

- Fixed positioning with backdrop blur effect
- Logo with hover animation
- Desktop navigation links
- Mobile hamburger menu
- CTA buttons (Sign In, Get Started)
- Smooth transitions and hover effects

**Props**: None (self-contained)

**Usage**:

```tsx
import Navbar from "./components/Navbar";
<Navbar />;
```

---

### 2. HeroSection (`components/HeroSection.tsx`)

**Purpose**: Main hero section with headline, CTA, and floating cards

**Features**:

- Large headline with gradient text
- Descriptive subtitle
- Primary and secondary CTA buttons
- Trust badges showing technology stack
- Floating card animation with health metrics visualization
- Animated floating avatars
- Responsive grid layout

**Props**: None

**Usage**:

```tsx
import HeroSection from "./components/HeroSection";
<HeroSection />;
```

---

### 3. TechBanner (`components/TechBanner.tsx`)

**Purpose**: Banner section highlighting technology stack

**Features**:

- Centered headline
- Descriptive text about technologies
- Clean, minimal design
- Border separators

**Props**: None

**Usage**:

```tsx
import TechBanner from "./components/TechBanner";
<TechBanner />;
```

---

### 4. FeaturesGrid (`components/FeaturesGrid.tsx`)

**Purpose**: Grid of feature cards with interactive elements

**Features**:

- Three feature cards: Dynamic Dashboard, Smart Notifications, Task Management
- Interactive visualizations (charts, toggles, checkboxes)
- Hover effects with shadow and scale
- Icon animations
- Responsive grid layout

**Props**: None (features defined internally)

**Customization**:
Edit the `features` array to add/modify features:

```tsx
const features = [
  {
    title: "Feature Name",
    description: "Feature description",
    icon: <svg>...</svg>,
    // Additional properties for visualization
  },
];
```

**Usage**:

```tsx
import FeaturesGrid from "./components/FeaturesGrid";
<FeaturesGrid />;
```

---

### 5. IntegrationsSection (`components/IntegrationsSection.tsx`)

**Purpose**: Showcase technology integrations and partnerships

**Features**:

- Dark gradient background with pattern overlay
- Grid of integration cards with icons
- Hover effects with scale and glow
- Additional technology badges
- Responsive grid (3-4-6 columns)

**Props**: None

**Customization**:
Edit the `integrations` array:

```tsx
const integrations = [{ name: "Technology Name", icon: "🔷" }];
```

**Usage**:

```tsx
import IntegrationsSection from "./components/IntegrationsSection";
<IntegrationsSection />;
```

---

### 6. TestimonialSection (`components/TestimonialSection.tsx`)

**Purpose**: Display customer testimonial

**Features**:

- Large quote icon
- Blockquote with testimonial text
- Customer avatar and details
- Centered layout

**Props**: None

**Customization**:
Replace the testimonial text and customer details directly in the component.

**Usage**:

```tsx
import TestimonialSection from "./components/TestimonialSection";
<TestimonialSection />;
```

---

### 7. StatsSection (`components/StatsSection.tsx`)

**Purpose**: Display key statistics and metrics

**Features**:

- Three-column grid
- Large numbers with labels
- Responsive layout

**Props**: None

**Customization**:
Edit the `stats` array:

```tsx
const stats = [
  { year: "2021", label: "Founded" },
  { number: "50K+", label: "Reports Analyzed" },
];
```

**Usage**:

```tsx
import StatsSection from "./components/StatsSection";
<StatsSection />;
```

---

### 8. CTASection (`components/CTASection.tsx`)

**Purpose**: Call-to-action section with buttons

**Features**:

- Dark gradient background
- Glowing background effect
- Large headline
- Two CTA buttons (primary and accent)
- Centered layout

**Props**: None

**Usage**:

```tsx
import CTASection from "./components/CTASection";
<CTASection />;
```

---

### 9. Footer (`components/Footer.tsx`)

**Purpose**: Site footer with links and information

**Features**:

- Four-column layout (brand + 3 link sections)
- Social media icons
- Newsletter signup area
- Bottom bar with copyright and legal links
- Responsive grid

**Props**: None

**Customization**:
Edit the `footerSections` array to modify link sections.

**Usage**:

```tsx
import Footer from "./components/Footer";
<Footer />;
```

---

## Styling System

### Colors

- **Primary**: `#037BFC` (Blue)
- **Primary Dark**: `#0260c9`
- **Primary Light**: `#3d9dfd`
- **Accent**: `#C8FF00` (Lime Green)

### Animations

All animations are defined in `globals.css`:

1. **fadeInUp**: Fade in with upward motion
2. **float**: Continuous floating motion
3. **pulse-glow**: Pulsing glow effect

Usage:

```tsx
<div className="animate-fade-in-up">Content</div>
<div className="animate-float">Content</div>
<div className="animate-pulse-glow">Content</div>
```

### Responsive Breakpoints

- **sm**: 640px
- **md**: 768px
- **lg**: 1024px
- **xl**: 1280px

## Best Practices

1. **Component Isolation**: Each component is self-contained and can be used independently
2. **Responsive Design**: All components are mobile-first and responsive
3. **Accessibility**: Semantic HTML and ARIA labels where needed
4. **Performance**: Optimized with Next.js Image component and lazy loading
5. **Maintainability**: Clear component structure with inline documentation

## Adding New Components

1. Create a new file in `app/components/`
2. Export a default function component
3. Import and use in `page.tsx`
4. Document in this file

Example:

```tsx
// app/components/NewSection.tsx
export default function NewSection() {
  return <section className="py-20">{/* Your content */}</section>;
}

// app/page.tsx
import NewSection from "./components/NewSection";
<NewSection />;
```

## Troubleshooting

### Component Not Rendering

- Check import path
- Ensure component is exported as default
- Verify no TypeScript errors

### Styling Issues

- Check Tailwind class names
- Verify custom CSS in globals.css
- Check responsive breakpoints

### Animation Not Working

- Ensure animation is defined in globals.css
- Check class name spelling
- Verify no conflicting styles
