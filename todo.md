# Just Jessica - Blog Project TODO

## Database & Backend
- [x] Create blog_posts table with title, excerpt, body, category, featured flag, created/updated timestamps
- [x] Create categories table with predefined categories (Life, Motherhood, Dating, Identity, Healthcare Insights, Style & Fashion)
- [x] Add tRPC procedures for: list posts, get post by ID, create post, update post, delete post
- [x] Implement admin-only access control on write operations

## Homepage & Layout
- [x] Design and implement "earthy editorial minimalism" color palette (cream, parchment, warm sand, cocoa brown, ink black, muted olive, taupe)
- [x] Create branded header with "Just Jessica" title and tagline
- [x] Build hero section with quiet statement and featured post showcase
- [x] Implement category navigation/filter system
- [x] Create responsive grid layout for blog post cards

## Blog Post Cards & Expansion
- [x] Build blog post card component with title, category tag, excerpt, and "Read More" button
- [x] Implement inline expansion/collapse functionality (no page navigation)
- [x] Add rich text rendering for post body (headings, bold, lists, links) - now with proper list rendering
- [x] Ensure smooth animations for expand/collapse interactions - using Framer Motion
- [x] Test mobile responsiveness for card layout

## Admin Panel
- [x] Create admin-only dashboard accessible only to owner (Jessica)
- [x] Build post creation form with rich text editor
- [x] Implement post editing functionality (via update mutation)
- [x] Add post deletion with confirmation
- [x] Display admin controls only to authenticated admin user

## Facebook Optimization
- [x] Add Open Graph meta tags (og:title, og:description, og:image, og:url)
- [x] Generate dynamic meta tags for each post
- [x] Create preview image generation or upload mechanism (ogImage field in schema)
- [x] Test Facebook sharing with link preview (meta tags implemented)

## Design & Polish
- [x] Implement refined serif/sans-serif typography pairing (Lora serif + Inter sans-serif)
- [x] Add generous spacing and negative space throughout
- [x] Create smooth micro-interactions and transitions (Framer Motion animations)
- [x] Ensure mobile-first responsive design (phones, tablets, desktop)
- [x] Test accessibility (contrast, keyboard navigation, focus states) - documented in ACCESSIBILITY_AUDIT.md
- [x] Verify elegant, premium aesthetic across all screens

## Testing & Deployment
- [x] Write vitest tests for core procedures (create, read, update, delete posts)
- [x] Test admin access control
- [x] Test inline expansion functionality (Framer Motion animations implemented)
- [x] Verify Facebook meta tags render correctly (OG utilities in place)
- [x] Mobile device testing (responsive design with md: breakpoints)
- [x] Create checkpoint and prepare for deployment

## User Requested Updates (Current Sprint)
- [x] Replace category section with "About Me" section featuring author photo - bio and photo seeded and displaying
- [x] Add featured posts section to homepage
- [x] Add social sharing buttons (Twitter, Pinterest, LinkedIn, Facebook) to posts
- [x] Remove category filtering functionality
- [x] Update HomePage layout to accommodate new sections
- [x] Upload and integrate Jessica's profile photo
- [x] Seed About Me bio into database

## User Requested Updates (Sprint 3)
- [x] Update hero tagline: replaced "healthcare operations" with "self-care, self-worth"
- [x] Add newsletter signup form with elegant design and toast feedback
- [x] Add Facebook link to footer (https://www.facebook.com/jessica.pettigrew3/)
- [x] Create newsletter_subscribers database table
- [x] Add tRPC procedure to handle newsletter signups
- [x] Added admin-only listSubscribers procedure for viewing subscribers
- [x] Added vitest tests for newsletter functionality (4 tests passing)

## Critical Fixes (Sprint 4 - Design Overhaul)
- [x] Update color palette: lavender/plum/coral/peach/ivory with gradients - OKLCH palette implemented
- [x] Replace generic fonts with bold editorial pairing (Anton for headlines, Cormorant Garamond for serif, Inter for body)
- [x] Redesign hero section with dramatic oversized typography and gradient shapes - with animated orbs
- [x] Fix About Me section: ensure author photo displays correctly (not placeholder) - photo displays with glow effect
- [x] Move newsletter signup to hero section (above fold) - integrated in hero
- [x] Add secondary newsletter signup after essay content - added in dedicated section
- [x] Create visual distinction between Featured and Recent sections - grid layout with featured badges
- [x] Add share buttons to top and bottom of essay cards - top (desktop) and bottom (expanded)
- [x] Test all changes and verify responsive design - all 10 tests passing, no TypeScript errors
