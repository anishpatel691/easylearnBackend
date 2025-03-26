// routes/user.routes.js
import express from 'express';
import { getUserById ,updatePassword} from '../controllers/user.controller.js';
import { getEnrollmentUser } from '../controllers/payment.controller.js';
import { getCoursesByInstructor } from '../controllers/course.controller.js';
import { Totalrevenueintructerbyid } from '../controllers/payment.controller.js';
import { updateCourse,deleteCourse,getUploadedcouresById } from '../controllers/instructor.controller.js';
const Updateroute = express.Router();

Updateroute.get('/getuser/:userId', getUserById);

Updateroute.put('/courses/:courseId', updateCourse);
Updateroute.delete('/courses/:courseId', deleteCourse);
Updateroute.get('/enrollments/:instructorId', getUploadedcouresById);
export default Updateroute;
