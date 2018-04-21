var express = require("express");
var router = express.Router();
var passport = require("passport");

var User = require("../models/user");
var Campaign = require("../models/campaign");

router.use(function(req, res, next){
	res.locals.currentUser = req.user;
	res.locals.error = req.flash("error");
	res.locals.success = req.flash("success");
	next();
});

//========================================================
//HELPER FUNCTIONS
//========================================================

var CUSTOMER = true;
var COMPANY = false;

function dealWithError(err, param1, param2, param3) {
	console.log("Error occurred when retreiving with following parameters: " + param1 + ", " + param2 + ", " + param3 + "\n");
	console.log(err);
	res.redirect("/");
}

function dealWithNothingFound(param1, param2, param3) {
	console.log("Nothing found with following parameters: " + param1 + ", " + param2 + ", " + param3 + "\n");
	res.render("common/notfound");
}

function getUsersAndRender(res, bool, filename) {
	User.find({role:COMPANY}, function(err, allCompanies) {
		if(err) {
			dealWithError(err,bool,filename);
		} else {
			if(!allCompanies.length) {
				dealWithNothingFound(bool);
			} else {
				console.log("RETREIVED ALL " + bool + " USERS");
				res.render(filename, {companies:allCompanies});
			}
		}
	});
}

function getUserByIdAndRender(res, id, filename) {
	User.findById(id, function(err, foundCompany) {
		if(err) {
			dealWithError(err,id,filename);
		} else {
			if(!foundCompany) {
				dealWithNothingFound(id);
			} else {
				console.log("RETREIVED " + id + " USER");
				res.render(filename, {company:foundCompany});
			}

		}
	});
}
function getCampaignsAndRender(res, filename) {
	Campaign.find({}, function(err, allCampaigns) {
		if(err) {
			dealWithError(err,id,filename);
		} else {
			if(!allCampaigns.length) {
				dealWithNothingFound(id);
			} else {
				console.log("RETREIVED ALL CAMPAIGNS");
				res.render(filename, {campaigns:allCampaigns});
			}
		}
	});
}

function getCampaignByIdAndRender(res, id, filename) {
	Campaign.findById(id, function(err, foundCampaign) {
		if(err) {
			dealWithError(err,id,filename);
		} else {
			if(!foundCampaign) {
				dealWithNothingFound(id);
			} else {
				console.log("RETREIVED " + id + " CAMPAIGN");
				res.render(filename, {campaign:foundCampaign});
			}
		}
	});
}

function getAllOfTypeAndRender(res, Schema, filename) {
	Schema.find({}, function(err, retreived) {
		if(err) {
			dealWithError(err,filename);
		} else {
			if(!retreived) {
				dealWithNothingFound();
			} else {
				console.log("RETREIVED ALL " + Schema + "S:\n");
				console.log(retreived);
				res.render(filename, {retreived:retreived});
			}
		}
	});
}

//========================================================
//BASIC ROUTES 
//========================================================


// router.get("/companies/", function(req,res) {
// 	getUsersAndRender(res, COMPANY, "company/index");
// 	//move to generic and parametrized functions next
// 	// getAllOfTypeAndRender(res, User, "company/index");
// });

// router.get("/companies/:id", function(req,res){
// 	getUserByIdAndRender(res, req.params.id, "company/profile")
// });


router.get("/", function(req,res){
	res.render("common/index");
});

router.get("/campaigns", function(req,res){
	// getCampaignsAndRender(res, "common/campaigns");
	Campaign.find({}, function(err, allCampaigns) {
		if(err) {
			console.log("error retreiving campaign");
			res.redirect("/");
		} else {
			if(!allCampaigns.length) {
				res.render("common/notfound");
			} else {
				console.log("RETREIVED ALL CAMPAIGNS");
				res.render("common/campaigns", {campaigns:allCampaigns});
			}
		}
	});
});

router.get("/campaigns/:title", function(req,res) {
	Campaign.find({title:req.params.title}, function(err, foundCampaign) {
		if(err) {
			console.log("error retreiving campaign");
			res.redirect("/");
		} else {
			console.log("campaign retreived");
			res.render("common/campaign", {campaign:foundCampaign});
		}
	});
});

// router.get("/campaigns/:id", function(req,res) {
// 	getCampaignByIdAndRender(res, req.params.id, "common/campaign");
// });


router.get("/login", function(req,res){
	res.render("common/login");
});

router.get("/register", function(req,res){
	res.render("common/register");
});

router.get("/business/auth", function(req,res){
	res.render("common/businessauth");
});

router.post("/login/customer", passport.authenticate("local", {
	successRedirect: "/customer",
	failureRedirect: "/login",
	failureFlash: true
}), function(req,res) {});

router.post("/login/company", passport.authenticate("local", {
	successRedirect: "/admin",
	failureRedirect: "/business/auth",
	failureFlash: true
}), function(req,res) {});



router.post("/register/customer", function(req,res){
	var newCustomer = 
		{
			image: req.body.image,
			username: req.body.username,
			email: req.body.email,
			role: true,
			cards: [],
			campaigns: null,
			signup_time: Date.now()
		};
	User.register(new User(newCustomer), req.body.password, function(err, user) {
		if(err) {
			console.log(err);
			req.flash("error", err.message);
			res.redirect("/register");
		} else passport.authenticate("local") (req, res, function() {
			res.redirect("/customer");
		});
	});
});

router.post("/register/company", function(req,res){
	var newCompany = 
		{
			image: req.body.image,
			username: req.body.username,
			email: req.body.email,
			role: false,
			cards: null,
			campaigns: [],
			signup_time: Date.now()
		};
	User.register(new User(newCompany), req.body.password, function(err, user) {
		if(err) {
			console.log(err);
			req.flash("error", err.message);
			res.redirect("/business/auth");
		} else 	passport.authenticate("local") (req, res, function() {
			res.redirect("/admin");
		});
	});
});


router.get("/logout",function(req, res){
	req.logout();
	req.flash("success", "Logged out");
	res.redirect("/");
});



module.exports = router;