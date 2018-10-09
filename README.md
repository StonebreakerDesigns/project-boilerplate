# Stonebreaker's boilerplate

This is the boilerplate for Stonebreaker's setup of choice for building modern
web applications. It's built on the following stack:

* Database
	* Postgres
* API layer
	* SQLAlchemy
	* falcon
* Presentation layer
	* Jinja2 (for emails)
	* express (isomorphic service)
	* preact
	* LESS
* Build tools
	* Babel
	* Webpack
	* Gulp
* Linters
	* pylint
	* eslint

## Repo setup

This repository is organized into 4 main sections:

* `./api` - The Python API.
	* The `./domain` package is for domain models, logic, and endpoints.
* `./app` - The isomorphic JavaScript application.
	* The `./components` package is for reusable components.
	* The `./routes` package is for pages.
* `./config` - Share configuration storage.
* `./static` - Static presentation layer assets. 