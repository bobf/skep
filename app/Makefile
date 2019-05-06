all:
	mkdir -p .build
	git show HEAD:Dockerfile > .build/Dockerfile
	git archive --format tar -o .build/build.tar HEAD
	docker build .build -t skep/app

