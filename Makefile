all: dev=0
all:
	cd app && $(MAKE) dev=${dev}
	cd stats && $(MAKE) dev=${dev}
