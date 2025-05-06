const User = require('../models/User');

// Get all institutes (admin role check in controller)
exports.getAllInstitutes = async (req, res) => {
    try {
        // Check if the user is an admin
        const user = await User.findById(req.user.id);
        if (!user || user.role !== 'admin') {
            return res.status(403).json({ message: 'Access denied. Admin only.' });
        }

        const institutes = await User.find({ role: 'institute' }).select(
            'name email contactNumber subscriptionStatus createdAt'
        );
        res.status(200).json(institutes);
    } catch (error) {
        console.error('Error fetching institutes:', error);
        res.status(500).json({ message: 'Error fetching institutes', error: error.message });
    }
};


exports.banInstitute = async (req, res) => {
    try {
      const user = await User.findById(req.user.id);
      if (!user || user.role !== 'admin') {
        return res.status(403).json({ message: 'Access denied. Admin only.' });
      }
  
      const { instituteId } = req.params;
      const institute = await User.findById(instituteId);
  
      if (!institute) {
        return res.status(404).json({ message: 'Institute not found' });
      }
  
      if (institute.role !== 'institute') {
        return res.status(400).json({ message: 'User is not an institute' });
      }
  
      institute.subscriptionStatus = 'inactive';
      await institute.save();
  
      res.status(200).json({ message: 'Institute banned successfully', institute });
    } catch (error) {
      console.error('Error banning institute:', error);
      res.status(500).json({ message: 'Error banning institute', error: error.message });
    }
  };
  
  exports.unbanInstitute = async (req, res) => {
    try {
      const user = await User.findById(req.user.id);
      if (!user || user.role !== 'admin') {
        return res.status(403).json({ message: 'Access denied. Admin only.' });
      }
  
      const { instituteId } = req.params;
      const institute = await User.findById(instituteId);
  
      if (!institute) {
        return res.status(404).json({ message: 'Institute not found' });
      }
  
      if (institute.role !== 'institute') {
        return res.status(400).json({ message: 'User is not an institute' });
      }
  
      institute.subscriptionStatus = 'active';
      await institute.save();
  
      res.status(200).json({ message: 'Institute unbanned successfully', institute });
    } catch (error) {
      console.error('Error unbanning institute:', error);
      res.status(500).json({ message: 'Error unbanning institute', error: error.message });
    }
  };
  
  exports.deleteInstitute = async (req, res) => {
    try {
      const user = await User.findById(req.user.id);
      if (!user || user.role !== 'admin') {
        return res.status(403).json({ message: 'Access denied. Admin only.' });
      }
  
      const { instituteId } = req.params;
      const institute = await User.findById(instituteId);
  
      if (!institute) {
        return res.status(404).json({ message: 'Institute not found' });
      }
  
      if (institute.role !== 'institute') {
        return res.status(400).json({ message: 'User is not an institute' });
      }
  
      await institute.deleteOne();
      res.status(200).json({ message: 'Institute removed successfully' });
    } catch (error) {
      console.error('Error removing institute:', error);
      res.status(500).json({ message: 'Error removing institute', error: error.message });
    }
  };
  
  exports.updateInstitute = async (req, res) => {
    try {
      const user = await User.findById(req.user.id);
      if (!user || user.role !== 'admin') {
        return res.status(403).json({ message: 'Access denied. Admin only.' });
      }
  
      const { instituteId } = req.params;
      const { name, email, contactNumber } = req.body;
  
      const institute = await User.findById(instituteId);
  
      if (!institute) {
        return res.status(404).json({ message: 'Institute not found' });
      }
  
      if (institute.role !== 'institute') {
        return res.status(400).json({ message: 'User is not an institute' });
      }
  
      if (name) institute.name = name;
      if (email) {
        const emailExists = await User.findOne({ email, _id: { $ne: instituteId } });
        if (emailExists) {
          return res.status(400).json({ message: 'Email is already in use' });
        }
        institute.email = email;
      }
      if (contactNumber) institute.contactNumber = contactNumber;
  
      await institute.save();
      res.status(200).json({ message: 'Institute updated successfully', institute });
    } catch (error) {
      console.error('Error updating institute:', error);
      res.status(500).json({ message: 'Error updating institute', error: error.message });
    }
  };

// Get all teachers (admin role check in controller)
exports.getAllTeachers = async (req, res) => {
    try {
        // Check if the user is an admin
        const user = await User.findById(req.user.id);
        if (!user || user.role !== 'admin') {
            return res.status(403).json({ message: 'Access denied. Admin only.' });
        }

        const teachers = await User.find({ role: 'teacher' }).select(
            'name email age contactNumber subscriptionStatus createdAt'
        );
        res.status(200).json(teachers);
    } catch (error) {
        console.error('Error fetching teachers:', error);
        res.status(500).json({ message: 'Error fetching teachers', error: error.message });
    }
};

// Ban a teacher by setting subscriptionStatus to inactive (admin role check in controller)
exports.banTeacher = async (req, res) => {
    try {
        // Check if the user is an admin
        const user = await User.findById(req.user.id);
        if (!user || user.role !== 'admin') {
            return res.status(403).json({ message: 'Access denied. Admin only.' });
        }

        const { teacherId } = req.params;
        const teacher = await User.findById(teacherId);

        if (!teacher) {
            return res.status(404).json({ message: 'Teacher not found' });
        }

        if (teacher.role !== 'teacher') {
            return res.status(400).json({ message: 'User is not a teacher' });
        }

        teacher.subscriptionStatus = 'inactive';
        await teacher.save();

        res.status(200).json({ message: 'Teacher banned successfully', teacher });
    } catch (error) {
        console.error('Error banning teacher:', error);
        res.status(500).json({ message: 'Error banning teacher', error: error.message });
    }
};

// Unban a teacher by setting subscriptionStatus to active (admin role check in controller)
exports.unbanTeacher = async (req, res) => {
    try {
        // Check if the user is an admin
        const user = await User.findById(req.user.id);
        if (!user || user.role !== 'admin') {
            return res.status(403).json({ message: 'Access denied. Admin only.' });
        }

        const { teacherId } = req.params;
        const teacher = await User.findById(teacherId);

        if (!teacher) {
            return res.status(404).json({ message: 'Teacher not found' });
        }

        if (teacher.role !== 'teacher') {
            return res.status(400).json({ message: 'User is not a teacher' });
        }

        teacher.subscriptionStatus = 'active';
        await teacher.save();

        res.status(200).json({ message: 'Teacher unbanned successfully', teacher });
    } catch (error) {
        console.error('Error unbanning teacher:', error);
        res.status(500).json({ message: 'Error unbanning teacher', error: error.message });
    }
};

// Delete a teacher (admin role check in controller)
exports.deleteTeacher = async (req, res) => {
    try {
        // Check if the user is an admin
        const user = await User.findById(req.user.id);
        if (!user || user.role !== 'admin') {
            return res.status(403).json({ message: 'Access denied. Admin only.' });
        }

        const { teacherId } = req.params;
        const teacher = await User.findById(teacherId);

        if (!teacher) {
            return res.status(404).json({ message: 'Teacher not found' });
        }

        if (teacher.role !== 'teacher') {
            return res.status(400).json({ message: 'User is not a teacher' });
        }

        await teacher.deleteOne();
        res.status(200).json({ message: 'Teacher removed successfully' });
    } catch (error) {
        console.error('Error removing teacher:', error);
        res.status(500).json({ message: 'Error removing teacher', error: error.message });
    }
};

// Update a teacher's details (admin role check in controller)
exports.updateTeacher = async (req, res) => {
    try {
        // Check if the user is an admin
        const user = await User.findById(req.user.id);
        if (!user || user.role !== 'admin') {
            return res.status(403).json({ message: 'Access denied. Admin only.' });
        }

        const { teacherId } = req.params;
        const { name, email, age, contactNumber } = req.body;

        const teacher = await User.findById(teacherId);

        if (!teacher) {
            return res.status(404).json({ message: 'Teacher not found' });
        }

        if (teacher.role !== 'teacher') {
            return res.status(400).json({ message: 'User is not a teacher' });
        }

        // Update fields if provided
        if (name) teacher.name = name;
        if (email) {
            // Check if the new email is already in use by another user
            const emailExists = await User.findOne({ email, _id: { $ne: teacherId } });
            if (emailExists) {
                return res.status(400).json({ message: 'Email is already in use' });
            }
            teacher.email = email;
        }
        if (age) teacher.age = age;
        if (contactNumber) teacher.contactNumber = contactNumber;

        await teacher.save();
        res.status(200).json({ message: 'Teacher updated successfully', teacher });
    } catch (error) {
        console.error('Error updating teacher:', error);
        res.status(500).json({ message: 'Error updating teacher', error: error.message });
    }
};