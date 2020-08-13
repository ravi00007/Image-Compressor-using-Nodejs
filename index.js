const express = require('express');
const multer = require('multer');
const bodyparse = require('body-parser');
const path = require('path');
const { nextTick } = require('process');
const imagemin = require('imagemin');
const imageminJpegtran = require('imagemin-jpegtran');
const imageminPngquant = require('imagemin-pngquant')


const app = express()


app.use('/uploads',express.static(path.join(__dirname + 'uploads')));
app.set('view engine','ejs');
app.use(bodyparse.json());
app.use(bodyparse.urlencoded({extended:true}));

const storage = multer.diskStorage({
    destination:function(req,file,cb){
        cb(null,"uploads")
    },
    filename:function(req,file,cb){
        cb(null,file.fieldname + '-' + Date.now() + path.extname(file.originalname));

    }
}) 

const upload = multer({
    storage:storage
})

app.get('/',(req,res)=>{
    res.render("index")
})       
                 

app.post('/',upload.single('image'),(req,res,next)=>{
    const file = req.file
    var ext
    if(!file){
        const error = new Error('Please upload a file')
        error.httpStatusCoad= 404
        return next(error)
    }
    if(file.mimetype=="image/jpeg"){
       ext = "jpeg"
    }
    if(file.mimetype == "image/png"){
        ext = "png"
    }
    res.render('image',{url:file.path,name:file.filename,ext:ext})
})

app.post('/compress/uploads/:name/:ext',async(req,res)=>{
  const files = await imagemin(["uploads/" + req.params.name],{
      destination:"output",
      plugins: [
          imageminJpegtran(),
          imageminPngquant({
              quality:[0.3,0.5]
          })
      ]
  })

  // download the image
  res.download(files[0].destinationPath)
})

app.listen(process.env.PORT || 3000, function(){
    console.log("Express server listening on port %d in %s mode", this.address().port, app.settings.env);
  });



