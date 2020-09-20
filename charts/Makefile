all:
	rm -rf .build/
	mkdir -p .build
ifeq (${dev},1)
	cp Dockerfile Pipfile Pipfile.lock .build/
	tar zcf .build/build.tar --exclude build.tar  --exclude .build --exclude node_modules .
	cp -r ../shared/skep .build/skep
	cd .build/ && docker build . -t skep/charts:dev
else
	git show HEAD:charts/Dockerfile > .build/Dockerfile
	git show HEAD:charts/Pipfile > .build/Pipfile
	git show HEAD:charts/Pipfile.lock > .build/Pipfile.lock
	git archive --format tar -o .build/build.tar HEAD
	cp -r ../shared/skep .build/skep
	cd .build/ && docker build . -t skep/charts:latest -t skep/charts:${tag}
endif
