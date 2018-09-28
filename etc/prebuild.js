/* Pre-build operations. */
const fs = require('fs');

const cleanDirs = [
	'./dist', './dist/client-bundles'
];

cleanDirs.forEach(dirPath => {
	if (!fs.existsSync(dirPath)) fs.mkdirSync(dirPath);
	
	let items = fs.readdirSync(dirPath);
	items.forEach(path => {
		if (!path.endsWith('.js')) return;

		path = dirPath + '/' + path;
		console.log(`Cleaning ${ path }`);
		fs.unlinkSync(path);
	});
});
