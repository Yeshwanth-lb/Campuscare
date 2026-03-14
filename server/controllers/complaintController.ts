import { Request, Response } from 'express';
import Complaint from '../models/Complaint';
import cloudinary from '../config/cloudinary';

const uploadToCloudinary = (buffer: Buffer) => {
  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      { folder: 'campuscare/complaints' },
      (error, result) => {
        if (error) reject(error);
        else resolve(result);
      }
    );
    uploadStream.end(buffer);
  });
};

export const createComplaint = async (req: any, res: Response) => {
  try {
    const { title, description, category } = req.body;
    let imageUrl = '';
    if (req.file) {
      const result: any = await uploadToCloudinary(req.file.buffer);
      imageUrl = result.secure_url;
    }
    const complaint = await Complaint.create({
      title,
      description,
      category,
      image: imageUrl,
      userId: req.user.id,
    });
    res.status(201).json({
      success: true,
      data: complaint,
    });
  } catch (error: any) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

export const getAllComplaints = async (req: Request, res: Response) => {
  try {
    const complaints = await Complaint.find()
      .populate('userId', 'name email')
      .populate('assignedStaff', 'name email')
      .sort({ createdAt: -1 });
    res.status(200).json({
      success: true,
      count: complaints.length,
      data: complaints,
    });
  } catch (error: any) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

export const getMyComplaints = async (req: any, res: Response) => {
  try {
    const complaints = await Complaint.find({ userId: req.user.id })
      .populate('userId', 'name email')
      .populate('assignedStaff', 'name email')
      .sort({ createdAt: -1 });
    res.status(200).json({
      success: true,
      count: complaints.length,
      data: complaints,
    });
  } catch (error: any) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

export const getAssignedComplaints = async (req: any, res: Response) => {
  try {
    const complaints = await Complaint.find({ assignedStaff: req.user.id })
      .populate('userId', 'name email')
      .sort({ createdAt: -1 });
    res.status(200).json({
      success: true,
      count: complaints.length,
      data: complaints,
    });
  } catch (error: any) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

export const getComplaint = async (req: Request, res: Response) => {
  try {
    const complaint = await Complaint.findById(req.params.id)
      .populate('userId', 'name email')
      .populate('assignedStaff', 'name email');
    if (!complaint) {
      return res.status(404).json({ message: 'Complaint not found' });
    }
    res.status(200).json({
      success: true,
      data: complaint,
    });
  } catch (error: any) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

export const assignComplaint = async (req: Request, res: Response) => {
  try {
    const { staffId } = req.body;
    const complaint = await Complaint.findByIdAndUpdate(
      req.params.id,
      {
        assignedStaff: staffId,
        status: 'Assigned',
      },
      { new: true, runValidators: true }
    )
      .populate('userId', 'name email')
      .populate('assignedStaff', 'name email');
    if (!complaint) {
      return res.status(404).json({ message: 'Complaint not found' });
    }
    res.status(200).json({
      success: true,
      data: complaint,
    });
  } catch (error: any) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

export const updateComplaintStatus = async (req: any, res: Response) => {
  try {
    const { status } = req.body;
    const complaint: any = await Complaint.findById(req.params.id);
    if (!complaint) {
      return res.status(404).json({ message: 'Complaint not found' });
    }
    if (complaint.assignedStaff.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized to update this complaint' });
    }
    complaint.status = status;
    await complaint.save();
    const updatedComplaint = await Complaint.findById(req.params.id)
      .populate('userId', 'name email')
      .populate('assignedStaff', 'name email');
    res.status(200).json({
      success: true,
      data: updatedComplaint,
    });
  } catch (error: any) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

export const getComplaintStats = async (req: any, res: Response) => {
  try {
    let matchCondition: any = {};
    if (req.user.role === 'user') {
      matchCondition = { userId: req.user._id };
    } else if (req.user.role === 'staff') {
      matchCondition = { assignedStaff: req.user._id };
    }
    const stats = await Complaint.aggregate([
      { $match: matchCondition },
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 },
        },
      },
    ]);
    const total = await Complaint.countDocuments(matchCondition);
    const formattedStats = {
      total,
      pending: 0,
      assigned: 0,
      inProgress: 0,
      resolved: 0,
    };
    stats.forEach((stat) => {
      switch (stat._id) {
        case 'Pending': formattedStats.pending = stat.count; break;
        case 'Assigned': formattedStats.assigned = stat.count; break;
        case 'In Progress': formattedStats.inProgress = stat.count; break;
        case 'Resolved': formattedStats.resolved = stat.count; break;
      }
    });
    res.status(200).json({
      success: true,
      data: formattedStats,
    });
  } catch (error: any) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

export const deleteComplaint = async (req: Request, res: Response) => {
  try {
    const complaint = await Complaint.findByIdAndDelete(req.params.id);
    if (!complaint) {
      return res.status(404).json({ message: 'Complaint not found' });
    }
    res.status(200).json({
      success: true,
      message: 'Complaint deleted successfully',
    });
  } catch (error: any) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};
