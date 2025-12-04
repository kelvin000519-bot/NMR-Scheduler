# NMR Scheduler - Design Guidelines

## Design Approach
**System Selected:** Material Design 3 / Ant Design Hybrid  
**Rationale:** Scientific/academic application requiring data-dense layouts, professional credibility, and clear information hierarchy. Design system approach ensures consistency across complex table structures and admin interfaces.

**Design Principles:**
- Functional clarity over decorative elements
- Data density without overwhelming users
- Institutional trust and professionalism
- Immediate information accessibility

---

## Typography

**Font Family:** 
- Primary: 'Inter' or 'Roboto' (Google Fonts)
- Monospace: 'Roboto Mono' for time displays

**Hierarchy:**
- Page Titles: text-2xl, font-semibold
- Section Headers: text-lg, font-medium
- Table Headers: text-sm, font-medium, uppercase tracking
- Body/Cells: text-sm, font-normal
- Time Labels: text-xs, font-mono
- Metadata: text-xs, font-normal

---

## Layout System

**Spacing Units:** Tailwind units 2, 4, 6, 8 (p-2, m-4, gap-6, p-8)

**Container Structure:**
- Header: Fixed top, full-width, h-16, px-8
- Main Content: max-w-7xl mx-auto, px-8, py-6
- Time Table Grid: Full width with horizontal scroll
- Sidebar (Admin): w-80, fixed right, h-screen

**Grid System:**
- Time table: CSS Grid with fixed column widths
- Admin dashboard: 2-column layout (lg:grid-cols-2)
- User cards: Single column stacked lists

---

## Core Components

### Navigation Bar
- Logo/Title left-aligned with institution branding
- Current date display (prominent, center-aligned)
- User profile dropdown right-aligned
- Admin badge indicator for admin users
- Logout button in dropdown

### Time Table Grid
- Sticky header row with date/column labels
- Sticky left column with time labels (00:00-23:50)
- Cell dimensions: h-8 minimum, full-width
- Hover states on available cells
- Reserved cells: Display username, distinct visual treatment
- Current time indicator: Horizontal line across grid
- 10-minute row intervals clearly delineated

### Reservation Modal
- Centered overlay (max-w-md)
- Title: "Reserve Time Slot"
- Time range display (bold)
- Name input field (if needed)
- Confirmation message showing 30-minute limit status
- Primary CTA: "Confirm Reservation"
- Secondary: "Cancel"

### Authentication Screens
**Login/Register Card:**
- Centered layout (max-w-sm)
- Minimal form design
- Input fields with clear labels
- Primary CTA button (full-width)
- Link to switch between login/register

**Approval Pending State:**
- Full-screen centered message
- Icon/illustration of pending status
- Clear messaging
- Contact information for support

### Admin Dashboard
**User Approval Section:**
- Table layout with user information
- Columns: Name, Email, Registration Date, Actions
- Approve/Reject buttons inline
- Search/filter functionality

**Reservation Management:**
- Calendar date picker for navigation
- List view of all reservations
- Ability to cancel any reservation
- User information display

---

## Component States

**Table Cells:**
- Available: Subtle border, hover effect
- Reserved: Filled treatment, username displayed
- User's own reservation: Distinct border/indicator
- Exceeds limit warning: Alert border treatment
- Disabled (past time): Muted appearance

**Buttons:**
- Primary: Solid fill, medium size (px-6 py-2.5)
- Secondary: Outlined, same size
- Danger (Cancel/Reject): Distinct treatment
- Icon buttons: p-2, circular or square

**Form Inputs:**
- Standard height: h-10
- Border treatment with focus states
- Error states with helper text below

---

## Page Layouts

### Main Scheduler View
- Full-width header (date, navigation, user info)
- Scrollable time table as primary content
- Legend/instructions in collapsible section (top-right)
- Today button for quick navigation

### Admin Dashboard
- Tabbed interface: "Pending Approvals" | "Manage Reservations" | "Users"
- Each tab: Dedicated layout optimized for task
- Action buttons prominent and accessible
- Statistics cards at top (total users, pending approvals, reservations today)

---

## Interactions

**Reservation Flow:**
1. Click available cell → immediate visual feedback
2. Modal appears with time confirmation
3. Submit → cell updates with username
4. Subsequent clicks for consecutive time: Limit counter visible

**Limit Enforcement:**
- Visual counter during multi-cell selection
- Alert dialog when attempting 4th cell
- Clear messaging about 30-minute maximum

**Animations:**
- Minimal: Focus on instant feedback
- Cell selection: Quick scale or border animation
- Modal entrance: Subtle fade-in
- Loading states: Simple spinner

---

## Accessibility

- Semantic table markup (`<table>`, `<th>`, `<td>`)
- ARIA labels for interactive cells
- Keyboard navigation support (arrow keys for table)
- Focus indicators on all interactive elements
- Color contrast ratios meeting WCAG AA standards
- Screen reader announcements for state changes

---

## Images

**Not applicable** - This is a data-focused utility application. No hero images or decorative imagery needed. Focus purely on functional clarity and information display.