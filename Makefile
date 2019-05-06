all: dev=0
all:
	cd app && $(MAKE) dev=${dev}
	cd stats && $(MAKE) dev=${dev}
	docker push skep/stats
	docker push skep/app
