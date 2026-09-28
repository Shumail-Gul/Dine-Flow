import Category from "../models/Category.js";

export const getCategories = async (req, res) => {
  try {
    const adminId = req.user? req.user._id : req.query.adminId;
    if(!adminId) return res.status(400).json({message : "AdminId is required. "})
    const categories = await Category.find({adminId}).sort({ displayOrder: 1 });
    res.json(categories);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const createCategory = async (req, res) => {
  try {
    const { name, slug, displayOrder } = req.body;
    const category = await Category.create({
      adminId : req.user._id,
       name,
        slug,
         displayOrder: displayOrder || 0});
    res.status(201).json(category);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

export const updateCategory = async (req, res) => {
  try {
    const category = await Category.findByIdAndUpdate({id: req.params.id, adminId : req.user._id});
    if(!category) return res.status(404).json({message : "Category not found. "})
    res.json(category);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

export const deleteCategory = async (req, res) => {
  try {
    const category = await Category.findOneAndDelete({ _id: req.params.id, adminId: req.user._id });
    if (!category) return res.status(404).json({ message: 'Category not found' });
    res.json({ message: 'Category removed' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};