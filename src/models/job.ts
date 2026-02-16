import mongoose, { type InferSchemaType, model, models, Schema } from "mongoose";

const JobSchema = new Schema(
  {
    jobId: { type: String, required: true, unique: true, index: true },
    jobTitle: { type: String, required: true },
    industry: { type: String, required: true },
    risk_score: { type: Number, required: true, min: 0, max: 100 },
    risk_level: { type: String, enum: ["Low", "Medium", "High"], required: true },
    automation_percentage: { type: Number, required: true, min: 0, max: 100 },
    time_horizon: { type: String, required: true },
    reason: { type: String, required: true },
    future_skills: [{ type: String, required: true }],
  },
  {
    timestamps: { createdAt: true, updatedAt: false },
    versionKey: false,
  },
);

JobSchema.index({ jobId: 1 }, { unique: true });

export type JobDocument = InferSchemaType<typeof JobSchema> & {
  _id: mongoose.Types.ObjectId;
  createdAt: Date;
};

const Job = models.Job || model("Job", JobSchema);

export default Job;
