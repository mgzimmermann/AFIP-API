const fs = require('fs'),
	path = require('path');

class Cache {
	constructor(name) {
		this.storePath = path.join('.', 'cache', `${name}`);
	}

	read() {
		try {
			let obj = fs.readFileSync(this.storePath, 'utf8');

			if (obj && obj != '') {
				return JSON.parse(obj);
			}
		} catch(e) {
			return {}
		}
	}

	getItem(key) {
		const jj = this.read();
		console.log('CACHE READ', key, jj[key])
		if (jj[key]) {
			return jj[key]
		}

		return false
	}

	setItem(key, value) {
		const jj = this.read();

		if (value) {

			jj[key] = value
			console.log('CACHE STORE', key, jj[key])

			return fs.writeFileSync(this.storePath, JSON.stringify(jj));
		}

		return false;
	}

	clear() {
		return fs.unlink(this.storePath);
	}
}

module.exports = Cache;
