const mongoose = require('mongoose')

mongoose.connect('mongodb://127.0.0.1:27017/mongoku', {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useCreateIndex: true
})

// Membuat schema
// const Contact = mongoose.model('Contact', {
//     nama: { type: String, required: true },
//     nohp: { type: String, required: true },
//     email: { type: String }
// })

// Menambah 1 data
// const contact1 = new Contact({
//     nama: 'Doddi Nuo',
//     nohp: '0877676542234',
//     email: 'doddinuo@mail.com'
// })

// Simpan ke collection
// contact1.save().then((contact) => console.log(contact))