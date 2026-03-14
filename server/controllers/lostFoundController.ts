import { Request, Response } from 'express';
import LostFound from '../models/LostFound';
import cloudinary from '../config/cloudinary';

const uploadToCloudinary = (buffer: Buffer) => {
  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      { folder: 'campuscare/lostfound' },
      (error, result) => {
        if (error) reject(error);
        else resolve(result);
      }
    );
    uploadStream.end(buffer);
  });
};

export const createItem = async (req: any, res: Response) => {
  try {
    const { title, description, location, type, contactInfo } = req.body;
    let imageUrl = '';
    if (req.file) {
      const result: any = await uploadToCloudinary(req.file.buffer);
      imageUrl = result.secure_url;
    }
    const item = await LostFound.create({
      title,
      description,
      location,
      type,
      contactInfo,
      image: imageUrl,
      postedBy: req.user.id,
    });
    res.status(201).json({
      success: true,
      data: item,
    });
  } catch (error: any) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

export const getAllItems = async (req: Request, res: Response) => {
  try {
    const { type, search, location, status } = req.query;
    let query: any = {};
    if (type && type !== 'all') query.type = type;
    if (status && status !== 'all') query.status = status;
    if (location) query.location = { $regex: location, $options: 'i' };
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { location: { $regex: search, $options: 'i' } },
      ];
    }
    const items = await LostFound.find(query)
      .populate('postedBy', 'name email')
      .sort({ createdAt: -1 });
    res.status(200).json({
      success: true,
      count: items.length,
      data: items,
    });
  } catch (error: any) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

export const getMyItems = async (req: any, res: Response) => {
  try {
    const items = await LostFound.find({ postedBy: req.user.id })
      .populate('postedBy', 'name email')
      .sort({ createdAt: -1 });
    res.status(200).json({
      success: true,
      count: items.length,
      data: items,
    });
  } catch (error: any) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

export const getItem = async (req: Request, res: Response) => {
  try {
    const item = await LostFound.findById(req.params.id)
      .populate('postedBy', 'name email');
    if (!item) {
      return res.status(404).json({ message: 'Item not found' });
    }
    res.status(200).json({
      success: true,
      data: item,
    });
  } catch (error: any) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

export const updateItemStatus = async (req: any, res: Response) => {
  try {
    const { status } = req.body;
    const item: any = await LostFound.findById(req.params.id);
    if (!item) {
      return res.status(404).json({ message: 'Item not found' });
    }
    if (item.postedBy.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized to update this item' });
    }

    // Prevent redundant updates
    if (item.status === status) {
      return res.status(400).json({ message: `Item is already marked as ${status}` });
    }

    // Prevent updates if already returned
    if (item.status === 'Returned') {
      return res.status(400).json({ message: 'Cannot update status of a returned item' });
    }

    // Validate transition
    if (status === 'Returned' && item.status !== 'Claimed' && item.status !== 'Open') {
      return res.status(400).json({ message: 'Invalid status transition' });
    }

    item.status = status;
    await item.save();
    res.status(200).json({
      success: true,
      data: item,
    });
  } catch (error: any) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

export const deleteItem = async (req: any, res: Response) => {
  try {
    const item: any = await LostFound.findById(req.params.id);
    if (!item) {
      return res.status(404).json({ message: 'Item not found' });
    }
    if (item.postedBy.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized to delete this item' });
    }
    await item.deleteOne();
    res.status(200).json({
      success: true,
      message: 'Item deleted successfully',
    });
  } catch (error: any) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

export const getLostFoundStats = async (req: any, res: Response) => {
  try {
    let matchCondition: any = {};
    if (req.user.role === 'user') {
      matchCondition = { postedBy: req.user._id };
    }
    const typeStats = await LostFound.aggregate([
      { $match: matchCondition },
      {
        $group: {
          _id: '$type',
          count: { $sum: 1 },
        },
      },
    ]);
    const statusStats = await LostFound.aggregate([
      { $match: matchCondition },
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 },
        },
      },
    ]);
    const total = await LostFound.countDocuments(matchCondition);
    const formattedStats = {
      total,
      lost: 0,
      found: 0,
      open: 0,
      claimed: 0,
      returned: 0,
    };
    typeStats.forEach((stat) => {
      if (stat._id === 'lost') formattedStats.lost = stat.count;
      if (stat._id === 'found') formattedStats.found = stat.count;
    });
    statusStats.forEach((stat) => {
      if (stat._id === 'Open') formattedStats.open = stat.count;
      if (stat._id === 'Claimed') formattedStats.claimed = stat.count;
      if (stat._id === 'Returned') formattedStats.returned = stat.count;
    });
    res.status(200).json({
      success: true,
      data: formattedStats,
    });
  } catch (error: any) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};
