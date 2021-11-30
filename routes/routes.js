const express= require('express');
const router = express.Router();
const Product = require('../models/products');
const multer = require('multer');
const fs = require('fs');

//image upload
var storage = multer.diskStorage({
    destination: function(req,res,cb){
        cb(null,"./uploads");
    },
    filename: function(req,file,cb){
        cb(null, file.fieldname + "" + Date.now() + "" + file.originalname);
    },
});

var upload= multer({
storage: storage,
}).single("image");

// Insert an product to the database
router.post('/add',upload,function(req,res){
    const product = new Product({
        name: req.body.name,
        description: req.body.description,
        image: req.file.filename,
    });
    product.save(function(err){
        if(err){
            res.json({message: err.message, type:'danger'});
        }else{
            req.session.message = {
                type: 'success',
                message: 'Product Added Successfully!',
            };
            res.redirect('/');
        }
    })
});

// Get all products route
router.get('/',function(req,res){
    Product.find().exec(function(err,products){
if(err){
    res.json({message: err.message});
}else{
    res.render('index',{
        title: 'Home Page',
        products: products,
    })
}
})
});

router.get('/', function(req,res){
res.render('index', {title:'Home Page'});
});

router.get('/add',function(req,res){
    res.render('add_products',{title:'Add Product Page'});
})

//Edit an product route
router.get("/edit/:id", function(req,res){
let id = req.params.id;
Product.findById(id,function(err,product){
if(err){
    res.redirect('/');
}else{
    if(product == null){
        res.redirect('/');
    }else{
    res.render("edit_products",{
        title: "Edit Product",
        product: product,
    });
}
}
});
});

//Update product route
router.post('/update/:id',upload,function(req,res){
    let id = req.params.id;
    let new_image = '';

    if(req.file){
        new_image = req.file.filename;
        try{
            fs.unlinkSync('./uploads/' + req.body.old_image)
        }catch(err){
            console.log(err);
        }
    }else{
        new_image = req.body.old_image;
    }

    Product.findByIdAndUpdate(id,{
        name: req.body.name,
        description: req.body.description,
        image: new_image,
    }),function(err,result){
        if(err){
            res.json({ message: err.message, type: 'danger'});
        }else{
            req.session.message = {
                type: 'success',
                message: 'Product updated Successfully!',
            };
            res.redirect('/');
        }
}
});

//Delete product route
router.get("/delete/:id",function(req,res){
    let id = req.params.id;
    Product.findByIdAndRemove(id,function(err,result){
        if(result.image != ""){
            try{
                fs.unlinkSync("./uoloads/" + result.image);
            }catch(err){
                console.log(err);
            }
        }
        if(err){
            res.json({message: err.message});
        }else{
            req.session.message ={
                type: "info",
                message: "Product deleted successfully!",
            };
            res.redirect("/");
        }
    });
});

module.exports= router;