// routes/user.routes.js
import express from 'express';
import { getUserById ,updatePassword} from '../controllers/user.controller.js';
import { getEnrollmentUser } from '../controllers/payment.controller.js';
import { getCoursesByInstructor } from '../controllers/course.controller.js';
import { Totalrevenueintructerbyid } from '../controllers/payment.controller.js';
import { updateCourse,deleteCourse,getUploadedcouresById } from '../controllers/instructor.controller.js';
const getuserrouter = express.Router();

getuserrouter.get('/getuser/:userId', getUserById);

getuserrouter.post('/updatepassword/:userId', updatePassword);
getuserrouter.get('/enrollment/:instructorId', getEnrollmentUser);
getuserrouter.get("/instructor/:instructorId", getCoursesByInstructor); 
getuserrouter.get("/instructor/amount/:instructorId",Totalrevenueintructerbyid)
getuserrouter.put('/courses/:courseId', updateCourse);
getuserrouter.delete('/courses/:courseId', deleteCourse);
getuserrouter.get('/enrollments/:instructorId', getUploadedcouresById);
export default getuserrouter;
