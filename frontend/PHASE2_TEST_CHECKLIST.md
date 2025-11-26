# Phase 2: Authentication - Test Checklist

## Prerequisites

1. **Backend API Running**
   - Ensure backend API is running on `http://localhost:8080`
   - API base URL: `/api/doctor-manager-api/v1`
   - CORS configured for frontend origin

2. **Frontend Dev Server**
   - Dev server should be running (check terminal output)
   - Usually available at `http://localhost:5173`

---

## Test Cases

### 1. Registration Flow

#### Test 1.1: Valid Registration
- [ ] Navigate to `/register`
- [ ] Fill in form:
  - Username: `testuser` (3+ characters, alphanumeric + underscore)
  - Email: `test@example.com` (valid email format)
  - Password: `password123` (8+ characters)
  - Confirm Password: `password123` (matches password)
- [ ] Click "Register" button
- [ ] **Expected**: Success message, redirect to `/login`

#### Test 1.2: Registration Validation
- [ ] Try to register with:
  - Username < 3 characters → Should show error
  - Invalid email format → Should show error
  - Password < 8 characters → Should show error
  - Non-matching passwords → Should show error
  - Username with special characters (except _) → Should show error
- [ ] **Expected**: Appropriate validation errors displayed

#### Test 1.3: Duplicate Registration
- [ ] Try to register with existing username/email
- [ ] **Expected**: Error message about conflict

---

### 2. Login Flow

#### Test 2.1: Valid Login
- [ ] Navigate to `/login`
- [ ] Fill in form:
  - Identity: `testuser` (or `test@example.com`)
  - Password: `password123`
- [ ] Click "Login" button
- [ ] **Expected**: 
  - Success message
  - Redirect to `/dashboard`
  - Header shows username
  - Sidebar navigation visible

#### Test 2.2: Login Validation
- [ ] Try to login with:
  - Empty identity → Should show error
  - Empty password → Should show error
- [ ] **Expected**: Validation errors displayed

#### Test 2.3: Invalid Credentials
- [ ] Try to login with wrong password
- [ ] **Expected**: Error message about invalid credentials

#### Test 2.4: Non-existent User
- [ ] Try to login with non-existent username/email
- [ ] **Expected**: Error message (404 or invalid credentials)

---

### 3. Protected Routes

#### Test 3.1: Access Protected Route Without Auth
- [ ] Logout (if logged in)
- [ ] Try to access `/dashboard` directly
- [ ] **Expected**: Redirect to `/login` with return URL

#### Test 3.2: Access Protected Route After Login
- [ ] Login successfully
- [ ] Navigate to `/dashboard`
- [ ] **Expected**: Dashboard page loads correctly

#### Test 3.3: Redirect After Login
- [ ] Try to access `/dashboard` while logged out
- [ ] Login successfully
- [ ] **Expected**: Redirect back to `/dashboard` (not just `/dashboard`)

---

### 4. Profile Management

#### Test 4.1: View Profile
- [ ] Login successfully
- [ ] Click on user avatar/name in header
- [ ] Click "Profile" in dropdown
- [ ] **Expected**: 
  - Profile page loads at `/profile`
  - Shows current user info (username, email)
  - Form pre-filled with current data

#### Test 4.2: Update Profile
- [ ] Navigate to `/profile`
- [ ] Update:
  - First Name: `John`
  - Last Name: `Doe`
- [ ] Click "Update Profile"
- [ ] **Expected**: 
  - Success message
  - Profile updated
  - Changes persist after page refresh

#### Test 4.3: Profile Validation
- [ ] Try to update with:
  - First Name > 50 characters → Should show error
  - Last Name > 50 characters → Should show error
- [ ] **Expected**: Validation errors displayed

---

### 5. Token Management

#### Test 5.1: Token Persistence
- [ ] Login successfully
- [ ] Refresh the page (F5)
- [ ] **Expected**: 
  - Still logged in
  - User data persists
  - No redirect to login

#### Test 5.2: Token Refresh
- [ ] Login successfully
- [ ] Wait for token to expire (or check browser console for refresh attempts)
- [ ] Make an API call
- [ ] **Expected**: Token automatically refreshed, request succeeds

#### Test 5.3: Logout
- [ ] Login successfully
- [ ] Click on user avatar/name in header
- [ ] Click "Logout"
- [ ] **Expected**: 
  - Success message
  - Redirect to `/login`
  - Tokens cleared
  - Cannot access protected routes

---

### 6. Navigation

#### Test 6.1: Sidebar Navigation
- [ ] Login successfully
- [ ] Click "Dashboard" in sidebar
- [ ] **Expected**: Navigate to `/dashboard`

#### Test 6.2: Header Navigation
- [ ] Login successfully
- [ ] Click on user menu
- [ ] **Expected**: Dropdown shows Profile, Settings, Logout options

#### Test 6.3: Link Between Login/Register
- [ ] On login page, click "Register" link
- [ ] **Expected**: Navigate to `/register`
- [ ] On register page, click "Login" link
- [ ] **Expected**: Navigate to `/login`

---

### 7. Error Handling

#### Test 7.1: Network Error
- [ ] Stop backend server
- [ ] Try to login
- [ ] **Expected**: Network error message displayed

#### Test 7.2: API Error Messages
- [ ] Try various invalid operations
- [ ] **Expected**: User-friendly error messages displayed

#### Test 7.3: Token Expiration
- [ ] Login successfully
- [ ] Manually expire token (or wait)
- [ ] Try to access protected route
- [ ] **Expected**: 
  - Attempt to refresh token
  - If refresh fails, redirect to login

---

### 8. UI/UX

#### Test 8.1: Loading States
- [ ] Submit login form
- [ ] **Expected**: Button shows loading state during request

#### Test 8.2: Form Validation Feedback
- [ ] Interact with forms
- [ ] **Expected**: 
  - Real-time validation feedback
  - Error messages appear/disappear appropriately

#### Test 8.3: Responsive Design
- [ ] Test on different screen sizes
- [ ] **Expected**: Layout adapts appropriately

---

## Browser Console Checks

While testing, check browser console for:

- [ ] No JavaScript errors
- [ ] No React warnings
- [ ] API requests logged correctly
- [ ] Token refresh attempts logged (if applicable)

---

## Common Issues & Solutions

### Issue: CORS Error
**Solution**: Ensure backend CORS is configured for frontend origin

### Issue: 401 Unauthorized
**Solution**: Check if tokens are being sent correctly in headers

### Issue: Redirect Loop
**Solution**: Check ProtectedRoute logic and token validation

### Issue: Form Validation Not Working
**Solution**: Check Zod schema integration

---

## Test Results

Date: _______________
Tester: _______________

### Summary
- Registration: ✅ / ❌
- Login: ✅ / ❌
- Protected Routes: ✅ / ❌
- Profile Management: ✅ / ❌
- Token Management: ✅ / ❌
- Error Handling: ✅ / ❌

### Issues Found
1. _________________________________________________
2. _________________________________________________
3. _________________________________________________

### Notes
_________________________________________________
_________________________________________________

---

**Next Steps**: After successful testing, proceed to Phase 3: Database Management





