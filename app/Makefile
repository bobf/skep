all:
	mkdir -p .build/app
	git show HEAD:app/Dockerfile > .build/app/Dockerfile
	git archive --format tar -o .build/app/build.tar HEAD
	cd .build/app && docker build . -t skep/app

