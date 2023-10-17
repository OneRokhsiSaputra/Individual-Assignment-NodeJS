const Category = require("../model/Category");

exports.create = async (req, res) => {
  if (!req.body.name) {
    res.status(400).send({ message: "Kategori wajib di isi" });
    return;
  }

  Category.create(req.body)
    .then(() => res.status(200).send({ message: "Kategori berhasil ditambahkan" }))
    .catch((err) => res.status(500).send(err));
};
