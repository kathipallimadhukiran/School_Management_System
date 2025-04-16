const checkTeacherClassAccess = (req, res, next) => {
    if (req.user.role === 'admin') return next();
  
    const classId = req.body.classId || req.query.classId;
    if (!classId) {
      return res.status(400).json({ error: "Class ID is required" });
    }
  
    if (!req.user.assignedClasses?.includes(classId)) {
      return res.status(403).json({ error: "Access denied to this class" });
    }
  
    next();
  };
  
  module.exports = checkTeacherClassAccess;
  