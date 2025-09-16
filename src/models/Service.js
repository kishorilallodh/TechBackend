import mongoose from 'mongoose';

const serviceSchema = new mongoose.Schema({
  title: String,
  description: String,
  cardImage : String,
  slug: { type: String, unique: true },

  // 👇 extra fields for detail page
  heroTitle: String,
  heroDescription: String,
  heroImage: String,

  // total 8 steps
  strategySteps: [
    {
      title: String,
      side: { type: String, enum: ["left", "right"] },
    }
  ],

  // total 6 card services offered
  servicesOffered: [
    {
      title: String,
      description: String,
      servicesOfferedImg : String
    }
  ],

  // 👇 NEW technologies section
technologies: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Technology' 
    }
  ]

}, { timestamps: true });

export default mongoose.model("Service", serviceSchema);
