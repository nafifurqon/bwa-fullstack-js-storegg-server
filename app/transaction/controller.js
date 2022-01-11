const Transaction = require('./model');

module.exports = {
  index: async (req, res) => {
    try {
      const alertMessage = req.flash('alertMessage');
      const alertStatus = req.flash('alertStatus');

      const alert = { message: alertMessage, status: alertStatus };

      const transactions = await Transaction.find();
      res.render('admin/transaction/view_transaction.ejs', {
        transactions,
        alert,
        name: req.session.user.name,
        title: 'Halaman transaksi',
      });
    } catch (error) {
      req.flash('alertMessage', error.message);
      req.flash('alertStatus', 'danger');
      res.redirect('/transaction');
    }
  },
}