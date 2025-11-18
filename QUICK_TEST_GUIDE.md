# Quick Test Guide - Phase 2 Authentication

## 🚀 Quick Start

1. **Ensure Backend is Running**
   ```bash
   # Backend should be running on http://localhost:8080
   # Check if API is accessible
   curl http://localhost:8080/api/doctor-manager-api/v1/auth/login
   ```

2. **Frontend Dev Server**
   - Already running at: `http://localhost:5173`
   - Open in browser: http://localhost:5173

---

## ✅ Quick Test Steps

### Step 1: Test Registration
1. Open http://localhost:5173
2. Click "Register" or navigate to `/register`
3. Fill form:
   - Username: `testuser123`
   - Email: `test@example.com`
   - Password: `password123`
   - Confirm: `password123`
4. Click "Register"
5. ✅ Should see success message and redirect to login

### Step 2: Test Login
1. On login page, enter:
   - Identity: `testuser123` (or `test@example.com`)
   - Password: `password123`
2. Click "Login"
3. ✅ Should redirect to dashboard
4. ✅ Should see username in header
5. ✅ Should see sidebar navigation

### Step 3: Test Protected Routes
1. While logged in, try accessing `/dashboard` directly
2. ✅ Should load dashboard
3. Logout (click user menu → Logout)
4. Try accessing `/dashboard` directly
5. ✅ Should redirect to login

### Step 4: Test Profile
1. Login again
2. Click user avatar/name in header
3. Click "Profile"
4. ✅ Should see profile page
5. Update first name: `John`
6. Update last name: `Doe`
7. Click "Update Profile"
8. ✅ Should see success message
9. Refresh page
10. ✅ Changes should persist

### Step 5: Test Token Persistence
1. Login successfully
2. Refresh page (F5)
3. ✅ Should remain logged in
4. ✅ User data should persist

---

## 🐛 Common Issues

### Issue: CORS Error
**Symptom**: Browser console shows CORS error
**Solution**: 
- Check backend CORS configuration
- Ensure backend allows `http://localhost:5173`

### Issue: 401 Unauthorized
**Symptom**: API calls return 401
**Solution**:
- Check if tokens are stored in localStorage (DevTools → Application → Local Storage)
- Check if Authorization header is being sent (Network tab)

### Issue: Redirect Loop
**Symptom**: Page keeps redirecting between login and dashboard
**Solution**:
- Clear localStorage: `localStorage.clear()`
- Refresh page
- Try login again

### Issue: Form Validation Not Working
**Symptom**: Can submit invalid forms
**Solution**:
- Check browser console for errors
- Verify Zod schemas are imported correctly

---

## 🔍 Browser DevTools Checks

### Check LocalStorage
1. Open DevTools (F12)
2. Go to Application → Local Storage → http://localhost:5173
3. Look for `auth-storage` key
4. Should contain: `accessToken`, `refreshToken`, `user`, `isAuthenticated`

### Check Network Requests
1. Open DevTools → Network tab
2. Try logging in
3. Check `/auth/login` request:
   - Status should be 200
   - Response should contain `access_token` and `refresh_token`
4. Check subsequent requests:
   - Should have `Authorization: Bearer <token>` header

### Check Console
1. Open DevTools → Console
2. Should see no errors
3. API calls should be logged (if logging enabled)

---

## 📝 Test Checklist

Quick checklist - mark as you test:

- [ ] Registration works
- [ ] Login works
- [ ] Protected routes redirect when not logged in
- [ ] Protected routes accessible when logged in
- [ ] Profile page loads
- [ ] Profile update works
- [ ] Logout works
- [ ] Token persists on page refresh
- [ ] User data persists on page refresh
- [ ] Form validation works
- [ ] Error messages display correctly

---

## 🎯 Expected Behavior Summary

| Action | Expected Result |
|--------|----------------|
| Register | Success message → Redirect to login |
| Login | Success message → Redirect to dashboard |
| Access protected route (not logged in) | Redirect to login |
| Access protected route (logged in) | Load page |
| Update profile | Success message → Changes persist |
| Logout | Success message → Redirect to login |
| Page refresh (logged in) | Stay logged in |
| Invalid form submission | Show validation errors |

---

## 📞 Need Help?

If you encounter issues:
1. Check browser console for errors
2. Check Network tab for failed requests
3. Verify backend API is running
4. Check CORS configuration
5. Clear localStorage and try again

---

**Happy Testing! 🎉**




