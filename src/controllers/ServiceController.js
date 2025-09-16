import Service from "../models/Service.js";
import slugify from "slugify";
import asyncHandler from "express-async-handler";
import mongoose from 'mongoose';

const imagePath = "/uploads/services/";
// Create Service
export const createService = asyncHandler(async (req, res) => {
  const { title, description, slug, heroTitle, heroDescription } = req.body;

  if (!title) {
    res.status(400);
    throw new Error("Service title is a required field.");
  }

  const cleanSlug = slugify(slug || title, { lower: true, strict: true });

  const existingService = await Service.findOne({ slug: cleanSlug });
  if (existingService) {
    res.status(409);
    throw new Error(`A service with the slug '${cleanSlug}' already exists.`);
  }

  let strategySteps = [];
  let servicesOffered = [];
  let technologies = [];

  try {
    if (req.body.strategySteps)
      strategySteps = JSON.parse(req.body.strategySteps);
    if (req.body.servicesOffered)
      servicesOffered = JSON.parse(req.body.servicesOffered);
    if (req.body.technologies) technologies = JSON.parse(req.body.technologies);
  } catch (err) {
    res.status(400);
    throw new Error(
      "Invalid JSON format in strategySteps, servicesOffered, or technologies."
    );
  }

  if (servicesOffered.length > 0 && req.files?.servicesOfferedImages) {
    servicesOffered = servicesOffered.map((service, idx) => ({
      ...service,
      // highlight-start
      // Prepend the full path to the filename before saving
      servicesOfferedImg: req.files.servicesOfferedImages[idx]
        ? `${imagePath}${req.files.servicesOfferedImages[idx].filename}`
        : service.servicesOfferedImg || null,
      // highlight-end
    }));
  } else {
    servicesOffered = servicesOffered.map((service) => ({
      ...service,
      servicesOfferedImg: service.servicesOfferedImg || null,
    }));
  }

  const service = await Service.create({
    title,
    description,
    slug: cleanSlug,
    heroTitle,
    heroDescription,
    // highlight-start
    // Prepend the full path to the filename before saving
    heroImage: req.files?.heroImage?.[0] ? `${imagePath}${req.files.heroImage[0].filename}` : null,
    cardImage: req.files?.cardImage?.[0] ? `${imagePath}${req.files.cardImage[0].filename}` : null,
    // highlight-end
    strategySteps,
    servicesOffered,
    technologies,
  });

  res
    .status(201)
    .json({
      success: true,
      message: "Service created successfully!",
      data: service,
    });
});

// Get all services
export const getAllServices = asyncHandler(async (req, res) => {
  const services = await Service.find().populate("technologies");
  res.json({ success: true, data: services });
});

// Get service by ID
export const getServiceById = asyncHandler(async (req, res) => {
  const { id } = req.params;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    res.status(400);
    throw new Error("Invalid service ID format.");
  }

  const service = await Service.findById(req.params.id).populate(
    "technologies"
  );
  if (!service) {
    res.status(404);
    throw new Error("Service not found.");
  }
  res.json({ success: true, data: service });
});

// Update service
export const updateService = asyncHandler(async (req, res) => {
  const { id } = req.params;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    res.status(400);
    throw new Error("Invalid service ID format.");
  }

  const service = await Service.findById(req.params.id);
  if (!service) {
    res.status(404);
    throw new Error("Service not found.");
  }

  const { title, description, slug } = req.body;

  const cleanSlug = slugify(slug || title, { lower: true, strict: true });

  const existingService = await Service.findOne({
    slug: cleanSlug,
    _id: { $ne: id },
  });
  if (existingService) {
    res.status(409);
    throw new Error(`A service with the slug '${cleanSlug}' already exists.`);
  }

  let strategySteps = service.strategySteps || [];
  let servicesOffered = service.servicesOffered || [];
  let technologies = service.technologies || [];

  try {
    if (req.body.strategySteps)
      strategySteps = JSON.parse(req.body.strategySteps);
    if (req.body.servicesOffered)
      servicesOffered = JSON.parse(req.body.servicesOffered);
    if (req.body.technologies) technologies = JSON.parse(req.body.technologies);
  } catch (err) {
    res.status(400);
    throw new Error("Invalid JSON format for one of the fields.");
  }

  if (
    req.files?.servicesOfferedImages &&
    req.files.servicesOfferedImages.length > 0
  ) {
    servicesOffered = servicesOffered.map((svc, idx) => ({
      ...svc,
      // highlight-start
      // Prepend the full path to the new filename if it exists
      servicesOfferedImg:
        req.files.servicesOfferedImages[idx]
            ? `${imagePath}${req.files.servicesOfferedImages[idx].filename}`
            : (service.servicesOffered[idx] &&
              service.servicesOffered[idx].servicesOfferedImg) ||
            svc.servicesOfferedImg ||
            null,
      // highlight-end
    }));
  } else {
    servicesOffered = servicesOffered.map((svc, idx) => ({
      ...svc,
      servicesOfferedImg:
        (service.servicesOffered[idx] &&
          service.servicesOffered[idx].servicesOfferedImg) ||
        svc.servicesOfferedImg ||
        null,
    }));
  }

  // Update fields
  service.title = title || service.title;
  service.description = description || service.description;
  service.slug = cleanSlug || service.slug;
  service.strategySteps = strategySteps;
  service.servicesOffered = servicesOffered;
  service.technologies = technologies;
  // highlight-start
  // Prepend the full path to the new filename, otherwise keep the old one
  service.heroImage = req.files?.heroImage?.[0] ? `${imagePath}${req.files.heroImage[0].filename}` : service.heroImage;
  service.cardImage = req.files?.cardImage?.[0] ? `${imagePath}${req.files.cardImage[0].filename}` : service.cardImage;
  // highlight-end

  await service.save();
  res.json({
    success: true,
    message: "Service updated successfully!",
    data: service,
  });
});

// Delete service
export const deleteService = asyncHandler(async (req, res) => {
  const service = await Service.findById(req.params.id);
  if (!service) {
    res.status(404);
    throw new Error("Service not found.");
  }

  await service.deleteOne();
  res.json({ success: true, message: "Service deleted successfully!" });
});

// Get service by Slug
export const getServiceBySlug = asyncHandler(async (req, res) => {
  const service = await Service.findOne({ slug: req.params.slug }).populate(
    "technologies"
  );
  if (!service) {
    res.status(404);
    throw new Error("Service not found with the provided slug.");
  }
  res.json({ success: true, data: service });
});
