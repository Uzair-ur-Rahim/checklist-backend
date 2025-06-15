import mongoose, { Schema, Document, Types } from "mongoose";

export interface IChecklistItem {
  _id: Types.ObjectId;
  text: string;
  isChecked: boolean;
}

export interface IChecklist extends Document {
  name: string;
  items: IChecklistItem[];
}

const ChecklistSchema = new Schema<IChecklist>(
  {
    name: { type: String, required: true },
    items: {
      type: [
        {
          title: { type: String, required: true },
          isChecked: { type: Boolean, default: false },
        },
      ],
      default: [],
    },
  },
  { timestamps: true }
);

const Checklist = mongoose.model<IChecklist>("Checklist", ChecklistSchema);
export default Checklist;
