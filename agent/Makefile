all:
	rm -rf .build/
	mkdir -p .build
ifeq (${dev},1)
	cp Dockerfile .build/
	tar zcf .build/build.tar --exclude build.tar --exclude .build .
	cp -r ../shared/skep .build/skep
	cd .build/ && docker build . -t skep/agent:dev
else
	git show HEAD:agent/Dockerfile > .build/Dockerfile
	git archive --format tar -o .build/build.tar HEAD
	cp -r ../shared/skep .build/skep
	cd .build/ && docker build . -t skep/agent
endif
