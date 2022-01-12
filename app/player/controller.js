const Player = require('./model');
const Voucher = require('../voucher/model');

module.exports = {
  landingPage: async (req, res) => {
    try {
      const vouchers = await Voucher.find()
        .select('_id name status category thumbnail')
        .populate('category');

      res.status(200).json({ data: vouchers });
    } catch (error) {
      res
        .status(500)
        .json({ message: error.message || 'Terjadi kesalahan pada server' });
    }
  },
};
