//backend/controllers/classContrller.js
const Class = require('../models/Class');

exports.getActiveClasses = async (req, res) => {
    try {
        const classes = await Class.find({ isActive: true }).populate('teacherId', 'name');
        res.status(200).json(classes);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error fetching active classes' });
    }
};

const ClassMaterial = require('../models/ClassMaterial');

exports.getClassMaterials = async (req, res) => {
    try {
        const materials = await ClassMaterial.find({ classId: req.params.classId });
        res.status(200).json(materials);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error fetching class materials' });
    }
};

exports.getClassesByTeacher = async (req, res) => {
    try {
        const teacherId = req.params.teacherId;
        const classes = await Class.find({ teacherId, isActive: true })
            .select('subject monthlyFee description')
            .sort('subject');
        res.status(200).json(classes);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error fetching classes' });
    }
};