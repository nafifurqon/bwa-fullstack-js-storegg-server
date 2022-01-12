const Voucher = require('../voucher/model');
const Transaction = require('../transaction/model');
const Player = require('../player/model');
const Category = require('../category/model');

module.exports = {
  index: async (req, res) => {
    try {
      const voucher = await Voucher.countDocuments();
      const transaction = await Transaction.countDocuments();
      const player = await Player.countDocuments();
      const category = await Category.countDocuments();

      res.render('admin/dashboard/view_dashboard', {
        name: req.session.user.name,
        title: 'Halaman dashboard',
        count: {
          voucher,
          transaction,
          player,
          category,
        }
      });
    } catch (error) {
      console.log(`error`, error);
    }
  },
};
