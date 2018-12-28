import sys
import io

fn = sys.argv[1]
route = sys.argv[2]
desc = ' '.join(sys.argv[3:])

with io.open('./app/router.js', 'r', encoding='utf-8') as f:
	code = f.read()

code = code.replace('//::end-routing', ",\n\t\t\t'/%s': () => import(\n\t\t\t\t/* webpackChunkName: '%s' */ './routes/%s'\n\t\t\t)//::end-routing"%(route.replace('/', '-'), route.replace('/', '-'), fn))

with io.open('./app/router.js', 'w', encoding='utf-8') as f:
	f.write(code)

with io.open('./app/routes/%s.js'%fn, 'w', encoding='utf-8') as f:
	f.write("/** %s */\nimport { Component, h } from 'preact';\n\nimport styled from '../style-bind';\nimport style from './%s.less'\n\n@styled(style)\nclass Page extends Component {\n\trender(){ return (\n\t\t<div></div>\n\t); }\n}\n\n//\tExport.\nexport default {\n\tcomponent: Page\n};"%(desc, fn))

with io.open('./app/routes/%s.less'%fn, 'w', encoding='utf-8') as f:
	f.write("@import '../config.less';\n")