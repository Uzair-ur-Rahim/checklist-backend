import mongoose, { Schema, Document, Types } from "mongoose";

export interface ITask extends Document {
  title: string;
  checklistIds: Types.ObjectId[];
  userId: Types.ObjectId;
}

const TaskSchema = new Schema<ITask>(
  {
    title: { type: String, required: true },
    checklistIds: {
      type: [Schema.Types.ObjectId],
      ref: "Checklist",
      required: false,
    },
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
  },
  { timestamps: true, toJSON: { virtuals: true }, toObject: { virtuals: true } }
);

TaskSchema.virtual("checklists", {
  ref: "Checklist",
  localField: "checklistIds",
  foreignField: "_id",
});

const Task = mongoose.model<ITask>("Task", TaskSchema);
export default Task;
