class ImageParser:
    def parse_image(self, spec):
        if spec is None:
            return {}

        if '@' not in spec:
            id, _, tag = spec.partition(':')
        else:
            image, _, __ = spec.rpartition('@')
            id, ___, tag = image.rpartition(':')

        return { 'id': id, 'tag': tag }
