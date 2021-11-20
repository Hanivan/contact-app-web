const mongoose = require("mongoose");
mongoose.connect("mongodb://127.0.0.1:27017/wpu", {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  useCreateIndex: true,
});

// // Menambahkan 1 data
// const contact1 = new Contact({
//   nama: "Adam",
//   nohp: "08125656789",
//   email: "adamf76@gmail.com",
// });

// // Simpan ke collection
// contact1.save().then((contact) => console.log(contact));
