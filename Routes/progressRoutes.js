// BACKEND ROUTES: routes/progressRoutes.js
import express from 'express';
import User from '../Models/user.model.js';
import Course from '../Models/course.model.js';

const Prorouter = express.Router();

// Get progress for a specific lecture
Prorouter.get('/:lectureId',  async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    
    if (!user) {
      return res.status(404).json({ msg: 'User not found' });
    }
    
    // Find the progress for this lecture in user's progress array
    const lectureProgress = user.progress.find(
      p => p.lectureId.toString() === req.params.lectureId
    );
    
    if (!lectureProgress) {
      return res.status(404).json({ msg: 'No progress found for this lecture' });
    }
    
    res.json(lectureProgress);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// Update progress for a lecture
Prorouter.post('/update',  async (req, res) => {
  try {
    const { lectureId, courseId, progress, completed, lastPosition, learningHours } = req.body;
    
    if (!lectureId || !courseId) {
      return res.status(400).json({ msg: 'Lecture ID and Course ID are required' });
    }
    
    const user = await User.findById(req.user._id);
    
    if (!user) {
      return res.status(404).json({ msg: 'User not found' });
    }
    
    // Find the progress object for this lecture if it exists
    const existingProgressIndex = user.progress.findIndex(
      p => p.lectureId.toString() === lectureId
    );
    
    if (existingProgressIndex >= 0) {
      // Update existing progress
      const updateData = {};
      if (progress !== undefined) updateData['progress.$.progress'] = progress;
      if (completed !== undefined) updateData['progress.$.completed'] = completed;
      if (lastPosition !== undefined) updateData['progress.$.lastPosition'] = lastPosition;
      if (learningHours !== undefined) updateData['progress.$.learningHours'] = learningHours;
      
      await User.updateOne(
        { _id: req.user._id, 'progress.lectureId': lectureId },
        { $set: updateData }
      );
    } else {
      // Create new progress entry
      const newProgress = {
        lectureId,
        courseId,
        progress: progress || 0,
        completed: completed || false,
        lastPosition: lastPosition || 0,
        learningHours: learningHours || 0,
        updatedAt: Date.now()
      };
      
      await User.updateOne(
        { _id: req.user.id },
        { $push: { progress: newProgress } }
      );
    }
    
    // Update total learning hours for the course
    if (learningHours !== undefined) {
      // Find all progress entries for lectures in this course
      const user = await User.findById(req.user._id);
      const courseProgress = user.progress.filter(p => p.courseId.toString() === courseId);
      
      // Calculate total learning hours for the course
      const totalCourseHours = courseProgress.reduce((total, p) => total + (p.learningHours || 0), 0);
      
      // Update course enrollment with total hours
      await User.updateOne(
        { _id: req.user.id, 'enrolledCourses.courseId': courseId },
        { $set: { 'enrolledCourses.$.totalLearningHours': totalCourseHours } }
      );
    }
    
    res.json({ msg: 'Progress updated successfully' });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// Get progress summary for a course
Prorouter.get('/course/:courseId', async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    
    if (!user) {
      return res.status(404).json({ msg: 'User not found' });
    }
    
    // Find all progress entries for this course
    const courseProgress = user.progress.filter(
      p => p.courseId.toString() === req.params.courseId
    );
    
    // Get course details to calculate completion percentage
    const course = await Course.findById(req.params.courseId);
    
    if (!course) {
      return res.status(404).json({ msg: 'Course not found' });
    }
    
    const totalLectures = course.lectures.length;
    const completedLectures = courseProgress.filter(p => p.completed).length;
    const completionPercentage = totalLectures > 0 ? Math.floor((completedLectures / totalLectures) * 100) : 0;
    
    // Calculate total learning hours
    const totalLearningHours = courseProgress.reduce((total, p) => total + (p.learningHours || 0), 0);
    
    res.json({
      totalLectures,
      completedLectures,
      completionPercentage,
      totalLearningHours,
      progressDetails: courseProgress
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

export default Prorouter;