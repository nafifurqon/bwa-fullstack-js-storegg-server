const Voucher = require("./model");
const Category = require("../category/model");
const Nominal = require("../nominal/model");
const path = require("path");
const fs = require("fs");
const config = require("../../config");
const cloudinary = require("../../helper/image-upload");

module.exports = {
  index: async (req, res) => {
    try {
      const alertMessage = req.flash("alertMessage");
      const alertStatus = req.flash("alertStatus");

      const alert = { message: alertMessage, status: alertStatus };

      const vouchers = await Voucher.find()
        .populate("category")
        .populate("nominals");

      res.render("admin/voucher/view_voucher.ejs", {
        vouchers,
        alert,
        name: req.session.user.name,
        title: "Halaman voucher",
      });
    } catch (error) {
      req.flash("alertMessage", error.message);
      req.flash("alertStatus", "danger");
      res.redirect("/voucher");
    }
  },
  viewCreate: async (req, res) => {
    try {
      const categories = await Category.find();
      const nominals = await Nominal.find();

      res.render("admin/voucher/create", {
        categories,
        nominals,
        name: req.session.user.name,
        title: "Halaman tambah voucher",
      });
    } catch (error) {
      req.flash("alertMessage", error.message);
      req.flash("alertStatus", "danger");
      res.redirect("/voucher");
    }
  },
  actionCreate: async (req, res) => {
    try {
      const { name, category, nominals } = req.body;

      if (req.file) {
        try {
          const uploadResult = await cloudinary.uploader.upload(req.file.path);

          const voucher = new Voucher({
            name,
            category,
            nominals,
            thumbnail: uploadResult.url,
          });
          await voucher.save();

          req.flash("alertMessage", "Berhasil tambah voucher");
          req.flash("alertStatus", "success");

          res.redirect("/voucher");
        } catch (error) {
          req.flash("alertMessage", error.message);
          req.flash("alertStatus", "danger");
          res.redirect("/voucher");
        }
      } else {
        try {
          const voucher = new Voucher({
            name,
            category,
            nominals,
          });
          await voucher.save();

          req.flash("alertMessage", "Berhasil tambah voucher");
          req.flash("alertStatus", "success");

          res.redirect("/voucher");
        } catch (error) {
          req.flash("alertMessage", error.message);
          req.flash("alertStatus", "danger");
          res.redirect("/voucher");
        }
      }
    } catch (error) {
      req.flash("alertMessage", error.message);
      req.flash("alertStatus", "danger");
      res.redirect("/nominal");
    }
  },
  viewEdit: async (req, res) => {
    try {
      const { id } = req.params;

      const voucher = await Voucher.findOne({ _id: id })
        .populate("category")
        .populate("nominals");
      const categories = await Category.find();
      const nominals = await Nominal.find();

      const localImagePath = `${config.rootPath}/public/uploads/${voucher.thumbnail}`;

      if (fs.existsSync(localImagePath)) {
        voucher.thumbnail = localImagePath;
      }

      res.render("admin/voucher/edit", {
        voucher,
        categories,
        nominals,
        name: req.session.user.name,
        title: "Halaman ubah voucher",
      });
    } catch (error) {
      req.flash("alertMessage", error.message);
      req.flash("alertStatus", "danger");
      res.redirect("/voucher");
    }
  },
  actionEdit: async (req, res) => {
    try {
      const { id } = req.params;
      const { name, category, nominals } = req.body;

      if (req.file) {
        try {
          const voucher = await Voucher.findOne({ _id: id });

          const currentImage = `${config.rootPath}/public/uploads/${voucher.thumbnail}`;
          if (fs.existsSync(currentImage)) {
            fs.unlinkSync(currentImage);
          }

          if (voucher.thumbnail && voucher.thumbnail.includes("cloudinary")) {
            const splittedImagePath = voucher.thumbnail.split("/");
            const originalPublicId =
              splittedImagePath[splittedImagePath.length - 1];
            const publicId = originalPublicId.split(".")[0];

            const destroyImageResult = await cloudinary.uploader.destroy(
              publicId
            );
          }

          const uploadResult = await cloudinary.uploader.upload(req.file.path);

          await Voucher.findOneAndUpdate(
            { _id: id },
            {
              name,
              category,
              nominals,
              thumbnail: uploadResult.url,
            }
          );

          req.flash("alertMessage", "Berhasil ubah voucher");
          req.flash("alertStatus", "success");

          res.redirect("/voucher");
        } catch (error) {
          req.flash("alertMessage", error.message);
          req.flash("alertStatus", "danger");
          res.redirect("/voucher");
        }
      } else {
        try {
          await Voucher.findOneAndUpdate(
            { _id: id },
            {
              name,
              category,
              nominals,
            }
          );

          req.flash("alertMessage", "Berhasil ubah voucher");
          req.flash("alertStatus", "success");

          res.redirect("/voucher");
        } catch (error) {
          req.flash("alertMessage", error.message);
          req.flash("alertStatus", "danger");
          res.redirect("/voucher");
        }
      }
    } catch (error) {
      req.flash("alertMessage", error.message);
      req.flash("alertStatus", "danger");
      res.redirect("/nominal");
    }
  },
  actionDelete: async (req, res) => {
    try {
      const { id } = req.params;

      const voucher = await Voucher.findByIdAndRemove({ _id: id });

      let currentImage = `${config.rootPath}/public/uploads/${voucher.thumbnail}`;
      if (fs.existsSync(currentImage)) {
        fs.unlinkSync(currentImage);
      }

      req.flash("alertMessage", "Berhasil hapus voucher");
      req.flash("alertStatus", "success");

      res.redirect("/voucher");
    } catch (error) {
      req.flash("alertMessage", error.message);
      req.flash("alertStatus", "danger");
      res.redirect("/voucher");
    }
  },
  actionStatus: async (req, res) => {
    try {
      const { id } = req.params;

      let voucher = await Voucher.findOne({ _id: id });

      const status = voucher.status === "Y" ? "N" : "Y";

      voucher = await Voucher.findOneAndUpdate({ _id: id }, { status });

      req.flash("alertMessage", "Berhasil ubah status voucher");
      req.flash("alertStatus", "success");

      res.redirect("/voucher");
    } catch (error) {
      req.flash("alertMessage", error.message);
      req.flash("alertStatus", "danger");
      res.redirect("/voucher");
    }
  },
};
