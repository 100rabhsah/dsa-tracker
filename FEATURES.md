# DSA Tracker - Enhanced Features

This document explains the enhanced features of the DSA Tracker application, including user authentication, admin management, and leaderboard functionality.

## User Authentication

The application now supports Google authentication, allowing users to:

1. Sign up and sign in with their Google accounts
2. Track their progress across sessions
3. Have their progress saved automatically
4. Compete on the leaderboard

### How to Sign In

1. Click the "Sign In" button in the top-right corner of the navbar
2. Click "Sign in with Google" in the sign-in page
3. Select your Google account and authorize the application
4. You will be redirected to the home page with your account information visible in the navbar

## Admin Portal

Administrators can manage problem data through the admin portal:

1. Add new problems
2. Edit existing problems (category, name, link)
3. Delete problems
4. Save changes to the database

### How to Access the Admin Portal

1. Only users with admin role can access the admin portal
2. Admins can click on their profile in the navbar and select "Admin Panel"
3. In the admin panel, problems can be managed with an intuitive interface

### Admin Features

1. **Problem Management**: Add, edit, and delete problems
2. **Import/Export CSV**: Only administrators can import problems from CSV files or export the entire problem set
3. **Database Control**: Save all changes to the database for all users

#### CSV Import Format

For importing problems via CSV in the Admin panel, ensure your CSV file has the following headers:
```
Problem Category,Problem Name,Problem Link,Status,Notes
```

For example:
```
Medium: Yellow,Binary Search,https://example.com/binary-search,Not Started,
Easy: Green,Two Sum,https://example.com/two-sum,Completed,Used hash map for O(n) solution
```

Notes:
- The "Problem Category" should include the difficulty level (Very Easy: Light Blue, Easy: Green, Medium: Yellow, Hard: Light Red)
- Status should be one of: "Not Started", "Review", or "Completed"
- A test import file is available at `/test_import.csv` for reference

### Setting Up Admin Users

To set up an admin user:

1. A user must first sign in with Google
2. In the Firebase console, navigate to the Firestore Database
3. Find the user document in the 'users' collection
4. Edit the document and change the 'role' field value to 'admin'
5. The user will now have access to the admin panel

## Leaderboard

The leaderboard showcases the top problem solvers based on completion count:

1. Users are ranked by the number of problems they've completed
2. The leaderboard displays user profile pictures, names, and completion statistics
3. The top 3 users receive special trophy/medal icons
4. The leaderboard updates every 5 minutes or when revisited

### How to Access the Leaderboard

1. Click on your profile in the navbar and select "Leaderboard"
2. Alternatively, navigate directly to the /leaderboard route

## Firebase Integration

The application is now integrated with Firebase for:

1. User authentication (via Firebase Auth)
2. Data persistence (via Firestore)
3. Real-time updates for multiple users
4. Secure data access based on user roles

### Firebase Setup

To set up your own Firebase project:

1. Create a Firebase project at https://console.firebase.google.com/
2. Enable Google Authentication in the Authentication section
3. Create a Firestore database
4. Replace the Firebase configuration in `src/utils/firebase.js` with your own config
5. Deploy to a hosting platform of your choice

## Local Development

For local development:

1. Clone the repository
2. Install dependencies with `npm install`
3. Replace the Firebase configuration with your own
4. Run the application with `npm start`
5. Build for production with `npm run build`

## Production Deployment

For production deployment:

1. Build the application with `npm run build`
2. Deploy the build folder to your hosting platform
3. Ensure Firebase configurations are correctly set for production 