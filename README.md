# DSA Tracker

A web application to track your Data Structures and Algorithms (DSA) problem-solving progress. This application allows you to keep track of problems you've solved, need to review, or haven't started yet.

## Features

- **Problem Tracking**: Keep track of all your DSA problems in one place
- **Status Updates**: Mark problems as "Not Started", "Review", or "Completed"
- **Notes**: Add notes for each problem for future reference
- **Filtering**: Filter problems by category, status, or search for specific problems
- **Import/Export**: Import problems from CSV or export your progress to CSV
- **Color Coding**: Problems are color-coded based on difficulty
- **Responsive Design**: Works well on both desktop and mobile devices
- **User Authentication**: Sign in with Google to save your progress
- **Admin Panel**: Administrators can manage problem data
- **Leaderboard**: Compete with other users based on problem completion

## Technology Stack

- **Frontend**: React.js 19, React Router 7
- **UI Framework**: Bootstrap 5
- **Icons**: Font Awesome
- **Authentication**: Firebase Authentication
- **Database**: Firebase Firestore
- **Analytics**: Firebase Analytics
- **CSV Parsing**: PapaParse

## Getting Started

### Prerequisites

- Node.js (v14 or higher)
- npm or yarn
- Firebase account (for authentication and database)

### Installation

1. Clone the repository:
   ```
   git clone https://github.com/yourusername/dsa-tracker.git
   cd dsa-tracker
   ```

2. Install dependencies:
   ```
   npm install
   ```

3. Update the Firebase configuration in `src/utils/firebase.js` with your own Firebase project details.

4. Start the development server:
   ```
   npm start
   ```

5. Open your browser and go to `http://localhost:3000`

## Usage

### User Authentication

1. Click "Sign In" in the navbar
2. Sign in with your Google account
3. Your progress will be saved and synced across devices

### Importing Problems (Admin Only)

1. Sign in as an admin user
2. Click on your profile in the navbar and select "Admin Panel"
3. Use the import function to upload a CSV file with problems

### Tracking Progress

1. Use the dropdown in the "Status" column to update a problem's status
2. Click "Edit Notes" to add or edit notes for a problem
3. Your progress is automatically saved to your account

### Filtering Problems

1. Use the search box to find problems by name or category
2. Use the category filter to show problems from a specific category
3. Use the status filter to show problems with a specific status

### Admin Panel

1. Administrators can access the admin panel through the navbar dropdown
2. In the admin panel, problems can be added, edited, or deleted
3. Changes are saved to the database for all users

### Leaderboard

1. Click on your profile in the navbar and select "Leaderboard"
2. View top users ranked by problem completion count
3. The leaderboard updates every 5 minutes or when revisited

## Project Structure

- `/src` - Source code
  - `/components` - React components
  - `/pages` - Page components
  - `/contexts` - React contexts for state management
  - `/utils` - Utility functions including Firebase and CSV handling
  - `/styles` - CSS styles
- `/public` - Static assets and HTML template
- `/build` - Production build (generated)

## CSV Format

The expected CSV format for importing problems is:

```
Problem Category,Problem Name,Problem Link,Status,Notes
```

Example:
```
Medium: Yellow,Program to find the average of two numbers,,Not Started,
Easy: Green,Check whether a given number is even or odd,,Completed,This was easy!
```

## Color Code

Problems are color-coded based on difficulty:
- Very Easy: Light Blue
- Easy: Green
- Medium: Yellow
- Hard: Light Red

## Firebase Setup

To set up Firebase for this application:

1. Create a Firebase project at https://console.firebase.google.com/
2. Enable Google Authentication in the Authentication section
3. Create a Firestore database with the following collections:
   - `users`: Store user information
   - `problems`: Store problem data

### Setting Up Admin Users

To set up an admin user:

1. A user must first sign in with Google
2. In the Firebase console, navigate to the Firestore Database
3. Find the user document in the 'users' collection
4. Edit the document and change the 'role' field value to 'admin'
5. The user will now have access to the admin panel

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

This project is licensed under the MIT License. 