build-docusaurus:
	npm run build

build-docker-image: build-docusaurus
	docker build -t gridcapa/gridcapa-doc .

run-docker-image: build-docker-image
	docker run -it -d -p 80:80 -p 443:443 gridcapa/gridcapa-doc

serve-docusaurus:
	npm run serve