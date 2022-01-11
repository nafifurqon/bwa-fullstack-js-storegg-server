const User = require('./model');
const bcrypt = require('bcryptjs');

module.exports = {
  viewSignIn: async (req, res) => {
    try {
      const alertMessage = req.flash('alertMessage');
      const alertStatus = req.flash('alertStatus');

      const alert = { message: alertMessage, status: alertStatus };

      if (req.session.user === null || req.session.user === undefined) {
        res.render('admin/users/view_signin.ejs', {
          alert,
          title: 'Halaman sign in',
        });
      } else {
        res.redirect('/dashboard');
      }
    } catch (error) {
      req.flash('alertMessage', error.message);
      req.flash('alertStatus', 'danger');
      res.redirect('/');
    }
  },
  actionSignIn: async (req, res) => {
    try {
      const { email, password } = req.body;
      const user = await User.findOne({ email });

      if (user) {
        if (user.status === 'Y') {
          const checkPassword = await bcrypt.compare(password, user.password);

          if (checkPassword) {
            req.session.user = {
              id: user._id,
              email: user.email,
              status: user.status,
              name: user.name,
            };
            res.redirect('/dashboard');
          } else {
            req.flash('alertMessage', 'Password yang anda inputkan salah');
            req.flash('alertStatus', 'danger');
            res.redirect('/');
          }
        } else {
          req.flash('alertMessage', 'Status anda belum aktif');
          req.flash('alertStatus', 'danger');
          res.redirect('/');
        }
      } else {
        req.flash('alertMessage', 'Email tidak terdaftar');
        req.flash('alertStatus', 'danger');
        res.redirect('/');
      }
    } catch (error) {
      req.flash('alertMessage', error.message);
      req.flash('alertStatus', 'danger');
      res.redirect('/');
    }
  },
  actionLogout: async (req, res) => {
    try {
      req.session.destroy();
      res.redirect('/');
    } catch (error) {
      req.flash('alertMessage', error.message);
      req.flash('alertStatus', 'danger');
      res.redirect('/');
    }
  }
};
