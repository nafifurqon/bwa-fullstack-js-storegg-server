const mongoose = require('mongoose');

const categorySchema = mongoose.Schema(
  {
    name: {
      type: String,
      require: [true, 'Nama kategori harus diisi'],
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Category', categorySchema);
