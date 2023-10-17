const slugify = require("slugify");

const Category = require("../model/Category");
const Post = require("../model/Post");
const Image = require("../model/Image");
const User = require("../model/User");

Category.hasMany(Post, { as: "category" });
Post.belongsTo(Category);

Post.belongsToMany(Image, { through: "PostImages" });
Image.belongsToMany(Post, { through: "PostImages" });

User.hasMany(Post, { as: "postId" });
Post.belongsTo(User);

exports.findAll = async (req, res) => {
  try {
    const posts = await Post.findAll();
    if (posts.length == 0) return res.status(404).send({ message: "Tidak ada post." });

    res.status(200).send(posts);
  } catch (err) {
    res.status(500).send({ message: err });
  }
};

exports.findOnePostBySlug = async (req, res) => {
  try {
    const slug = req.params.slug;
    const post = await Post.findOne({ where: { slug } });

    if (!post) return res.status(404).send({ message: "Post tidak ada" });

    res.status(200).send(post);
  } catch (err) {
    res.status(500).send({ message: err });
  }
};

exports.create = async (req, res) => {
  try {
    const { title, content, category, images } = req.body;

    const userId = req.payload.id;

    if (!title || !content || !category) {
      return res.status(400).send("Silakan masukkan judul konten dan kategori untuk post.");
    }

    const user = await User.findOne({ where: { id: userId } });

    const slug = slugify(title, { lower: true });
    const slugExist = await Post.findOne({ where: { slug } });
    if (slugExist) {
      req.body.slug = `${slug}-${Date.now()}`;
    } else {
      req.body.slug = slug;
    }

    const post = await Post.create({
      title: title,
      content: content,
      slug: req.body.slug,
    });

    await post.setUser(user);

    // menambahkan gambar
    if (images.length > 0) {
      for (const image of images) {
        let [img] = await Image.findOrCreate({ where: { image: image.image } });
        await post.addImage(img);
      }
    }

    // menambah kategori
    const existCategory = await Category.findOne({ where: { name: category.name } });
    if (existCategory) {
      await post.setCategory(existCategory);
    } else {
      const newCategory = await Category.create({ name: category.name });
      await post.setCategory(newCategory);
    }

    res.status(200).send({ message: "Post telah di buat." });
  } catch (err) {
    res.status(500).send(err);
  }
};

// update post
exports.update = async (req, res) => {
  try {
    const postId = req.params.id;
    const userId = req.payload.id;
    const { title, content, category, images } = req.body;

    const post = await Post.findByPk(postId);

    if (!post) return res.status(404).send({ message: "Post tidak ada." });

    if (post.UserId !== userId) return res.status(403).send({ message: "Anda tidak bisa melakukan tindakan ini." });

    // check kategori
    const categoryExist = await Category.findOne({ where: { name: category.name } });
    if (categoryExist) {
      await post.setCategory(categoryExist);
    } else {
      const newCategory = await Category.create({ name: category.name });
      await post.setCategory(newCategory);
    }

    // mengapus gambar
    const postImages = await post.getImages();
    await post.removeImage(postImages);

    // menambah gambar

    if (images.length > 0) {
      for (const image of images) {
        let [img] = await Image.findOrCreate({ where: { image: image.image } });
        await post.addImage(img);
      }
    }

    const slug = slugify(title, { lower: true });
    const slugExist = await Post.findOne({ where: { slug } });
    if (slugExist) {
      req.body.slug = `${slug}-${Date.now()}`;
    } else {
      req.body.slug = slug;
    }

    await Post.update(
      {
        title: title,
        content: content,
        slug: req.body.slug,
      },
      { where: { id: postId } }
    );

    res.status(200).send({ message: "Post telah di update." });
  } catch (err) {
    res.status(500).send({ message: err });
  }
};

// menghapus satu post
exports.deleteOne = async (req, res) => {
  try {
    const postId = req.params.id;
    const userId = req.payload.id;

    const post = await Post.findByPk(postId);
    if (!post) return res.status(400).send({ message: "Error: Post tidak ditemukan." });

    if (post.UserId !== userId) return res.status(403).send({ message: "Anda tidak bisa melakukan tindakan ini." });

    await Post.destroy({ where: { id: postId } });
    res.status(200).send({ message: "Post telah di hapus." });
  } catch (err) {
    res.status(500).send({ message: err });
  }
};

// menghapus semua post
exports.deleteAll = async (req, res) => {
  try {
    const userId = req.payload.id;
    const posts = await Post.findAll({ where: { user_id: userId } });

    if (posts.length == 0) return res.status(404).send({ message: "tidak ada post." });

    await Post.destroy({
      where: { user_id: userId },
      truncate: false,
    });

    res.status(200).send({ message: "Semua post telah di hapus." });
  } catch (err) {
    res.status(500).send({ message: err });
  }
};
