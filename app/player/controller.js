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
        .json({ message: error.message || 'Internal Server Error' });
    }
  },
  detailPage: async (req, res) => {
    try {
      const { id } = req.params;
      const vouchers = await Voucher.findOne({ _id: id })
        .populate('category')
        .populate('nominals')
        .populate('user', '_id name phoneNumber');

      if (!vouchers) {
        return res
          .status(404)
          .json({ message: 'Voucher game tidak ditemukan' });
      }

      res.status(200).json({ data: vouchers });
    } catch (error) {
      res
        .status(500)
        .json({ message: error.message || 'Internal Server Error' });
    }
  },
};
