const mongoose = require('mongoose');

const bankSchema = mongoose.Schema({
  name: {
    type: String,
    require: [true, 'Nama pemilik harus diisi'],
  },
  bankName: {
    type: String,
    require: [true, 'Nama bank harus diisi'],
  },
  accountNumber: {
    type: String,
    require: [true, 'Nomor rekening bank harus diisi'],
  },
});

module.exports = mongoose.model('Bank', bankSchema);
