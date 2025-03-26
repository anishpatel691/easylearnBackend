import Instructor from "../Models/Instructor.model.js";
import User from "../Models/user.model.js";  // Import user model if needed

export const logout = async (req, res) => {
  try {
    const logoutId = req.params;  // Extracting the logoutId from the route params
    console.log(logoutId);
    const id = logoutId.id;

    let flag = 0;  // Initialize flag to identify the user type (0 for user, 1 for instructor)

    // Find user by ID check if it is student
    const user = await User.findById(id);
    
    if (user) {
      console.log("Student");
      res.clearCookie('token', { httpOnly: true, secure: true });  // Clear token cookie
      return res.status(200).json({ message: 'User logged out successfully' });
    }

    // If user not found, check if it's an instructor
    const instructor = await Instructor.findById(id);
    if (instructor) {
      console.log("Instructor");
      res.clearCookie('token', { httpOnly: true, secure: true });  // Clear token cookie
      flag = 1;  // Set flag to 1 for instructor
      return res.status(200).json({ message: 'Instructor logged out successfully' });
    }

    // If no matching user or instructor found
    return res.status(404).json({ error: 'User or Instructor not found' });

  } catch (err) {
    // Error handling
    console.error(err);
    return res.status(500).json({ error: 'Server error during logout' });
  }
};
