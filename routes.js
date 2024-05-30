const schemas = require("./exports/schemas.js");
const { v4: uuid } = require("uuid");
const homeMessage = {
      "loginsucces": "Login successfull",
      "loginfail": "Login failed",
      "subdoesnotexist": "This subreddit does not exist",
      "accountcreated": "Created account successfully"
}

module.exports.home = (req, res) => {
	let msg
	const query = req.query;
	console.log({query, homeMessage})
	if(query.q){
		if(homeMessage[query.q]){
			msg = homeMessage[query.q]
		}
	}
	res.render("home", { msg });
};
module.exports.login = (req, res) => {
	res.render("login");
};
module.exports.register = (req, res) => res.render("register");
module.exports.notfound = (req, res) => res.render("notfound");

module.exports.subView = async (req, res) => {
	const { q } = req.query;
	const results = await schemas.Subreddit.find({ name: q });
	if (results.length < 1) {
		res.redirect(302, "/?q=subdoesnotexist");
	} else {
		res.render("sub", { sub: results[0] });
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
			.then(() => null);
	}
	res.redirect(302, "/?q=accountcreated");
};
module.exports.postLogin = async (req, res) => {
	const { username, password } = req.body;
	const result = await schemas.User.find({
		username: username,
		password: password,
	});
	if (result.length === 1) {
		res.redirect(302, "/?q=loginsucces");
	} else {
		res.redirect(302, "/?q=loginfail");
	}
};

module.exports.newSub = (req, res) => res.render("newsub");

module.exports.createSub = async (req, res) => {
	const { title, description } = req.body;
	const newsub = new schemas.Subreddit({
		_id: uuid(),
		name: title,
		description: description,
		members: [],
		posts: [],
	})
		.save()
		.then(() => null);

	res.redirect(302, "/");
};

module.exports.newPost = (req, res) => {
	res.render("newpost", { sub: req.params.sub });
};
module.exports.createPost = async (req, res) => {
	const { sub, content, title } = req.body;
	const id = uuid();
	new schemas.Post({
		_id: id,
		title: title,
		content: content,
	})
		.save()
		.then(() => {
			schemas.Subreddit.find({ name: sub }).then((result) => {
				const res = result[0]
				res.posts.push(id)
				console.log(res.posts)
				schemas.Subreddit.updateOne({name: res.name}, {$set: {posts: res.posts}}).then(() => {
				})
			});
		});

	res.redirect(302, "/");
};
