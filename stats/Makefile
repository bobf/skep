all:
	rm -rf .build/
	mkdir -p .build
ifeq (${dev},1)
	cp Dockerfile .build/
	tar zcf .build/build.tar --exclude build.tar --exclude .build .
else
	git show HEAD:stats/Dockerfile > .build/Dockerfile
	git archive --format tar -o .build/build.tar HEAD
endif
	cd .build/ && docker build . -t skep/stats
