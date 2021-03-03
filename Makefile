develop:
	npx webpack serve

install:
	npm install

build:
	rm -rf dist
	NODE_ENV=production npx webpack

lint:
	npx eslint .

test:
	npm test

test-coverage:
	npm test -- --coverage --coverageProvider=v8

test-watch:
	npx -n --experimental-vm-modules jest --watch

.PHONY: test
