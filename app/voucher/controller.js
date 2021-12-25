const Voucher = require('./model');
const Category = require('../category/model');
const Nominal = require('../nominal/model');
const path = require('path');
const fs = require('fs');
const config = require('../../config');

module.exports = {
  index: async (req, res) => {
    try {
      const alertMessage = req.flash('alertMessage');
      const alertStatus = req.flash('alertStatus');

      const alert = { message: alertMessage, status: alertStatus };

      const vouchers = await Voucher.find()
        .populate('category')
        .populate('nominals');

      res.render('admin/voucher/view_voucher.ejs', {
        vouchers,
        alert,
      });
    } catch (error) {
      req.flash('alertMessage', error.message);
      req.flash('alertStatus', 'danger');
      res.redirect('/voucher');
    }
  },
  viewCreate: async (req, res) => {
    try {
      const categories = await Category.find();
      const nominals = await Nominal.find();

      res.render('admin/voucher/create', {
        categories,
        nominals,
      });
    } catch (error) {
      req.flash('alertMessage', error.message);
      req.flash('alertStatus', 'danger');
      res.redirect('/voucher');
    }
  },
  actionCreate: async (req, res) => {
    try {
      const { name, category, nominals } = req.body;

      if (req.file) {
        let tmp_path = req.file.path;
        let splittedOrgName = req.file.originalname.split('.');
        let originalExt = splittedOrgName[splittedOrgName.length - 1];
        let filename = req.file.filename + '.' + originalExt;
        let target_path = path.resolve(
          config.rootPath,
          `public/uploads/${filename}`
        );

        const src = fs.createReadStream(tmp_path);
        const dest = fs.createWriteStream(target_path);

        src.pipe(dest);

        src.on('end', async () => {
          try {
            const voucher = new Voucher({
              name,
              category,
              nominals,
              thumbnail: filename,
            });
            await voucher.save();

            req.flash('alertMessage', 'Berhasil tambah voucher');
            req.flash('alertStatus', 'success');

            res.redirect('/voucher');
          } catch (error) {
            req.flash('alertMessage', error.message);
            req.flash('alertStatus', 'danger');
            res.redirect('/voucher');
          }
        });
      } else {
        try {
          const voucher = new Voucher({
            name,
            category,
            nominals,
          });
          await voucher.save();

          req.flash('alertMessage', 'Berhasil tambah voucher');
          req.flash('alertStatus', 'success');

          res.redirect('/voucher');
        } catch (error) {
          req.flash('alertMessage', error.message);
          req.flash('alertStatus', 'danger');
          res.redirect('/voucher');
        }
      }
    } catch (error) {
      req.flash('alertMessage', error.message);
      req.flash('alertStatus', 'danger');
      res.redirect('/nominal');
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
