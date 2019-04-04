# Stonebreakers' Web Boilerplate

This is our setup of choice for building websites and -applications.

It works like this:

```
+----------+   Web server
| Postgres |       ||
+----------+       ||
     |             ||
+------------+     ||
| Python API | --- || ------ + ----> API consumers
+------------+     ||        |
     |             ||        |
+------------+     ||     +------------+
| Preact app | --- || --- | Preact app |
| (server)   |     ||     | (client)   |
+------------+     ||     +------------+
```

It is:

* very low friction / cost
* SEO friendly
* Google Analytics ready
* Preset with a solid foundation including users & accounts

## Packaging

* `./api` - The business and data layers as a Python API
* `./app` - The presentation layer as an isomorphic, React-esq JavaScript application
* `./config-templates` - Configuration templates
* `./static` - Static presentation layer assets
* `./etc` - Everything else & more

## Installation

To get started, you'll need Python 3, Pip, Node, npm, and Postgres.

```bash
git clone <this repo>
# De-template configuration
cp -r ./config-templates ./config

# Install packages
npm i --save-dev
pip3 install -r requirements.txt

# Initialize your database
python3 etc/write_setup_sql.py | sudo -u postgres psql

# Run it!
npm start
```
