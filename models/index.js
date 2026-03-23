const Admin = require('./admin_model');
const Announcement = require('./announcement_model');
const ClassModel = require('./class_model');
const Otp = require('./otp_model');
const Student = require('./student_model');
const Submission = require('./submission_model');
const Task = require('./task_model');
const User = require('./user_model');

module.exports = {
  Admin,
  Announcement,
  ClassModel,
  Otp,
  Student,
  Submission,
  Task,
  User,
  Academic: require('./academic_model'),
  Guardian: require('./guardian_model'),
  Notification: require('./notification_model'),
  Enrollment: require('./enrollment_model'),
  Batch: require('./batch_model'),
};
