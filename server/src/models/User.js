import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

/**
 * Schema Modeling (MongoDB / Mongoose)
 *
 * Demonstrates:
 *  - Sub-documents (preferences)
 *  - Custom validators
 *  - Indexes (unique, compound)
 *  - Instance methods
 *  - Pre-save middleware hook
 *  - Virtuals
 *  - toJSON transform (strip sensitive fields)
 *  - Default values
 */

// ─── Sub-document: user preferences ────────────────────────────────────────
const preferencesSchema = new mongoose.Schema(
  {
    currency: {
      type: String,
      // Custom validator: must be a valid ISO 4217 currency code (3 uppercase letters)
      validate: {
        validator: (v) => /^[A-Z]{3}$/.test(v),
        message: (props) => `${props.value} is not a valid ISO 4217 currency code`,
      },
      default: 'INR',
    },
    dateFormat: {
      type: String,
      enum: ['DD/MM/YYYY', 'MM/DD/YYYY', 'YYYY-MM-DD'],
      default: 'DD/MM/YYYY',
    },
    notificationsEnabled: {
      type: Boolean,
      default: true,
    },
  },
  { _id: false } // no separate _id for embedded sub-documents
);

// ─── Main User schema ────────────────────────────────────────────────────────
const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Please add a name'],
      trim: true,
      minlength: [2, 'Name must be at least 2 characters'],
      maxlength: [50, 'Name cannot exceed 50 characters'],
    },
    email: {
      type: String,
      required: [true, 'Please add an email'],
      unique: true, // creates a unique index automatically
      lowercase: true,
      trim: true,
      // Custom email format validator — no external library needed
      validate: {
        validator: (v) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v),
        message: (props) => `${props.value} is not a valid email address`,
      },
    },
    password: {
      type: String,
      required: [true, 'Please add a password'],
      minlength: [6, 'Password must be at least 6 characters'],
      select: false, // never returned in queries unless explicitly requested
    },
    avatar: {
      type: String,
      default: null, // URL to a profile picture (e.g., from an upload service)
    },
    theme: {
      type: String,
      enum: ['light', 'dark', 'system'],
      default: 'light',
    },
    monthlyBudget: {
      type: Number,
      default: 50000,
      min: [0, 'Monthly budget cannot be negative'],
    },
    // Embedded sub-document: user preferences (not a separate collection)
    preferences: {
      type: preferencesSchema,
      default: () => ({}), // factory default so every user gets a preferences object
    },
    isActive: {
      type: Boolean,
      default: true,
      index: true, // simple index — speeds up queries filtering by account status
    },
  },
  {
    timestamps: true, // adds createdAt + updatedAt automatically
  }
);

// ─── Indexes ─────────────────────────────────────────────────────────────────
// Compound index: speeds up queries that filter/sort by email AND createdAt
// e.g., admin dashboards listing users ordered by sign-up date
userSchema.index({ email: 1, createdAt: -1 });

// ─── Virtuals ────────────────────────────────────────────────────────────────
// A virtual is a computed property that is NOT stored in the database.
// It is derived on-the-fly from existing fields.
userSchema.virtual('displayName').get(function () {
  // Returns "John D." — useful for UI display without storing a redundant field
  const parts = this.name.trim().split(' ');
  if (parts.length === 1) return parts[0];
  return `${parts[0]} ${parts[parts.length - 1][0]}.`;
});

// ─── toJSON transform ────────────────────────────────────────────────────────
// Controls what gets serialised when res.json(user) is called.
// Removes password and __v from every API response automatically — no need
// to remember to call .select('-password') everywhere.
userSchema.set('toJSON', {
  virtuals: true, // include virtual fields like displayName
  versionKey: false, // remove __v
  transform: (_doc, ret) => {
    delete ret.password; // never expose the hashed password
    return ret;
  },
});

// ─── Pre-save middleware ─────────────────────────────────────────────────────
// Runs before every .save(). Hashes the password only when it has been modified
// (new user or explicit password change) — avoids re-hashing on profile updates.
userSchema.pre('save', async function () {
  if (!this.isModified('password')) return;
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

// ─── Instance methods ─────────────────────────────────────────────────────────
/**
 * Compares a plain-text password against the stored bcrypt hash.
 * Used in the login controller.
 * Must use a regular function (not an arrow function) so `this` refers
 * to the Mongoose document instance.
 */
userSchema.methods.matchPassword = async function (enteredPassword) {
  // password has select:false so we need to explicitly load it for comparison
  const user = await mongoose.model('User').findById(this._id).select('+password');
  return bcrypt.compare(enteredPassword, user.password);
};

/**
 * Returns a sanitised plain object safe to send to the client.
 * Strips password and internal Mongoose fields.
 * Includes the JWT token passed in so callers get one consistent shape.
 */
userSchema.methods.toAuthJSON = function (token) {
  return {
    _id: this._id,
    name: this.name,
    displayName: this.displayName, // virtual
    email: this.email,
    avatar: this.avatar,
    theme: this.theme,
    monthlyBudget: this.monthlyBudget,
    preferences: this.preferences,
    token,
  };
};

const User = mongoose.model('User', userSchema);

export default User;
