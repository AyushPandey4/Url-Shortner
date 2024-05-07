const mongoose = require('mongoose');
mongoose.connect('mongodb://localhost:27017/urlShortner');

const urlschema = new mongoose.Schema({
    originalURL: String,
    shortURL: String,
    clicked: { type: Number, default: 0 }
});

const urlmodel = mongoose.model('urls', urlschema);



const path = require("path")
const shortUrl = require("node-url-shortener");
const express = require('express');
const app = express();
const port = 4500;

app.set('view engine', 'ejs');
app.use(express.urlencoded({ extended: true }));

app.get('/', async (req, res) => {
    let data = await urlmodel.find();
    res.render('home',{data});
})

app.post('/result',  (req, res) => {
    const url = req.body.url;
    console.log(req.body.url);
    shortUrl.short(url, function (err, resulturl) {
        if (err) {
            console.error(err);
            res.status(500).send('Error shortening URL');
        } else {
            const shortUrl = resulturl;
            const newUrl = new urlmodel({
                originalURL: url,
                shortURL: shortUrl
            });
             newUrl.save()
                .then(() => {
                    res.render('result', {shortUrl });
                })
                .catch(err => {
                    console.error(err);
                    res.status(500).send('Error saving URL');
                });

            }})
    });


    app.get('/:shorturl', async (req, res) => {
        try {
            const shorturl = 'https://cdpt.in/' + req.params.shorturl;
            const foundurl = await urlmodel.findOne({ shortURL: shorturl });
            if (!foundurl) {
                return res.status(404).send('URL Not Found');
            }
            
            // Increment the clicked count for the found URL
            foundurl.clicked++;
            
            // Save the updated document
            await foundurl.save();
            
            // Redirect the user to the original URL
            res.redirect(foundurl.originalURL);
        } catch (error) {
            console.error(error);
            res.status(500).send('Internal Server Error');
        }
    });
    

app.listen(port, () => {
    console.log("server is running on", port)
})