all:
	mkdir -p .build/
	git show HEAD:app/Dockerfile > .build/Dockerfile
	git archive --format tar -o .build/build.tar HEAD
	cd .build/ && docker build . -t skep/app

