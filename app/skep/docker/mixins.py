class ImageParser:
    def parse_image(self, spec):
        if spec is None:
            return {}

        image, _, __ = spec.rpartition('@')
        id, ___, tag = image.rpartition(':')

        return { 'id': id, 'tag': tag }
