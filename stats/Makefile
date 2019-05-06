all:
	mkdir -p .build/stats
	git show HEAD:stats/Dockerfile > .build/stats/Dockerfile
	git archive --format tar -o .build/stats/build.tar HEAD
	cd .build/stats && docker build . -t skep/stats
