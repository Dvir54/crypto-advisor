# Pages

This directory contains all the page-level components for the Crypto Advisor application.

## LoginPage

A beautiful, modern login page with form validation and error handling.

### Features

- **Form Fields:**
  - Email Address (required, valid email format)
  - Password (required)

- **Validation:**
  - Real-time client-side validation
  - Clear error messages for each field
  - Server error handling and display
  - Prevents submission with invalid data

- **UX Features:**
  - Modern gradient design matching SignupPage
  - Smooth animations and transitions
  - Loading states with spinner
  - Disabled state during submission
  - Forgot password link (placeholder for future implementation)
  - Responsive design for mobile devices
  - Accessible form with proper labels and ARIA attributes
  - Auto-focus on email field

- **Integration:**
  - Uses `useAuth` hook from AuthContext
  - Calls `login` function with validated credentials
  - Redirects to home page after successful login
  - Link to signup page for new users

### Usage

```tsx
import { LoginPage } from './pages';

// In your router
<Route path="/login" element={<LoginPage />} />
```

### Styling

The page uses the same purple gradient background as SignupPage for consistency. All styles are contained in `LoginPage.css` with modern design principles.

---

## DashboardPage

A protected dashboard page that displays user information and serves as the main landing page after authentication.

### Features

- **User Welcome**: Displays personalized greeting with user's name
- **User Information Display:**
  - Email address
  - Account status
  - Onboarding completion status
  - Member since date

- **Protected Content**: Only accessible to authenticated users
- **Logout Functionality**: Clean logout button with navigation to login page

- **UX Features:**
  - Modern card-based layout
  - Gradient background matching app theme
  - Responsive design for mobile devices
  - Smooth animations
  - Visual status indicators (completed/pending)

### Integration

- Protected by `ProtectedRoute` component
- Uses `useAuth` hook to access user data
- Automatic redirect if user is not authenticated

### Usage

```tsx
import { DashboardPage } from './pages';
import { ProtectedRoute } from './components';

// In your router (must be wrapped in ProtectedRoute)
<Route
  path="/dashboard"
  element={
    <ProtectedRoute>
      <DashboardPage />
    </ProtectedRoute>
  }
/>
```

### Styling

The page features a gradient background with a centered white card displaying user information. All styles are contained in `DashboardPage.css`.

---

## SignupPage

A beautiful, modern signup page with comprehensive form validation.

### Features

- **Form Fields:**
  - Full Name (required, min 2 characters)
  - Email Address (required, valid email format)
  - Password (required, min 6 characters)
  - Confirm Password (required, must match password)

- **Validation:**
  - Real-time client-side validation
  - Clear error messages for each field
  - Server error handling and display
  - Prevents submission with invalid data

- **UX Features:**
  - Modern gradient design
  - Smooth animations and transitions
  - Loading states with spinner
  - Disabled state during submission
  - Responsive design for mobile devices
  - Accessible form with proper labels and ARIA attributes

- **Integration:**
  - Uses `useAuth` hook from AuthContext
  - Calls `signup` function with validated credentials
  - Redirects to home page after successful signup
  - Link to login page for existing users

### Usage

```tsx
import { SignupPage } from './pages';

// In your router
<Route path="/signup" element={<SignupPage />} />
```

### Styling

The page uses a purple gradient background with a white card layout. All styles are contained in `SignupPage.css` and follow modern design principles with:
- Smooth transitions
- Focus states for accessibility
- Hover effects for interactive elements
- Responsive breakpoints for mobile

