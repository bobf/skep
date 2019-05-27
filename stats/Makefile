all:
	rm -rf .build/
	mkdir -p .build
ifeq (${dev},1)
	cp Dockerfile .build/
	tar zcf .build/build.tar --exclude build.tar --exclude .build .
	cd .build/ && docker build . -t skep/stats:dev
else
	git show HEAD:stats/Dockerfile > .build/Dockerfile
	git archive --format tar -o .build/build.tar HEAD
	cd .build/ && docker build . -t skep/stats
endif
