var express = require('express');
var router = express.Router();
var User = require('../models/user');

router.get('/', function (req, res, next) {
    return res.render('index.ejs');
});

router.post('/', function (req, res, next) {
    console.log("user new", req.body);
    var personInfo = req.body;

    // Ensure all fields are provided
    if (!personInfo.firstname || !personInfo.lastname || !personInfo.email || !personInfo.username || !personInfo.password || !personInfo.passwordConf) {
        res.status(400).send({ "Error": "All fields are required." });
    } else {
        if (personInfo.password === personInfo.passwordConf) {
            User.findOne({ email: personInfo.email }, function (err, data) {
                if (!data) {
                    var uniqueId;
                    User.findOne({}, function (err, data) {
                        uniqueId = data ? data.unique_id + 1 : 1;

                        var newPerson = new User({
                            unique_id: uniqueId,
                            firstname: personInfo.firstname,
                            lastname: personInfo.lastname,
                            email: personInfo.email,
                            username: personInfo.username,
                            password: personInfo.password,
                            passwordConf: personInfo.passwordConf
                        });

                        newPerson.save(function (err, Person) {
                            if (err) {
                                console.log(err);
                                res.status(500).send({ "Error": "Error saving user." });
                            } else {
                                console.log('Success');
                                res.send({ "Success": "You are registered, you can log in now." });
                            }
                        });
                    }).sort({ _id: -1 }).limit(1);
                } else {
                    res.send({ "Success": "Email is already used." });
                }
            });
        } else {
            res.send({ "Success": "Passwords do not match." });
        }
    }
});

// The rest of your routes remain unchanged
router.get('/login', function (req, res, next) {
    return res.render('login.ejs');
});

router.post('/login', function (req, res, next) {
    User.findOne({ email: req.body.email }, function (err, data) {
        if (data) {
            if (data.password === req.body.password) {
                req.session.userId = data.unique_id;
                res.send({ "Success": "Success!" });
            } else {
                res.send({ "Success": "Wrong password!" });
            }
        } else {
            res.send({ "Success": "This Email is not registered!" });
        }
    });
});
router.get('/profile', function (req, res, next) {
	console.log("profile");
	User.findOne({unique_id:req.session.userId},function(err,data){
		console.log("data");
		console.log(data);
		if(!data){
			res.redirect('/');
		}else{
			//console.log("found");
			return res.render('data.ejs', {"name":data.username,"email":data.email});
		}
	});
});

router.get('/logout', function (req, res, next) {
	console.log("logout")
	if (req.session) {
    // delete session object
    req.session.destroy(function (err) {
    	if (err) {
    		return next(err);
    	} else {
    		return res.redirect('/');
    	}
    });
}
});

router.get('/forgetpass', function (req, res, next) {
	res.render("forget.ejs");
});

router.post('/forgetpass', function (req, res, next) {
	//console.log('req.body');
	//console.log(req.body);
	User.findOne({email:req.body.email},function(err,data){
		console.log(data);
		if(!data){
			res.send({"Success":"This Email Is not regestered!"});
		}else{
			// res.send({"Success":"Success!"});
			if (req.body.password==req.body.passwordConf) {
			data.password=req.body.password;
			data.passwordConf=req.body.passwordConf;

			data.save(function(err, Person){
				if(err)
					console.log(err);
				else
					console.log('Success');
					res.send({"Success":"Password changed!"});
			});
		}else{
			res.send({"Success":"Password does not matched! Both Password should be same."});
		}
		}
	});
	
});

module.exports = router;