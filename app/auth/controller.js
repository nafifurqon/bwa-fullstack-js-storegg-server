const Player = require("../player/model");
const path = require("path");
const fs = require("fs");
const config = require("../../config");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const cloudinary = require("../../helper/image-upload");

module.exports = {
  signup: async (req, res, next) => {
    try {
      const payload = req.body;

      if (req.file) {
        try {
          const uploadResult = await cloudinary.uploader.upload(req.file.path);

          const player = new Player({ ...payload, avatar: uploadResult.url });

          await player.save();

          delete player._doc.password;

          res.status(201).json({
            data: player,
          });
        } catch (error) {
          if (error && error.name === "ValidationError") {
            return res.status(422).json({
              error: 1,
              message: error.message,
              fields: error.errors,
            });
          }
          next(error);
        }
      } else {
        let player = new Player(payload);

        await player.save();

        delete player._doc.password;

        res.status(201).json({
          data: player,
        });
      }
    } catch (error) {
      if (error && error.name === "ValidationError") {
        return res.status(422).json({
          error: 1,
          message: error.message,
          fields: error.errors,
        });
      }
      next(error);
    }
  },
  signin: async (req, res, next) => {
    const { email, password } = req.body;

    Player.findOne({ email: email })
      .then((player) => console.log("player", player))
      .catch((error) => console.log("error", error));

    Player.findOne({ email: email })
      .then((player) => {
        if (player) {
          const checkPassword = bcrypt.compareSync(password, player.password);

          if (checkPassword) {
            const token = jwt.sign(
              {
                player: {
                  id: player.id,
                  username: player.username,
                  email: player.email,
                  name: player.name,
                  phoneNumber: player.phoneNumber,
                  avatar: player.avatar,
                },
              },
              config.jwtKey
            );

            res.status(200).json({
              data: { token },
            });
          } else {
            res.status(403).json({
              message: "kata sandi yang anda masukkan salah.",
            });
          }
        } else {
          res.status(403).json({
            message: "email yang anda masukkan belum terdaftar.",
          });
        }
      })
      .catch((error) => {
        res.status(500).json({
          message: error.message || "Internal Server Error",
        });

        next();
      });
  },
};
