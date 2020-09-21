tag := $(shell git rev-parse --short --verify HEAD)
all: dev:=0
all:
	cd app && $(MAKE) dev=${dev} tag=${tag}
	cd agent && $(MAKE) dev=${dev} tag=${tag}
	cd monitor && $(MAKE) dev=${dev} tag=${tag}
	cd charts && $(MAKE) dev=${dev} tag=${tag}
ifneq (1,$(dev))
	$(MAKE) push
else
	docker push skep/agent:dev
	docker push skep/monitor:dev
	docker push skep/app:dev
	docker push skep/charts:dev
endif

push:
	docker push skep/agent:${tag}
	docker push skep/monitor:${tag}
	docker push skep/app:${tag}
	docker push skep/charts:${tag}
	docker push skep/agent:latest
	docker push skep/monitor:latest
	docker push skep/app:latest
	docker push skep/charts:latest
