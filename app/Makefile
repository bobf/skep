all:
	mkdir -p .build/
	git show HEAD:app/Dockerfile > .build/Dockerfile
	git show HEAD:app/Pipfile > .build/Pipfile
	git show HEAD:app/Pipfile.lock > .build/Pipfile.lock
	git archive --format tar -o .build/build.tar HEAD
	cd .build/ && docker build . -t skep/app

