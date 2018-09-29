/* eslint-disable */
/** Create or destroy the webpack-dev-server environment. */
const fs = require('fs');
const { ncp } = require('ncp');
const rmrf = require('rimraf');

const DEV_HTML_TEMPLATE = `
<html>
	<head>
		<title>Loading...</title>
		<script>
			console.warn("This isn't isomorphic service!");
		</script>
	</head>
	<body>
		<div id="app">
			<!-- Node for preact to remove. -->
			<div></div>
		</div>
		<script src="/assets/client.js"></script>
	</body>
</html>
`;

const mode = process.argv[2];
console.log(`Development environment: ${ mode }`);

const handleMode = () => {
	if (mode === 'setup') {
		//	Refresh dev. directory.
		fs.mkdirSync('./dist');
		fs.writeFileSync('./dist/index.html', DEV_HTML_TEMPLATE);
		fs.mkdirSync('./dist/static');
		ncp('./static', './dist/static');
	}
};

if (fs.existsSync('./dist')) {
	rmrf('./dist', handleMode);
}
else {
	handleMode();
}
