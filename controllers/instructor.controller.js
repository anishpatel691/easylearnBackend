import Instructor from '../Models/Instructor.model.js';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import Course from '../Models/course.model.js';
import Enrollment from '../Models/Enrollment.model.js';
import Lecture from '../Models/lectures.model.js'; 
const JWT_SECRET = process.env.JWT_SECRET || 'your_secret_key';

// Register a new instructor
export const registerInstructor = async (req, res) => {
  const { name, email, password, bio, skills, profilePicture } = req.body;

  if (!name || !email || !password || !skills) {
    return res.status(400).json({ error: 'DB Call All required fields must be filled' });
  }

  try {
    // Check if the instructor already exists
    const existingInstructor = await Instructor.findOne({ email });
    if (existingInstructor) {
      return res.status(400).json({ error: 'Instructor with this email already exists' });
    }

    // Hash the password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create a new instructor
    const instructor = new Instructor({
      name,
      email,
      password: hashedPassword,
      bio,
      skills,
      profilePicture,
    });

    const savedInstructor = await instructor.save();

    // Generate a token
    const token = jwt.sign({ id: savedInstructor._id, role: 'instructor' }, JWT_SECRET, {
      expiresIn: '1d',
    });

    res.status(201).json({
      message: 'Instructor registered successfully',
      instructor: savedInstructor,
      token,
    });
  } catch (err) {
    res.status(500).json({ error: 'Server error: ' + err.message });
  }
};



export const loginInstructor = async (req, res) => {
  const { email, password } = req.body;

  // Input validation
  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password are required' });
  }

  try {
    const instructor = await Instructor.findOne({ email });
    if (!instructor) {
      return res.status(400).json({ error: ' Invalid credentials' });
    }

    // Check if password matches
    const isMatch = await bcrypt.compare(password, instructor.password);
    if (!isMatch) {
      return res.status(400).json({ error: 'Password is Invalid credentials' });
    }

    // Create JWT token
    const token = jwt.sign(
      { id: instructor._id, email: instructor.email },
      JWT_SECRET,
      { expiresIn: '1h' } // Token expires in 1 hour
    );

    res.cookie('token', token, {
      httpOnly: true, // Prevent client-side JS access
      secure: process.env.NODE_ENV === 'production', // Use HTTPS in production
      maxAge: 3600000,    // 1 hour in milliseconds
    });

    res.json({ 
      message: 'Instructor logged in successfully',
      instructor,
      token,
      LoginSataus:true
     
    });
  } catch (err) {
    res.status(500).json({ error: 'Server error: ' + err.message });
  }
};


//getInstructorProfile 
export const getInstructorProfile = async (req, res) => {
  try {
    const instructor = await Instructor.findById(req.user.id).select('-password');
    if (!instructor) {
      return res.status(404).json({ error: 'Instructor not found' });
    }
    res.json(instructor);
  } catch (err) {
    res.status(500).json({ error: 'Server error: ' + err.message });
  }
};

export const updateCourse = async (req, res) => {
  try {
    const courseId = req.params.courseId;

    // Destructure all potential fields from the request body
    const { 
      title, 
      description, 
      lectures, 
      price, 
      category, 
      thumbnail 
    } = req.body;

    // Validate input
    if (!title || !description) {
      return res.status(400).json({ 
        message: 'Title and description are required' 
      });
    }

    // Prepare update object with only provided fields
    const updateData = {};
    if (title) updateData.title = title;
    if (description) updateData.description = description;
    if (lectures) updateData.lectures = lectures;
    if (price !== undefined) updateData.price = price;
    if (category) updateData.category = category;
    if (thumbnail) updateData.thumbnail = thumbnail;

    // Update course with new data
    const updatedCourse = await Course.findByIdAndUpdate(
      courseId, 
      updateData,
      { 
        new: true,  // Return the modified document
        runValidators: true  // Run model validations
      }
    );
    
    // Check if course was found and updated
    if (!updatedCourse) {
      return res.status(404).json({ 
        message: 'Course not found' 
      });
    }
    
    // Respond with updated course
    res.status(200).json({
      message: 'Course updated successfully',
      course: updatedCourse
    });

  } catch (error) {
    console.error('Course Update Error:', error);

    // Handle specific error types
    if (error.name === 'ValidationError') {
      return res.status(400).json({ 
        message: 'Invalid course data',
        errors: Object.values(error.errors).map(err => err.message)
      });
    }

    res.status(500).json({ 
      message: 'Error updating course', 
      error: error.message 
    });
  }
};

export const deleteCourse = async (req, res) => {
  // Validate Mongoose connection
  if (mongoose.connection.readyState !== 1) {
    return res.status(500).json({
      success: false,
      message: 'Database connection is not established',
      errorCode: 'DB_CONNECTION_ERROR'
    });
  }

  // Create a session for transaction
  const session = await mongoose.startSession();
  
  try {
    // Extract courseId from request parameters
    const courseId = req.params.courseId;

    // Validate courseId format
    if (!mongoose.Types.ObjectId.isValid(courseId)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid course ID format',
        errorCode: 'INVALID_ID',
        courseId: courseId
      });
    }

    // Start transaction
    session.startTransaction();

    // Find the course with populated lectures
    const existingCourse = await Course.findById(courseId)
      .populate('lectures')
      .session(session);

    // Check if course exists
    if (!existingCourse) {
      await session.abortTransaction();
      session.endSession();
      return res.status(404).json({
        success: false,
        message: 'Course not found',
        errorCode: 'COURSE_NOT_FOUND',
        courseId: courseId
      });
    }

    // Delete associated lectures
    if (existingCourse.lectures && existingCourse.lectures.length > 0) {
      const lectureDeleteResult = await Lecture.deleteMany(
        { _id: { $in: existingCourse.lectures.map(l => l._id) } },
        { session }
      );
      console.log(`Deleted ${lectureDeleteResult.deletedCount} associated lectures`);
    }

    // Delete the course
    const deletedCourse = await Course.findByIdAndDelete(courseId, { session });

    // Delete associated enrollments
    const enrollmentDeleteResult = await Enrollment.deleteMany(
      { courseId: courseId },
      { session }
    );

    // Commit transaction
    await session.commitTransaction();
    session.endSession();

    // Prepare response
    res.status(200).json({
      success: true,
      message: 'Course deletion successful',
      data: {
        deletedCourse: {
          _id: deletedCourse._id,
          title: deletedCourse.title
        },
        enrollmentsDeleted: enrollmentDeleteResult.deletedCount,
        lecturesDeleted: existingCourse.lectures.length
      }
    });

  } catch (error) {
    // Ensure transaction is aborted
    try {
      await session.abortTransaction();
    } catch (abortError) {
      console.error('Transaction abort error:', abortError);
    }

    // End the session
    try {
      session.endSession();
    } catch (sessionEndError) {
      console.error('Session end error:', sessionEndError);
    }

    // Log detailed error
    console.error('Course Deletion Error:', {
      name: error.name,
      message: error.message,
      stack: error.stack,
      code: error.code
    });

    // Respond with error details
    res.status(500).json({
      success: false,
      message: 'Error deleting course',
      errorCode: 'DELETION_FAILED',
      errorDetails: {
        name: error.name,
        message: error.message
      }
    });
  }
};
//enrollments for a user
export const getUploadedcouresById = async (req, res) => {
  try {
    const { instructorId } = req.params;
    
    const enrollments = await Course.find({ instructorId })
     
      .sort({ enrollmentDate: -1 });
    
    
    return res.status(200).json(enrollments);
  } catch (error) {
    console.error('Error fetching user enrollments:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch enrollments',
      error: error.message
    });
  }
};