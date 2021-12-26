const Payment = require('./model');
const Bank = require('../bank/model');

module.exports = {
  index: async (req, res) => {
    try {
      const alertMessage = req.flash('alertMessage');
      const alertStatus = req.flash('alertStatus');

      const alert = { message: alertMessage, status: alertStatus };

      const payments = await Payment.find().populate('banks');
      res.render('admin/payment/view_payment.ejs', {
        payments,
        alert,
      });
    } catch (error) {
      req.flash('alertMessage', error.message);
      req.flash('alertStatus', 'danger');
      res.redirect('/payment');
    }
  },
  viewCreate: async (req, res) => {
    try {
      const banks = await Bank.find();

      res.render('admin/payment/create', {
        banks,
      });
    } catch (error) {
      req.flash('alertMessage', error.message);
      req.flash('alertStatus', 'danger');
      res.redirect('/payment');
    }
  },
  actionCreate: async (req, res) => {
    try {
      const { type, banks } = req.body;

      let payment = await Payment({ type, banks });
      await payment.save();

      req.flash('alertMessage', 'Berhasil tambah payment');
      req.flash('alertStatus', 'success');

      res.redirect('/payment');
    } catch (error) {
      req.flash('alertMessage', error.message);
      req.flash('alertStatus', 'danger');
      res.redirect('/payment');
    }
  },
  // viewEdit: async (req, res) => {
  //   try {
  //     const { id } = req.params;

  //     const nominal = await Nominal.findOne({ _id: id });

  //     res.render('admin/nominal/edit', {
  //       nominal,
  //     });
  //   } catch (error) {
  //     req.flash('alertMessage', error.message);
  //     req.flash('alertStatus', 'danger');
  //     res.redirect('/nominal');
  //   }
  // },
  // actionEdit: async (req, res) => {
  //   try {
  //     const { id } = req.params;
  //     const { coinName, coinQuantity, price } = req.body;

  //     await Nominal.findOneAndUpdate(
  //       { _id: id },
  //       { coinName, coinQuantity, price }
  //     );

  //     req.flash('alertMessage', 'Berhasil ubah nominal');
  //     req.flash('alertStatus', 'success');

  //     res.redirect('/nominal');
  //   } catch (error) {
  //     req.flash('alertMessage', error.message);
  //     req.flash('alertStatus', 'danger');
  //     res.redirect('/nominal');
  //   }
  // },
  // actionDelete: async (req, res) => {
  //   try {
  //     const { id } = req.params;

  //     await Nominal.findByIdAndRemove({ _id: id });

  //     req.flash('alertMessage', 'Berhasil hapus nominal');
  //     req.flash('alertStatus', 'success');

  //     res.redirect('/nominal');
  //   } catch (error) {
  //     req.flash('alertMessage', error.message);
  //     req.flash('alertStatus', 'danger');
  //     res.redirect('/nominal');
  //   }
  // },
};
