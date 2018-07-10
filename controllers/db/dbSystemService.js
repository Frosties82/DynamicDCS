const mongoose = require('mongoose');
const _ = require('lodash');

//changing promises to bluebird
mongoose.Promise = require('bluebird');

var systemdb = mongoose.createConnection();

// include mongoose db schemas
var userAccountSchema = require('./models/userAccountSchema');
const UserAccount = systemdb.model('userAccount', userAccountSchema);

_.set(exports, 'connectSystemDB', function (host, database, port, opts) {
	systemdb.open(host, database, port, opts);
});

exports.userAccountActions = function (action, obj){
	if(action === 'create') {
		return new Promise(function(resolve, reject) {
			const useraccount = new UserAccount(obj);
			useraccount.save(function (err, useraccount) {
				if (err) { reject(err) }
				resolve(useraccount);
			});
		});
	}
	if(action === 'read') {
		return new Promise(function(resolve, reject) {
			UserAccount.find(obj, function (err, useraccount) {
				if (err) { reject(err) }
				resolve(useraccount);
			});
		});
	}
	if(action === 'getPerm') {
		return new Promise(function(resolve, reject) {
			UserAccount.find({authId: obj}, function (err, useraccount) {
				if (err) { reject(err) }
				resolve(useraccount);
			});
		});
	}
	if(action === 'updateSingleUCID') {
		return new Promise(function(resolve, reject) {
			UserAccount.findOneAndUpdate(
				{ucid: obj.ucid},
				{$set: obj},
				{new: true},
				function(err, uaccount) {
					if (err) { reject(err) }
					resolve(uaccount);
				}
			);
		});
	}
	if(action === 'updateSingleIP') {
		return new Promise(function(resolve, reject) {
			UserAccount.findOneAndUpdate(
				{lastIp: obj.ipaddr},
				{$set: obj},
				{new: true},
				function(err, uaccount) {
					if (err) { reject(err) }
					resolve(uaccount);
				}
			);
		});
	}
	if(action === 'update') {
		return new Promise(function(resolve, reject) {
			UserAccount.find({ucid: obj.ucid}, function (err, ucidUser) {
				if (err) {
					reject(err);
				}
				if (ucidUser.length === 0) {
					UserAccount.find({lastIp: obj.lastIp}, function (err, ipUser) {
						if (err) {
							reject(err);
						}
						if (ipUser.length !== 0) {
							ipUser = ipUser[0];
							_.set(ipUser, 'gameName', _.get(obj, 'gameName'));
							if(typeof obj.curSocket !== 'undefined'){
								_.set(ipUser, 'curSocket', _.get(obj, 'curSocket'));
							}
							ipUser.save(function (err) {
								if (err) {
									reject(err);
								}
								resolve(ipUser);
							});
						}
					});
				} else {
					ucidUser = ucidUser[0];
					_.set(ucidUser, 'gameName', _.get(obj, 'gameName'));
					_.set(ucidUser, 'lastIp', _.get(obj, 'lastIp'));
					if(typeof obj.curSocket !== 'undefined'){
						_.set(ucidUser, 'curSocket', _.get(obj, 'curSocket'));
					}
					ucidUser.save(function (err) {
						if (err) {
							reject(err);
						}
						resolve(ucidUser);
					});
				}
			});
		});
	}
	if(action === 'updateSocket') {
		// console.log('UA update socket line42: ', obj);
		return new Promise(function(resolve, reject) {
			UserAccount.find({authId: obj.authId}, function (err, authIdUser) {
				if (err) {
					reject(err);
				}
				if (authIdUser.length !== 0) {
					authIdUser = authIdUser[0];
					_.set(authIdUser, 'lastIp', _.get(obj, 'lastIp'));
					_.set(authIdUser, 'curSocket', _.get(obj, 'curSocket'));
					authIdUser.save(function (err) {
						if (err) {
							reject(err);
						}
						resolve(authIdUser);
					});
				} else {
					console.log('User '+obj.authId+' does not exist in user database line111');
					// reject('User '+obj.authId+' does not exist in user database');
				}
			});
		});
	}
	if(action === 'checkAccount') {
		var curBody = _.get(obj, 'body');
		return new Promise(function(resolve, reject) {
			UserAccount.find({authId: curBody.sub}, function (err, userAccount) {
				if (err) { reject(err); }
				if (userAccount.length === 0) {

					const useraccount = new UserAccount({
						authId: curBody.sub,
						realName: _.get(curBody, 'name'),
						firstName: _.get(curBody, 'given_name'),
						lastName: _.get(curBody, 'family_name'),
						nickName: _.get(curBody, 'nickname'),
						picture: _.get(curBody, 'picture'),
						gender: _.get(curBody, 'gender'),
						locale: _.get(curBody, 'locale')
					});
					useraccount.save(function (err, useraccount) {
						if (err) { reject(err) }
						resolve(useraccount);
					});
				} else {
					useraccount = userAccount[0];
					resolve(useraccount);
				}
			});
		});
	}
};


var serverSchema = require('./models/serverSchema');
const Server = systemdb.model('server', serverSchema);

exports.serverActions = function (action, obj){
	if(action === 'create') {
		return new Promise(function(resolve, reject) {
			const server = new Server(obj);
			server.save(function (err, servers) {
				if (err) { reject(err) }
				resolve(servers);
			});
		});
	}
	if(action === 'read') {
		return new Promise(function(resolve, reject) {
			Server.find(obj, function (err, servers) {
				if (err) { reject(err) }
				resolve(servers);
			});
		});
	}
	if(action === 'update') {
		return new Promise(function(resolve, reject) {
			Server.findOneAndUpdate(
				{name: obj.name},
				{$set: obj},
				{new: true},
				function(err, servers) {
					if (err) { reject(err) }
					resolve(servers);
				}
			);
		});
	}
	if(action === 'delete') {
		return new Promise(function(resolve, reject) {
			Server.findOneAndRemove({name: obj.name}, function (err, servers) {
				if (err) { reject(err) }
				resolve(servers);
			});
		});
	}
};

var theaterSchema = require('./models/theaterSchema');
const Theater = systemdb.model('theater', theaterSchema);

exports.theaterActions = function (action){
	if(action === 'read') {
		return new Promise(function(resolve, reject) {
			Theater.find(function (err, servers) {
				if (err) { reject(err) }
				resolve({theaters: servers});
			});
		});
	}
};

var weaponScoreSchema = require('./models/weaponScoreSchema');
const WeaponScore = systemdb.model('weaponScore', weaponScoreSchema);

exports.weaponScoreActions = function (action, obj){
	if(action === 'read') {
		return new Promise(function(resolve, reject) {
			WeaponScore.find({_id: obj.typeName}, function (err, weaponscore) {
				if (err) { reject(err) }
				if (weaponscore.length === 0) {
					const curWeaponScore = new WeaponScore({
						_id: obj.typeName,
						name: obj.typeName,
						displayName: obj.displayName,
						category: obj.category,
						unitType: obj.unitType
					});
					curWeaponScore.save(function (err, saveweaponscore) {
						if (err) {
							reject(err);
						}
						resolve(saveweaponscore);
					});
				} else {
					var curWeaponScore = weaponscore[0];
					// console.log('curweaponscore: ', curWeaponScore);
					resolve(curWeaponScore);
				}
			});
		});
	}
};

var staticDictionarySchema = require('./models/staticDictionarySchema');
const StaticDictionary = systemdb.model('staticDictionary', staticDictionarySchema);

exports.staticDictionaryActions = function (action, obj){
	if(action === 'read') {
		return new Promise(function(resolve, reject) {
			StaticDictionary.find(obj, function (err, staticDictionary) {
				if (err) { reject(err) }
				resolve(staticDictionary);
			});
		});
	}
};

var unitDictionarySchema = require('./models/unitDictionarySchema');
const UnitDictionary = systemdb.model('unitDictionary', unitDictionarySchema);

exports.unitDictionaryActions = function (action, obj){
	if(action === 'read') {
		return new Promise(function(resolve, reject) {
			UnitDictionary.find(obj, function (err, unitDictionary) {
				if (err) { reject(err) }
				resolve(unitDictionary);
			});
		});
	}
};
