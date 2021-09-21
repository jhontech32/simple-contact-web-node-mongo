const express = require('express')
const expressLayouts = require('express-ejs-layouts')

const { body, validationResult, check } = require('express-validator')
const methodOverride = require('method-override')

const session = require('express-session')
const cookieParser = require('cookie-parser')
const flash = require('connect-flash')

require('./utils/db')
const Contact = require('./models/contact')

const app = express()
const port = 3000

app.use(methodOverride('_method'))

// SETUP EJS AS TEMPLATING ENGINE
app.set('view engine', 'ejs')
app.use(expressLayouts) // third party middleware
app.use(express.static('public')) // built in middleware
app.use(express.urlencoded({ extended: true }))

// KONFIGURASI FLASH
app.use(cookieParser('secret'))
app.use(
    session({
        cookie: { maxAge: 6000 },
        secret: 'secret',
        resave: true,
        saveUninitialized: true
    })
)
app.use(flash())

// HALAMAN HOME
app.get('/', (req, res) => {
    const datas = [
        {
            nama: 'Jhony',
            email: 'jhony@mail.com'
        },
        {
            nama: 'Joko',
            email: 'joko123@mail.com'
        },
        {
            nama: 'Inami',
            email: 'inamio@mail.com'
        },
        {
            nama: 'Erick',
            email: 'erick@mail.com'
        },
        {
            nama: 'Erick',
            email: 'erick@mail.com'
        }
    ]
    res.render('index', {
        layout: 'layouts/main-layout',
        nama: 'Jhony',
        datas,
        title: 'Halaman Home'
    })

    console.log('ini halaman home')
})

// HALAMAN ABOUT
app.get('/about', (req, res) => {
    res.render('about', {
        title: 'Halaman About',
        layout: 'layouts/main-layout'
    })
})

// HALAMAN CONTACT
app.get('/contact', async (req, res) => {
    const contacts = await Contact.find()

    res.render('contact', {
        title: 'Halaman Contact',
        layout: 'layouts/main-layout',
        contacts,
        msg: req.flash('msg')
    })
})

// HALAMAN TAMBAH CONTACT
app.get('/contact/add', (req, res) => {
    res.render('add-contact', {
        title: 'Form Tambah Data Contact',
        layout: 'layouts/main-layout'
    })
})

// PROSES TAMBAH DATA CONTACT
app.post(
    '/contact',
    [
        body('nama').custom(async (value) => {
            const duplikat = await Contact.findOne({ nama: value })
            if(duplikat) {
                throw new Error('Nama contact sudah digunakan !')
            }

            return true
        }),
        check('email', 'Email tidak valid !').isEmail(),
        check('nohp', 'No hp tidak valid !').isMobilePhone('id-ID')
    ],
    (req, res) => {
        const errors = validationResult(req)
        console.log('errors', errors)
        if(!errors.isEmpty()) {
            res.render('add-contact', {
                title: 'Form Tambah Data Contact',
                layout: 'layouts/main-layout',
                errors: errors.array()
            })
        } else {
            Contact.insertMany(req.body, (error, result) => {
                // kirimkan flash message
                req.flash('msg', 'Data contact berhasil ditambahkan !')
                res.redirect('/contact')
            })
        }
    }
)

// HALAMAN DETAIL CONTACT
app.get('/contact/detail/:nama', async (req, res) => {
    // const contact = findContact(req.params.nama)
    const contact = await Contact.findOne({ nama: req.params.nama })

    res.render('detail', {
        title: 'Halaman detail contact',
        layout: 'layouts/main-layout',
        contact,
    })
})

app.delete('/contact', async (req, res) => {
    Contact.deleteOne({ nama: req.body.nama }).then((result) => {
        req.flash('msg', 'Data contact berhasil di hapus !')
        res.redirect('/contact')  
    })
})

app.put( 
    '/contact', 
    [
        body('nama').custom(async (value, { req }) => {
            const duplikat = await Contact.findOne({ nama: value })
            if(value !== req.body.oldNama && duplikat) {
                throw new Error('Nama contact sudah digunakan !')
            }

            return true
        }),
        check('email', 'Email tidak valid !').isEmail(),
        check('nohp', 'No hp tidak valid !').isMobilePhone('id-ID')
    ], 
    async (req, res) => {
        console.log('iddd', req.body._id)
        const errors = validationResult(req)
        if(!errors.isEmpty()) {
            res.render('edit-contact', {
                title: 'Form Ubah Data Contact',
                layout: 'layouts/main-layout',
                errors: errors.array(),
                contact: req.body
            })
        } else {
            Contact.updateOne(
                { _id: req.body._id },
                {
                    $set: {
                        nama: req.body.nama,
                        email: req.body.email,
                        nohp: req.body.nohp
                    }
                }
            ).then((result) => {
                req.flash('msg', 'Data contact berhasil di ubah !')
                res.redirect('/contact')  
            })
        }
})

app.get('/contact/edit/:nama', async (req, res) => {
    const contact = await Contact.findOne({ nama: req.params.nama })

    res.render('edit-contact', {
        title: 'Form Ubah Data Contact',
        layout: 'layouts/main-layout',
        contact
    })
})

app.use((req, res) => {
    res.status(404)
    res.send('404 Not found !')
})

app.listen(port, () => {
    console.log(`Listening at http://localhost:${port}`)
})