const schemas = require("./exports/schemas.js");
const { v4: uuid } = require("uuid");

const homeMessage = {
      "loginsucces": "Login successfull",
      "loginfail": "Login failed",
      "subdoesnotexist": "This subreddit does not exist",
      "accountcreated": "Created account successfully",
	"oops": "Oops, something went wrong. Please try again",
	"logout": "You have been logged out",
	"subcreated": "New sub has been created",
	"requirelogin":  "you need to be logged in to do this",
	"alreadymember": "you are a member already, no need for this twice right?"
	}

module.exports.home = (req, res) => {
	
	let msg
	const {q} = req.query;
	if(q){
		if(homeMessage[q]){
			msg = homeMessage[q]
		}
	}
	res.render("home", { msg, userid: req.session.login, username: req.session.username });
};
module.exports.login = (req, res) => {
	res.render("login", { userid: req.session.login, username: req.session.username });
};
module.exports.register = (req, res) => res.render("register", { userid: req.session.login, username: req.session.username });
module.exports.notfound = (req, res) => res.render("notfound", { userid: req.session.login, username: req.session.username });

module.exports.subView = async (req, res) => {
	const { q } = req.query;
	const sub = await schemas.Subreddit.find({ name: q });
	if(sub.length){
		const posts = await schemas.Post.find({ subreddit: q })
		const subscribed = sub[0].members.includes(req.session.login)
		res.render("sub", { posts, sub: sub[0], subscribed , userid: req.session.login, username: req.session.username});
	}
	else{
		res.redirect(302, `/r/new?q=${q}`)
	}
};

module.exports.postRegister = async (req, res) => {
	const {
		username,
		email,
		emailverification,
		password,
		passwordverification,
	} = req.body;
	if (email === emailverification && password === passwordverification) {
		new schemas.User({
			_id: uuid(),
			username: username,
			email: email,
			password: password,
		})
			.save()
			.then(() => {
				res.redirect(302, "/?q=accountcreated");
			})
			.catch(err => {
				res.redirect(302, "/?q=oops")
			})
	}
};
module.exports.postLogin = async (req, res) => {
	const { username, password } = req.body;
	const result = await schemas.User.find({
		username: username,
		password: password,
	});
	if (result.length === 1) {
		req.session.login = result[0]._id
		req.session.username = result[0].username
		res.redirect(302, "/?q=loginsucces");
	} else {
		req.session.login = false
		req.session.username = null
		res.redirect(302, "/?q=loginfail");
	}
};
module.exports.logout = (req,res) => {
	req.session.login = false
	req.session.username = null
	res.redirect(302, "/?q=logout")
}

module.exports.newSub = (req, res) => {
	const {q} = req.query;
	if(!req.session.login){
		res.redirect(302, "/login")
	}
	else{
		res.render("newsub", { q, userid: req.session.login, username: req.session.username })
	}
};

module.exports.createSub = async (req, res) => {
	const { title, description } = req.body;
	const newsub = new schemas.Subreddit({
		_id: uuid(),
		name: title,
		description: description,
		members: []
	})
		.save()
		.then(() => {
			res.redirect(302, "/?q=subcreated");
		})
		.catch(err => {
			res.redirect(302, "/?q=oops")
		})

};

module.exports.newPost = async (req, res) => {
	if(!req.session.login){
		res.redirect(302, "/login")
	}
	else{
		await schemas.Subreddit.find({name: req.params.sub}).then(sub => {
			res.render("newpost", { sub: sub[0] ,userid: req.session.login, username: req.session.username });
		})
		.catch(err => {
			res.redirect(302, "/?q=oops")
		})
	}
};
module.exports.createPost = async (req, res) => {
	const { sub, content, title } = req.body;
	const id = uuid();
	new schemas.Post({
		_id: id,
		title: title,
		content: content,
		subreddit: sub,
		author: req.session.login
	})
		.save()
		.then(() => {
			res.redirect(302, `/r?q=${sub}`);
		})
		.catch(err => {
			console.log(err)
			res.redirect(302, "/?q=oops")
		})
};
module.exports.subscribe = async (req, res) => {
	const {sub } = req.params
	const { login } = req.session
	if(login){
		schemas.Subreddit.findOne({name: sub}).then(data => {
			if(!data.members.includes(login)){
				data.members.push(login)
				schemas.Subreddit.updateOne({name: sub}, {members: data.members}).then(data => {
					res.redirect(302, `/r?q=${sub}`)
				})
				.catch(err => {
					res.redirect(302, "/?q=oops")
				})
			}
			else{
				const index = data.members.indexOf(req.session.login)
				data.members.splice(index, 1)
				schemas.Subreddit.updateOne({name: sub}, {members: data.members}).then(data => {
					res.redirect(302, `/r?q=${sub}`)
				})
				.catch(err => {
					res.redirect(302, "/?q=oops")
				})
			}
		})
		.catch(err => {
			res.redirect(302, "/?q=oops")
		})
	}
	else{
		res.redirect(302, "/?q=requirelogin")
	}
}

