const mongoose = require('mongoose');

const TokenSchema = new mongoose.Schema({
  token: { type: String, unique: true, index: true },
  email: { type: String },
  name: { type: String },
  createdAt: { type: Date, default: Date.now },
  expiresAt: { type: Date },
  usedAt: { type: Date, default: null },
  allowMultiple: { type: Boolean, default: false }
}, { versionKey: false });

TokenSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0, partialFilterExpression: { expiresAt: { $exists: true } } });

const SubmissionSchema = new mongoose.Schema({
  reportId: { type: String, index: true },
  candidate: {
    name: String,
    email: String
  },
  token: String,
  meta: {
    submittedAt: Date,
    durationSec: Number,
    userAgent: String,
    times: {
      logic: Object, // { q1: ms, ... }
      soft: Object   // { s1: ms, ... }
    }
  },
  scored: Object
}, { timestamps: true, versionKey: false });

const Token = mongoose.models.Token || mongoose.model('Token', TokenSchema);
const Submission = mongoose.models.Submission || mongoose.model('Submission', SubmissionSchema);

module.exports = { Token, Submission };
