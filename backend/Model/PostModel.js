const mongoose = require("mongoose");

const commentSchema = new mongoose.Schema(
  {
    userId: { type: String, required: true },
    text: { type: String, required: true },
  },
  { timestamps: true }
);

const postSchema = new mongoose.Schema(
  {
    heading: { type: String },
    description: { type: String },
    image: { type: String }, // base64 or url
    postType: { type: String, default: "general" }, // e.g. job, photo, update
    referenceId: { type: String }, // optional id of job/photo/update
    postedBy: { type: String }, // display name of author
    postedById: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }, // user id
    collegeId: { type: mongoose.Schema.Types.ObjectId, ref: 'College' }, // institution isolation
    likes: { type: [String], default: [] }, // array of userIds who liked
    comments: { type: [commentSchema], default: [] },
    shares: { type: Number, default: 0 },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Post", postSchema);
