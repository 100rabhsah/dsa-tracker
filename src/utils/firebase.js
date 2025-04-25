import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider, signInWithPopup, signOut } from 'firebase/auth';
import { getFirestore, collection, doc, setDoc, getDoc, updateDoc, query, orderBy, limit, getDocs } from 'firebase/firestore';
import { getAnalytics } from "firebase/analytics";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: process.env.REACT_APP_FIREBASE_API_KEY,
  authDomain: process.env.REACT_APP_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.REACT_APP_FIREBASE_PROJECT_ID,
  storageBucket: process.env.REACT_APP_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.REACT_APP_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.REACT_APP_FIREBASE_APP_ID,
  measurementId: process.env.REACT_APP_FIREBASE_MEASUREMENT_ID
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const analytics = getAnalytics(app);
// Authentication functions
export const googleProvider = new GoogleAuthProvider();

export const signInWithGoogle = async () => {
  try {
    const result = await signInWithPopup(auth, googleProvider);
    const user = result.user;
    
    // Check if user exists in database, if not create a new user document
    const userRef = doc(db, 'users', user.uid);
    const userSnap = await getDoc(userRef);
    
    if (!userSnap.exists()) {
      await setDoc(userRef, {
        uid: user.uid,
        email: user.email,
        displayName: user.displayName,
        photoURL: user.photoURL,
        role: 'user', // Default role
        completedProblems: 0,
        reviewProblems: 0,
        totalProblems: 0,
        lastActive: new Date(),
        createdAt: new Date()
      });
    } else {
      // Update lastActive
      await updateDoc(userRef, {
        lastActive: new Date()
      });
    }
    
    return user;
  } catch (error) {
    console.error("Error signing in with Google: ", error);
    throw error;
  }
};

export const logoutUser = () => {
  return signOut(auth);
};

// Admin functions
export const checkIfUserIsAdmin = async (uid) => {
  if (!uid) return false;
  
  try {
    const userRef = doc(db, 'users', uid);
    const userSnap = await getDoc(userRef);
    
    if (userSnap.exists()) {
      const userData = userSnap.data();
      return userData.role === 'admin';
    }
    
    return false;
  } catch (error) {
    console.error("Error checking admin status: ", error);
    return false;
  }
};

// User progress functions
export const updateUserProgress = async (uid, status) => {
  if (!uid) return;
  
  try {
    const userRef = doc(db, 'users', uid);
    const userSnap = await getDoc(userRef);
    
    if (userSnap.exists()) {
      const userData = userSnap.data();
      
      // Calculate counts
      const completedProblems = status.Completed || 0;
      const reviewProblems = status.Review || 0;
      const totalProblems = Object.values(status).reduce((a, b) => a + b, 0);
      
      await updateDoc(userRef, {
        completedProblems,
        reviewProblems,
        totalProblems,
        lastActive: new Date()
      });
    }
  } catch (error) {
    console.error("Error updating user progress: ", error);
  }
};

// Leaderboard functions
export const getLeaderboard = async () => {
  try {
    const usersRef = collection(db, 'users');
    // Get all users ordered by completedProblems in descending order
    const q = query(usersRef, orderBy('completedProblems', 'desc'));
    const querySnapshot = await getDocs(q);
    
    const leaderboard = [];
    let rank = 1;
    let prevScore = null;
    let sameRankCount = 0;
    
    querySnapshot.forEach((doc) => {
      const userData = doc.data();
      
      // Skip users with no completed problems and no activity
      if (userData.completedProblems === 0 && !userData.lastActive) {
        return;
      }
      
      // If this user has the same score as the previous one, they get the same rank
      if (prevScore !== null && prevScore === userData.completedProblems) {
        sameRankCount++;
      } else {
        // If different score, assign the next rank (accounting for ties)
        rank += sameRankCount;
        sameRankCount = 0;
        prevScore = userData.completedProblems;
      }
      
      leaderboard.push({
        uid: userData.uid,
        displayName: userData.displayName || 'Anonymous',
        photoURL: userData.photoURL,
        completedProblems: userData.completedProblems || 0,
        totalProblems: userData.totalProblems || 0,
        lastActive: userData.lastActive ? userData.lastActive.toDate() : null,
        rank: rank
      });
    });
    
    return leaderboard;
  } catch (error) {
    console.error("Error fetching leaderboard:", error);
    return [];
  }
};

// Problem management functions
export const getProblems = async () => {
  try {
    const problemsRef = doc(db, 'problems', 'problemList');
    const problemsSnap = await getDoc(problemsRef);
    
    if (problemsSnap.exists()) {
      return problemsSnap.data().problems;
    }
    
    return [];
  } catch (error) {
    console.error("Error fetching problems: ", error);
    return [];
  }
};

export const updateProblems = async (problems) => {
  try {
    await setDoc(doc(db, 'problems', 'problemList'), { problems });
    return true;
  } catch (error) {
    console.error("Error updating problems: ", error);
    return false;
  }
};

// User progress tracking
export const saveUserProblemProgress = async (uid, problems) => {
  if (!uid) return false;
  
  try {
    // Make sure difficulty classes are preserved when saving user progress
    const preservedProblems = problems.map(problem => {
      // Ensure the difficultyClass is always included
      if (!problem.difficultyClass) {
        console.warn("Problem missing difficultyClass:", problem);
        return {
          ...problem,
          difficultyClass: problem.difficultyClass || 'medium'
        };
      }
      return problem;
    });
    
    await setDoc(doc(db, 'userProgress', uid), { problems: preservedProblems });
    
    // Calculate and update user stats
    const status = preservedProblems.reduce((acc, problem) => {
      acc[problem.status] = (acc[problem.status] || 0) + 1;
      return acc;
    }, {});
    
    await updateUserProgress(uid, status);
    console.log("User progress saved with difficulty distribution:", {
      'very-easy': preservedProblems.filter(p => p.difficultyClass === 'very-easy').length,
      'easy': preservedProblems.filter(p => p.difficultyClass === 'easy').length,
      'medium': preservedProblems.filter(p => p.difficultyClass === 'medium').length,
      'hard': preservedProblems.filter(p => p.difficultyClass === 'hard').length
    });
    
    return true;
  } catch (error) {
    console.error("Error saving user progress:", error);
    return false;
  }
};

export const getUserProblemProgress = async (uid) => {
  if (!uid) return null;
  
  try {
    const progressRef = doc(db, 'userProgress', uid);
    const progressSnap = await getDoc(progressRef);
    
    if (progressSnap.exists()) {
      const userProblems = progressSnap.data().problems;
      
      // Check for and fix any problems missing difficulty classes
      const fixedProblems = userProblems.map(problem => {
        if (!problem.difficultyClass) {
          console.warn("User problem missing difficultyClass:", problem);
          return {
            ...problem,
            difficultyClass: 'medium' // Default to medium if missing
          };
        }
        return problem;
      });
      
      // Log the difficulty distribution for debugging
      if (fixedProblems.length > 0) {
        console.log("User progress loaded with difficulty distribution:", {
          'very-easy': fixedProblems.filter(p => p.difficultyClass === 'very-easy').length,
          'easy': fixedProblems.filter(p => p.difficultyClass === 'easy').length,
          'medium': fixedProblems.filter(p => p.difficultyClass === 'medium').length,
          'hard': fixedProblems.filter(p => p.difficultyClass === 'hard').length
        });
      }
      
      return fixedProblems;
    }
    
    return null;
  } catch (error) {
    console.error("Error fetching user progress:", error);
    return null;
  }
};

export { auth, db }; 