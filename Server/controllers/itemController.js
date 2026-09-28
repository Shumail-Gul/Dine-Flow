// import MenuItem from "../models/MenuItem.js";
// import cloudinary from "../config/cloudinary.js";

// export const getItems = async (req, res) => {
//   try {
//     const adminId = req.user ? req.user._id : req.query.adminId;
//     if (!adminId) return res.status(400).json({ message: 'adminId is required' });

//     const items = await MenuItem.find({ adminId }).populate('categoryId');
//     res.json(items);
//   } catch (err) {
//     res.status(500).json({ message: err.message });
//   }
// };

// export const createItem = async (req, res) => {
//   try {
//     let imageUrl = req.body.imageUrl || "";

//     if (req.file) {
//       const result = await new Promise((resolve, reject) => {
//         const stream = cloudinary.uploader.upload_stream({ folder: "dineflow" }, (err, res) => {
//           if (err) reject(err);
//           else resolve(res);
//         });
//         stream.end(req.file.buffer);
//       });
//       imageUrl = result.secure_url;
//     }

//     const item = await MenuItem.create({ ...req.body, imageUrl });
//     res.status(201).json(item);
//   } catch (error) {
//     res.status(400).json({ message: error.message });
//   }
// };

// export const toggleAvailability = async (req, res) => {
//   try {
//     const item = await MenuItem.findById(req.params.id);
//     if (!item) return res.status(404).json({ message: "Item not found" });

//     item.isAvailable = req.body.isAvailable !== undefined ? req.body.isAvailable : !item.isAvailable;
//     await item.save();

//     res.json(item);
//   } catch (error) {
//     res.status(400).json({ message: error.message });
//   }
// };

// export const updateItem = async (req, res) => {
//   try{
//     await MenuItem.findByIdAndUpdate(req.params.id, req.body, {new : true, runValidators:true});
//     if(!updateItem){
//       return res.status(404).json({message: "item not found"})
//     }
//     res.status(200).json(updateItem)
//     res.json({message : "Item updated successfully"})

//   } catch(error) {
//     res.status(500).json({message: error.message})
//   }
// }

// export const deleteItem = async (req, res) => {
//   try {
//     await MenuItem.findByIdAndDelete(req.params.id);
//     res.json({ message: "Item deleted successfully" });
//   } catch (error) {
//     res.status(500).json({ message: error.message });
//   }
// };

import MenuItem from '../models/MenuItem.js';

export const getItems = async (req, res) => {
  try {
    const adminId = req.user ? req.user._id : req.query.adminId;
    if (!adminId) return res.status(400).json({ message: 'adminId is required' });

    const items = await MenuItem.find({ adminId }).populate('categoryId');
    res.json(items);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const createItem = async (req, res) => {
  try {
    const item = await MenuItem.create({
      ...req.body,
      adminId: req.user._id
    });
    res.status(201).json(item);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

export const updateItem = async (req, res) => {
  try {
    const item = await MenuItem.findOneAndUpdate(
      { _id: req.params.id, adminId: req.user._id },
      req.body,
      { new: true, runValidators: true }
    );
    if (!item) return res.status(404).json({ message: 'Item not found' });
    res.json(item);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

export const toggleAvailability = async (req, res) => {
  try {
    const { isAvailable } = req.body;
    const item = await MenuItem.findOneAndUpdate(
      { _id: req.params.id, adminId: req.user._id },
      { isAvailable },
      { new: true }
    );
    if (!item) return res.status(404).json({ message: 'Item not found' });
    res.json(item);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

export const deleteItem = async (req, res) => {
  try {
    const item = await MenuItem.findOneAndDelete({ _id: req.params.id, adminId: req.user._id });
    if (!item) return res.status(404).json({ message: 'Item not found' });
    res.json({ message: 'Item deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};