var express = require("express");
var router = express.Router();

var User = require("../models/user");
var Stamp = require("../models/stamp");
var Campaign = require("../models/campaign");
var middleware = require("../middleware/index.js");

//========================================================
//BASIC ROUTES 
//========================================================
var  getRelevantStamps = function(req, res, next) {
	Stamp.find({campaign:req.params.campaigntitle}, function(err, foundStamps) {
		req.flash("error", err);
		res.locals.foundStamps = foundStamps;
		return next();
	});
}

//get company page by username
router.get("/admin", middleware.isAuthenticatedCompany, function(req,res){
	Campaign.find({company:req.user.username}, function(err, foundCampaigns) {
		if(err) {
			console.log("error retreiving campaigns");
			req.flash("error","error retreiving campaigns");
		} else {
			console.log("campaigns retreived");
			req.flash("success","found the campaigns");
			res.render("company/admin", {user:req.user, campaigns:foundCampaigns});
		}
	});
	
});

router.get("/admin/:campaigntitle", middleware.isAuthenticatedCompany, getRelevantStamps, function(req,res){
	Campaign.find({title:req.params.campaigntitle}, function(err, foundCampaign) {
	// Campaign.find({}, function(err, foundCampaigns) {
		if(err) {
			console.log("error retreiving campaign");
			req.flash("error","error retreiving campaign");
			res.redirect("/admin");
		} else {
			console.log("campaigns retreived");
			req.flash("success","found the campaign");
			res.render("company/campaign", {user:req.user, campaign:foundCampaign, stamps:res.locals.foundStamps});
		}
	});
});

/*
Publish a new campaign
*/
router.post("/admin/campaigns", middleware.isAuthenticatedCompany, middleware.campaignNameAvailable, function(req,res){
	var campaign = req.body.campaign;
	campaign["company"] = req.user.username;
	campaign["identifiers"] = [];
	Campaign.create(campaign, function(err, newCampaign) {
		if(err) {
			console.log("Campaign creation failed");
			req.flash("error", "Campaign creation failed");
			res.redirect("/companies/COMPANYNAME/admin");
		} else {
			console.log("Campaign created");
			req.flash("success", "Campaign successfully created");
			res.redirect("/admin/" + newCampaign.title);
		}
	})
});

router.put("/admin/campaigns/:campaign", middleware.isAuthenticatedCompany, function (req, res) {
	Campaign.findOneAndUpdate({title:req.params.campaign}, 
		{
			$addToSet: {
				identifiers: req.body.identifier
			}
		}, function(err, updatedCampaign) {
		if(err) {
			console.log("Failed to add identifier to campaign");
			req.flash("error", "Failed to add identifier to campaign");
			res.redirect("/admin");
		} else {
			console.log("Identifier added");
			req.flash("success", "Identifier added");
			res.redirect("/admin/" + req.params.campaign);
		}
	});
});

module.exports = router;
